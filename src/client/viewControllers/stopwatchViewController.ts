import { formatDuration } from "../../core/other/time";
import { Stopwatch } from "../../core/utils/stopwatch";
import { ViewController } from "../utils/viewController";
import { Label } from "../views/label";

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