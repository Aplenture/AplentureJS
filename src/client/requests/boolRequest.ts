import { parseToBool } from "../../core";
import { Request } from "../utils";

export class BoolRequest<TParams> extends Request<TParams, boolean> {
    protected parse(data: string): boolean {
        return parseToBool(data);
    }
}