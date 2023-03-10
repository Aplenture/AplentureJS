import { EC } from "../../../core/crypto/ec";
import { ECDSA } from "../../../core/crypto/ecdsa";
import { toHashInt } from "../../../core/crypto/hash";
import { sleep } from "../../../core/other/sleep";
import { parseToString } from "../../../core/other/text";
import { Milliseconds } from "../../../core/other/time";
import { BoolProperty } from "../../../core/properties/boolProperty";
import { CommandArgs } from "../../../core/properties/commandArgs";
import { NumberProperty } from "../../../core/properties/numberProperty";
import { StringProperty } from "../../../core/properties/stringProperty";
import { UnauthorizedError } from "../../../core/utils/error";
import { AccessRepository } from "../../repositories/accessRepository";
import { AccountRepository } from "../../repositories/accountRepository";
import { JSONResponse } from "../../responses/jsonResponse";
import { Response } from "../../utils/response";
import { ServerCommand } from "../../utils/serverCommand";

const DURATION_DELAY = Milliseconds.Second;
const DURATION_SHORT_ACCESS = Milliseconds.Day;
const DURATION_LONG_ACCESS = Milliseconds.Day * 30;

interface Args {
    readonly timestamp: number;
    readonly username: string;
    readonly sign: string;
    readonly keepLogin?: boolean;
    readonly label?: string;
}

interface Context {
    readonly repositories: {
        readonly AccessRepository: AccessRepository;
        readonly AccountRepository: AccountRepository;
    }
}

export class LoginUser extends ServerCommand<void, Context, Args> {
    public readonly isPrivate = false;
    public readonly description = "Creates access to account."
    public readonly property = new CommandArgs<Args>(
        new NumberProperty("timestamp", "For validation."),
        new StringProperty("username", "From account."),
        new StringProperty("sign", "From timestamp."),
        new BoolProperty("keepLogin", "Keeps access for long time.", false),
        new StringProperty("label", "To assign the access creator.", '')
    );

    public async execute(args: Args): Promise<Response> {
        // delay login handling
        // for brute force protection
        await sleep(DURATION_DELAY);

        const account = await this.context.repositories.AccountRepository.getByName(args.username);

        if (!account)
            throw new UnauthorizedError('#_login_invalid');

        const hash = toHashInt(args.timestamp.toString());
        const key = EC.Point.fromHex(account.key);
        const sign = ECDSA.Sign.fromHex(parseToString(args.sign, 'sign'));

        if (!ECDSA.verify(hash, key, sign))
            throw new UnauthorizedError('#_login_invalid');

        const expirationDuration = args.keepLogin
            ? DURATION_LONG_ACCESS
            : DURATION_SHORT_ACCESS;

        const access = await this.context.repositories.AccessRepository.create(account.id, args.label, expirationDuration);

        this.message(`create access '${access.id}' for account '${access.account}'`);

        return new JSONResponse(access);
    }
}