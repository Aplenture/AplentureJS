import { Command } from "../../../core/utils/command";
import { Singleton } from "../../../core/utils/singleton";
import { ServerConfig } from "../../models/serverConfig";
import { TextResponse } from "../../responses/textResponse";
import { Response } from "../../utils/response";

interface Context {
    readonly commands: NodeJS.ReadOnlyDict<Singleton<Command<any, any, any, any>>>;
}

export class ServerHelp extends Command<ServerConfig, Context, any, Response> {
    public description = "Returna the API description.";
    public property = null;

    public async execute(): Promise<Response> {
        const commands = Object.keys(this.context.commands)
            .sort((a, b) => a.localeCompare(b));

        const maxCommandNameLength = Math.max(...commands.map(command => command.length));

        let result = `${this.config.name} v${this.config.version} by ${this.config.author}\n`;

        if (this.config.description) {
            result += '\n';
            result += this.config.description + '\n';
        }

        result += '\n';
        result += 'Commands:\n';
        result += commands
            .map(command => `  ${command}${' '.repeat(maxCommandNameLength - command.length)} - ${this.context.commands[command].instance.description}`)
            .join('\n');

        return new TextResponse(result);
    }
}