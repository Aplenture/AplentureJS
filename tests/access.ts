import { expect } from "chai";
import { Access } from "../src";

describe("Access", () => {
    describe("Serialization", () => {
        const tests = [
            { access: new Access('hello', 'world'), hex: '05hello05world' },
            { access: new Access('world', 'hello', 'label'), hex: '05world05hellolabel' }
        ];

        it("serializes to hex", () => tests.forEach(test => expect(test.access.toHex()).equals(test.hex)));
        it("deserializes from hex", () => tests.forEach(test => expect(Access.fromHex(test.hex)).deep.equals(test.access)));
    });
});
