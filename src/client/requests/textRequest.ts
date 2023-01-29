import { parseToString } from "../../core";
import { Request } from "../utils";

export class TextRequest<TParams> extends Request<TParams, string> {
    protected parse(data: string): string {
        return parseToString(data);
    }
}