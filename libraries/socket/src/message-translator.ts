import {Buffer} from "buffer";
import {encode, decode} from "@shelacek/ubjson";
import SocketMessage from "./socket-message";

export const MESSAGE_IS_SENDABLE = 0xbedabb1e;

enum DataIdentifier {
    NULL,
    data,
    extra
}

export function messageToSendable(message: SocketMessage): string {
    const dataEncoded = encode(message.data),
        extraEncoded = encode(message.extra);

    const dataEncodedLength = dataEncoded.byteLength,
        extraEncodedLength = extraEncoded.byteLength;

    const hasData = Object.keys(message.data).length > 0;
    const hasExtra = Object.keys(message.extra).length > 0;

    const totalLength = 4 + 4 +
        (hasData ? 5 + dataEncodedLength : 0) +
        (hasExtra ? 5 + extraEncodedLength : 0);

    const buffer = Buffer.allocUnsafe(totalLength);

    let offset = 0;

    buffer.writeUInt32LE(MESSAGE_IS_SENDABLE, offset); offset += 4;

    buffer.writeUInt32LE(message.name, offset); offset += 4;

    if (hasData) {
        // data identifier
        buffer.writeUInt8(DataIdentifier.data, offset); offset++;
        // length
        buffer.writeUInt32LE(dataEncodedLength, offset); offset += 4;
        // data
        buffer.write(Buffer.from(dataEncoded).toString("base64"), offset, "base64");
        offset += dataEncodedLength;
    }

    if (hasExtra) {
        // data identifier
        buffer.writeUInt8(DataIdentifier.extra, offset); offset++;
        // length
        buffer.writeUInt32LE(extraEncodedLength, offset); offset += 4;
        // data
        buffer.write(Buffer.from(extraEncoded).toString("base64"), offset, "base64");
        offset += extraEncodedLength;
    }

    return buffer.toString("base64");
}

export function sendableToMessage(data: string): SocketMessage {
    const buffer = Buffer.from(data, "base64");
    let offset = 0;

    // check that the message is sendable
    const messageIsSendable = buffer.readUInt32LE(offset); offset += 4;
    if (messageIsSendable !== MESSAGE_IS_SENDABLE) throw new TypeError("Invalid sendable data");

    // get message type
    const name = buffer.readUInt32LE(offset); offset += 4;

    const message = new SocketMessage(name, {});

    // get next values
    while (offset < buffer.length) {
        // data identifier
        const identifier = buffer.readUInt8(offset); offset++;
        // length
        const length = buffer.readUInt32LE(offset); offset += 4;
        // data
        const data = buffer.slice(offset, offset + length); offset += length;

        switch (identifier) {
            case DataIdentifier.data:
                message.data = decode(data);
                break;
            case DataIdentifier.extra:
                message.extra = decode(data);
                break;
            default:
                throw new TypeError("Invalid data identifier type");
        }
    }

    return message;
}