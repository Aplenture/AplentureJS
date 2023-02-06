import { View } from "../utils/view";

export class ScrollView extends View {
    constructor(...classes: string[]) {
        super(...classes, 'scroll');
    }
}