import { Singleton } from "./singleton";
import { Command } from "./command";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";
import { formatDuration } from "../other/time";
import { parseArgs } from "../other/text";
import { Help } from "../commands/help";

export const COMMAND_HELP = 'help';

export class Commander {
    public readonly onMessage = new Event<Commander, string>('Commander.onMessage');
    public readonly onCommand = new Event<string, string>('Commander.onCommand');

    constructor(public readonly commands: NodeJS.ReadOnlyDict<Singleton<Command<any, any, any, any>>> = {}, addHelpCommand = true) {
        if (addHelpCommand)
            (commands[COMMAND_HELP] as any) = new Singleton(Help, null, { commands });

        for (const key in commands)
            commands[key].onInstantiated.once(instance => instance.onMessage.on(message => this.onCommand.emit(key, message)));
    }

    public execute<T>(command: string, args?: any): Promise<T> {
        const data = [];

        for (const key in args)
            data.push('--' + key, args[key]);

        return this.executeCommand(`${command} ${data.join(' ')}`, command, args);
    }

    public executeLine<T>(commandLine: string): Promise<T> {
        const split = commandLine.split(' ');
        const command = split[0] || COMMAND_HELP;
        const args = parseArgs(commandLine.substring(command.length));

        return this.executeCommand(commandLine, command, args);
    }

    public hasCommand(name: string): boolean {
        return !!this.commands[name.toLowerCase()];
    }

    public getCommand<T extends Command<any, any, any, any>>(name: string): T {
        if (!this.hasCommand(name))
            throw new Error(`unknown command '${name}'`);

        return this.commands[name.toLowerCase()].instance as T;
    }

    protected async executeCommand<TRes>(commandLine: string, command: string, args = {}): Promise<TRes> {
        const stopwatch = new Stopwatch();

        command = command.toLowerCase();

        if (!this.commands[command])
            throw new Error(`Unknown command '${command}'. Type '${COMMAND_HELP}' for help.`);

        const instance = this.commands[command].instance;

        try {
            if (instance.property)
                args = instance.property.parse(args);

            stopwatch.start();
            const result = await instance.execute(args);
            stopwatch.stop();

            this.onMessage.emit(this, `executed ${commandLine} in (${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })})`);

            return result as TRes;
        } catch (error) {
            this.onMessage.emit(this, `executed ${commandLine} >> ${error.stack}`);

            throw error;
        }
    }
}