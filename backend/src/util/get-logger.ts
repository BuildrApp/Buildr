import {existsSync} from "fs";
import {mkdirsSync} from "fs-extra-promise";
import * as bunyan from "bunyan";
import * as createCallsiteRecord from "callsite-record";
import {renderers} from "callsite-record";

export function getLogger(name: string) {
    // create output directory if it doesn't exist
    if (!existsSync("logs")) mkdirsSync("logs");

    return bunyan.createLogger({
        name,

        streams: [
            {
                level: "trace",
                stream: process.stdout
            },
            {
                type: "rotating-file",
                period: "1d",
                level: "trace",
                count: 12,
                path: "logs/trace.log"
            },
            {
                type: "rotating-file",
                period: "1d",
                level: "error",
                count: 12,
                path: "logs/error.log"
            }
        ],

        serializers: {
            res: bunyan.stdSerializers.res,
            req: bunyan.stdSerializers.req,

            err(err: Error | string) {
                if (typeof err === "string") err = new Error(err);

                const record = createCallsiteRecord({
                    forError: err
                });
                if (record === null) return err.message;

                try {
                    return err.message + "\n\n" + record.renderSync({
                        renderer: renderers.default,
                        stackFilter(frame) {
                            return !frame.fileName.includes("node_modules")
                        }
                    });
                } catch {
                    return "[could not generate filter] " + err.message;
                }
            }
        }
    })
}