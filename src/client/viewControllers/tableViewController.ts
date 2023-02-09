import { TableSelectionMode } from "../enums/tableSelectionMode";
import { TableViewControllerDelegate } from "../interfaces/tableViewControllerDataDelegate";
import { TableViewControllerSource } from "../interfaces/tableViewControllerDataSource";
import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Label } from "../views/label";

export class TableViewController<TCell extends View> extends ViewController {
    public readonly titleLabel = new Label('title');

    public source: TableViewControllerSource<TCell>;
    public delegate: TableViewControllerDelegate<TCell>;

    private readonly _cells: TCell[] = [];
    private readonly _selectedRows: number[] = [];

    private _header: View;
    private _selectionMode = TableSelectionMode.None;

    constructor(...classes: string[]) {
        super(...classes, 'table');
    }

    public get header(): View { return this._header; }

    public get cells(): readonly TCell[] { return this._cells; }
    public get selectedRows(): readonly number[] { return this._selectedRows; }

    public get selectionMode(): TableSelectionMode { return this._selectionMode; }
    public set selectionMode(value: TableSelectionMode) {
        this._selectionMode = value;
        this.cells.forEach(cell => cell.isClickable = value != TableSelectionMode.None);
    }

    public get alternatingBackgroundColor(): boolean { return this.view.hasClass('alternatingBackgroundColor'); }
    public set alternatingBackgroundColor(value: boolean) {
        if (value == this.alternatingBackgroundColor)
            return;

        if (value)
            this.view.addClass('alternatingBackgroundColor');
        else
            this.view.removeClass('alternatingBackgroundColor');
    }

    public update(): Promise<void> {
        this.render();

        return super.update();
    }

    public render() {
        const numCategories = this.source.numberOfCategories && this.source.numberOfCategories(this) || 1;

        this._header = this.source.createHeader(this);

        this.deselectAllRows();

        this._cells.splice(0, this._cells.length);

        this.view.removeAllChildren();
        this.view.appendChild(this.titleLabel);
        this.view.appendChild(this._header);

        for (let i = 0; i < numCategories; ++i) {
            const numCells = this.source.numberOfCells(this, i);
            const category = this.source.createCategory && this.source.createCategory(this, i);

            if (category) {
                if (!category.hasClass('category'))
                    category.addClass('category');

                this.view.appendChild(category);
            }

            for (let j = 0; j < numCells; ++j) {
                const cell = this.reuseCell(i);

                if (!cell.hasClass('cell'))
                    cell.addClass('cell');

                this.source.updateCell(this, cell, j, i);

                this.view.appendChild(cell);
                this._cells.push(cell);
            }
        }
    }

    public isRowSelected(row: number): boolean {
        return -1 != this._selectedRows.indexOf(row);
    }

    public deselectAllRows(): void {
        if (!this._selectedRows.length)
            return;

        this._selectedRows.splice(0, this._selectedRows.length);
        this._cells.forEach(cell => {
            cell.isSelected = false;

            if (this.delegate)
                this.delegate.deselectedCell(this, cell);
        });
    }

    public deselectRow(row: number): void {
        const index = this._selectedRows.indexOf(row);

        if (- 1 == index)
            return;

        this._cells[row].isSelected = false;
        this._selectedRows.splice(index, 1);

        if (this.delegate)
            this.delegate.deselectedCell(this, this._cells[row]);
    }

    public selectRow(row: number): void {
        if (this._selectionMode == TableSelectionMode.None)
            return;

        if (this.isRowSelected(row))
            return;

        if (this._selectionMode == TableSelectionMode.Single)
            this.deselectAllRows();

        if (this._selectionMode != TableSelectionMode.Clickable) {
            this._cells[row].isSelected = true;

            if (!this._selectedRows.includes(row))
                this._selectedRows.push(row);
        }

        if (this.delegate)
            this.delegate.selectedCell(this, this._cells[row]);
    }

    public cellIndex(cell: TCell): number {
        return this._cells.indexOf(cell);
    }

    private reuseCell(category: number): TCell {
        const cell = this.source.createCell(this, category);

        cell.isClickable = this._selectionMode != TableSelectionMode.None;

        View.onClick.on(() => {
            if (this._selectionMode == TableSelectionMode.None)
                return;

            const row = this.cellIndex(cell);

            if (this.isRowSelected(row))
                this.deselectRow(row);
            else
                this.selectRow(row);
        }, { sender: cell });

        return cell;
    }
}