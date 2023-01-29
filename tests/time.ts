import { expect } from "chai";
import { Milliseconds, trimTime } from "../src/other/time"

describe("Time", () => {
    describe("Trim Time", () => {
        it("trims time", () => expect(trimTime(Milliseconds.Day, Date.UTC(2022, 1, 20, 13, 37))).equals(1645315200000));
    });
});