import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Button } from "../views/button";
import { Label } from "../views/label";
import { StackViewController } from "./stackViewController";

export class PopupViewController extends StackViewController {
    public readonly contentViewController = new ViewController('content');

    public autoHide = false;

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup');
    }

    public init(): void {
        super.appendChild(this.contentViewController);

        this.view.isVisible = false;
        this.contentViewController.view.propaginateClickEvents = false;

        View.onClick.on(() => this.autoHide && this.removeFromParent(), { sender: this.view });

        super.init();
    }

    public get children(): readonly ViewController[] { return this.contentViewController.children; }

    public focus() {
        this.contentViewController.focus();
    }

    public pushMessage(text: string, title: string): Promise<void> {
        const viewController = new ViewController('message');

        const titleLabel = new Label('title');
        const textLabel = new Label('text');
        const doneButton = new Button('done');

        viewController.view.appendChild(titleLabel);
        viewController.view.appendChild(textLabel);
        viewController.view.appendChild(doneButton);

        titleLabel.text = title;
        textLabel.text = text;

        doneButton.text = '#_done';
        doneButton.tabIndex = 1;

        View.onEnterKey.on(() => this.pop(), { sender: doneButton, listener: viewController });
        Button.onClick.on(() => this.pop(), { sender: doneButton, listener: viewController });

        return this.push(viewController).then(() => {
            View.onEnterKey.off({ listener: viewController });
            Button.onClick.off({ listener: viewController });
        });
    }

    public pushError(error: Error, title = '#_error'): Promise<void> {
        return this.pushMessage(error.message, title);
    }

    public appendChild(child: ViewController): number {
        const index = this.contentViewController.appendChild(child);

        if (0 <= index) {
            this.view.isVisible = true;
            this.focus();
        }

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = this.contentViewController.removeChild(child);

        if (0 == this.children.length)
            this.view.isVisible = false;

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = this.contentViewController.removeChildAtIndex(index);

        if (0 == this.children.length)
            this.view.isVisible = false;

        return child;
    }

    public removeAllChildren(): void {
        this.contentViewController.removeAllChildren();
        this.view.isVisible = false;
    }
}