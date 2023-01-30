import { parseToString } from "../other/text";
import { Property } from "../utils/property";

export class StringProperty extends Property<string> {
    protected parseData(data: any): string {
        return parseToString(data, this.name);
    }
}