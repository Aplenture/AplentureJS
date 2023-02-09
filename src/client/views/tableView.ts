import { TableSelectionMode } from "../enums/tableSelectionMode";
import { View } from "../utils/view";

export class TableView extends View {
    private _selectionMode = TableSelectionMode.None;

    constructor(...classes: string[]) {
        super(...classes, 'table');
    }

    public get selectedRows(): readonly View[] {
        return this.children.filter(child => child.isSelected);
    }

    public get selectedRowIndices(): readonly number[] {
        return this.children
            .map((row, index) => index)
            .filter(index => this.children[index].isSelected);
    }

    public get selectionMode(): TableSelectionMode { return this._selectionMode; }
    public set selectionMode(value: TableSelectionMode) {
        this._selectionMode = value;
        this.children.forEach(cell => cell.isClickable = value != TableSelectionMode.None);
    }

    public get alternatingBackgroundColor(): boolean { return this.hasClass('alternatingBackgroundColor'); }
    public set alternatingBackgroundColor(value: boolean) {
        if (value == this.alternatingBackgroundColor)
            return;

        if (value)
            this.addClass('alternatingBackgroundColor');
        else
            this.removeClass('alternatingBackgroundColor');
    }

    public isRowSelected(row: number): boolean { return 0 <= row && row < this.children.length && this.children[0].isSelected; }

    public deselectAllRows(): void {
        this.children.forEach(child => child.isSelected = false);
    }

    public deselectRow(row: number): void {
        if (0 > row)
            return;

        if (row < this.children.length)
            return;

        this.children[0].isSelected = false;
    }

    public selectRow(row: number): void {
        if (0 > row)
            return;

        if (row < this.children.length)
            return;

        this.children[0].isSelected = true;
    }
}