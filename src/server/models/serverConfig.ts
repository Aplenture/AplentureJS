import { CommandConfig } from "./commandConfig";
import { DatabaseConfig } from "./databaseConfig";
import { HTTPConfig } from "./httpConfig";
import { RepositoryConfig } from "./repositoryConfig";

export interface ServerConfig {
    readonly name: string;
    readonly debug: boolean;
    readonly version: string;
    readonly author: string;
    readonly description: string;
    readonly servers: readonly HTTPConfig[];
    readonly databases: NodeJS.ReadOnlyDict<DatabaseConfig>;
    readonly repositories: NodeJS.ReadOnlyDict<RepositoryConfig>;
    readonly localCommands: NodeJS.ReadOnlyDict<CommandConfig>;
    readonly globalCommands: NodeJS.ReadOnlyDict<CommandConfig>;
}