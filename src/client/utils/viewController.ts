import { View } from "./view";

export class ViewController {
    public readonly view: View;

    public title: string;

    private readonly _children: ViewController[] = [];

    private _parent: ViewController;

    constructor(...classes: readonly string[]) {
        this.view = new View(...classes, 'controller');
    }

    public get parent(): ViewController { return this._parent; }
    public get children(): readonly ViewController[] { return this._children; }

    public init() {
        this._children.forEach(child => child.init());
    }

    public async update(): Promise<void> {
        await Promise.all(this._children.map(child => child.update()));
    }

    public focus() {
        this.view.focus();
        this._children.forEach(child => child.focus());
    }

    public appendChild(child: ViewController): number {
        if (!child)
            return;

        if (child._parent)
            child._parent.removeChild(child);

        child._parent = this;

        this.view.appendChild(child.view);

        return this._children.push(child) - 1;
    }

    public removeChild(child: ViewController): number {
        const index = this._children.indexOf(child);

        if (0 > index)
            return;

        this.removeChildAtIndex(index);

        return index;
    }

    public removeChildAtIndex(index: number) {
        if (index < 0)
            return;

        if (index >= this._children.length)
            return;

        this._children[index]._parent = null;
        this._children.splice(index, 1);

        this.view.removeChildAtIndex(index);
    }

    public removeAllChildren() {
        this.view.removeAllChildren();

        this._children.forEach(child => child._parent = null);
        this._children.splice(0, this._children.length);
    }

    public removeFromParent() {
        if (!this._parent)
            return;

        this._parent.removeChild(this);
    }
}