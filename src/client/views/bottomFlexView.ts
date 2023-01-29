import { FlexView } from "./flexView";

export class BottomFlexView extends FlexView {
    constructor(...classes: string[]) {
        super(...classes, 'bottom');
    }
}