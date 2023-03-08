import { Command } from "../../../core/utils/command";
import { Server } from "../../utils/server";

interface Context {
    readonly server: Server;
}

export class StartServer extends Command<any, Context, any, void> {
    public readonly description = "Starts a server";
    public readonly property = null;

    public async execute(): Promise<void> {
        this.context.server.start();
    }
}