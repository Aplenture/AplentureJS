import { Property } from "../utils";

export class ArrayProperty<T> extends Property<readonly T[]> {
    public readonly properties: readonly Property<T>[];

    constructor(name: string, ...properties: readonly Property<T>[]) {
        const maxNameLength = Math.max(...properties.map((_, index) => index.toString().length));

        super(name, properties.map((property, index) => '  ' + index + ' '.repeat(maxNameLength - index.toString().length) + ' - ' + (property.optional ? '(optional)' : '') + property.description).join("\n"),);

        this.properties = properties;
    }

    public parse(data = []): readonly T[] {
        return this.properties.map((property, index) => property.parse(data[index]));
    }
}