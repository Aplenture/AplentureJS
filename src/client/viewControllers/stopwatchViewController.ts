import { formatDuration, Stopwatch } from "../../core";
import { ViewController } from "../utils";
import { Label } from "../views";

export class StopwatchViewController extends ViewController {
    public readonly label = new Label('stopwatch');

    public readonly options = {
        seconds: true,
        milliseconds: false
    }

    public readonly stopwatch = new Stopwatch();

    private interval: NodeJS.Timer;

    constructor(...classes: string[]) {
        super(...classes, 'stopwatch');
    }

    public init(): void {
        this.view.appendChild(this.label);

        super.init();
    }

    public updateTime(duration: number) {
        this.label.text = formatDuration(duration, this.options);
    }

    public start(time?: number) {
        this.stopwatch.start(time);
        this.interval = setInterval(() => this.updateTime(this.stopwatch.duration), 100);
    }

    public stop(time?: number) {
        this.stopwatch.stop(time);

        clearInterval(this.interval);
        this.interval = null;
    }
}