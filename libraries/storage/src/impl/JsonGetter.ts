import {Stringifyable} from "@buildr/stringifyable/src/stringifyable";
import ConfigurationSection, {ResultType} from "../configuration-section";
import Path from "../paths/path";
import {Ok} from "../result";
import Option, {None, Some} from "../option";

export default class JsonGetter extends ConfigurationSection {
    private readonly _source: Stringifyable;

    protected getData(path: Path): Promise<ResultType<any>> {
        const result: Option<any> = path.structure.reduce((obj: Option<Stringifyable>, part) => {
            return part.getFrom(obj.unwrapOr({}));
        }, this._source);

        return Promise.resolve(Ok(result));
    }

    protected getInner(path: Path): ConfigurationSection {
        return new JsonGetter(this._source, this.rootPath.append(path));
    }

    protected async removeData(path: Path): Promise<void> {
        // get data one section above
        const lastSection = await this.getData(path.slice(0, path.structure.length - 1));

        // we can do this because `ConfigurationSection` makes sure that path.structure.length > 0
        path.structure[path.structure.length - 1].removeFrom(lastSection);
    }

    protected async setData<T>(path: Path, value: T): Promise<void> {
        // get data one section above
        const lastSection = await this.getData(path.slice(0, path.structure.length - 1));

        // we can do this because `ConfigurationSection` makes sure that path.structure.length > 0
        path.structure[path.structure.length - 1].setFrom(lastSection, value);
    }

    constructor(source: Stringifyable, rootPath: Path | string) {
        super(rootPath);
        this._source = source;
    }
}