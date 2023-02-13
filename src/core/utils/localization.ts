import { Event } from "./event";

export abstract class Localization {
    public static readonly onMissingTranslation = new Event<Localization, string>('Localization.onMissingTranslation');

    private static _initialized = false;
    private static _language: string;
    private static _dictionary: NodeJS.Dict<string>;

    public static get initialized(): boolean { return this._initialized; }
    public static get language(): string { return this._language; }

    public static init(language: string, dictionary: NodeJS.ReadOnlyDict<string> = {}) {
        if (this._initialized)
            throw new Error('already initialized');

        this._initialized = true;
        this._language = language;
        this._dictionary = Object.assign({}, dictionary);
    }

    public static translate(key = '', values: NodeJS.ReadOnlyDict<string> = {}): string {
        if (!key)
            return '';

        let result = this._dictionary[key];

        if (!result) {
            this.onMissingTranslation.emit(this, key);
            this._dictionary[key] = key;
            result = key;
        }

        Object
            .keys(values)
            .forEach(key => result = result.replace(key, values[key]));

        return result;
    }
}