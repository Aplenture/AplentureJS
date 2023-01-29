import { parseToString } from "../other/text";
import { Property } from "../utils/property";

export class StringProperty extends Property<string> {
    public parse(data: any): string {
        if (!data && this.optional)
            return '';

        return parseToString(data, this.name);
    }
}