import { View } from "../utils";

export class Canvas extends View {
    protected readonly canvas = document.createElement('canvas');

    constructor(...classes: readonly string[]) {
        super(...classes, 'canvas');

        this.div.appendChild(this.canvas);
    }
}