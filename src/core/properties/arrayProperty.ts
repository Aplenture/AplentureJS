import { Property } from "../utils/property";

export class ArrayProperty<T> extends Property<readonly T[]> {
    constructor(
        protected readonly parser: (data: any) => T,
        name: string,
        description: string,
        _default?: readonly T[]
    ) {
        super(name, description, _default);
    }

    protected parseData(data: any): readonly T[] {
        if (Array.isArray(data))
            return data.map(data => this.parser(data));

        return [this.parser(data)];
    }
}