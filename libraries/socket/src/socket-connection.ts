import {Buffer} from "buffer";
import {generate as randomString} from "randomstring";
import SocketListeners from "./socket-listeners";
import {messageToSendable, sendableToMessage} from "./message-translator";
import SocketMessage from "./socket-message";
import OnAnyCallback from "./on-any-callback";
import SocketEvent from "./socket-event";
import {SocketMessageName} from "./socket-message-name";
import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";
import ResponderFunction from "./responder-function";
import {SocketNames} from "./socket-names";

function objectContainsAll(object: any, required: string[] | string, splitBy: string = " "): boolean {
    if (typeof required === "string") {
        if (!splitBy)
            throw new ReferenceError("Must specify `splitBy` when `required` is string");

        required = required.split(splitBy);
    }

    const keys = Object.keys(object);
    return required.every(it => keys.indexOf(it) !== -1);
}

function createErrorFromObject(err: {
    name?: string;
    message: string;
}, extendMessageWith?: string) {
    const error = new Error();

    // remove this function from the stack
    error.stack = error.stack.substr(0, error.stack.indexOf("\n"));

    // Set its name and message
    Object.assign(error, err);

    if (extendMessageWith) error.message += extendMessageWith;

    return error;
}

export default abstract class SocketConnection {
    /**
     * Converts WebSocket response data to a string
     * @param data
     * @protected
     */
    protected static _convertMessageData(data: string | Buffer | Buffer[]): string {
        if (typeof data === "string") return data;
        if (data instanceof Buffer) return data.toString();
        if (data instanceof Array) return data.map(it => this._convertMessageData(it)).join("");
        throw new TypeError("Invalid message data type");
    }

    /**
     * Generate a random request ID
     * @param message
     * @param idSize
     */
    public static fillMessageId(message: SocketMessage, idSize = 32) {
        message.extra.requestId = randomString(idSize);
    }

    private _listeners: SocketListeners = {};
    private _onAny: OnAnyCallback[] = [];
    private _onAnySend: OnAnyCallback[] = [];
    private _messageQueue: SocketMessage[] = [];

    /**
     * Number of messages queued for sending
     */
    public get queueLength() {
        return this._messageQueue.length;
    }

    private _initEvent(event: SocketMessageName) {
        if (!this._listeners[event]) this._listeners[event] = [];
    }

    private _readQueue() {
        const message = this._messageQueue.shift();
        const data = messageToSendable(message);

        this._onAnySend.forEach(callback => callback(message, data.length));

        this._send(data);
    }

    /**
     * Run this method in onmessage handler
     * @param data - Raw data as received by the socket implementation
     * @protected
     */
    protected _emit(data: string) {
        const message = sendableToMessage(data);

        this._onAny.forEach(callback => callback(message, data.length));

        const listeners: SocketEvent[] = this._listeners[message.name];
        if (!listeners) return;

        for (let listener of listeners) {
            listener(message.data, message);
        }
    }

    /**
     * Emit a fake event
     * @param message
     * @protected
     */
    protected _fakeEmit(message: SocketMessage) {
        const data = messageToSendable(message);

        this._emit(data);
    }

    /**
     * Read all of the queue. Run after connection successful
     * @protected
     */
    protected _readWholeQueue() {
        while (this.queueLength) {
            this._readQueue();
        }
    }

    protected _onOpenHandler() {
        this._fakeEmit(new SocketMessage(SocketNames.connect));
        this._readWholeQueue();
    }
    protected _onOpenHandlerBound = this._onOpenHandler.bind(this);

    protected _onMessageHandler({data}: {data: string | Buffer | Buffer[]}) {
        this._emit(SocketConnection._convertMessageData(data));
    }
    protected _onMessageHandlerBound = this._onMessageHandler.bind(this);

    protected _onErrorHandler(error: Error) {
        this._fakeEmit(new SocketMessage(SocketNames.error, {
            name: error.name || "Error",
            message: error.message || error.toString()
        }));
    }
    protected _onErrorHandlerBound = this._onErrorHandler.bind(this);

    /**
     * Send data to the other end of the connection
     * @param data - Raw data to be sent
     * @protected
     */
    protected abstract _send(data: string): void;

    /**
     * Check if connected to the target
     * @protected
     */
    protected abstract _isConnected(): boolean;

    /**
     * Run `callback` when the socket receives `event`
     * @param event
     * @param callback
     */
    public on(event: SocketMessageName, callback: SocketEvent) {
        this._initEvent(event);

        this._listeners[event].push(callback);
    }

    /**
     * Send a message to the other end of the socket
     * @param message
     */
    public sendMessage(message: SocketMessage) {
        this._messageQueue.push(message);

        if (this._isConnected()) this._readQueue();
    }

    /**
     * Send a message to the other end of the socket
     * @param name
     * @param data
     */
    public send(name: SocketMessageName, data: Stringifyable) {
        this.sendMessage(new SocketMessage(name, data));
    }

    /**
     * Return a function that will send a message to the other end of the socket
     * @param message
     */
    public sendMessageDelayed(message: SocketMessage): () => void {
        return () => this.sendMessage(message);
    }

    /**
     * Return a function that will send a message to the other end of the socket
     * @param name
     * @param data
     */
    public sendDelayed(name: SocketMessageName, data: Stringifyable): () => void {
        return () => this.send(name, data);
    }

    /**
     * Listen for an event for one time, then stop listening
     * @param name
     * @param timeout
     * @param id - A request ID if required
     */
    public once(name: SocketMessageName, timeout: number = 1000, id: string = null): Promise<SocketMessage> {
        this._initEvent(name);

        return new Promise((yay, nay) => {
            const index = this._listeners[name].length;
            let receivedResponse = false;

            this._listeners[name].push((data, message) => {
                if (id !== null && message.extra.requestId !== id) return;

                receivedResponse = true;
                delete this._listeners[name][index];
                yay(message);
            });

            if (timeout !== -1) {
                setTimeout(() => {
                    if (receivedResponse) return;

                    nay(new Error(`Timeout when getting response for \`${name}\``));
                }, timeout);
            }
        });
    }

    async get(message: SocketMessage, timeout: number = 1000, generateId: boolean = true): Promise<SocketMessage> {
        if (generateId) SocketConnection.fillMessageId(message);
        this.sendMessage(message);
        const result = await this.once(message.name, timeout, message.extra.requestId);

        if (result.data["error"]) {
            const error = result.data["error"];

            const errorExtension = ` (from socket event: ${message.name})`;

            if (objectContainsAll(error, "name message")) {
                throw createErrorFromObject(error, errorExtension);
            } else if (typeof error === "string") {
                throw createErrorFromObject({
                    message: error
                }, errorExtension);
            }
        }

        return result;
    }

    public respond(name: SocketMessageName, responder: ResponderFunction = () => null) {
        this.on(name, (data, message) => {
            try {
                const response = responder(data);

                if (response instanceof Promise) {
                    response.then(res => {
                        this.sendMessage(new SocketMessage(name, res, message.extra));
                    }).catch((err: Error | string) => {
                        this.sendMessage(new SocketMessage(name, {
                            error: {
                                name: typeof err === "string" ? "Error" : err.name,
                                message: typeof err === "string" ? err : err.message
                            }
                        }, message.extra));
                    });
                } else {
                    this.sendMessage(new SocketMessage(name, response, message.extra));
                }
            } catch (err) {
                this.sendMessage(new SocketMessage(name, {
                    error: {
                        name: typeof err === "string" ? "Error" : err.name,
                        message: typeof err === "string" ? err : err.message
                    }
                }, message.extra))
            }
        });
    }

    /**
     * Run `callback` when any event is received
     * @param callback
     */
    public onAny(callback: OnAnyCallback) {
        this._onAny.push(callback);
    }

    /**
     * Run `callback` when any event is sent
     * @param callback
     */
    public onAnySend(callback: OnAnyCallback) {
        this._onAnySend.push(callback);
    }
}