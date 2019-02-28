import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";

export default interface ResponderFunction {
    (data: Stringifyable): Stringifyable | Promise<Stringifyable>;
}