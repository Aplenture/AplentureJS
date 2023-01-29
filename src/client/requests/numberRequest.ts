import { parseToNumber } from "../../core";
import { Request } from "../utils";

export class NumberRequest<TParams> extends Request<TParams, number> {
    protected parse(data: string): number {
        return parseToNumber(data);
    }
}