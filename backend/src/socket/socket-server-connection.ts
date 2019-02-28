import * as WebSocket from "ws";
import {IncomingMessage} from "http";
import SocketConnection from "@buildr/socket/src/socket-connection";
import {SocketNames} from "@buildr/socket/src/socket-names";

export default class SocketServerConnection extends SocketConnection {
    private readonly _socket: WebSocket;
    private _req: IncomingMessage;

    public get ip() {
        return this._req.connection.remoteAddress;
    }

    private _listen() {
        this._socket.onopen = this._onOpenHandlerBound;
        this._socket.onmessage = this._onMessageHandlerBound;
        this._socket.onerror = this._onErrorHandlerBound;

        this.respond(SocketNames.handshake);
    }

    protected _isConnected(): boolean {
        return this._socket.readyState === WebSocket.OPEN;
    }

    protected _send(data: string): void {
        this._socket.send(data);
    }

    public constructor(client: WebSocket, req: IncomingMessage) {
        super();

        this._socket = client;
        this._req = req;

        this._listen();
    }
}