import { View } from "../utils/view";
import { TableViewController } from "../viewControllers/tableViewController";

export interface TableViewControllerSource<TCell extends View> {
    numberOfCategories?(sender: TableViewController<TCell>): number;
    numberOfCells(sender: TableViewController<TCell>, category: number): number;
    createHeader(sender: TableViewController<TCell>,): View;
    createCategory?(sender: TableViewController<TCell>, index: number): View | null;
    createCell(sender: TableViewController<TCell>, category: number): TCell;
    updateCell(sender: TableViewController<TCell>, cell: TCell, row: number, category: number): void;
}