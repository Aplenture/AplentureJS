import { parseToBool } from "../other/text";
import { Property } from "../utils/property";

export class BoolProperty extends Property<boolean> {
    protected parseData(data: any): boolean {
        return parseToBool(data, this.name);
    }
}