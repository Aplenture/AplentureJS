import { expect } from "chai";
import { Access } from "../src/models/access";

describe("Access", () => {
    describe("Serialization", () => {
        const tests = [
            { session: new Access('hello', 'world'), hex: '05hello05world' },
            { session: new Access('world', 'hello', 'label'), hex: '05world05hellolabel' }
        ];

        it("serializes to hex", () => tests.forEach(test => expect(test.session.toHex()).equals(test.hex)));
        it("deserializes from hex", () => tests.forEach(test => expect(Access.fromHex(test.hex)).deep.equals(test.session)));
    });
});
