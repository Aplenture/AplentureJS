import { View } from "../utils/view";
import { TableViewController } from "../viewControllers/tableViewController";

export interface TableViewControllerDelegate {
    selectedCell(sender: TableViewController, cell: View): void;
    deselectedCell(sender: TableViewController, cell: View): void;
}