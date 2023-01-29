import { Event } from "./event";

export abstract class Localization {
    public static readonly onMissingTranslation = new Event<Localization, string>();

    public static language = 'en';
    public static dictionary: NodeJS.ReadOnlyDict<string> = {}

    public static translate(key = '', values: NodeJS.ReadOnlyDict<string> = {}): string {
        if (!key)
            return '';

        let result = this.dictionary[key];

        if (!result) {
            this.onMissingTranslation.emit(this, key);
            return key;
        }

        Object
            .keys(values)
            .forEach(key => result = result.replace(key, values[key]));

        return result;
    }
}