import { View } from "../utils/view";
import { Label } from "./label";

export class Button extends View {
    public readonly label = new Label();

    constructor(...classes: readonly string[]) {
        super(...classes, 'button');

        this.clickable = true;
        this.propaginateClickEvents = false;
        this.text = '#_button';

        this.appendChild(this.label);
    }

    public get text(): string { return this.label.text; }
    public set text(value: string) { this.label.text = value; }
}