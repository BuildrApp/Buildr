import SocketServerConnection from "./socket-server-connection";

export default interface SocketConnectionCallback {
    (client: SocketServerConnection): void;
}