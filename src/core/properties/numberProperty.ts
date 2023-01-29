import { parseToNumber } from "../other/text";
import { Property } from "../utils/property";

export class NumberProperty extends Property<number> {
    public parse(data: any): number {
        if (!data && this.optional)
            return 0;

        return parseToNumber(data, this.name);
    }
}