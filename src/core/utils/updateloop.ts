import { Milliseconds } from "../other/time";
import { Event } from "./event";
import { Stopwatch } from "./stopwatch";

export class Updateloop extends Stopwatch {
    public static readonly onUpdate = new Event<Updateloop, number>('Updateloop.onUpdate');

    private _interval: NodeJS.Timer;

    constructor(public readonly updateDuration = Milliseconds.Second) {
        super();
    }

    public start(time?: number) {
        super.start(time);

        this._interval = setInterval(() => Updateloop.onUpdate.emit(this, this.duration), this.updateDuration);
    }

    public stop(time?: number) {
        super.stop(time);

        clearInterval(this._interval);

        this._interval = null;
    }
}
