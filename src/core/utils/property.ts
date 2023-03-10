export abstract class Property<T> {
    public readonly optional: boolean;

    constructor(
        public readonly name: string,
        public readonly description: string,
        protected readonly _default?: T
    ) {
        this.optional = undefined !== this._default;
    }

    public parse(data: any): T {
        if (this.optional && (undefined === data || this._default === data))
            return this._default;

        return this.parseData(data);
    }

    protected abstract parseData(data: any): T;
}