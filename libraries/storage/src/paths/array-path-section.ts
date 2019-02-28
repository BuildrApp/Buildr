import PathSection from "./path-section";
import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";

export default class ArrayPathSection implements PathSection {
    index: number;

    constructor(index: number) {
        this.index = index;
    }

    toString(): string {
        return `[${this.index}]`;
    }

    getFrom(obj: Stringifyable): Stringifyable {
        return obj[this.index];
    }

    setFrom(obj: Stringifyable, value: Stringifyable) {
        obj[this.index] = value;
    }

    isIn(object: Stringifyable): boolean {
        return this.index in object;
    }

    removeFrom(obj: Stringifyable): void {
        delete obj[this.index];
    }
}