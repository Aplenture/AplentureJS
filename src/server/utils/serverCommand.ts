import { Command } from "../../core/utils/command";
import { Response } from "./response";

export abstract class ServerCommand<TConfig, TContext, TArgs> extends Command<TConfig, TContext, TArgs, Response> {
    public abstract readonly isPrivate: boolean;
}