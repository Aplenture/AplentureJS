import { Database } from "../utils/database";
import { Repository } from "../utils/repository";
import { Server } from "../utils/server";

export interface ServerContext {
    readonly server: Server;
    readonly databases: NodeJS.Dict<Database>;
    readonly repositories: NodeJS.Dict<Repository>;
}