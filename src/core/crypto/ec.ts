import { ZERO, ONE, calcMod, calcModInv, fromHex, toHex } from "../other/bigMath";
import { random } from "./random";
import { toHashInt } from "./hash";

export namespace EC {
    export type PrivateKey = bigint;
    export type PublicKey = Point;

    export class Point {
        public doubleCache?: ReadonlyArray<Point>;

        constructor(
            public readonly x: bigint,
            public readonly y: bigint
        ) { }

        public static fromHex(value: string): Point {
            const x = value.slice(2, 66);
            const y = value.slice(66, 131);

            return new Point(fromHex(x), fromHex(y));
        }

        public toString(): string {
            return this.toHex();
        }

        public toHex(): string {
            const x = toHex(this.x, 64);
            const y = toHex(this.y, 64);

            return `04${x}${y}`;
        }
    }

    const POINT_ZERO = new Point(ZERO, ZERO);

    /*!
     * elliptic curve point mathematic
     * inspired by https://github.com/paulmillr
     * https://paulmillr.com/posts/noble-secp256k1-fast-ecc/
     */
    export class EllipticCurve {
        public readonly p: bigint;
        public readonly a: bigint;
        public readonly b: bigint;
        public readonly G: Point;
        public readonly n: bigint;
        public readonly h: bigint;

        constructor(properties: {
            readonly p: bigint;
            readonly a: bigint;
            readonly b: bigint;
            readonly G: Point;
            readonly n: bigint;
            readonly h: bigint;
        }) {
            {
                this.p = properties.p;
                this.a = properties.a;
                this.b = properties.b;
                this.G = properties.G;
                this.n = properties.n;
                this.h = properties.h;
            }
        }

        public prepare(point = this.G) {
            this.getDoubleCache(point);
        }

        public createPublicKey(privateKey: PrivateKey): PublicKey {
            if (privateKey <= ZERO)
                throw new RangeError('private key must be > 0n');

            if (privateKey >= this.n)
                throw new RangeError(`private key must be < ${this.n}n`);

            const point = this.multiplySecure(privateKey);

            return new Point(point.x, point.y);
        }

        // simple elliptic curve point multiplication with double-and-add algo
        public multiply(k: bigint, point = this.G): Point {
            let p = POINT_ZERO;
            let d = point;
            let i = 0;

            const dcache = this.getDoubleCache(point);

            while (k > ZERO) {
                if (k & ONE)
                    p = this.add(p, d);

                d = dcache[i];
                k >>= ONE;
                i += 1;
            }

            return p;
        }

        // secure constant-time elliptic curve point multiplication with double-and-add algo
        public multiplySecure(k: PrivateKey, point = this.G): Point {
            let p = POINT_ZERO;
            let f = POINT_ZERO; // fake point

            const dcache = this.getDoubleCache(point);

            for (let i = 0, d = point; i <= 256; d = dcache[i], i++) {
                if (k & ONE)
                    p = this.add(p, d);
                else
                    f = this.add(f, d);

                k >>= ONE;
            }

            return p;
        }

        public double(point: Point): Point {
            const X1 = point.x;
            const Y1 = point.y;
            const lam = calcMod(3n * X1 ** 2n * calcModInv(2n * Y1, this.p), this.p);
            const X3 = calcMod(lam * lam - 2n * X1, this.p);
            const Y3 = calcMod(lam * (X1 - X3) - Y1, this.p);

            return new Point(X3, Y3);
        }

        public add(point: Point, other: Point): Point {
            const [a, b] = [point, other];
            const [X1, Y1, X2, Y2] = [a.x, a.y, b.x, b.y];

            if (X1 === ZERO || Y1 === ZERO) return b;
            if (X2 === ZERO || Y2 === ZERO) return a;
            if (X1 === X2 && Y1 === Y2) return this.double(point);
            if (X1 === X2 && Y1 === -Y2) return POINT_ZERO;

            const lam = calcMod((Y2 - Y1) * calcModInv(X2 - X1, this.p), this.p);
            const X3 = calcMod(lam * lam - X1 - X2, this.p);
            const Y3 = calcMod(lam * (X1 - X3) - Y1, this.p);

            return new Point(X3, Y3);
        }

        private getDoubleCache(point: Point): ReadonlyArray<Point> {
            if (point.doubleCache)
                return point.doubleCache;

            const cache = new Array<Point>(256);

            let dbl = point;

            for (let i = 0; i < 256; i++) {
                dbl = this.double(dbl); // [2G, 4G, 8G..., 256G], optimized
                cache[i] = dbl;
            }

            point.doubleCache = cache;

            return cache;
        }
    }

    export const secp256k1 = new EllipticCurve({
        p: fromHex('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'),
        a: 0n,
        b: 7n,
        G: new Point(
            fromHex('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'),
            fromHex('483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8')
        ),
        n: fromHex('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'),
        h: 1n
    });

    export function createPrivateKey(seed?: string | number | bigint): PrivateKey {
        if (seed == undefined)
            return random(32);

        if (seed == null)
            return random(32);

        return toHashInt(seed.toString());
    }
}