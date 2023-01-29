import { Command } from "../../../core/utils/command";
import { HTTPConfig } from "../../models/httpConfig";
import { ServerConfig } from "../../models/serverConfig";
import { AccessRepository } from "../../repositories/accessRepository";
import { Server } from "../../utils/server";

interface Config extends ServerConfig {
    readonly servers: readonly HTTPConfig[];
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