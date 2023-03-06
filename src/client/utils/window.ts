import { Event, Localization } from "../../core";
import { WindowConfig } from "../models/windowConfig";
import { View } from "./view";

export abstract class Window {
    public static readonly onResize = new Event<Window, void>('Window.onResize');
    public static readonly onDebugChanged = new Event<Window, boolean>('Window.onDebugChanged');

    private static _initialized = false;
    private static _debug = false;

    public static get title(): string { return document.title; }
    public static set title(value: string) { document.title = value; }

    public static get width(): number { return window.innerWidth; }
    public static get height(): number { return window.innerHeight; }

    public static get debug(): boolean { return this._debug; }
    public static set debug(value: boolean) {
        this._debug = value;
        this.onDebugChanged.emit(this, value);
    }

    public static init(config: WindowConfig) {
        if (this._initialized)
            throw new Error('Window is already initialized');

        this._initialized = true;
        this.debug = config.debug;

        window.addEventListener('resize', () => this.onResize.emit(this));

        Event.onEmit.on((args, sender) => this._debug && console.log(sender.name, args));
        Localization.onMissingTranslation.on(key => this._debug && console.warn(`missing translation for key '${key}'`));
    }
}