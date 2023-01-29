import { ResponseCode, ResponseType } from "../../core";
import { Response } from "../utils";

export class TextResponse extends Response {
    constructor(text: string, code = ResponseCode.OK) {
        super(text, ResponseType.Text, code);
    }
}