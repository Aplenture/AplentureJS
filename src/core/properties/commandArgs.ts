import { Property } from "../utils/property";

export class CommandArgs<T extends NodeJS.ReadOnlyDict<any>> extends Property<T> {
    public readonly properties: readonly Property<any>[];

    constructor(...properties: readonly Property<any>[]) {
        const maxNameLength = Math.max(...properties.map(property => property.name.length));

        super("", properties.map(property => '  ' + property.name + ' '.repeat(maxNameLength - property.name.length) + ' - ' + (property.optional ? '(optional) ' : '') + property.description).join("\n"),);

        this.properties = properties;
    }

    protected parseData(data = {}): T {
        const result = {};

        this.properties.forEach(property => result[property.name] = property.parse(data[property.name]));

        return result as any;
    }
}