import { Event } from "../../core";
import { View } from "../utils/view";
import { Bar } from "./bar";
import { Label } from "./label";

export class TabBar extends Bar {
    public static readonly onItemClicked = new Event<TabBar, number>('TabBar.onItemClicked');

    constructor(...classes: string[]) {
        super(...classes, 'tab');
    }

    public get selectedIndex(): number { return this.children.findIndex(child => child.isSelected); }
    public set selectedIndex(value: number) {
        if (value == this.selectedIndex)
            return;

        this.children.forEach((view, index) => view.isSelected = index == value);
        TabBar.onItemClicked.emit(this, value);
    }

    public addItem(title: string): number {
        const item = new View('item', title);
        const label = new Label();

        label.text = title;

        item.appendChild(label);

        return this.appendChild(item);
    }

    public appendChild(child: View): number {
        const index = super.appendChild(child);

        child.isClickable = true;

        View.onClick.on(() => this.selectedIndex = index, { sender: child, listener: this });

        return index;
    }

    public removeAllChildren() {
        View.onClick.off({ listener: this });

        super.removeAllChildren();
    }

    public removeChildAtIndex(index: number): View {
        const child = super.removeChildAtIndex(index);

        if (child)
            View.onClick.off({ sender: child });

        return child;
    }

    public removeChild(child: View): number {
        const index = super.removeChild(child);

        if (0 <= index)
            View.onClick.off({ sender: child });

        return index;
    }
}