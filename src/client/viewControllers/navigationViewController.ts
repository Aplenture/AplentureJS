import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Window } from "../utils/window";
import { Bar } from "../views/bar";
import { BottomFlexView } from "../views/bottomFlexView";
import { HorizontalFlexView } from "../views/horizontalFlexView";
import { Label } from "../views/label";

export class NavigationViewController extends ViewController {
    public readonly contentViewController = new ViewController('content');

    public readonly menuView = new View('menu');
    public readonly tabBar = new Bar('tab');

    constructor(...classes: string[]) {
        super(...classes, 'navigation');
    }

    public init(): void {
        const horizontalFlexView = new HorizontalFlexView();
        const bottomFlexView = new BottomFlexView();

        super.appendChild(this.contentViewController);

        bottomFlexView.appendChild(this.contentViewController.view);
        bottomFlexView.appendChild(this.tabBar);

        horizontalFlexView.appendChild(this.menuView);
        horizontalFlexView.appendChild(bottomFlexView);

        this.view.appendChild(horizontalFlexView);

        Window.onResize.on(() => this.updateSizes());
        View.onResize.on(() => this.updateSizes(), { sender: this.view });

        super.init();

        this.updateSizes();
    }

    public focus() {
        this.contentViewController.focus();
    }

    public appendChild(child: ViewController): number {
        const menuItem = new View('menu_item');
        const menuLabel = new Label('menu_label');

        const barItem = new View('bar_item');
        const barLabel = new Label('bar_label');

        const index = this.contentViewController.appendChild(child);

        this.menuView.appendChild(menuItem);
        this.tabBar.appendChild(barItem);

        menuLabel.text = child.title || '#_missing_title';

        menuItem.appendChild(menuLabel);
        menuItem.clickable = true;

        barLabel.text = child.title || '#_missing_title';

        barItem.appendChild(barLabel);
        barItem.clickable = true;

        View.onClick.on(() => this.showViewControllerAtIndex(index), { sender: menuItem });
        View.onClick.on(() => this.showViewControllerAtIndex(index), { sender: barItem });

        if (0 == index)
            this.showViewControllerAtIndex(index);

        return index;
    }

    public removeChild(child: ViewController): number {
        const index = this.contentViewController.removeChild(child);

        this.menuView.removeChildAtIndex(index);
        this.tabBar.removeChildAtIndex(index);

        return index;
    }

    public removeChildAtIndex(index: number): void {
        this.contentViewController.removeChildAtIndex(index);
        this.menuView.removeChildAtIndex(index);
        this.tabBar.removeChildAtIndex(index);
    }

    public removeAllChildren() {
        this.contentViewController.removeAllChildren();
        this.menuView.removeAllChildren();
        this.tabBar.removeAllChildren();
    }

    public updateSizes() {
        this.menuView.visible = this.contentViewController.view.width >= this.contentViewController.view.height;
        this.tabBar.visible = this.contentViewController.view.width < this.contentViewController.view.height;
    }

    public showViewControllerAtIndex(index: number) {
        this.contentViewController.children.forEach((controller, controllerIndex) => controller.view.visible = controllerIndex == index);
        this.menuView.children.forEach((view, viewIndex) => view.selected = viewIndex == index);
        this.tabBar.children.forEach((view, viewIndex) => view.selected = viewIndex == index);
    }
}