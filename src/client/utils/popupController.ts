import { View } from "./view";
import { ViewController } from "./viewController";
import { Button } from "../views/button";
import { Label } from "../views/label";
import { BodyViewController } from "../viewControllers/bodyViewController";
import { StackViewController } from "../viewControllers/stackViewController";

export abstract class PopupController {
    private static viewController: ViewController;
    private static stackViewController: StackViewController;
    private static closeButton: View;

    private static initialized = false;

    public static async init() {
        if (this.initialized)
            throw new Error('PopupController is already initialized');

        const closeButtonContainer = new View('close-button-container');

        this.initialized = true;
        this.viewController = new ViewController('popup-view-controller');
        this.stackViewController = new StackViewController();
        this.closeButton = new View('close');

        closeButtonContainer.appendChild(this.closeButton);

        this.viewController.appendChild(this.stackViewController);

        this.stackViewController.view.propaginateClickEvents = false;
        this.stackViewController.view.appendChild(closeButtonContainer);

        this.closeButton.propaginateClickEvents = false;
        this.closeButton.onClick.on(() => this.stackViewController.popViewController());

        this.stackViewController.onPush.on(() => !(this.viewController.view as any).div.parentNode && document.body.appendChild((this.viewController.view as any).div));
        this.stackViewController.onPop.on(() => 0 == this.stackViewController.children.length && (this.viewController.view as any).div.parentNode && document.body.removeChild((this.viewController.view as any).div));

        await this.viewController.load();
    }

    public static pushViewController(next: ViewController): Promise<void> {
        return this.stackViewController.pushViewController(next);
    }

    public static popViewController(): Promise<ViewController> {
        return this.stackViewController.popViewController();
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
}