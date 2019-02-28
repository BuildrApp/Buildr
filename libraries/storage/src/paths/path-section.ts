import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";
import Option from "../option";

export default interface PathSection {
    toString(): string;
    getFrom(obj: Stringifyable): Option<Stringifyable>;
    setFrom(obj: Stringifyable, value: Stringifyable): void;
    removeFrom(obj: Stringifyable): void;
    isIn(object: Stringifyable): boolean;
}