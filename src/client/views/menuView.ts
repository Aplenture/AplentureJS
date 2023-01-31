import { View } from "../utils/view";
import { Label } from "./label";

export class MenuView extends View {
    constructor(...classes: string[]) {
        super(...classes, 'menu');
    }

    public addItem(title: string, onClicked: (index: number) => void): number {
        const item = new View('item', title);
        const label = new Label();

        const index = super.appendChild(item);

        label.text = title;

        item.appendChild(label);
        item.clickable = true;

        View.onClick.on(() => onClicked(index), { sender: item });

        return index;
    }

    public removeItem(title: string) {
        const index = this.children.findIndex(child => child.id.includes('item_' + title));

        super.removeChildAtIndex(index);
    }

    public appendChild(child: View): number {
        throw new Error('appendChild is not allowed to call public');
    }
}