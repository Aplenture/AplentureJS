import { CommandArgs } from "../../../core/properties/commandArgs";
import { StringProperty } from "../../../core/properties/stringProperty";
import { Command } from "../../../core/utils/command";
import { DatabaseConfig } from "../../models/databaseConfig";
import { Database } from "../../utils/database";

interface Config {
    readonly databases: readonly DatabaseConfig[];
}

interface Args {
    readonly directory: string;
}

export class ResetDatabase extends Command<Config, void, Args, string> {
    public readonly description = "Resets the databases.";
    public readonly property = new CommandArgs<Args>(
        new StringProperty("directory", "Directory of update files.", null)
    );

    public async execute(args: Args): Promise<string> {
        for (const name in this.config.databases) {
            const config = this.config.databases[name];
            const database = new Database(name, config);

            database.onMessage.on(message => this.message(message));

            this.message(`drop database '${name}'`);
            await Database.drop(config);

            this.message(`create database '${name}'`);
            await Database.create(config);

            this.message(`update database '${name}'`);
            await database.init();
            await database.update(args.directory);
            await database.close();
        }

        return "databases reset";
    }
}