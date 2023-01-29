import { BoolProperty, DictionaryProperty, EC, Milliseconds, randomPassword, StringProperty } from "../../../core";
import { AccessRepository, AccountRepository } from "../../repositories";
import { JSONResponse, OKResponse } from "../../responses";
import { ServerCommand, Response } from "../../utils";

const DURATION_EXPIRATION = Milliseconds.Hour;

interface Args {
    readonly username: string;
    readonly password: string;
    readonly publickey: string;
    readonly label: string;
    readonly access: boolean;
}

interface Context {
    readonly repositories: {
        readonly accounts: AccountRepository;
        readonly access: AccessRepository;
    }
}

export class RegisterUser extends ServerCommand<void, Context, Args>{
    public readonly isPrivate = false;
    public readonly description = "Creates a new account and optionaly a temporary access.";
    public readonly property = new DictionaryProperty<Args>("",
        new StringProperty("username", "For account."),
        new StringProperty("password", "For account.", true),
        new StringProperty("publickey", "From password.", true),
        new StringProperty("label", "To assign creator of temporary open access for created account.", true),
        new BoolProperty("access", "Flag to create temporary access too.", true)
    );

    public async execute(args: Args): Promise<Response> {
        const seed = !args.publickey && (args.password || randomPassword(6));
        const publicKey = args.publickey || EC.secp256k1.createPublicKey(EC.createPrivateKey(seed));

        const account = await this.context.repositories.accounts.create(args.username, publicKey.toString());

        if (!args.access)
            return new OKResponse();

        const access = await this.context.repositories.access.create(account.id, args.label, DURATION_EXPIRATION);

        return new JSONResponse(access);
    }
}