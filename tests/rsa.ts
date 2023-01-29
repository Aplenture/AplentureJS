import { expect } from "chai";
import { RSA } from "../src/crypto";

describe.skip("RSA", () => {
    it("creates random key pairs", () => {
        for (let i = 0, a = RSA.createKeys(), b: RSA.KeyPair; b = RSA.createKeys(), i < 10; a = b, ++i) {
            expect(a.private).not.deep.equals(b.private);
            expect(a.public).not.deep.equals(b.public);
        }
    });

    describe("Serialization", () => {
        const tests = [
            { key: new RSA.PrivateKey(77n, 37n), hex: '024d25' },
            { key: new RSA.PublicKey(77n, 13n), hex: '024d0d' }
        ];

        it("serializes key to hex", () => tests.forEach(test => expect(test.key.toHex()).equals(test.hex)));
        it("deserializes key from hex", () => tests.forEach(test => expect(RSA.Key.fromHex(test.hex)).deep.equals(test.key)));
    });

    describe("Encryption", () => {
        const tests = [
            { privateKey: new RSA.PrivateKey(77n, 37n), publicKey: new RSA.PublicKey(77n, 13n), decrypted: 14n, encrypted: 49n }
        ];

        it("encrypts number", () => tests.forEach(test => {
            expect(test.publicKey.encrypt(test.decrypted)).equals(test.encrypted);
            expect(test.publicKey.encrypt(test.encrypted)).not.equals(test.decrypted);
            expect(test.publicKey.encrypt(test.encrypted)).not.equals(test.encrypted);
            expect(test.publicKey.encrypt(test.decrypted)).not.equals(test.decrypted);
        }));

        it("decrypts number", () => tests.forEach(test => {
            expect(test.privateKey.decrypt(test.encrypted)).equals(test.decrypted);
            expect(test.privateKey.decrypt(test.decrypted)).not.equals(test.encrypted);
            expect(test.privateKey.decrypt(test.encrypted)).not.equals(test.encrypted);
            expect(test.privateKey.decrypt(test.decrypted)).not.equals(test.decrypted);
        }));
    });

    describe("Signing", () => {
        const tests = [
            { privateKey: new RSA.PrivateKey(77n, 37n), publicKey: new RSA.PublicKey(77n, 13n), decrypted: 14n, encrypted: 42n }
        ];

        it("create sign", () => tests.forEach(test => {
            expect(test.privateKey.sign(test.decrypted)).equals(test.encrypted);
            expect(test.privateKey.sign(test.encrypted)).not.equals(test.decrypted);
            expect(test.privateKey.sign(test.encrypted)).not.equals(test.encrypted);
            expect(test.privateKey.sign(test.decrypted)).not.equals(test.decrypted);
        }));

        it("verifies sign", () => tests.forEach(test => {
            expect(test.publicKey.verify(test.encrypted)).equals(test.decrypted);
            expect(test.publicKey.verify(test.decrypted)).not.equals(test.encrypted);
            expect(test.publicKey.verify(test.encrypted)).not.equals(test.encrypted);
            expect(test.publicKey.verify(test.decrypted)).not.equals(test.decrypted);
        }));
    });
});