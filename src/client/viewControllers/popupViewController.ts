import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Container } from "../views/container";

export class PopupViewController extends ViewController {
    public readonly contentView = new Container('content');

    public autoHide = true;

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup');
    }

    public init(): void {
        this.view.appendChild(this.contentView);

        this.contentView.propaginateClickEvents = false;

        View.onClick.on(() => this.autoHide && this.removeFromParent(), { sender: this.view });

        super.init();
    }

    public focus() {
        this.contentView.focus();
    }

    public appendChild(child: ViewController): number {
        const index = super.appendChild(child);

        this.contentView.appendChild(child.view);

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = super.removeChild(child);

        this.contentView.appendChild(child.view);

        return index;
    }

    public removeChildAtIndex(index: number) {
        super.removeChildAtIndex(index);
        this.contentView.removeChildAtIndex(index);
    }

    public removeAllChildren(): void {
        super.removeAllChildren();
        this.contentView.removeAllChildren();
    }
}