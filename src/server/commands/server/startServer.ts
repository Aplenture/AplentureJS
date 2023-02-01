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
        readonly AccessRepository: AccessRepository;
    }
}

export class StartServer extends Command<Config, Context, any, void> {
    public readonly description = "Starts a server";
    public readonly property = null;

    public execute(): Promise<void> {
        const server = new Server(this.context.repositories.AccessRepository, this.config);

        server.init();

        return server.start(...this.config.servers);
    }
}