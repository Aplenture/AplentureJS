import { ResponseCode, ResponseType } from "../../core";
import { Response } from "../utils";

export class JSONResponse extends Response {
    constructor(data: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number) {
        super(JSON.stringify(data, replacer, space), ResponseType.JSON, ResponseCode.OK);
    }
}