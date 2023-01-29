import { parseToBool } from "../../core/other/text";
import { Request } from "../utils/request";

export class BoolRequest<TParams> extends Request<TParams, boolean> {
    protected parse(data: string): boolean {
        return parseToBool(data);
    }
}