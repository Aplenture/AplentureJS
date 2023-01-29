import { Stack } from "../interfaces";

export class Lifo<T> implements Stack<T> {
    private readonly _elements: T[] = [];

    public get count(): number { return this._elements.length; }

    public push(element: T): number {
        return this._elements.push(element);
    }

    public pop(): T {
        return this._elements.pop();
    }
}