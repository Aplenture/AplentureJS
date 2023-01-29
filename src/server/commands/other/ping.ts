import { TextResponse } from "../../responses";
import { ServerCommand, Response } from "../../utils";

export class Ping extends ServerCommand<any, any, any> {
    public readonly isPrivate = false;
    public readonly description = "Returns 'pong'.";
    public readonly property = null;

    public async execute(): Promise<Response> {
        return new TextResponse('pong');
    }
}