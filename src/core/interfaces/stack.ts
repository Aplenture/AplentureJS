export interface Stack<T> {
    readonly count: number;

    push(element: T): number;
    pop(): T;
}