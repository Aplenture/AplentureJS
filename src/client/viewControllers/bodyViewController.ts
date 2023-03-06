import { View } from "../utils/view";
import { Bar } from "../views/bar";
import { TitleBar } from "../views/titleBar";
import { ContainerViewController } from "./containerViewController";

export class BodyViewController extends ContainerViewController {
    public readonly titleBar: TitleBar;
    public readonly footerBar: Bar;

    constructor(...classes: string[]) {
        super(...classes, 'body-view-controller');

        this.titleBar = new TitleBar(...classes, 'body-title-bar');
        this.footerBar = new Bar(...classes, 'body-footer-bar');

        this.view.appendChild(this.titleBar);
        this.view.appendChild(this.contentView);
        this.view.appendChild(this.footerBar);
    }

    public get contentView(): View { return this.contentViewController.view; }
}