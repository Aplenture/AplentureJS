import { CommandArgs } from "../../../core/properties/commandArgs";
import { NumberProperty } from "../../../core/properties/numberProperty";
import { StringProperty } from "../../../core/properties/stringProperty";
import { ForbiddenError } from "../../../core/utils/error";
import { AccountRepository } from "../../repositories/accountRepository";
import { OKResponse } from "../../responses/okResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

interface Args {
    readonly account: number;
    readonly old: string;
    readonly new: string;
}

interface Context {
    readonly repositories: {
        readonly AccountRepository: AccountRepository;
    }
}

export class ChangeUserPassword extends ServerCommand<void, Context, Args> {
    public readonly isPrivate = true;
    public readonly description = "Changes the account password."
    public readonly property = new CommandArgs<Args>(
        new NumberProperty("account", "Where to change the password."),
        new StringProperty("old", "Of current password."),
        new StringProperty("new", "Of new password.")
    );

    public async execute(args: Args): Promise<Response> {
        const account = await this.context.repositories.AccountRepository.getByID(args.account);

        if (account.key != args.old)
            throw new ForbiddenError('#_wrong_old_password');

        await this.context.repositories.AccountRepository.changePassword(args.account, args.new);

        return new OKResponse();
    }
}