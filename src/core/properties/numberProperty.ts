import { parseToNumber } from "../other/text";
import { Property } from "../utils/property";

export class NumberProperty extends Property<number> {
    protected parseData(data: any): number {
        return parseToNumber(data, this.name);
    }
}