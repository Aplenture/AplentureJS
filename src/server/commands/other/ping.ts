import { TextResponse } from "../../responses/textResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

export class Ping extends ServerCommand<any, any, any> {
    public readonly isPrivate = false;
    public readonly description = "Returns 'pong'.";
    public readonly property = null;

    public async execute(): Promise<Response> {
        return new TextResponse('pong');
    }
}