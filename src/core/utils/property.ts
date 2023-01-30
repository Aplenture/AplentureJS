export abstract class Property<T> {
    constructor(
        public readonly name: string,
        public readonly description: string,
        protected readonly _default?: T
    ) { }

    public get optional(): boolean { return undefined != this._default; }

    public parse(data: any): T {
        if (undefined == data && this.optional)
            return this._default;

        return this.parseData(data);
    }

    protected abstract parseData(data: any): T;
}