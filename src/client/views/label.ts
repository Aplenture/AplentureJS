import { Localization } from "../../core/utils/localization";
import { TextAlignment } from "../enums/textAlignment";
import { View } from "../utils/view";

export class Label extends View {
    protected readonly label = document.createElement('span');

    constructor(...classes: readonly string[]) {
        super(...classes, 'label');

        this.label.innerText = 'label';

        this.div.appendChild(this.label);
    }

    public get text(): string { return this.label.innerText; }
    public set text(value: string) { this.label.innerText = Localization.translate(value); }

    public get textAlignment(): TextAlignment { return this.label.style.textAlign as TextAlignment; }
    public set textAlignment(value: TextAlignment) { this.label.style.textAlign = value; }
}