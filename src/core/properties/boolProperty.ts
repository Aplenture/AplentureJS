import { parseToBool } from "../other/text";
import { Property } from "../utils/property";

export class BoolProperty extends Property<boolean> {
    public parse(data: any): boolean {
        if (!data && this.optional)
            return false;

        return parseToBool(data, this.name);
    }
}