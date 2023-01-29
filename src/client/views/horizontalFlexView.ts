import { FlexView } from "./flexView";

export class HorizontalFlexView extends FlexView {
    constructor(...classes: string[]) {
        super(...classes, 'horizontal');
    }
}