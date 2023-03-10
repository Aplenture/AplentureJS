import { CommandArgs } from "../../../core/properties/commandArgs";
import { StringProperty } from "../../../core/properties/stringProperty";
import { AccessRepository } from "../../repositories/accessRepository";
import { OKResponse } from "../../responses/okResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

interface Args {
    readonly api: string;
}

interface Context {
    readonly repositories: {
        readonly AccessRepository: AccessRepository;
    }
}

export class LogoutUser extends ServerCommand<any, Context, Args> {
    public readonly isPrivate = true;
    public readonly description = "Closes the access."
    public readonly property = new CommandArgs<Args>(
        new StringProperty("api", "From access to close.")
    );

    public async execute(args: Args): Promise<Response> {
        const access = await this.context.repositories.AccessRepository.getByAPI(args.api);

        if (!access)
            throw new Error('missing access');

        await this.context.repositories.AccessRepository.delete(access.id);

        this.message(`delete access '${access.id}'`);

        return new OKResponse();
    }
}