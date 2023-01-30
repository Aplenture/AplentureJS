import * as FS from "fs";

interface ContentPathOptions {
    readonly folder?: string;
    readonly extension?: string;
}

export function createInstance<T>(path: string, className: string, ...args: any[]): T {
    return new (require(`${process.env.PWD}/${path}.js`))[className](...args) as T;
}

export function existContentFile(filename: string, options: ContentPathOptions = {}): boolean {
    return FS.existsSync(calcContentPath(filename, options));
}

export function loadContentFile<T>(filename: string, options: ContentPathOptions = {}): T {
    return require(calcContentPath(filename, options));
}

export function loadAllContentFiles<T>(directory: string): NodeJS.ReadOnlyDict<T> {
    const result: NodeJS.Dict<T> = {};

    FS
        .readdirSync(directory)
        .forEach(filename => result[filename.substring(0, filename.lastIndexOf("."))] = loadContentFile(filename, { folder: directory }));

    return result;
}

function calcContentPath(filename: string, options: ContentPathOptions = {}): string {
    let result = process.env.PWD;

    if (options.folder)
        result += "/" + options.folder;

    result += "/" + filename;

    if (options.extension)
        result += "." + options.extension;

    return result;
}