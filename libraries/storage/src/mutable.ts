import {EventEmitter} from "events";

export class Mutable<T> extends EventEmitter {
    private _value: T;

    public get(): T {
        this.emit("get", this._value);
        return this._value;
    }

    public set(value: T): void {
        this.emit("set", this._value, value);
        this._value = value;
    }

    constructor(value: T) {
        super();

        this._value = value;
    }
}