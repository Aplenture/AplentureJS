import { parseToString } from "../../core/other/text";
import { Request } from "../utils/request";

export class TextRequest<TParams> extends Request<TParams, string> {
    protected parse(data: string): string {
        return parseToString(data);
    }
}