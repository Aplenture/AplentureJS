interface Options {
    readonly start?: number;
    readonly stop?: number;
}

export class Stopwatch {
    private _running: boolean;
    private _start: number;
    private _stop: number;

    constructor(options?: Options) {
        this.reset(options)
    }

    public get isRunning(): boolean { return this._running; }
    public get duration(): number { return (this._stop || Date.now()) - this._start; }

    public start(time = Date.now()) {
        if (this._running)
            throw new Error("stopwatch is currently running");

        this._running = true;
        this._start = time;
        this._stop = 0;
    }

    public stop(time = Date.now()) {
        if (!this._running)
            throw new Error("stopwatch is not running");

        this._running = false;
        this._stop = time;
    }

    public restart(time = Date.now()) {
        this.reset();
        this.start(time);
    }

    public reset(options: Options = {}) {
        this._running = false;
        this._start = options.start || 0;
        this._stop = options.stop || 0;
    }
}
