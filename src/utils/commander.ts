import { Singleton } from "./singleton";
import { Command } from "./command";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";
import { formatDuration, parseArgs } from "../other";
import { Help } from "../commands";

const MAX_LENGTH_RESULT = 30;

export const COMMAND_HELP = 'help';

export class Commander {
    public static readonly onMessage = new Event<Commander, string>();

    private readonly _commands: NodeJS.Dict<Singleton<Command<any, any, any, any>>> = {};

    constructor() {
        this.addCommand(COMMAND_HELP, Help, null, { commands: this._commands });
    }

    public get commands(): NodeJS.ReadOnlyDict<Singleton<Command<any, any, any, any>>> { return this._commands; }

    public addCommand<TConfig, TContext, TArgs, TRes>(command: string, _constructor: new (...args: any[]) => Command<TConfig, TContext, TArgs, TRes>, ...args: any[]) {
        this._commands[command.toLowerCase()] = new Singleton(_constructor, ...args);
    }

    public execute<TArgs>(command: string, args?: any): Promise<TArgs> {
        const data = [];

        for (const key in args)
            data.push('--' + key, args[key]);

        return this.executeCommand(`${command} ${data.join(' ')}`, command, args);
    }

    public executeLine<TArgs>(commandLine: string): Promise<TArgs> {
        const split = commandLine.split(' ');
        const command = split[0] || COMMAND_HELP;
        const args = parseArgs(commandLine.substring(command.length));

        return this.executeCommand(commandLine, command, args);
    }

    public hasCommand(name: string): boolean {
        return !!this._commands[name.toLowerCase()];
    }

    public getCommand<T extends Command<any, any, any, any>>(name: string): T {
        return this._commands[name.toLowerCase()].instance as T;
    }

    protected async executeCommand<TRes>(commandLine: string, command: string, args = {}): Promise<TRes> {
        const stopwatch = new Stopwatch();

        command = command.toLowerCase();

        Commander.onMessage.emit(this, "commander << " + commandLine);

        if (!this._commands[command])
            throw new Error(`Unknown command '${command}'. Type '${COMMAND_HELP}' for help.`);

        const instance = this._commands[command].instance;

        try {
            if (instance.property)
                args = instance.property.parse(args);

            stopwatch.start();
            const result = await instance.execute(args);
            stopwatch.stop();

            let shortResult: string = result.toString();

            const maxResultLength = Math.min(
                Math.max(0, shortResult.indexOf('\n')),
                MAX_LENGTH_RESULT
            );

            if (shortResult.length > maxResultLength)
                shortResult = shortResult.substring(0, maxResultLength) + '[...]';

            Commander.onMessage.emit(this, `commander >> ${commandLine} >> ${shortResult} (${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })})`);

            return result as TRes;
        } catch (error) {
            Commander.onMessage.emit(this, `commander >> ${commandLine} >> ${error.stack}`);

            throw error;
        }
    }
}