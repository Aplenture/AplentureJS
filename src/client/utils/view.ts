import { Event } from "../../core/utils/event";

export class View {
    public static readonly onClick = new Event<View, void>('View.onClick');
    public static readonly onEnterKey = new Event<View, void>('View.onEnterKey');
    public static readonly onHiddenChanged = new Event<View, boolean>('View.onHiddenChanged');

    public index: number = null;
    public propaginateClickEvents = true;

    protected readonly div = document.createElement('div');

    private readonly _children: View[] = [];

    private _parent: View;

    constructor(...classes: string[]) {
        classes.push('view');
        classes.forEach(c => this.div.classList.add(c));

        this.div.id = classes.join('_');
        this.div.addEventListener('mousedown', event => event.detail > 1 && event.preventDefault(), false);

        this.div.addEventListener('click', event => {
            View.onClick.emit(this);

            if (!this.propaginateClickEvents)
                event.stopPropagation();
        });

        this.div.addEventListener("keydown", event => {
            if (event.key != 'Enter')
                return;

            if (!this.hasFocus)
                return;

            event.preventDefault();
            View.onEnterKey.emit(this);
        });
    }

    public get id(): string { return this.div.id; }
    public get parent(): View { return this._parent; }
    public get children(): readonly View[] { return this._children; }
    public get hasFocus(): boolean { return document.activeElement == this.div; }

    public get tabIndex(): number { return this.div.tabIndex; }
    public set tabIndex(value: number) { this.div.tabIndex = value; }

    public get width(): number { return this.div.offsetWidth };
    public get height(): number { return this.div.offsetHeight };

    public get description(): string { return this.div.title; }
    public set description(value: string) { this.div.title = value; }

    public get isVisible(): boolean { return !this.isHidden; }
    public set isVisible(value: boolean) { this.isHidden = !value; }

    public get isEnabled(): boolean { return !this.isDisabled; }
    public set isEnabled(value: boolean) { this.isDisabled = !value; }

    public get isHidden() { return this.div.classList.contains('hidden'); }
    public set isHidden(value) {
        if (value == this.isHidden)
            return;

        if (value)
            this.div.classList.add('hidden');
        else
            this.div.classList.remove('hidden');

        View.onHiddenChanged.emit(this, value);
    }

    public get isDisabled(): boolean { return this.div.classList.contains('disabled'); }
    public set isDisabled(value: boolean) {
        if (value == this.isDisabled)
            return;

        if (value)
            this.div.classList.add('disabled');
        else
            this.div.classList.remove('disabled');
    }

    public get isSelected(): boolean { return this.div.classList.contains('selected'); }
    public set isSelected(value: boolean) {
        if (value == this.isSelected)
            return;

        if (value)
            this.div.classList.add('selected');
        else
            this.div.classList.remove('selected');
    }

    public get isClickable(): boolean { return this.div.classList.contains('clickable'); }
    public set isClickable(value: boolean) {
        if (value == this.isClickable)
            return;

        if (value)
            this.div.classList.add('clickable');
        else
            this.div.classList.remove('clickable');
    }

    public focus() {
        this.div.focus();
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
        if (!child)
            return -1;

        if (child.parent)
            child.parent.removeChild(child);

        child._parent = this;

        this.div.appendChild(child.div);

        return this._children.push(child) - 1;
    }

    public removeChild(child: View): number {
        let result: number;

        this.div.childNodes.forEach((node, index) => {
            if (node !== child.div)
                return;

            result = index;

            this.removeChildAtIndex(index);
        });

        return result;
    }

    public removeChildAtIndex(index: number): View {
        if (index < 0)
            return null;

        if (index >= this._children.length)
            return null;

        const child = this._children[index];

        child._parent = null;

        this._children.splice(index, 1);
        this.div.removeChild(this.div.childNodes[index]);

        return child;
    }

    public removeAllChildren() {
        this._children.forEach(child => {
            this.div.removeChild(child.div);
            child._parent = null;
        });

        this._children.splice(0, this._children.length);
    }

    public removeFromParent() {
        if (!this._parent)
            return;

        this._parent.removeChild(this);
    }
}