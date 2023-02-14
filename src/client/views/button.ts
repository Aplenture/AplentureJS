import { View } from "../utils/view";
import { Label } from "./label";

export class Button extends View {
    public readonly label = new Label();

    constructor(...classes: readonly string[]) {
        super(...classes, 'button');

        this.isClickable = true;
        this.propaginateClickEvents = false;

        this.appendChild(this.label);
    }

    public get text(): string { return this.label.text; }
    public set text(value: string) { this.label.text = value; }

    public get isRed(): boolean { return this.hasClass('red'); }
    public set isRed(value: boolean) {
        if (value == this.isRed)
            return;

        if (value)
            this.addClass('red');
        else
            this.removeClass('red');
    }
}