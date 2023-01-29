import { expect } from "chai";
import { sha256, toHashInt, createSign } from "../src/crypto";

describe("Hash", () => {
    it("calculates sha256", () => [
        { text: "hello world", hash: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9" }
    ].forEach(test => expect(sha256(test.text)).equals(test.hash)));

    it("calculates big int", () => [
        { text: "hello world", hash: 83814198383102558219731078260892729932246618004265700685467928187377105751529n }
    ].forEach(test => expect(toHashInt(test.text)).equals(test.hash)));

    it("creates signature", () => [
        { message: "hello", secret: "world", signature: "936a185caaa266bb9cbe981e9e05cb78cd732b0b3280eb944412bb6f8f8f07af" }
    ].forEach(test => expect(createSign(test.message, test.secret)).equals(test.signature)));
});