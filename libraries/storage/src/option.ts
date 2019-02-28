import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";
import Result, {ErrWithOkType, OkWithErrType} from "./result";
import {Mutable} from "./mutable";

export default class Option<T extends Stringifyable> {
    public static withNoValue<T>() {
        return new Option<T>(false, null);
    }

    public static withValue<T>(value: T) {
        return new Option<T>(true, value);
    }

    public static withValueUnlessNull<T>(value: T) {
        if (value === null) return this.withNoValue();
        return this.withValue(value);
    }

    private _hasValue: boolean;
    private readonly _value: Mutable<T | null>;

    public get isSome() {
        return this._hasValue;
    }

    public get isNone() {
        return !this._hasValue;
    }

    public constructor(hasValue: boolean, value: T | null) {
        this._hasValue = hasValue;
        this._value = new Mutable(value);
    }

    public expect(message: string) {
        if (this.isNone) throw new ReferenceError(message);
    }

    public unwrap(): T {
        this.expect("Result is empty");
        return this._value.get();
    }

    public unwrapOr(def: T): T {
        return this.isSome ? this._value.get() : def;
    }

    public unwrapOrElse(callback: () => T): T {
        return this.isSome ? this._value.get() : callback();
    }

    public map<U>(callback: (value: T) => U): Option<U> {
        return this.isSome ? Some(callback(this._value.get())) : NoneTyped<U>();
    }

    public mapOr<U>(def: U, callback: (value: T) => U): U {
        return this.isSome ? callback(this._value.get()) : def;
    }

    public mapOrElse<U>(def: () => U, callback: (value: T) => U): U {
        return this.isSome ? callback(this._value.get()) : def();
    }

    public okOr<E extends Error>(err: E): Result<T, E> {
        if (this.isSome) return OkWithErrType<T, E>(this._value.get());
        return ErrWithOkType<T, E>(err);
    }

    public okOrElse<E extends Error>(err: () => E): Result<T, E> {
        if (this.isSome) return OkWithErrType<T, E>(this._value.get());
        return ErrWithOkType<T, E>(err());
    }

    public iter(): T[] {
        if (this.isSome) return [this._value.get()];
        return [];
    }

    public and<U>(optn: Option<U>): Option<U> {
        if (this.isSome && optn.isSome) return optn;
        return NoneTyped<U>();
    }

    public andThen<U>(f: (value: T) => Option<U>): Option<U> {
        if (this.isSome) return f(this._value.get());
        return NoneTyped<U>();
    }

    public filter<P>(predicate: (value: T) => boolean): Option<T> {
        if (this.isSome && predicate(this._value.get())) return this;
        return NoneTyped<T>();
    }

    public or(optb: Option<T>): Option<T> {
        if (this.isSome) return this;
        if (optb.isSome) return optb;
        return NoneTyped<T>();
    }

    public orElse(f: () => Option<T>): Option<T> {
        if (this.isSome) return this;
        return f();
    }

    public xor(optb: Option<T>): Option<T> {
        if (this.isSome && optb.isNone) return this;
        return optb;
    }

    public getOrInsert(v: T): Mutable<T> {
        if (this.isNone) {
            this._value.set(v);
            this._hasValue = true;
        }

        return this._value;
    }

    public getOrInsertWith(f: () => T): Mutable<T> {
        if (this.isNone) {
            this._value.set(f());
            this._hasValue = true;
        }

        return this._value;
    }

    public take(): Option<T> {
        this._hasValue = false;
        return this;
    }

    public replace(value: T): Option<T> {
        this._hasValue = true;
        this._value.set(value);
        return this;
    }
}

export function Some<T>(value: T) {
    return new Option(true, value);
}

export const None = new Option<void>(false, null);

export function NoneTyped<T>() {
    return new Option<T>(false, null);
}