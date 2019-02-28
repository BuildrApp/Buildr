import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";
import {SocketMessageName} from "./socket-message-name";

export interface ExtraSocketData {
    requestId?: string;
    authenticationToken?: string;
}

export default class SocketMessage {
    public name: SocketMessageName;
    public data: Stringifyable;
    public extra: ExtraSocketData;

    constructor(name: SocketMessageName, data: Stringifyable = null, extra: ExtraSocketData = {}) {
        this.name = name;
        this.data = data;
        this.extra = extra;
    }
}