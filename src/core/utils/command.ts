import { CommandArgs } from "../properties/commandArgs";
import { Event } from "./event";

export abstract class Command<TConfig, TContext, TArgs extends NodeJS.ReadOnlyDict<any>, TRes> {
    public static readonly onMessage = new Event<Command<any, any, any, any>, string>('Command.onMessage');

    public abstract readonly description: string;
    public abstract readonly property?: CommandArgs<TArgs>;

    constructor(
        public readonly config: TConfig,
        public readonly context: TContext
    ) { }

    public abstract execute(args: TArgs): Promise<TRes>;

    protected message(text: string) {
        Command.onMessage.emit(this, text);
    }
}