import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { MenuView } from "../views/menuView";
import { TabBar } from "../views/tabBar";
import { TitleBar } from "../views/titleBar";
import { PopupViewController } from "./popupViewController";

export class RootViewController extends ViewController {
    public readonly contentViewController = new ViewController('root', 'content');
    public readonly popupViewController = new PopupViewController('root');

    public readonly header = new View('root', 'content', 'header');
    public readonly footer = new View('root', 'content', 'footer');

    public readonly bannerView = new View('root', 'banner');
    public readonly titlebar = new TitleBar('root');

    protected readonly menuView = new MenuView('root');
    protected readonly tabBar = new TabBar('root');

    constructor(...classes: string[]) {
        super(...classes, 'root');
    }

    public get selected(): number { return this.contentViewController.children[0] && this.contentViewController.children[0].children.findIndex(child => child.view.visible); }
    public set selected(value: number) {
        const viewController = this.contentViewController.children[0];

        if (!viewController)
            return;

        viewController.children.forEach((controller, index) => controller.view.visible = index == value);
        this.menuView.children.forEach((view, index) => view.selected = index == value);
        this.tabBar.children.forEach((view, index) => view.selected = index == value);

        if (0 <= value && value < viewController.children.length)
            viewController.children[value].update();
    }

    public init(): void {
        const headerContainerView = new View('root', 'header', 'container');
        const bodyContainerView = new View('root', 'body', 'container');
        const mainContainerView = new View('root', 'main', 'container');
        const contentContainerView = new View('root', 'content', 'container');
        const footerContainerView = new View('root', 'footer', 'container');

        super.appendChild(this.contentViewController);
        super.appendChild(this.popupViewController);

        headerContainerView.appendChild(this.bannerView);
        headerContainerView.appendChild(this.titlebar);

        bodyContainerView.appendChild(mainContainerView);

        mainContainerView.appendChild(this.menuView);
        mainContainerView.appendChild(contentContainerView);

        contentContainerView.appendChild(this.header);
        contentContainerView.appendChild(this.contentViewController.view);
        contentContainerView.appendChild(footerContainerView);

        footerContainerView.appendChild(this.footer);
        footerContainerView.appendChild(this.tabBar);

        this.view.appendChild(headerContainerView);
        this.view.appendChild(bodyContainerView);

        MenuView.onItemClicked.on(index => this.selected = index, { sender: this.menuView, listener: this });
        TabBar.onItemClicked.on(index => this.selected = index, { sender: this.tabBar, listener: this });

        super.init();

        this.selected = 0;
    }

    public deinit(): void {
        MenuView.onItemClicked.off({ listener: this });
        TabBar.onItemClicked.off({ listener: this });

        super.deinit();
    }

    public focus() {
        this.contentViewController.focus();
    }

    public appendChild(child: ViewController, title = child.title || '#_missing_title'): number {
        this.removeAllChildren();

        const result = this.contentViewController.appendChild(child);

        if (child.header)
            this.header.appendChild(child.header);

        if (child.footer)
            this.footer.appendChild(child.footer);

        child.popupViewController = this.popupViewController;
        child.children.forEach(child => {
            child.view.visible = false;

            this.menuView.addItem(title);
            this.tabBar.addItem(title);
        });

        this.selected = 0;

        return result;
    }

    public removeChild(child: ViewController): number {
        const index = this.contentViewController.children.findIndex(tmp => tmp == child);

        if (0 <= index)
            this.removeAllChildren();

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = this.contentViewController.children[index];

        if (child)
            this.removeAllChildren();

        return child;
    }

    public removeAllChildren() {
        this.contentViewController.children.forEach(child => child.popupViewController = null);

        this.contentViewController.removeAllChildren();
        this.menuView.removeAllChildren();
        this.tabBar.removeAllChildren();
        this.header.removeAllChildren();
        this.footer.removeAllChildren();
    }
}