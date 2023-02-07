import { View } from "../utils/view";
import { Bar } from "../views/bar";
import { TitleBar } from "../views/titleBar";
import { ContainerViewController } from "./containerViewController";

export class BodyViewController extends ContainerViewController {
    public readonly titleBar: TitleBar;
    public readonly footerBar: Bar;

    constructor(...classes: string[]) {
        super(...classes, 'body');

        this.titleBar = new TitleBar(...classes, 'body');
        this.footerBar = new Bar(...classes, 'body', 'footer');
    }

    public get contentView(): View { return this.contentViewController.view; }

    public init(): void {
        this.view.appendChild(this.titleBar);
        super.init();
        this.view.appendChild(this.footerBar);
    }
}