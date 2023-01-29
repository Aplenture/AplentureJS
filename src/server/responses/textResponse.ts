import { ResponseCode } from "../../core/enums/responseCode";
import { ResponseType } from "../../core/enums/responseType";
import { Response } from "../utils/response";

export class TextResponse extends Response {
    constructor(text: string, code = ResponseCode.OK) {
        super(text, ResponseType.Text, code);
    }
}