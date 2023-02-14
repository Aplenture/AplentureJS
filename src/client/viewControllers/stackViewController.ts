import { Event, Lifo } from "../../core";
import { ViewController } from "../utils/viewController";

export class StackViewController extends ViewController {
    public static readonly onPush = new Event<StackViewController, ViewController>('StackViewController.onPush');
    public static readonly onPop = new Event<StackViewController, ViewController>('StackViewController.onPop');

    private history = new Lifo<ViewController>();

    constructor(...classes: string[]) {
        super(...classes, 'stack');
    }

    public deinit(): void {
        StackViewController.onPop.off({ listener: this });

        super.deinit();
    }

    public async pushViewController(next: ViewController): Promise<void> {
        if (0 > this.appendChild(next))
            return Promise.reject();

        next.view.isVisible = true;

        await this.update();

        this.focus();

        return new Promise<void>(resolve => StackViewController.onPop.once(() => resolve(), { sender: this, listener: this, args: next }));
    }

    public popViewController(): ViewController {
        const current = this.children[0];

        if (current)
            this.removeChild(current);

        if (this.children[0])
            this.focus();

        return current;
    }

    public appendChild(child: ViewController): number {
        const index = super.appendChild(child);

        if (1 == index) {
            this.history.push(this.children[0]);
            super.removeChildAtIndex(0);
        }

        if (0 <= index)
            StackViewController.onPush.emit(this, child);

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = super.removeChild(child);

        if (0 == index) {
            super.appendChild(this.history.pop());
            StackViewController.onPop.emit(this, child);
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = super.removeChildAtIndex(index);

        if (child) {
            super.appendChild(this.history.pop());
            StackViewController.onPop.emit(this, child);
        }

        return child;
    }

    public removeAllChildren(): void {
        let child = this.children[0];

        super.removeAllChildren();

        while (child) {
            this.children.forEach(child => StackViewController.onPop.emit(this, child));
            child = this.history.pop();
        }
    }
}