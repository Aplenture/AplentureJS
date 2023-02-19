import { expect } from "chai";
import { Localization } from "../src";

describe("Localization", () => {
    Localization.init("", { "#_hello": "world" });

    it("returns translation", () => expect(Localization.translate("#_hello")).equals("world"));
    it("replaces values", () => expect(Localization.translate("#_hello", { "w": "A" })).equals("Aorld"));

    it("emits missing translation", () => {
        Localization.onMissingTranslation.on(key => expect(key).equals("test"));
        Localization.translate("test");
    });

    it("does not emit existing translation", () => {
        let emittedKey = "";

        Localization.onMissingTranslation.on(key => emittedKey = key);
        Localization.translate("#_hello");

        expect(emittedKey).equals("");
    });
});