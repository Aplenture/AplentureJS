import { Request } from "../utils/request";

export class JSONRequest<TParams, TResponse> extends Request<TParams, TResponse> {
    protected parse(data: string): TResponse {
        return JSON.parse(data);
    }
}