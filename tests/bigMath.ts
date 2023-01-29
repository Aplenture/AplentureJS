import { expect } from "chai";
import { calcEGCD, calcModInv, toHex, fromHex, toBuffer, fromBuffer } from "../src/other/bigMath";

describe("BigInteger math", () => {
    it("calculates egcd", () => {
        expect(calcEGCD(1n, 1n)).deep.equal({ g: 1n, x: 1n, y: 0n });
        expect(calcEGCD(19168541349167916541934149125444444491635125783192549n, 1254366468914567943795n)).deep.equal({ g: 3n, x: -51600903958588471463n, y: 788536751975320746859894014817801548390476186596482n });
    });

    it("calculates modInv", () => {
        expect(calcModInv(1n, 19n)).equals(1n);
        expect(calcModInv(2n, 5n)).equals(3n);
        expect(calcModInv(-2n, 5n)).equals(2n);
    });

    it("generates hex", () => {
        expect(toHex(fromHex('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'))).equals("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
        expect(toHex(fromHex('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'))).equals("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798");
        expect(toHex(fromHex('483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8'))).equals("483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8");
        expect(toHex(fromHex('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'))).equals("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    });

    it("calculates egcd", () => {
        [
            { input: { a: 13n, b: 60n }, output: { x: -23n, y: 5n } }
        ].forEach(test => expect(calcEGCD(test.input.a, test.input.b)).deep.contains(test.output));
    });

    describe("buffering", () => {
        const tests = [
            { unserialized: 0n, serialized: Buffer.from([0]) },
            { unserialized: 1n, serialized: Buffer.from([0x01]) },
            { unserialized: 255n, serialized: Buffer.from([0xFF]) },
            { unserialized: 256n, serialized: Buffer.from([0x00, 0x01]) },
            { unserialized: 511n, serialized: Buffer.from([0xFF, 0x01]) },
            { unserialized: 512n, serialized: Buffer.from([0x00, 0x02]) },
            { unserialized: 65535n, serialized: Buffer.from([0xFF, 0xFF]) },
            { unserialized: 65536n, serialized: Buffer.from([0x00, 0x00, 0x01]) }
        ];

        it("serializes to buffer", () => tests.forEach(test => expect(toBuffer(test.unserialized)).deep.equals(test.serialized)));
        it("deserializes from buffer", () => tests.forEach(test => expect(fromBuffer(test.serialized)).equals(test.unserialized)));
    });
});