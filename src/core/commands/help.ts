import { DictionaryProperty, StringProperty } from "../properties";
import { Command, Singleton } from "../utils";

interface Context {
    readonly commands: NodeJS.ReadOnlyDict<Singleton<Command<any, any, any, any>>>;
}

interface Args {
    readonly command: string;
}

export class Help extends Command<void, Context, Args, string> {
    public readonly description = "Lists all commands.";
    public readonly property = new DictionaryProperty<Args>("",
        new StringProperty("command", "Name of part of name of command to get detailed help.", true)
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