import { CommandArgs } from "../properties/commandArgs";
import { StringProperty } from "../properties/stringProperty";
import { Command } from "../utils/command";
import { Singleton } from "../utils/singleton";

interface Context {
    readonly commands: NodeJS.ReadOnlyDict<Singleton<Command<any, any, any, any>>>;
}

interface Args {
    readonly command: string;
}

export class Help extends Command<void, Context, Args, string> {
    public readonly description = "Lists all commands.";
    public readonly property = new CommandArgs<Args>(
        new StringProperty("command", "Name of part of name of command to get detailed help.", '')
    );

    public async execute(args: Args): Promise<string> {
        const commands = Object.keys(this.context.commands)
            .filter(command => command.includes(args.command))
            .sort((a, b) => a.localeCompare(b));

        const maxCommandNameLength = Math.max(...commands.map(command => command.length));

        let result = "";

        if (1 == commands.length) {
            const command = this.context.commands[commands[0]].instance;

            result += commands[0] + "\n";
            result += command.description + "\n";
            result += command.property.description;
        } else {
            result += commands
                .map(command => `${command}${' '.repeat(maxCommandNameLength - command.length)} - ${this.context.commands[command].instance.description}`)
                .join('\n');
            result += '\n';
        }

        return result;
    }
}