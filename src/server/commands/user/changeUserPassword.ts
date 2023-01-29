import { DictionaryProperty, ForbiddenError, NumberProperty, StringProperty } from "../../../core";
import { AccountRepository } from "../../repositories";
import { OKResponse } from "../../responses";
import { ServerCommand, Response } from "../../utils";

interface Args {
    readonly account: number;
    readonly publickey_old: string;
    readonly publickey_new: string;
}

interface Context {
    readonly repositories: {
        readonly accounts: AccountRepository;
    }
}

export class ChangeUserPassword extends ServerCommand<void, Context, Args> {
    public readonly isPrivate = true;
    public readonly description = "Changes the account password."
    public readonly property = new DictionaryProperty<Args>("",
        new NumberProperty("account", "Where to change the password."),
        new StringProperty("publickkey_old", "Of current password."),
        new StringProperty("publickkey_new", "Of new password.")
    );

    public async execute(args: Args): Promise<Response> {
        const account = await this.context.repositories.accounts.getByID(args.account);

        if (account.key != args.publickey_old)
            throw new ForbiddenError('#_wrong_public_key');

        await this.context.repositories.accounts.changePassword(args.account, args.publickey_new);

        return new OKResponse();
    }
}