import { Milliseconds } from "../../core";
import { Event } from "../../core/utils/event";
import { Localization } from "../../core/utils/localization";
import { View } from "../utils/view";

export enum TextFieldType {
    Text = 'text',
    Password = 'password',
    Date = 'date',
    DateTimeLocal = 'datetime-local'
}

export class TextField extends View {
    public static readonly onChange = new Event<TextField, string>('TextField.onChange');

    protected readonly label = document.createElement('span');
    protected readonly input = document.createElement('input');

    constructor(...classes: readonly string[]) {
        super(...classes, 'text-field-view');

        this.propaginateClickEvents = false;
        this.title = '#_title';

        this.div.appendChild(this.label);
        this.div.appendChild(this.input);

        this.input.type = 'text';
        this.input.addEventListener("input", (event: InputEvent) => TextField.onChange.emit(this, event.data));

        this.label.innerText = '_text_field_title_';
    }

    public get hasFocus(): boolean { return document.activeElement == this.input; }

    public get type(): TextFieldType { return this.input.type as any; }
    public set type(value: TextFieldType) { this.input.type = value; }

    public get title(): string { return this.label.innerText; }
    public set title(value: string) { this.label.innerText = Localization.translate(value); }

    public get value(): string { return this.input.value; }
    public set value(value: string) { this.input.value = value; }

    public get dateValue(): Date { return new Date(this.input.value); }
    public set dateValue(value: Date) {
        this.input.value = this.type == TextFieldType.Date
            ? new Date(value.getTime() - value.getTimezoneOffset() * Milliseconds.Minute).toLocaleDateString('en-ca')
            : new Date(value.getTime() - value.getTimezoneOffset() * Milliseconds.Minute).toISOString().slice(0, 16);
    }

    public get numberValue(): number { return Number(this.input.value); }
    public set numberValue(value: number) { this.input.value = value.toString(); }

    public get placeholder(): string { return this.input.placeholder; }
    public set placeholder(value: string) { this.input.placeholder = Localization.translate(value); }

    public get selectionStart() { return this.input.selectionStart; }
    public get selectionRange() { return this.input.selectionEnd - this.input.selectionStart; }

    public focus() {
        this.input.focus();
    }

    public selectRange(start?: number, end = this.value.length) {
        this.input.setSelectionRange(start, end);
    }
}