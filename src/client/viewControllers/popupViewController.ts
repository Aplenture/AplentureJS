import { INavigationViewController } from "../interfaces/navigationViewController";
import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Button } from "../views/button";
import { Label } from "../views/label";
import { BodyViewController } from "./bodyViewController";
import { StackViewController } from "./stackViewController";

export class PopupViewController extends ViewController implements INavigationViewController {
    private static _instance: PopupViewController;

    public readonly stacktViewController = new StackViewController();

    public readonly closeButton = new View('close');

    constructor(...classes: readonly string[]) {
        super(...classes, 'popup-view-controller');

        const closeButtonContainer = new View('close-button-container');

        closeButtonContainer.appendChild(this.closeButton);

        super.appendChild(this.stacktViewController);

        this.stacktViewController.view.propaginateClickEvents = false;
        this.stacktViewController.view.appendChild(closeButtonContainer);

        this.closeButton.onClick.on(() => this.stacktViewController.popViewController());

        this.stacktViewController.onPush.on(() => !(this.view as any).div.parentNode && document.body.appendChild((this.view as any).div));
        this.stacktViewController.onPop.on(() => 0 == this.children.length && (this.view as any).div.parentNode && document.body.removeChild((this.view as any).div));
    }

    protected static get instance(): PopupViewController {
        if (!this._instance) {
            this._instance = new PopupViewController();
            this._instance.load();
        }

        return this._instance;
    }

    public get children(): readonly ViewController[] { return this.stacktViewController.children; }

    public focus() {
        this.stacktViewController.focus();
    }

    public static pushViewController(next: ViewController): Promise<void> {
        return this.instance.pushViewController(next);
    }

    public static popViewController(): Promise<ViewController> {
        return this.instance.popViewController();
    }

    public static pushMessage(text: string, title: string): Promise<void> {
        const viewController = new BodyViewController('message');

        const textLabel = new Label('text');
        const doneButton = new Button('done');

        viewController.titleBar.title = title;
        viewController.contentView.appendChild(textLabel);
        viewController.footerBar.appendChild(doneButton);
        viewController.load();

        textLabel.text = text;

        doneButton.text = '#_ok';
        doneButton.tabIndex = 1;

        doneButton.onEnterKey.on(() => this.popViewController());
        doneButton.onEscapeKey.on(() => this.popViewController());
        doneButton.onClick.on(() => this.popViewController());

        return this.pushViewController(viewController);
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
        viewController.load();

        textLabel.text = text;

        yesButton.text = '#_yes';
        yesButton.tabIndex = 1;

        noButton.text = '#_no';
        noButton.tabIndex = 2;

        yesButton.onEnterKey.on(() => (value = true) && this.popViewController());
        noButton.onEnterKey.on(() => (value = false) || this.popViewController());

        yesButton.onEscapeKey.on(() => (value = false) || this.popViewController());
        noButton.onEscapeKey.on(() => (value = false) || this.popViewController());

        yesButton.onClick.on(() => (value = true) && this.popViewController());
        noButton.onClick.on(() => (value = false) || this.popViewController());

        return this.pushViewController(viewController).then(() => value);
    }

    public static pushError(error: Error, title = '#_error'): Promise<void> {
        return this.pushMessage(error.message, title);
    }

    public pushViewController(next: ViewController): Promise<void> {
        return this.stacktViewController.pushViewController(next);
    }

    public popViewController(): Promise<ViewController> {
        return this.stacktViewController.popViewController();
    }
}