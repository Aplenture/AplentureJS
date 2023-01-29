import { parseToBool } from "../other";
import { Property } from "../utils";

export class BoolProperty extends Property<boolean> {
    public parse(data: any): boolean {
        if (!data && this.optional)
            return false;

        return parseToBool(data, this.name);
    }
}