import { View } from "./view";

export class ViewController {
    public readonly view: View;

    private readonly _children: ViewController[] = [];

    private _parent: ViewController;

    constructor(...classes: readonly string[]) {
        this.view = new View(...classes);
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

    public appendChild(child: ViewController) {
        if (child._parent)
            child._parent.removeChild(child);

        child._parent = this;

        this.view.appendChild(child.view);
        this._children.push(child);
    }

    public removeChild(child: ViewController) {
        const index = this._children.indexOf(child);

        if (0 > index)
            return;

        child._parent = null;

        this.view.removeChild(child.view);
        this._children.splice(index, 1);
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