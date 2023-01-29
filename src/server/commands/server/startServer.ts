import { Command } from "../../../core";
import { AppConfig, ServerConfig } from "../../models";
import { AccessRepository } from "../../repositories";
import { Server } from "../../utils";

interface Config extends AppConfig {
    readonly servers: readonly ServerConfig[];
}

interface Context {
    readonly repositories: {
        readonly access: AccessRepository;
    }
}

export class StartServer extends Command<Config, Context, any, string> {
    public readonly description = "Starts a server";
    public readonly property = null;

    public async execute(): Promise<string> {
        const server = new Server(this.context.repositories.access, this.config);

        server.init();
        server.start(...this.config.servers);

        return "server started";
    }
}