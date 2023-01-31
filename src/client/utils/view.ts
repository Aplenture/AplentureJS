import { Event } from "../../core/utils/event";

export class View {
    public static readonly onClick = new Event<View, void>();
    public static readonly onResize = new Event<View, void>();

    public propaginateClickEvents = false;

    protected readonly div = document.createElement('div');

    private readonly _children: View[] = [];

    private _parent: View;

    constructor(...classes: readonly string[]) {
        classes.forEach(c => this.div.classList.add(c));
        
        this.div.classList.add('view');
        this.div.id = classes.join('_');
        this.div.addEventListener('mousedown', event => event.detail > 1 && event.preventDefault(), false);
        this.div.addEventListener('resize', () => View.onResize.emit(this));
        this.div.addEventListener('click', event => {
            View.onClick.emit(this);

            if (!this.propaginateClickEvents)
                event.stopPropagation();
        });
    }

    public get id(): string { return this.div.id; }
    public get parent(): View { return this._parent; }
    public get children(): readonly View[] { return this._children; }

    public get width(): number { return this.div.offsetWidth };
    public get height(): number { return this.div.offsetHeight };

    public get description(): string { return this.div.title; }
    public set description(value: string) { this.div.title = value; }

    public get hidden(): boolean { return this.div.hidden; }
    public set hidden(value: boolean) {
        this.div.hidden = value;

        if (!value)
            this.focus();
    }

    public get visible(): boolean { return !this.hidden; }
    public set visible(value: boolean) { this.hidden = !value; }

    public get enabled(): boolean { return !this.disabled; }
    public set enabled(value: boolean) { this.disabled = !value; }

    public get disabled(): boolean { return this.div.classList.contains('disabled'); }
    public set disabled(value: boolean) {
        if (value)
            this.div.classList.add('disabled');
        else
            this.div.classList.remove('disabled');
    }

    public get selected(): boolean { return this.div.classList.contains('selected'); }
    public set selected(value: boolean) {
        if (value)
            this.div.classList.add('selected');
        else
            this.div.classList.remove('selected');
    }

    public get clickable(): boolean { return this.div.classList.contains('clickable'); }
    public set clickable(value: boolean) {
        if (value)
            this.div.classList.add('clickable');
        else
            this.div.classList.remove('clickable');
    }

    public focus() {
        this.div.focus();
        this.children.forEach(child => child.focus());
    }

    public click() {
        View.onClick.emit(this);
    }

    public hasClass(value: string): boolean {
        return this.div.classList.contains(value);
    }

    public addClass(value: string) {
        this.div.classList.add(value);
    }

    public removeClass(value: string) {
        this.div.classList.remove(value);
    }

    public appendChild(child: View): number {
        if (child.parent)
            child.parent.removeChild(child);

        child._parent = this;

        this.div.appendChild(child.div);

        return this._children.push(child);
    }

    public removeChild(child: View) {
        this.div.childNodes.forEach((node, index) => {
            if (node !== child.div)
                return;

            this.removeChildAtIndex(index);
        });
    }

    public removeChildAtIndex(index: number) {
        if (index >= this._children.length)
            return;

        this._children[index]._parent = null;
        this._children.splice(index, 1);

        this.div.removeChild(this.div.childNodes[index]);
    }

    public removeAllChildren() {
        this.div.childNodes.forEach(node => this.div.removeChild(node));

        this._children.forEach(child => child._parent = null);
        this._children.splice(0, this._children.length);
    }

    public removeFromParent() {
        if (!this._parent)
            return;

        this._parent.removeChild(this);
    }
}