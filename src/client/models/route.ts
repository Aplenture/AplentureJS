export interface Route {
    readonly name: string;
    readonly isPrivate?: boolean;
    readonly index?: number;
}