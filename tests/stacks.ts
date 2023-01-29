import { expect } from "chai";
import * as Stacks from "../src/stacks";

describe("Stacks", () => {
    describe("Fifo", () => {
        const stack = new Stacks.Fifo<any>();
        const elements = [1, "2", 3.0, { "hello": "world" }];

        it("increases correctly", () => {
            expect(stack.count).equals(0);
            elements.forEach((element, index) => expect(stack.push(element)).equals(index + 1));
            expect(stack.count).equals(elements.length);
        });

        it("decreases correctly", () => {
            expect(stack.count).equals(elements.length);
            elements.forEach((element, index) => stack.pop() || expect(stack.count).equals(elements.length - index - 1));
            expect(stack.count).equals(0);
        });

        it("returns correct series", () => {
            elements.forEach(element => stack.push(element));
            elements.forEach(element => expect(stack.pop()).equals(element));
        });
    });

    describe("Lifo", () => {
        const stack = new Stacks.Lifo<any>();
        const elements = [1, "2", 3.0, { "hello": "world" }];

        it("increases correctly", () => {
            expect(stack.count).equals(0);
            elements.forEach((element, index) => expect(stack.push(element)).equals(index + 1));
            expect(stack.count).equals(elements.length);
        });

        it("decreases correctly", () => {
            expect(stack.count).equals(elements.length);
            elements.forEach((element, index) => stack.pop() || expect(stack.count).equals(elements.length - index - 1));
            expect(stack.count).equals(0);
        });

        it("returns correct series", () => {
            elements.forEach(element => stack.push(element));
            elements.reverse();
            elements.forEach(element => expect(stack.pop()).equals(element))
        });
    });
});