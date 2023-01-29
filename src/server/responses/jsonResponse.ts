import { ResponseCode } from "../../core/enums/responseCode";
import { ResponseType } from "../../core/enums/responseType";
import { Response } from "../utils/response";

export class JSONResponse extends Response {
    constructor(data: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number) {
        super(JSON.stringify(data, replacer, space), ResponseType.JSON, ResponseCode.OK);
    }
}