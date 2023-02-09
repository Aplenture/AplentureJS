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

    constructor(...classes: string[]) {
        super(...classes, 'table');
    }

    public get header(): View { return this._header; }

    public get selectionMode(): TableSelectionMode { return this.tableView.selectionMode; }
    public set selectionMode(value: TableSelectionMode) { this.tableView.selectionMode = value; }

    public init(): void {
        this.view.appendChild(this.titleLabel);
        this.view.appendChild(this.tableView);

        this.titleLabel.text = '#_table_title';

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
        const numCategories = this.source.numberOfCategories && this.source.numberOfCategories(this) || 1;

        this._header = this.source.createHeader(this);

        this.deselectAllRows();

        this.tableView.removeAllChildren();
        this.tableView.appendChild(this._header);

        for (let i = 0; i < numCategories; ++i) {
            const numCells = this.source.numberOfCells(this, i);
            const category = this.source.createCategory && this.source.createCategory(this, i);

            if (category) {
                if (!category.hasClass('category'))
                    category.addClass('category');

                this.tableView.appendChild(category);
            }

            for (let j = 0; j < numCells; ++j) {
                const cell = this.reuseCell(i);

                if (!cell.hasClass('cell'))
                    cell.addClass('cell');

                this.source.updateCell(this, cell, j, i);

                this.tableView.appendChild(cell);
            }
        }
    }

    public isRowSelected(row: number): boolean {
        if (0 > row)
            return;

        if (row < this.tableView.children.length)
            return;

        return this.tableView.children[0].isSelected;
    }

    public deselectAllRows(): void {
        this.tableView.selectedRows.forEach(cell => {
            cell.isSelected = false;

            if (this.delegate)
                this.delegate.deselectedCell(this, cell);
        });
    }

    public deselectRow(row: number): void {
        if (!this.isRowSelected(row))
            return;

        const cell = this.tableView.children[row];

        cell.isSelected = false;

        if (this.delegate)
            this.delegate.deselectedCell(this, cell);
    }

    public selectRow(row: number): void {
        if (0 > row)
            return;

        if (row < this.tableView.children.length)
            return;

        if (this.selectionMode == TableSelectionMode.None)
            return;

        if (this.isRowSelected(row))
            return;

        const cell = this.tableView.children[row];

        if (this.selectionMode == TableSelectionMode.Single)
            this.deselectAllRows();

        if (this.selectionMode != TableSelectionMode.Clickable)
            cell.isSelected = true;

        if (this.delegate)
            this.delegate.selectedCell(this, cell);
    }

    public cellIndex(cell: View): number {
        return this.tableView.children.indexOf(cell);
    }

    private reuseCell(category: number): View {
        const cell = this.source.createCell(this, category);

        cell.isClickable = this.selectionMode != TableSelectionMode.None;

        View.onClick.on(() => {
            if (this.selectionMode == TableSelectionMode.None)
                return;

            const row = this.cellIndex(cell);

            if (this.isRowSelected(row))
                this.deselectRow(row);
            else
                this.selectRow(row);
        }, { sender: cell, listener: this });

        return cell;
    }
}