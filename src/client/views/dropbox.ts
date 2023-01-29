import { Event, Localization } from "../../core";
import { View } from "../utils";

export class Dropbox extends View {
    public static readonly onSelected = new Event<Dropbox, number>();

    protected readonly label = document.createElement('label');
    protected readonly select = document.createElement('select');

    private _options: readonly HTMLOptionElement[];

    constructor(...classes: readonly string[]) {
        super(...classes, 'dropbox');

        this.div.appendChild(this.label);
        this.div.appendChild(this.select);

        this.select.addEventListener('change', () => Dropbox.onSelected.emit(this, this.select.selectedIndex));
    }

    public get title(): string { return this.label.innerText; }
    public set title(value: string) { this.label.innerText = Localization.translate(value); }

    public get options(): readonly string[] {
        return this._options.map(option => option.text);
    }

    public set options(value: readonly string[]) {
        this.select.innerText = '';

        this._options = value.map(text => {
            const element = document.createElement('option');

            element.text = text;

            this.select.appendChild(element);

            return element;
        });
    }

    public get selectedIndex(): number { return this.select.selectedIndex; }
    public set selectedIndex(value: number) { this.select.selectedIndex = value; }

    public get multipleSelectionEnabled(): boolean { return this.select.multiple; }
    public set multipleSelectionEnabled(value: boolean) { this.select.multiple = value; }

    public get selectedIndices(): readonly number[] {
        return this._options
            .map((option, index) => index)
            .filter(index => this._options[index].selected);
    }

    public set selectedIndices(value: readonly number[]) {
        this._options.forEach((option, index) => option.selected = value.includes(index));
    }

    public focus() {
        this.select.focus();
    }
}