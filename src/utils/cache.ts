import { parseToJSON } from "../other/text";

export class Cache {
    private _changed = false;
    private _data = {};
    private _backup = {};

    public get changed(): boolean { return this._changed; }

    public static fromData(data: string): Cache {
        const result = new Cache();
        result.deserialize(data);
        return result;
    }

    public has(key: string): boolean {
        return !!this._data[key];
    }

    public get<T>(key: string, def?: T): T {
        return this._data[key] || def;
    }

    public all<T>(): NodeJS.ReadOnlyDict<T> {
        return Object.assign({}, this._data);
    }

    public set<T>(key: string, value: T, force = false): T {
        if (!force && this._data[key] === value)
            return value;

        this._changed = true;
        this._data[key] = value;

        return value;
    }

    public serialize(): string {
        this._changed = false;
        return JSON.stringify(this._data);
    }

    public deserialize(data: string): void {
        this._data = parseToJSON(data, {});
    }

    public clear(key?: string): void {
        if (key)
            delete this._data[key];
        else
            this._data = {};
    }

    public backup(): void {
        this._backup = Object.assign({}, this._data);
    }

    public rollback(): void {
        this._data = Object.assign({}, this._backup);
    }
}