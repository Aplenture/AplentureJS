import { TableSelectionMode } from "../enums/tableSelectionMode";
import { TableViewControllerDelegate } from "../interfaces/tableViewControllerDataDelegate";
import { TableViewControllerSource } from "../interfaces/tableViewControllerDataSource";
import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Label } from "../views/label";
import { TableView } from "../views/tableView";

export class TableViewController extends ViewController {
    public readonly titleLabel = new Label('title');
    public readonly tableView = new TableView();

    public source: TableViewControllerSource;
    public delegate: TableViewControllerDelegate;

    private _header: View;
    private _cells: View[][] = [];

    constructor(...classes: string[]) {
        super(...classes, 'table-view-controller');

        this.titleLabel.text = 'table title';
    }

    public get header(): View { return this._header; }
    public get cells(): readonly View[][] { return this._cells; }

    public get selectionMode(): TableSelectionMode { return this.tableView.selectionMode; }
    public set selectionMode(value: TableSelectionMode) { this.tableView.selectionMode = value; }

    public init(): void {
        this.view.appendChild(this.titleLabel);
        this.view.appendChild(this.tableView);

        super.init();
    }

    public update(): Promise<void> {
        this.render();

        return super.update();
    }

    public deinit(): void {
        View.onClick.off({ listener: this });

        super.deinit();
    }

    public render() {
        if (!this.source)
            throw new Error('missing table view controller data source');

        const numCategories = this.source.numberOfCategories && this.source.numberOfCategories(this) || 1;

        this._header = this.source.createHeader && this.source.createHeader(this);

        this.deselectAllRows();

        this.tableView.removeAllChildren();

        if (this._header)
            this.tableView.appendHeader(this._header);

        for (let category = 0; category < numCategories; ++category) {
            const numCells = this.source.numberOfCells(this, category);
            const categoryView = this.source.createCategory && this.source.createCategory(this, category);

            if (categoryView)
                this.tableView.appendCategory(categoryView);

            for (let row = 0; row < numCells; ++row) {
                const cell = this.reuseCell(category, row);

                this.source.updateCell(this, cell, row, category);
                this.tableView.appendCell(cell);
            }
        }
    }

    public cellAtIndex(index: number, category?: number): View {
        if (undefined == category) {
            category = 0;

            while (this._cells[category] && index >= this._cells[category].length) {
                category++;
                index -= this._cells[category].length;
            }
        }

        return this._cells[category] && this._cells[category][index];
    }

    public isRowSelected(category: number, row: number): boolean {
        if (0 > category)
            return;

        if (0 > row)
            return;

        if (category >= this._cells.length)
            return;

        if (row >= this._cells[category].length)
            return;

        return this._cells[category][row].isSelected;
    }

    public deselectAllRows(): void {
        this.tableView.selectedRows.forEach(cell => {
            cell.isSelected = false;

            if (this.delegate && this.delegate.deselectedCell)
                this.delegate.deselectedCell(this, cell);
        });
    }

    public deselectRow(category: number, row: number): void {
        if (!this.isRowSelected(category, row))
            return;

        const cell = this._cells[category][row];

        cell.isSelected = false;

        if (this.delegate && this.delegate.deselectedCell)
            this.delegate.deselectedCell(this, cell);
    }

    public selectRow(category: number, row: number): void {
        if (this.selectionMode == TableSelectionMode.None)
            return;

        if (0 > category)
            return;

        if (0 > row)
            return;

        if (category >= this._cells.length)
            return;

        if (row >= this._cells[category].length)
            return;

        if (this.isRowSelected(category, row))
            return;

        const cell = this._cells[category][row];

        if (this.selectionMode == TableSelectionMode.Single)
            this.deselectAllRows();

        if (this.selectionMode != TableSelectionMode.Clickable)
            cell.isSelected = true;

        if (this.delegate && this.delegate.selectedCell)
            this.delegate.selectedCell(this, cell);
    }

    private reuseCell(category: number, row: number): View {
        while (category >= this._cells.length)
            this._cells.push([]);

        const categoryCells = this._cells[category];

        while (row >= categoryCells.length)
            categoryCells.push(this.createCell(category, row));

        return categoryCells[row];
    }

    private createCell(category: number, row: number): View {
        const cell = this.source.createCell(this, category);

        cell.isClickable = this.selectionMode != TableSelectionMode.None;

        View.onClick.on(() => {
            if (this.selectionMode == TableSelectionMode.None)
                return;

            if (this.isRowSelected(category, row))
                this.deselectRow(category, row);
            else
                this.selectRow(category, row);
        }, { sender: cell, listener: this });

        return cell;
    }
}