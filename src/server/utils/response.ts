import { ResponseCode } from "../../core/enums/responseCode";
import { ResponseType } from "../../core/enums/responseType";

export class Response {
    constructor(
        public readonly data: string,
        public readonly type: ResponseType,
        public readonly code: ResponseCode
    ) { }

    public toString(): string {
        return `${this.type} ${this.code} ${this.data}`;
    }
}