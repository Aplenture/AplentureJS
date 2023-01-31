export interface Stack<T> {
    readonly count: number;
    readonly current: T;

    push(element: T): number;
    pop(): T;
}