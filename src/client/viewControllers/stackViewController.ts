import { Event, Lifo } from "../../core";
import { ViewController } from "../utils/viewController";

export class StackViewController extends ViewController {
    public static readonly onPush = new Event<StackViewController, ViewController>('StackViewController.onPush');
    public static readonly onPop = new Event<StackViewController, ViewController>('StackViewController.onPop');

    private viewControllers = new Lifo<ViewController>();

    constructor(...classes: string[]) {
        super(...classes, 'stack');
    }

    public deinit(): void {
        StackViewController.onPop.off({ listener: this });

        super.deinit();
    }

    public async push(next: ViewController): Promise<void> {
        const current = this.viewControllers.current;

        this.viewControllers.push(next);

        this.removeChild(current);
        this.appendChild(next);

        await this.update();

        this.focus();

        StackViewController.onPush.emit(this, next);

        return new Promise<void>(resolve => StackViewController.onPop.once(() => resolve(), { sender: this, listener: this, args: next }));
    }

    public pop(): ViewController {
        const current = this.viewControllers.pop();
        const previous = this.viewControllers.current;

        this.removeChild(current);
        this.appendChild(previous);

        StackViewController.onPop.emit(this, current);

        return current;
    }
}