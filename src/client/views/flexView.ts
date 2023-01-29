import { View } from "../utils/view";

export class FlexView extends View {
    constructor(...classes: string[]) {
        super(...classes, 'flex');
    }
}