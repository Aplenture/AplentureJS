export abstract class Property<T> {
    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly optional = false
    ) { }

    public abstract parse(data: any): T;
}