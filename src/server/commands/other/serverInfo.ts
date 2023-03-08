import { Command } from "../../../core";
import { Singleton } from "../../../core/utils/singleton";
import { ServerConfig } from "../../models/serverConfig";
import { TextResponse } from "../../responses/textResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

interface Context {
    readonly commands: NodeJS.ReadOnlyDict<Singleton<ServerCommand<any, any, any>>>;
}

export class ServerInfo extends Command<ServerConfig, Context, any, Response> {
    public description = "Returna the API description.";
    public property = null;

    public async execute(): Promise<Response> {
        const nameLabel = this.config.debug
            ? this.config.name + ' (debug)'
            : this.config.name;

        const commands = Object.keys(this.context.commands)
            .sort((a, b) => a.localeCompare(b));

        const maxCommandNameLength = Math.max(...commands.map(command => command.length));

        let result = `${nameLabel} v${this.config.version} by ${this.config.author}\n`;

        if (this.config.description) {
            result += '\n';
            result += this.config.description + '\n';
        }

        result += '\n';
        result += 'Public Commands:\n';
        result += commands
            .filter(command => !this.context.commands[command].instance.isPrivate)
            .map(command => `  ${command}${' '.repeat(maxCommandNameLength - command.length)} - ${this.context.commands[command].instance.description}`)
            .join('\n');

        result += '\n';
        result += '\n';
        result += 'Private Commands:\n';
        result += commands
            .filter(command => this.context.commands[command].instance.isPrivate)
            .map(command => `  ${command}${' '.repeat(maxCommandNameLength - command.length)} - ${this.context.commands[command].instance.description}`)
            .join('\n');

        return new TextResponse(result);
    }
}