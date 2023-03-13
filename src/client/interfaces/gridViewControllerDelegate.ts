import { View } from "../utils/view";
import { GridViewController } from "../viewControllers/gridViewController";

export interface GridViewControllerDelegate {
    selectedCell?(sender: GridViewController, cell: View): void;
    deselectedCell?(sender: GridViewController, cell: View): void;
}