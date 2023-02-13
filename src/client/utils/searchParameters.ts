export class SearchParamters {
    private _parameters: URLSearchParams = null;

    public init() {
        this._parameters = new URLSearchParams(window.location.search);
    }

    public has(key: string): boolean {
        return this._parameters.has(key);
    }

    public get(key: string): string {
        return this._parameters.get(key);
    }

    public getNumber(key: string): number {
        return Number(this._parameters.get(key));
    }

    public getBoolean(key: string): boolean {
        return Boolean(this._parameters.get(key));
    }

    public set(key: string, value: any) {
        this._parameters.set(key, value.toString());

        window.location.search = this._parameters.toString();
    }
}