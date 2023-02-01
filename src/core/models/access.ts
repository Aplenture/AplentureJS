import { createSign } from "../crypto/hash";
import { toHex } from "../other/bigMath";

export class Access {
    constructor(
        public readonly api: string,
        private readonly secret: string,
        public readonly label = ''
    ) { }

    public static fromHex(value: string): Access {
        const apiLength = parseInt(value.slice(0, 2), 16);
        const secretLength = parseInt(value.slice(apiLength + 2, apiLength + 4), 16);

        const api = value.slice(2, apiLength + 2);
        const secret = value.slice(apiLength + 4, apiLength + secretLength + 4);
        const label = value.slice(apiLength + secretLength + 4);

        return new Access(api, secret, label);
    }

    public toString(): string {
        return this.toHex();
    }

    public toHex(): string {
        return `${toHex(this.api.length, 2)}${this.api}${toHex(this.secret.length, 2)}${this.secret}${this.label}`;
    }

    public sign(message: string): string {
        return createSign(message, this.secret);
    }
}