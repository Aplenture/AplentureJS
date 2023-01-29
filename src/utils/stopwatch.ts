import { Milliseconds } from "../other/time";

export class Stopwatch {
    private _running = false;
    private _start = 0;
    private _stop = 0;

    public get isRunning(): boolean { return this._running; }
    public get duration(): number { return (this._stop || Date.now()) - this._start; }

    public get seconds(): number { return this.duration / Milliseconds.Second; }
    public get minutes(): number { return this.duration / Milliseconds.Minute; }
    public get hours(): number { return this.duration / Milliseconds.Hour; }

    public start(time = Date.now()) {
        if (this._running) throw new Error("stopwatch is currently running");

        this._running = true;
        this._start = time;
        this._stop = 0;
    }

    public stop(time = Date.now()) {
        if (!this._running) throw new Error("stopwatch is not running");

        this._running = false;
        this._stop = time;
    }

    public restart(time = Date.now()) {
        if (this._running)
            this.stop(time);

        this.start(time);
    }
}
