import { expect } from "chai";
import { Event } from "../src/utils";

describe("Event", () => {
    it("emits message", () => {
        const evnt = new Event<any, any>();

        evnt.on(message => expect(message).equals("hello world"));
        evnt.emit(null, "hello world");
    });

    it("emits sender", () => {
        const sender = {};
        const evnt = new Event<any, any>();

        evnt.on((message, tmp) => expect(tmp).equals(sender));
        evnt.emit(sender, "hello world");
    });

    it("calls multiple times", () => {
        let counter = 0;

        const evnt = new Event<any, any>();

        evnt.on(() => counter++);

        evnt.emit(null, "hello world");
        evnt.emit(null, "hello world");

        expect(counter).equals(2);
    });

    it("calls once", () => {
        let counter = 0;

        const evnt = new Event<any, any>();

        evnt.once(() => counter++);

        evnt.emit(null, "hello world");
        evnt.emit(null, "hello world");

        expect(counter).equals(1);
    });

    it("removes receiver", () => {
        let counter = 0;

        const evnt = new Event<any, any>();
        const callback = () => counter++;

        evnt.on(callback);
        evnt.off(callback);
        evnt.emit(null, "hello world");

        expect(counter).equals(0);
    });

    it("calls every sender", () => {
        let counter = 0;

        const evnt = new Event<any, any>();

        evnt.on(() => counter++);

        evnt.emit(1, "hello world");
        evnt.emit(2, "hello world");

        expect(counter).equals(2);
    });

    it("calls equal sender only", () => {
        let counter = 0;

        const evnt = new Event<any, any>();

        evnt.on(() => counter++, { sender: 1 });

        evnt.emit(1, "hello world");
        evnt.emit(2, "hello world");

        expect(counter).equals(1);
    });

    it("calls equal args only", () => {
        let counter = 0;

        const evnt = new Event<any, any>();

        evnt.on(() => counter++, { args: 1 });

        evnt.emit(this, 1);
        evnt.emit(this, 2);
        evnt.emit(1, 1);
        evnt.emit(1, 2);

        expect(counter).equals(2);
    });
});