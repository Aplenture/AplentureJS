import { View } from "../utils";

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

    public appendChild(controller: View): void {
        this.contentView.appendChild(controller);
    }

    public removeChild(controller: View): void {
        this.contentView.removeChild(controller);
    }

    public removeAllChildren(): void {
        this.contentView.removeAllChildren();
    }
}