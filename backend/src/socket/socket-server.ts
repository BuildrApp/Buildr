import * as ws from "ws";
import SocketConnectionCallback from "./socket-connection-callback";
import SocketServerConnection from "./socket-server-connection";

export default class SocketServer {
    private _server: ws.Server;

    public constructor(port_httpServer_options: number | ws.ServerOptions | ws.Server) {
        if (typeof port_httpServer_options === "number") {
            this._server = new ws.Server({port: port_httpServer_options});
        } else if (typeof port_httpServer_options === "object") {
            this._server = new ws.Server(port_httpServer_options);
        } else {
            this._server = new ws.Server({server: port_httpServer_options});
        }
    }

    public listen(connection: SocketConnectionCallback) {
        this._server.on("connection", (client, req) => {
            connection(new SocketServerConnection(client, req));
        });
    }
}