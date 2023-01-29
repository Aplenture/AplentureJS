import { Database } from "./database";

export abstract class Repository {
    constructor(
        protected readonly database: Database,
        protected readonly table: string
    ) { }
}