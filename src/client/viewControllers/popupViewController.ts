import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";

export class PopupViewController extends ViewController {
    public readonly contentViewController = new ViewController('content');

    public autoHide = true;

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup');
    }

    public init(): void {
        super.appendChild(this.contentViewController);

        this.contentViewController.view.propaginateClickEvents = false;

        View.onClick.on(() => this.autoHide && this.removeFromParent(), { sender: this.view });

        super.init();
    }

    public get children(): readonly ViewController[] { return this.contentViewController.children; }

    public focus() {
        this.contentViewController.focus();
    }

    public appendChild(child: ViewController): number {
        return this.contentViewController.appendChild(child);
    }

    public removeChild(child: ViewController): number {
        return this.contentViewController.removeChild(child);
    }

    public removeChildAtIndex(index: number) {
        this.contentViewController.removeChildAtIndex(index);
    }

    public removeAllChildren(): void {
        this.contentViewController.removeAllChildren();
    }
}