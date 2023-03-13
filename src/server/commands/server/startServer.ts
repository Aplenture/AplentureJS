import { Command } from "../../../core/utils/command";
import { Server } from "../../utils/server";

interface Context {
    readonly server: Server;
}

export class StartServer extends Command<any, Context, any, void> {
    public readonly description = "Starts a server";
    public readonly property = null;

    public execute(): Promise<void> {
        return this.context.server.start();
    }
}