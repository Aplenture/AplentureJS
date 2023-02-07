import { Event } from "../../core";
import { TextAlignment } from "../enums/textAlignment";
import { View } from "../utils/view";
import { Bar } from "./bar";
import { Label } from "./label";

export class TabBar extends Bar {
    public static readonly onItemClicked = new Event<TabBar, number>('TabBar.onItemClicked');

    constructor(...classes: string[]) {
        super(...classes, 'tab');
    }

    public addItem(title: string): number {
        const item = new View('item', title);
        const label = new Label();

        label.text = title;
        label.textAlignment = TextAlignment.Center;

        item.appendChild(label);

        return this.appendChild(item);
    }

    public appendChild(child: View): number {
        const index = super.appendChild(child);

        child.clickable = true;

        View.onClick.on(() => TabBar.onItemClicked.emit(this, index), { sender: child, listener: this });

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
        if (this.children.includes(child))
            View.onClick.off({ sender: child });

        return super.removeChild(child);
    }
}