import SocketEvent from "./socket-event";

export default interface SocketListeners {
    [event: number]: SocketEvent[];
}