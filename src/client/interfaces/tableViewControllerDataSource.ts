import { View } from "../utils/view";

export interface TableViewControllerSource<TCell extends View> {
    numberOfCategories?(): number;
    numberOfCells(category: number): number;
    createHeader(): View;
    createCategory?(index: number): View | null;
    createCell(category: number): TCell;
    updateCell(cell: TCell, row: number, category: number): void;
}