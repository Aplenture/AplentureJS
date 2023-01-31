import { View } from "../utils/view";

export class Container extends View {
    public readonly contentView = new View('content');

    constructor(...classes: string[]) {
        super(...classes, 'container');

        super.appendChild(this.contentView);
    }

    public get children(): readonly View[] { return this.contentView.children; }

    public focus() {
        this.contentView.focus();
    }

    public appendChild(child: View): number {
        return this.contentView.appendChild(child);
    }

    public removeChild(child: View): void {
        this.contentView.removeChild(child);
    }

    public removeChildAtIndex(index: number) {
        this.contentView.removeChildAtIndex(index);
    }

    public removeAllChildren(): void {
        this.contentView.removeAllChildren();
    }
}