import { ViewController } from "../utils/viewController";
import { MenuView } from "../views/menuView";
import { TabBar } from "../views/tabBar";
import { ContainerViewController } from "./containerViewController";

export class NavigationViewController extends ContainerViewController {
    public readonly menuView: MenuView;
    public readonly tabBar: TabBar;

    constructor(...classes: string[]) {
        super(...classes, 'navigation');

        this.menuView = new MenuView(...classes, 'navigation');
        this.tabBar = new TabBar(...classes, 'navigation');
    }

    public get selectedIndex(): number { return this.children.findIndex(child => child.view.isVisible); }
    public set selectedIndex(value: number) {
        if (value == this.selectedIndex)
            return;

        this.children.forEach((controller, index) => controller.view.isVisible = index == value);

        this.menuView.selectedIndex = value;
        this.tabBar.selectedIndex = value;

        if (0 <= value && value < this.children.length)
            this.children[value].update();
    }

    public init(): void {
        MenuView.onItemClicked.on(index => this.selectedIndex = index, { sender: this.menuView, listener: this });
        TabBar.onItemClicked.on(index => this.selectedIndex = index, { sender: this.tabBar, listener: this });

        this.view.appendChild(this.menuView);

        super.init();

        this.view.appendChild(this.tabBar);

        this.selectedIndex = 0;
    }

    public deinit(): void {
        MenuView.onItemClicked.off({ listener: this });
        TabBar.onItemClicked.off({ listener: this });

        super.deinit();
    }

    public appendChild(child: ViewController, title = child.title || '#_missing_title'): number {
        this.removeAllChildren();

        const index = super.appendChild(child);

        child.view.isVisible = false;

        this.menuView.addItem(title);
        this.tabBar.addItem(title);

        if (0 == index)
            this.selectedIndex = 0;

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = super.removeChild(child);

        if (0 <= index) {
            this.menuView.removeChildAtIndex(index);
            this.tabBar.removeChildAtIndex(index);
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        const child = super.removeChildAtIndex(index);

        if (child) {
            this.menuView.removeChildAtIndex(index);
            this.tabBar.removeChildAtIndex(index);
        }

        return child;
    }

    public removeAllChildren() {
        this.contentViewController.removeAllChildren();
        this.menuView.removeAllChildren();
        this.tabBar.removeAllChildren();
    }
}