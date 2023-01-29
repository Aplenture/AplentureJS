import { Response } from "./response";
import { Command } from "../../core";

export abstract class ServerCommand<TConfig, TContext, TArgs> extends Command<TConfig, TContext, TArgs, Response> {
    public abstract readonly isPrivate: boolean;
}