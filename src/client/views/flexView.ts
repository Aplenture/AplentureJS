import { View } from "../utils";

export class FlexView extends View {
    constructor(...classes: string[]) {
        super(...classes, 'flex');
    }
}