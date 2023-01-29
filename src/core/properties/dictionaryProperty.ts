import { Property } from "../utils";

export class DictionaryProperty<T extends NodeJS.ReadOnlyDict<any>> extends Property<T> {
    public readonly properties: readonly Property<any>[];

    constructor(name: string, ...properties: readonly Property<any>[]) {
        const maxNameLength = Math.max(...properties.map(property => property.name.length));

        super(name, properties.map(property => '  ' + property.name + ' '.repeat(maxNameLength - property.name.length) + ' - ' + (property.optional ? '(optional)' : '') + property.description).join("\n"),);

        this.properties = properties;
    }

    public parse(data = {}): T {
        const result = {};

        this.properties.forEach(property => result[property.name] = property.parse(data[property.name]));

        return result as any;
    }
}