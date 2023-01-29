import { Request } from "../utils";

export class JSONRequest<TParams, TResponse> extends Request<TParams, TResponse> {
    protected parse(data: string): TResponse {
        return JSON.parse(data);
    }
}