import { Milliseconds, trimTime } from "../other/time";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";

export class Updateloop {
    public readonly onError = new Event<Updateloop, Error>('Updateloop.onError');

    private readonly stopwatch = new Stopwatch();

    private _lastUpdate = 0;

    constructor(
        public readonly action: (time: number) => Promise<any>,
        public readonly interval = Milliseconds.Second
    ) { }

    public get isRunning(): boolean { return this.stopwatch.isRunning; }
    public get duration(): number { return this.stopwatch.duration; }
    public get lastUpdate(): number { return this._lastUpdate; }

    public start(time?: number) {
        if (this.isRunning)
            throw new Error("Updateloop is currently running");

        this.stopwatch.start(time);

        const loop = async () => {
            if (!this.isRunning) return;

            const start = Date.now();
            const nextUpdate = this._lastUpdate + this.interval;

            if (start < nextUpdate)
                return setTimeout(loop, nextUpdate - start);

            this._lastUpdate = trimTime(this.interval, start);

            try {
                await this.action(this._lastUpdate);
            } catch (error) {
                this.onError.emit(this, error);
            }

            const stop = Date.now();
            const delay = this.interval - (stop % this.interval);

            return setTimeout(loop, delay);
        };

        loop();
    }

    public stop(time?: number) {
        if (!this.isRunning)
            throw new Error("Updateloop is not running");

        this.stopwatch.stop(time);
    }
}
