import { Lifo } from "../../core";
import { ViewController } from "../utils/viewController";

export class StackViewController extends ViewController {
    private viewControllers = new Lifo<ViewController>();

    constructor(...classes: string[]) {
        super(...classes, 'stack');
    }

    public async push(next: ViewController): Promise<void> {
        const current = this.viewControllers.current;

        this.viewControllers.push(next);

        this.removeChild(current);
        this.appendChild(next);

        await next.update();
    }

    public pop() {
        const current = this.viewControllers.pop();
        const previous = this.viewControllers.current;

        this.removeChild(current);
        this.appendChild(previous);
    }
}