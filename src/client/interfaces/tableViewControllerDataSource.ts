import { View } from "../utils/view";
import { TableViewController } from "../viewControllers/tableViewController";

export interface TableViewControllerSource {
    numberOfCategories?(sender: TableViewController): number;
    numberOfCells(sender: TableViewController, category: number): number;
    createHeader(sender: TableViewController,): View;
    createCategory?(sender: TableViewController, index: number): View | null;
    createCell(sender: TableViewController, category: number): View;
    updateCell(sender: TableViewController, cell: View, row: number, category: number): void;
}