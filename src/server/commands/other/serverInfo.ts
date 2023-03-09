import { Command } from "../../../core";
import { Singleton } from "../../../core/utils/singleton";
import { ServerConfig } from "../../models/serverConfig";
import { TextResponse } from "../../responses/textResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

interface Context {
    readonly commands: NodeJS.ReadOnlyDict<Singleton<ServerCommand<any, any, any>>>;
}

export class ServerInfo extends ServerCommand<ServerConfig, Context, any> {
    public readonly isPrivate = false;
    public readonly description = "Returns the API description.";
    public readonly property = null;

    public async execute(): Promise<Response> {
        const nameLabel = this.config.debug
            ? this.config.name + ' (debug)'
            : this.config.name;

        const commands = Object.keys(this.context.commands)
            .sort((a, b) => a.localeCompare(b));

        const maxCommandNameLength = Math.max(...commands.map(command => command.length));

        const publicCommands = commands.filter(command => !this.context.commands[command].instance.isPrivate);
        const privateCommands = commands.filter(command => this.context.commands[command].instance.isPrivate);

        let result = `${nameLabel} v${this.config.version} by ${this.config.author}\n`;

        if (this.config.description) {
            result += '\n';
            result += this.config.description + '\n';
        }

        if (publicCommands.length) {
            result += '\n';
            result += 'Public Commands:\n';
            result += publicCommands
                .map(command => `  ${command}${' '.repeat(maxCommandNameLength - command.length)} - ${this.context.commands[command].instance.description}`)
                .join('\n');
        }

        result += '\n';

        if (privateCommands.length) {
            result += '\n';
            result += 'Private Commands:\n';
            result += privateCommands
                .map(command => `  ${command}${' '.repeat(maxCommandNameLength - command.length)} - ${this.context.commands[command].instance.description}`)
                .join('\n');
        }

        return new TextResponse(result);
    }
}