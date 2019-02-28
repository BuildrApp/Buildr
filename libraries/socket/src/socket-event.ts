import SocketMessage from "./socket-message";
import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";

export default interface SocketEvent {
    (response: Stringifyable, message: SocketMessage): void;
}