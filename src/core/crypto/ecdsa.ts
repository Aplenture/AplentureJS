import { ZERO, calcModInv, fromHex, calcLength, toHex } from "../other/bigMath";
import { random } from "./random";
import { HashInt } from "./hash";
import { EC } from "./ec";

export namespace ECDSA {
    export class Sign {
        constructor(
            public readonly r: bigint,
            public readonly s: bigint
        ) { }

        public static fromHex(value: string): Sign {
            const r = value.slice(2, 66);
            const s = value.slice(66, 131);

            return new Sign(fromHex(r), fromHex(s));
        }

        public toString(): string {
            return this.toHex();
        }

        public toHex(): string {
            const r = toHex(this.r, 64);
            const s = toHex(this.s, 64);

            return `04${r}${s}`;
        }
    }

    /*!
     * ECDSA
     * inspired by https://github.com/bitcoinjs/bitcoinjs-lib
     * https://raw.githubusercontent.com/bitcoinjs/bitcoinjs-lib/faa10f0f6a1fff0b9a99fffb9bc30cee33b17212/src/ecdsa.js
     */
    export function sign(hash: HashInt, privateKey: EC.PrivateKey, k = random(32), ec = EC.secp256k1): Sign {
        if (calcLength(k) > 256)
            throw new RangeError(`lenght of k must be <= 32 bytes`);

        const p = ec.multiply(k);
        const r = p.x % ec.n;

        if (r <= ZERO)
            throw new RangeError(`r must be > 0`);

        const s = (calcModInv(k, ec.n) * (hash + privateKey * r)) % ec.n;

        if (s <= ZERO)
            throw new RangeError(`s must be > 0`);

        return new Sign(r, s);
    }

    /*!
     * ECDSA
     * inspired by https://github.com/bitcoinjs/bitcoinjs-lib
     * https://raw.githubusercontent.com/bitcoinjs/bitcoinjs-lib/faa10f0f6a1fff0b9a99fffb9bc30cee33b17212/src/ecdsa.js
     */
    export function verify(hash: HashInt, publicKey: EC.PublicKey, sign: Sign, ec = EC.secp256k1): boolean {
        if (sign.r < ZERO)
            return false;

        if (sign.r > ec.n)
            return false;

        if (sign.s < ZERO)
            return false;

        if (sign.s > ec.n)
            return false;

        const w = calcModInv(sign.s, ec.n);

        const u1 = (hash * w) % ec.n;
        const u2 = (sign.r * w) % ec.n;

        const p1 = ec.multiply(u1);
        const p2 = ec.multiply(u2, publicKey);

        const p = ec.add(p1, p2);
        const v = p.x % ec.n;

        return v == sign.r;
    }
}