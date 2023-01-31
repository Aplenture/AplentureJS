import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Window } from "../utils/window";
import { Bar } from "../views/bar";
import { BottomFlexView } from "../views/bottomFlexView";
import { Label } from "../views/label";
import { LeftFlexView } from "../views/leftFlexView";

export class NavigationViewController extends ViewController {
    public readonly contentViewController = new ViewController('content');

    public readonly menuView = new View('menu');
    public readonly tabBar = new Bar('tab');

    private _selected = 0;

    constructor(...classes: string[]) {
        super(...classes, 'navigation');
    }

    public get selected(): number { return this._selected; }
    public set selected(value: number) {
        this._selected = value;
        this.updateSelected(value);
    }

    public init(): void {
        const leftFlexView = new LeftFlexView();
        const bottomFlexView = new BottomFlexView();

        super.appendChild(this.contentViewController);

        bottomFlexView.appendChild(this.contentViewController.view);
        bottomFlexView.appendChild(this.tabBar);

        leftFlexView.appendChild(this.menuView);
        leftFlexView.appendChild(bottomFlexView);

        this.view.appendChild(leftFlexView);

        View.onResize.on(() => this.updateSizes(), { sender: this.view });

        super.init();

        this.updateSizes();
    }

    public focus() {
        this.contentViewController.focus();
    }

    public appendChild(child: ViewController): number {
        const menuItem = new View('item');
        const menuLabel = new Label();

        const barItem = new View('item');
        const barLabel = new Label();

        const index = this.contentViewController.appendChild(child);

        this.menuView.appendChild(menuItem);
        this.tabBar.appendChild(barItem);

        menuLabel.text = child.title || '#_missing_title';
        barLabel.text = child.title || '#_missing_title';

        menuItem.appendChild(menuLabel);
        menuItem.clickable = true;

        barItem.appendChild(barLabel);
        barItem.clickable = true;

        View.onClick.on(() => this.selected = index, { sender: menuItem });
        View.onClick.on(() => this.selected = index, { sender: barItem });

        this.updateSelected();

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

    protected updateSelected(selected = this._selected) {
        this.contentViewController.children.forEach((controller, index) => controller.view.visible = index == selected);
        this.menuView.children.forEach((view, index) => view.selected = index == selected);
        this.tabBar.children.forEach((view, index) => view.selected = index == selected);
    }
}