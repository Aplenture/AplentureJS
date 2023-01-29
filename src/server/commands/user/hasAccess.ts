import { Server, ServerCommand, Response } from "../../utils";
import { AccessRepository } from "../../repositories";
import { BoolResponse, OKResponse } from "../../responses";
import { DictionaryProperty, NumberProperty, StringProperty } from "../../../core";

interface Args {
    readonly session: string;
    readonly signature: string;
    readonly timestamp: number;
}

interface Context {
    readonly repositories: {
        readonly access: AccessRepository;
    }
}

export class HasAccess extends ServerCommand<void, Context, Args> {
    public readonly isPrivate = false;
    public readonly description = "Returns whether access is valid."
    public readonly property = new DictionaryProperty<Args>("",
        new StringProperty("sesion", "Access session."),
        new StringProperty("signature", "Signatured timestamp."),
        new NumberProperty("timestamp", "Validation timestamp.")
    );

    public async execute(args: Args): Promise<Response> {
        const access = await this.context.repositories.access.getByAPI(args.session);
        const time = Date.now();

        if (!Server.validateAccess(access, time))
            return new BoolResponse(false);

        if (!Server.validateSignature(args.signature, args.timestamp.toString(), access.secret))
            return new BoolResponse(false);

        return new OKResponse();
    }
}