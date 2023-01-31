import { Event } from "../../core/utils/event";
import { Localization } from "../../core/utils/localization";
import { View } from "../utils/view";

export enum TextFieldType {
    Text = 'text',
    Password = 'password'
}

export class TextField extends View {
    public static readonly onChange = new Event<TextField, string>();

    protected readonly label = document.createElement('label');
    protected readonly input = document.createElement('input');

    constructor(...classes: readonly string[]) {
        super(...classes, 'text_field');

        this.div.appendChild(this.label);
        this.div.appendChild(this.input);

        this.input.type = 'text';
        this.input.addEventListener("input", (event: InputEvent) => TextField.onChange.emit(this, event.data));
    }

    public get hasFocus(): boolean { return document.activeElement == this.input; }

    public get type(): TextFieldType { return this.input.type as any; }
    public set type(value: TextFieldType) { this.input.type = value; }

    public get title(): string { return this.label.innerText; }
    public set title(value: string) { this.label.innerText = Localization.translate(value); }

    public get text(): string { return this.input.value; }
    public set text(value: string) { this.input.value = value; }

    public get placeholder(): string { return this.input.placeholder; }
    public set placeholder(value: string) { this.input.placeholder = value; }

    public get selectionStart() { return this.input.selectionStart; }
    public get selectionRange() { return this.input.selectionEnd - this.input.selectionStart; }

    public focus() {
        this.input.focus();
    }

    public selectRange(start?: number, end = this.text.length) {
        this.input.setSelectionRange(start, end);
    }
}