import { PopupViewController } from "../viewControllers/popupViewController";
import { View } from "./view";

export class ViewController {
    public readonly view: View;

    public title: string;
    public index: number = null;

    private readonly _children: ViewController[] = [];

    private _parent: ViewController;
    private _popupViewController: PopupViewController;

    constructor(...classes: readonly string[]) {
        this.view = new View(...classes, 'controller');
    }

    public get popupViewController(): PopupViewController { return this._popupViewController; }
    public set popupViewController(value: PopupViewController) {
        this._popupViewController = value;
        this._children.forEach(child => child.popupViewController = value);
    }

    public get parent(): ViewController { return this._parent; }
    public get children(): readonly ViewController[] { return this._children; }

    public init() {
        this._children.forEach(child => child.init());
    }

    public deinit() {
        this._children.forEach(child => child.deinit());
    }

    public async update() {
        await Promise.all(this._children.map(child => child.update()));
    }

    public focus() {
        this.view.focus();
        this._children.forEach(child => child.focus());
    }

    public appendChild(child: ViewController): number {
        if (!child)
            return -1;

        if (child._parent)
            child._parent.removeChild(child);

        child._parent = this;
        child.popupViewController = this.popupViewController;

        this.view.appendChild(child.view);

        return this._children.push(child) - 1;
    }

    public removeChild(child: ViewController): number {
        const index = this._children.findIndex(tmp => tmp == child);

        if (0 <= index) {
            this._children.splice(index, 1);
            this.view.removeChild(child.view);
    
            child._parent = null;
            child.popupViewController = null;
        }

        return index;
    }

    public removeChildAtIndex(index: number): ViewController {
        if (index < 0)
            return null;

        if (index >= this._children.length)
            return null;

        const child = this._children[index];

        this._children.splice(index, 1);
        this.view.removeChildAtIndex(index);

        child._parent = null;
        child.popupViewController = null;

        return child;
    }

    public removeAllChildren() {
        this.view.removeAllChildren();

        this._children.forEach(child => {
            child._parent = null;
            child.popupViewController = null;
        });

        this._children.splice(0, this._children.length);
    }

    public removeFromParent() {
        if (!this._parent)
            return;

        this._parent.removeChild(this);
    }
}