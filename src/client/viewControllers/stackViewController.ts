import { Event, Lifo } from "../../core";
import { INavigationViewController as INavigationViewController } from "../interfaces/navigationViewController";
import { ViewController } from "../utils/viewController";

export class StackViewController extends ViewController implements INavigationViewController {
    public readonly onPush = new Event<StackViewController, ViewController>('StackViewController.onPush');
    public readonly onPop = new Event<StackViewController, ViewController>('StackViewController.onPop');

    private history = new Lifo<ViewController>();

    constructor(...classes: string[]) {
        super(...classes, 'stack-view-controller');
    }

    public async pushViewController(next: ViewController): Promise<void> {
        if (0 > this.appendChild(next))
            return Promise.reject();

        await this.load();

        this.focus();

        return new Promise<void>(resolve => this.onPop.once(() => resolve(), { listener: this, args: next }));
    }

    public async popViewController(): Promise<ViewController> {
        const current = this.children[0];

        if (current) {
            current.unload();
            this.removeChild(current);
        }

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
            this.onPush.emit(this, child);

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = super.removeChild(child);

        if (0 == index) {
            super.appendChild(this.history.pop());
            this.onPop.emit(this, child);
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = super.removeChildAtIndex(index);

        if (child) {
            super.appendChild(this.history.pop());
            this.onPop.emit(this, child);
        }

        return child;
    }

    public removeAllChildren(): void {
        let child = this.children[0];

        super.removeAllChildren();

        while (child) {
            this.children.forEach(child => this.onPop.emit(this, child));
            child = this.history.pop();
        }
    }
}