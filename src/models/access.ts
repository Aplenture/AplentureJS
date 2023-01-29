import { toHex } from "../other";
import { createSign } from "../crypto";

export class Access {
    constructor(
        public readonly id: string,
        private readonly secret: string,
        public readonly label = ''
    ) { }

    public static fromHex(value: string): Access {
        const idLength = parseInt(value.slice(0, 2), 16);
        const secretLength = parseInt(value.slice(idLength + 2, idLength + 4), 16);

        const id = value.slice(2, idLength + 2);
        const secret = value.slice(idLength + 4, idLength + secretLength + 4);
        const label = value.slice(idLength + secretLength + 4);

        return new Access(id, secret, label);
    }

    public toString(): string {
        return this.toHex();
    }

    public toHex(): string {
        return `${toHex(this.id.length, 2)}${this.id}${toHex(this.secret.length, 2)}${this.secret}${this.label}`;
    }

    public sign(message: string): string {
        return createSign(message, this.secret);
    }
}