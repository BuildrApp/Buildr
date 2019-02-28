import * as connect from "connect";
import {getLogger} from "./util/get-logger";

const logger = getLogger("backend");
const app = connect();



// listen for process events
process.on("unhandledRejection", (err: Error | string) => {
    if (!(err instanceof Error)) err = new Error(err);
    logger.error(err, "An error occurred");
});
process.on("uncaughtException", (err: Error | string) => {
    if (!(err instanceof Error)) err = new Error(err);
    logger.error(err, "An error occurred");
});
process.on("warning", (warning: Error | string) => {
    if (typeof warning !== "string") warning = `${warning.name}: ${warning.message}`;
    logger.warn(`Warning: ${warning}`);
});