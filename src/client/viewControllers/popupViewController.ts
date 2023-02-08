import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Button } from "../views/button";
import { Label } from "../views/label";
import { BodyViewController } from "./bodyViewController";
import { StackViewController } from "./stackViewController";

export class PopupViewController extends ViewController {
    private static _instance: PopupViewController;

    public readonly stacktViewController = new StackViewController();

    public autoHide = false;

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup');
    }

    protected static get instance(): PopupViewController {
        if (!this._instance) {
            this._instance = new PopupViewController();
            this._instance.init();
            this._instance.update();
        }

        return this._instance;
    }

    public get children(): readonly ViewController[] { return this.stacktViewController.children; }

    public init(): void {
        super.appendChild(this.stacktViewController);

        this.stacktViewController.view.propaginateClickEvents = false;

        View.onClick.on(() => this.autoHide && this.removeFromParent(), { sender: this.view, listener: this });

        StackViewController.onPush.on(() => !(this.view as any).div.parentNode && document.body.appendChild((this.view as any).div), { sender: this.stacktViewController, listener: this });
        StackViewController.onPop.on(() => 0 == this.children.length && (this.view as any).div.parentNode && document.body.removeChild((this.view as any).div), { sender: this.stacktViewController, listener: this });

        super.init();
    }

    public deinit() {
        View.onClick.off({ listener: this });

        StackViewController.onPush.off({ listener: this });
        StackViewController.onPop.off({ listener: this });

        super.deinit();
    }

    public focus() {
        this.stacktViewController.focus();
    }

    public static pushViewController(next: ViewController): Promise<void> {
        return this.instance.stacktViewController.pushViewController(next);
    }

    public static popViewController(): ViewController {
        return this.instance.stacktViewController.popViewController();
    }

    public static pushMessage(text: string, title: string): Promise<void> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const doneButton = new Button('done');
        
        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.footerBar.appendChild(doneButton);

        textLabel.text = text;

        doneButton.text = '#_done';
        doneButton.tabIndex = 1;

        View.onEnterKey.on(() => this.popViewController(), { sender: doneButton, listener: viewController });
        Button.onClick.on(() => this.popViewController(), { sender: doneButton, listener: viewController });

        return this.pushViewController(viewController).then(() => {
            View.onEnterKey.off({ listener: viewController });
            Button.onClick.off({ listener: viewController });
        });
    }

    public static queryBoolean(text: string, title: string): Promise<boolean> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const yesButton = new Button('yes');
        const noButton = new Button('no', 'cancel');

        let value: boolean;

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.footerBar.appendChild(noButton);
        viewController.footerBar.appendChild(yesButton);

        textLabel.text = text;

        yesButton.text = '#_yes';
        yesButton.tabIndex = 1;

        noButton.text = '#_no';
        noButton.tabIndex = 2;

        View.onEnterKey.on(() => (value = true) || this.popViewController(), { sender: yesButton, listener: viewController });
        View.onEnterKey.on(() => (value = false) || this.popViewController(), { sender: noButton, listener: viewController });

        Button.onClick.on(() => (value = true) || this.popViewController(), { sender: yesButton, listener: viewController });
        Button.onClick.on(() => (value = false) || this.popViewController(), { sender: noButton, listener: viewController });

        return this.pushViewController(viewController).then(() => {
            View.onEnterKey.off({ listener: viewController });
            Button.onClick.off({ listener: viewController });

            return value;
        });
    }

    public static pushError(error: Error, title = '#_error'): Promise<void> {
        return this.pushMessage(error.message, title);
    }
}