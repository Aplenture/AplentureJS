import { expect } from "chai";
import { Commander } from "../src/utils/commander";

describe("Commander", () => {
    const commander = new Commander();

    it("executes help", async () => expect(await commander.execute("help")).contains('help'));

    it("executes with arguments", async () => {
        expect(await commander.execute("help", { command: 'hel' })).contains('help');
        expect(await commander.execute("help", { command: 'world' })).contains('');
    });

    it("executes line", async () => {
        expect(await commander.executeLine("help")).contains('help');
        expect(await commander.executeLine("help --command hel")).contains('help');
        expect(await commander.executeLine("help --command world")).contains('');
    });
});