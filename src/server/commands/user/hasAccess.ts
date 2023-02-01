import { CommandArgs } from "../../../core/properties/commandArgs";
import { NumberProperty } from "../../../core/properties/numberProperty";
import { StringProperty } from "../../../core/properties/stringProperty";
import { AccessRepository } from "../../repositories/accessRepository";
import { BoolResponse } from "../../responses/boolResponse";
import { OKResponse } from "../../responses/okResponse";
import { Response } from "../../utils/response";
import { Server } from "../../utils/server";
import { ServerCommand } from "../../utils/serverCommand";

interface Args {
    readonly api: string;
    readonly signature: string;
    readonly timestamp: number;
}

interface Context {
    readonly repositories: {
        readonly AccessRepository: AccessRepository;
    }
}

export class HasAccess extends ServerCommand<void, Context, Args> {
    public readonly isPrivate = false;
    public readonly description = "Returns whether access is valid."
    public readonly property = new CommandArgs<Args>(
        new StringProperty("api", "From Access."),
        new StringProperty("signature", "Signatured timestamp."),
        new NumberProperty("timestamp", "Validation timestamp.")
    );

    public async execute(args: Args): Promise<Response> {
        const access = await this.context.repositories.AccessRepository.getByAPI(args.api);
        const time = Date.now();

        if (!Server.validateAccess(access, time))
            return new BoolResponse(false);

        if (!Server.validateSignature(args.signature, args.timestamp.toString(), access.secret))
            return new BoolResponse(false);

        return new OKResponse();
    }
}