import { DictionaryProperty } from "../../../core/properties/dictionaryProperty";
import { NumberProperty } from "../../../core/properties/numberProperty";
import { StringProperty } from "../../../core/properties/stringProperty";
import { ForbiddenError } from "../../../core/utils/error";
import { AccountRepository } from "../../repositories/accountRepository";
import { OKResponse } from "../../responses/okResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

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