import { Database } from "../utils/database";
import { Repository } from "../utils/repository";

export interface ServerContext {
    readonly databases: NodeJS.ReadOnlyDict<Database>;
    readonly repositories: NodeJS.ReadOnlyDict<Repository>;
}