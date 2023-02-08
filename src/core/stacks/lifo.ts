import { Stack } from "../interfaces/stack";

export class Lifo<T> implements Stack<T> {
    private readonly _elements: T[] = [];

    public get count(): number { return this._elements.length; }
    public get current(): T { return this._elements.length && this._elements[this._elements.length - 1] || null; }

    public push(element: T): number {
        return this._elements.push(element);
    }

    public pop(): T {
        return this._elements.pop();
    }

    public clear(): void {
        this._elements.splice(0, this._elements.length);
    }
}