import { Event } from "../../core";
import { View } from "./view";

export abstract class Window {
    public static readonly onResize = new Event<Window, void>();
    public static readonly onDebugChanged = new Event<Window, boolean>();

    private static initialized = false;
    private static _debug = false;

    public static get title(): string { return document.title; }
    public static set title(value: string) { document.title = value; }

    public static get width(): number { return window.innerWidth; }
    public static get height(): number { return window.innerHeight; }

    public static get debug(): boolean { return this._debug; }
    public static set debug(value: boolean) {
        this._debug;
        this.onDebugChanged.emit(this, value);
    }

    public static init(debug: boolean) {
        this.debug = debug;

        if (this.initialized)
            return;

        this.initialized = true;

        window.addEventListener('resize', () => this.onResize.emit(this));

        View.onClick.on((_, view) => this._debug && console.log(`clicked view '${view.id}'`));
        View.onEnterKey.on((_, view) => this._debug && console.log(`clicked view '${view.id}'`));
    }
}