import { Event } from "../../core";
import { View } from "../utils/view";
import { Label } from "./label";

export class MenuView extends View {
    public static readonly onItemClicked = new Event<MenuView, number>('MenuView.onItemClicked');

    constructor(...classes: string[]) {
        super(...classes, 'menu');
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

        child.clickable = true;

        View.onClick.on(() => MenuView.onItemClicked.emit(this, index), { sender: child, listener: this });

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