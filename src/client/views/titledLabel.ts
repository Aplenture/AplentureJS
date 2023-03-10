import { Localization } from "../../core/utils/localization";
import { View } from "../utils/view";

export class TitledLabel extends View {
    protected readonly titleLabel = document.createElement('span');
    protected readonly valueLabel = document.createElement('span');

    constructor(...classes: readonly string[]) {
        super(...classes, 'titled-label-view');

        this.titleLabel.innerText = '_label_title_';
        this.valueLabel.innerText = '_label_text_';

        this.div.appendChild(this.titleLabel);
        this.div.appendChild(this.valueLabel);
    }

    public get title(): string { return this.titleLabel.innerText; }
    public set title(value: string) { this.titleLabel.innerText = Localization.translate(value); }

    public get text(): string { return this.valueLabel.innerText; }
    public set text(value: string) { this.valueLabel.innerText = Localization.translate(value); }
}