import Option, {Some} from "./option";

export default class Result<T, E extends Error> {
    private _isError: boolean;
    private _value: T;
    private _error: E;

    public get isOk(): boolean {
        return !this._isError;
    }

    public get isErr(): boolean {
        return this._isError;
    }

    public constructor(isError: boolean, value: T, error: E) {
        this._isError = isError;
        this._value = value;
        this._error = error;
    }

    public ok(): Option<T> {
        return Some(this._value);
    }

    public err(): Option<E> {
        return Some(this._error);
    }

    public map<U>(op: (value: T) => U): Result<U, E> {
        return new Result(this.isErr, op(this._value), this._error);
    }

    public mapOrElse<U>(fallback: (error: E) => U, map: (value: T) => U): Result<U, E> {
        return new Result(this.isErr, this.isErr ? fallback(this._error) : map(this._value), this._error);
    }

    public mapErr<F extends Error>(op: (error: E) => F): Result<T, F> {
        return new Result(this.isErr, this._value, op(this._error));
    }

    public iter(): T[] {
        if (this.isErr) return [];
        return [this._value];
    }

    public and<U>(res: Result<U, E>): Result<U, E> {
        if (this.isOk && res.isOk) return res;
        return new Result(true, null, this._error);
    }

    public andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
        if (this.isOk) return op(this._value);
        return new Result(true, null, this._error);
    }

    public unwrapOr(optB: T): T {
        if (this.isOk) return this._value;
        return optB;
    }

    public unwrapOrElse(op: (error: E) => T): T {
        if (this.isOk) return this._value;
        return op(this._error);
    }

    public unwrap(): T {
        if (this.isErr) throw this._error;
        return this._value;
    }

    public expect(message: string): T {
        if (this.isErr) throw new ReferenceError(`${message}: ${this._error.message}`);
        return this._value;
    }

    public unwrapErr(): E {
        if (this.isOk) throw new ReferenceError(this._value.toString());
        return this._error;
    }

    public expectErr(message: string): E {
        if (this.isOk) throw new ReferenceError(`${message}: ${this._value}`);
        return this._error;
    }
}

export function OkWithErrType<T, E extends Error>(value: T): Result<T, E> {
    return new Result<T, E>(false, value, null);
}

export function Ok<T>(value: T): Result<T, Error> {
    return OkWithErrType<T, Error>(value);
}

export function ErrWithOkType<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(true, null, error);
}

export function Err<E extends Error>(error: E): Result<void, E> {
    return ErrWithOkType<void, E>(error);
}