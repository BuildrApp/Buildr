import SocketMessage from "./socket-message";

export default interface OnAnyCallback {
    (message: SocketMessage, size: number): void;
}