import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { StackViewController } from "./stackViewController";

export class PopupViewController extends StackViewController {
    public readonly contentViewController = new ViewController('content');

    public autoHide = true;

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup');
    }

    public init(): void {
        super.appendChild(this.contentViewController);

        this.view.visible = false;
        this.contentViewController.view.propaginateClickEvents = false;

        View.onClick.on(() => this.autoHide && this.removeFromParent(), { sender: this.view });

        super.init();
    }

    public get children(): readonly ViewController[] { return this.contentViewController.children; }

    public focus() {
        this.contentViewController.focus();
    }

    public appendChild(child: ViewController): number {
        const index = this.contentViewController.appendChild(child);

        if (1 == this.contentViewController.children.length) {
            this.view.visible = true;
            this.focus();
        }

        return index;
    }

    public removeChild(child: ViewController): number {
        return this.contentViewController.removeChild(child);
    }

    public removeChildAtIndex(index: number) {
        this.contentViewController.removeChildAtIndex(index);

        if (0 == this.contentViewController.children.length)
            this.view.visible = false;
    }

    public removeAllChildren(): void {
        this.contentViewController.removeAllChildren();
    }
}