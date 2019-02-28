//jest.enableAutomock();

import {messageToSendable, sendableToMessage} from "./message-translator";
import SocketMessage from "./socket-message";

test("successfully generates sendable message", () => {
    const socketMessage = new SocketMessage(0, {});
    expect(() => messageToSendable(socketMessage)).not.toThrow();
});

test("successfully parses sendable message", () => {
    const socketMessage = new SocketMessage(100, {
        foo: "bar"
    }, {
        authenticationToken: "baz"
    });

    const sendable = messageToSendable(socketMessage);

    const result = sendableToMessage(sendable);

    // check that it is the same
    expect(result.name).toEqual(socketMessage.name);
    expect(result.data).toEqual(socketMessage.data);
    expect(result.extra).toEqual(socketMessage.extra);
});