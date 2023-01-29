import { View } from "../utils";

export class ImageView extends View {
    protected readonly image = document.createElement('img');

    constructor(...classes: readonly string[]) {
        super(...classes, 'image');

        this.div.appendChild(this.image);
    }

    public get source(): string { return this.image.src; }
    public set source(value: string) { this.image.src = value; }
}