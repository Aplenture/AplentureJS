import { Event } from "../../core";

export abstract class Window {
    public static readonly onResize = new Event<Window, void>();

    private static initialized = false;

    public static get title(): string { return document.title; }
    public static set title(value: string) { document.title = value; }

    public static get width(): number { return window.innerWidth; }
    public static get height(): number { return window.innerHeight; }

    public static init() {
        if (this.initialized)
            return;

        this.initialized = true;

        window.addEventListener('resize', () => this.onResize.emit(this));
    }
}