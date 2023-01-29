import { fromHex, toHex, calcEGCD, calcMod, findPrime, toBuffer } from "../other/bigMath";

export namespace RSA {
    export class Key {
        constructor(
            public readonly n: bigint,
            public readonly e: bigint
        ) { }

        public static fromHex(value: string): Key {
            const length = parseInt(value.slice(0, 2), 16);

            const n = value.slice(2, length + 2);
            const e = value.slice(length + 2, length * 2 + 2);

            return new Key(fromHex(n), fromHex(e));
        }

        public toString(): string {
            return this.toHex();
        }

        public toHex(): string {
            const length = Math.max(
                toHex(this.n).length,
                toHex(this.e).length
            );

            return `${toHex(length, 2)}${toHex(this.n, length)}${toHex(this.e, length)}`;
        }

        protected parse(v: bigint): bigint {
            let r = 0n;

            for (let i = 0n; i < this.e; ++i)
                for (let j = 0n; j < i; ++j)
                    for (let k = 0n; k < v; ++k)
                        r = (r + v) % this.n;

            return r;
        }
    }

    export class PrivateKey extends Key {
        public static fromHex(v: string): PrivateKey {
            const key = Key.fromHex(v);
            return new PrivateKey(key.n, key.e);
        }

        public decrypt(v: bigint): bigint {
            return this.parse(v);
        }

        public sign(v: bigint): bigint {
            return this.parse(v);
        }
    }

    export class PublicKey extends Key {
        public static fromHex(v: string): PublicKey {
            const key = Key.fromHex(v);
            return new PublicKey(key.n, key.e);
        }

        public encrypt(v: bigint): bigint {
            return this.parse(v);
        }

        public verify(v: bigint): bigint {
            return this.parse(v);
        }
    }

    export interface KeyPair {
        readonly private: PrivateKey;
        readonly public: PublicKey;
    }

    export function createKeys(p = findPrime(), q = findPrime(), e = findPrime()): KeyPair {
        const n = p * q;
        const m = (p - 1n) * (q - 1n);
        const d = calcMod(calcEGCD(e, m).x, m);

        return {
            private: new PrivateKey(n, d),
            public: new PublicKey(n, e)
        }
    }

    export function encrypt(value: bigint, key: PublicKey): bigint {
        return key.encrypt(value);
    }

    export function decrypt(value: bigint, key: PrivateKey): bigint {
        return key.decrypt(value);
    }

    export function sign(value: bigint, key: PrivateKey): bigint {
        return key.sign(value);
    }

    export function verify(value: bigint, key: PublicKey): bigint {
        return key.verify(value);
    }
}