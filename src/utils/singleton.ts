import { Event } from "./event";

export class Singleton<T> {
    public static onInstantiated = new Event<Singleton<any>, any>();

    private readonly args: any[];

    private _instance: T;

    constructor(private readonly _constructor: new (...args: any[]) => T, ...args: any[]) {
        this.args = args;
    }

    public get instance(): T {
        if (this._instance)
            return this._instance;

        this._instance = new this._constructor(...this.args);

        Singleton.onInstantiated.emit(this, this._instance);

        return this._instance;
    }
}