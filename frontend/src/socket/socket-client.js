import SocketConnection from "@buildr/socket/lib/socket-connection";
import SocketMessage from "@buildr/socket/lib/socket-message";
import {SocketNames} from "@buildr/socket/lib/socket-names";

export default class SocketClient extends SocketConnection {
    /**
     * Socket connection instance
     * @type {WebSocket}
     * @private
     */
    _socket;

    /**
     * Amount of errors since last handshake
     * @type {number}
     * @private
     */
    _errorCount = 0;

    /**
     * Handshake loop
     * @type {number}
     * @private
     */
    _handshakeLoop;

    /**
     * Handshake timeout
     * @type {number}
     * @private
     */
    _handshakeTimeout;

    /**
     * Time of the last ping
     * @type {number}
     * @private
     */
    _lastPingTime;

    /**
     * URL of the socket connection
     * @type {string}
     */
    url;

    /**
     * Current connection ping in ms
     * @type {number}
     */
    ping;

    /**
     * The amount of attempts that should be made for reconnections
     * @type {number}
     */
    reconnectAttempts = 3;

    /**
     * The handshake timeout in milliseconds before disconnecting
     * @type {number}
     */
    handshakeTimeout = 10;

    /**
     * The interval between handshakes in milliseconds
     * @type {number}
     */
    handshakeInterval = 500;

    /**
     * The state of the socket
     * @returns {number}
     */
    get state() {
        return this._socket.readyState;
    }

    /**
     * Connect to the socket and add listeners
     * @private
     */
    _connect() {
        this._socket = new WebSocket(this.url);

        this._socket.onopen = this._onOpenHandlerBound;
        this._socket.onmessage = this._onMessageHandlerBound;
        this._socket.onerror = this._onErrorHandlerBound;

        this._socket.onclose = () => {
            // clean everything up
            clearInterval(this._handshakeLoop);
            clearTimeout(this._handshakeTimeout);
        };
    }

    /**
     * Disconnect from the socket with a reason
     * @param {string} reason
     * @private
     */
    _disconnect(reason) {
        this._socket.close(1, reason);
        this._fakeEmit(new SocketMessage(SocketNames.disconnect, {
            reason: reason
        }));
    }

    /**
     * Set up the handshake loop
     * @private
     */
    _setupHandshake() {
        this._handshakeLoop = setInterval(() => {
            if (this.state === WebSocket.OPEN) {
                // reset error count
                this._errorCount = 0;

                // send handshake event
                this._lastPingTime = Date.now();
                this.send(SocketNames.handshake, {
                    time: Date.now()
                });

                clearTimeout(this._handshakeTimeout);
                this._handshakeTimeout = setTimeout(() => {
                    this._disconnect("timeout");
                }, this.handshakeTimeout);
            } else {
                if (this._errorCount > this.reconnectAttempts) {
                    this._disconnect("handshake");
                    return;
                }

                this._errorCount++;
            }
        }, this.handshakeInterval);

        this.on(SocketNames.handshake, () => {
            clearTimeout(this._handshakeTimeout);
            this.ping = Date.now() - this._lastPingTime;
        });
    }

    /**
     * Check if the connection is open
     * @returns {boolean}
     * @protected
     */
    _isConnected() {
        return this.state === WebSocket.OPEN;
    }

    /**
     * Sends `data` to the server
     * @param data
     * @protected
     */
    _send(data) {
        this._socket.send(data);
    }

    /**
     * Initialise `SocketClient`
     * @param {string} url - WebSocket url. Protocol will be replaced
     * @param {boolean} secure - When true, use WSS protocol instead
     */
    constructor(url, secure = false) {
        super();

        const protocol = `ws${secure ? "s" : ""}://`;
        this.url = protocol + url.replace(/^[a-z]+:\/\//, "");

        this._connect();
        this._setupHandshake();
    }
}