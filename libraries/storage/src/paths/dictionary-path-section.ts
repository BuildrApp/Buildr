import PathSection from "./path-section";
import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";

export default class DictionaryPathSection implements PathSection {
    key: string;

    constructor(key: string) {
        this.key = key;
    }

    toString(): string {
        return `.${this.key}`;
    }

    getFrom(obj: Stringifyable): Stringifyable {
        return obj[this.key];
    }

    setFrom(obj: Stringifyable, value: Stringifyable) {
        obj[this.key] = value;
    }

    isIn(object: Stringifyable): boolean {
        return this.key in object;
    }

    removeFrom(obj: Stringifyable): void {
        delete obj[this.key];
    }
}