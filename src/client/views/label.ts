import { Localization } from "../../core/utils/localization";
import { View } from "../utils/view";

export class Label extends View {
    protected readonly label = document.createElement('label');

    constructor(...classes: readonly string[]) {
        super(...classes, 'label');

        this.div.appendChild(this.label);
    }

    public get text(): string { return this.label.innerText; }
    public set text(value: string) { this.label.innerText = Localization.translate(value); }
}