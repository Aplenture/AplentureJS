import { parseToString } from "../other";
import { Property } from "../utils";

export class StringProperty extends Property<string> {
    public parse(data: any): string {
        if (!data && this.optional)
            return '';

        return parseToString(data, this.name);
    }
}