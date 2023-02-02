import { View } from "../utils/view";
import { TableViewController } from "../viewControllers/tableViewController";

export interface TableViewControllerDelegate<TCell extends View> {
    selectedCell(sender: TableViewController<TCell>, cell: TCell): void;
    deselectedCell(sender: TableViewController<TCell>, cell: TCell): void;
}