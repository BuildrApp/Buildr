import Path from "./paths/path";
import Result, {ErrWithOkType} from "./result";
import Option from "./option";

export type ResultType<T> = Result<Option<T>, Error>;
export type Ctor<T> = {new(): T} | string;

export default abstract class ConfigurationSection {
    private static _checkDataType<T>(data: any, ctor: Ctor<T>) {
        if (typeof ctor === "string") return typeof data === ctor;
        return data instanceof ctor;
    }

    private static _getPath(path: Path | string) {
        if (typeof path === "string") return new Path(path);
        return path;
    }

    public rootPath: Path;

    protected abstract getData(path: Path): Promise<ResultType<any>>;
    protected abstract setData<T>(path: Path, value: T): Promise<void>;
    protected abstract removeData(path: Path): Promise<void>;
    protected abstract getInner(path: Path): ConfigurationSection;

    protected constructor(rootPath: Path | string) {
        this.rootPath = ConfigurationSection._getPath(rootPath);
    }

    getSection(path: string | Path): ConfigurationSection {
        return this.getInner(ConfigurationSection._getPath(path));
    }

    async get<T>(path: string | Path, ctor: Ctor<T>): Promise<ResultType<T>> {
        const realPath = ConfigurationSection._getPath(path);
        if (realPath.structure.length < 1) throw new Error("Path must have at least one section");

        const data = await this.getData(realPath),
            expectedDataTypeName = typeof ctor === "string" ? ctor : ctor.name,
            realDataTypeName = typeof data === "object" ? data.constructor.name : typeof data;

        if (!ConfigurationSection._checkDataType(data, ctor))
            return ErrWithOkType<Option<T>, TypeError>(
                new TypeError(`Invalid data type for ${realPath}: ` +
                    `expecting ${expectedDataTypeName}, ` +
                    `found ${realDataTypeName}`)
            );

        return data;
    }

    set<T>(path: string | Path, value: T): Promise<void> {
        const realPath = ConfigurationSection._getPath(path);
        if (realPath.structure.length < 1) throw new Error("Path must have at least one section");
        return this.setData(realPath, value);
    }

    remove(path: string | Path): Promise<void> {
        const realPath = ConfigurationSection._getPath(path);
        if (realPath.structure.length < 1) throw new Error("Path must have at least one section");
        return this.removeData(realPath);
    }
}