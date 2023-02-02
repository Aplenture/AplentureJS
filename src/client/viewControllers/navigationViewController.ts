import { TextAlignment } from "../enums/textAlignment";
import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Window } from "../utils/window";
import { BottomFlexView } from "../views/bottomFlexView";
import { Label } from "../views/label";
import { LeftFlexView } from "../views/leftFlexView";
import { MenuView } from "../views/menuView";
import { TabBar } from "../views/tabBar";

export class NavigationViewController extends ViewController {
    public readonly contentViewController = new ViewController('content');

    public readonly menuView = new MenuView();
    public readonly tabBar = new TabBar();

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

        Window.onResize.on(() => this.updateSizes());

        super.init();

        this.updateSizes();
    }

    public focus() {
        this.contentViewController.focus();
    }

    public appendChild(child: ViewController, title = child.title || '#_missing_title'): number {
        super.appendChild(child);

        child.view.visible = false;
        
        return this.addItem(title, (index) => this.selected = index);
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
        const landscaped = this.contentViewController.view.width > this.contentViewController.view.height;

        this.menuView.visible = landscaped;
        this.tabBar.visible = !landscaped;
    }

    public addItem(title: string, onClicked: (index: number) => void): number {
        const index = this.menuView.addItem(title, onClicked);

        this.tabBar.addItem(title, onClicked);
        this.updateSelected();

        return index;
    }

    public removeItem(title: string) {
        this.menuView.removeItem(title);
        this.tabBar.removeItem(title);
        this.updateSelected();
    }

    protected updateSelected(selected = this._selected) {
        this.contentViewController.children.forEach((controller, index) => controller.view.visible = index == selected);
        this.menuView.children.forEach((view, index) => view.selected = index == selected);
        this.tabBar.children.forEach((view, index) => view.selected = index == selected);
    }
}