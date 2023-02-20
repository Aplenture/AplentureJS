import { View } from "../utils/view";

export class Bar extends View {
    constructor(...classes: string[]) {
        super(...classes, 'bar-view');
    }
}