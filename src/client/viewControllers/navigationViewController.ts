import { Event } from "../../core";
import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { MenuView } from "../views/menuView";
import { TabBar } from "../views/tabBar";
import { ContainerViewController } from "./containerViewController";

export class NavigationViewController extends ViewController {
    public static readonly onSelected = new Event<NavigationViewController, number>('NavigationViewController.onSelected');

    public readonly containerViewController = new ContainerViewController();

    public readonly menuView: MenuView;
    public readonly tabBar: TabBar;

    constructor(...classes: string[]) {
        super(...classes, 'navigation');

        this.menuView = new MenuView(...classes, 'navigation');
        this.tabBar = new TabBar(...classes, 'navigation');
    }

    public get children(): readonly ViewController[] { return this.containerViewController.children; }
    public get contentView(): View { return this.containerViewController.contentViewController.view; }

    public get selectedViewController(): ViewController { return this.children.find(child => child.view.isVisible); }

    public get selectedIndex(): number { return this.children.findIndex(child => child.view.isVisible); }
    public set selectedIndex(value: number) {
        if (value == this.selectedIndex)
            return;

        this.children.forEach((controller, index) => controller.view.isVisible = index == value);

        this.menuView.selectedIndex = value;
        this.tabBar.selectedIndex = value;

        const selectedViewController = this.selectedViewController;

        if (selectedViewController)
            selectedViewController.focus();
    }

    public init(): void {
        const relativeViewController = new ViewController('relative');

        MenuView.onItemClicked.on(index => this.selectedIndex = index, { sender: this.menuView, listener: this });
        MenuView.onItemClicked.on(index => NavigationViewController.onSelected.emit(this, index), { sender: this.menuView, listener: this });
        MenuView.onItemClicked.on(() => this.update(), { sender: this.menuView, listener: this });

        TabBar.onItemClicked.on(index => this.selectedIndex = index, { sender: this.tabBar, listener: this });
        TabBar.onItemClicked.on(index => NavigationViewController.onSelected.emit(this, index), { sender: this.menuView, listener: this });
        TabBar.onItemClicked.on(() => this.update(), { sender: this.menuView, listener: this });

        this.view.appendChild(this.menuView);

        relativeViewController.appendChild(this.containerViewController);

        super.appendChild(relativeViewController);
        super.init();

        this.containerViewController.view.appendChild(this.tabBar);

        this.selectedIndex = 0;
    }

    public deinit(): void {
        MenuView.onItemClicked.off({ listener: this });
        TabBar.onItemClicked.off({ listener: this });

        super.deinit();
    }

    public enableViewController(index: number, enabled = true) {
        if (0 > index)
            return;

        if (index >= this.children.length)
            return;

        this.menuView.children[index].isDisabled = !enabled;
        this.tabBar.children[index].isDisabled = !enabled;
    }

    public disableViewController(index: number) {
        this.enableViewController(index, false);
    }

    public appendChild(child: ViewController, title = child.title || '#_missing_title'): number {
        const index = this.containerViewController.appendChild(child);

        child.view.isVisible = false;

        this.menuView.addItem(title);
        this.tabBar.addItem(title);

        if (0 == index)
            this.selectedIndex = 0;

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = this.containerViewController.removeChild(child);

        if (0 <= index) {
            this.menuView.removeChildAtIndex(index);
            this.tabBar.removeChildAtIndex(index);
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = this.containerViewController.removeChildAtIndex(index);

        if (child) {
            this.menuView.removeChildAtIndex(index);
            this.tabBar.removeChildAtIndex(index);
        }

        return child;
    }

    public removeAllChildren() {
        this.containerViewController.removeAllChildren();
        this.menuView.removeAllChildren();
        this.tabBar.removeAllChildren();
    }
}