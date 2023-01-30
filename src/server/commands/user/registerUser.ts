import { EC } from "../../../core/crypto/ec";
import { randomPassword } from "../../../core/crypto/random";
import { Milliseconds } from "../../../core/other/time";
import { BoolProperty } from "../../../core/properties/boolProperty";
import { CommandArgs } from "../../../core/properties/commandArgs";
import { StringProperty } from "../../../core/properties/stringProperty";
import { AccessRepository } from "../../repositories/accessRepository";
import { AccountRepository } from "../../repositories/accountRepository";
import { JSONResponse } from "../../responses/jsonResponse";
import { OKResponse } from "../../responses/okResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

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
        readonly AccountRepository: AccountRepository;
        readonly AccessRepository: AccessRepository;
    }
}

export class RegisterUser extends ServerCommand<void, Context, Args>{
    public readonly isPrivate = false;
    public readonly description = "Creates a new account and optionaly a temporary access.";
    public readonly property = new CommandArgs<Args>(
        new StringProperty("username", "For account."),
        new StringProperty("password", "For account.", null),
        new StringProperty("publickey", "From password.", null),
        new StringProperty("label", "To assign creator of temporary open access for created account.", ''),
        new BoolProperty("access", "Flag to create temporary access too.", false)
    );

    public async execute(args: Args): Promise<Response> {
        const seed = !args.publickey && (args.password || randomPassword(6));
        const publicKey = args.publickey || EC.secp256k1.createPublicKey(EC.createPrivateKey(seed));

        const account = await this.context.repositories.AccountRepository.create(args.username, publicKey.toString());

        if (!args.access)
            return new OKResponse();

        const access = await this.context.repositories.AccessRepository.create(account.id, args.label, DURATION_EXPIRATION);

        return new JSONResponse(access);
    }
}