import { parseToNumber } from "../../core/other/text";
import { Request } from "../utils/request";

export class NumberRequest<TParams> extends Request<TParams, number> {
    protected parse(data: string): number {
        return parseToNumber(data);
    }
}