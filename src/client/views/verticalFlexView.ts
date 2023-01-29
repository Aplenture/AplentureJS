import { FlexView } from "./flexView";

export class VerticalFlexView extends FlexView {
    constructor(...classes: string[]) {
        super(...classes, 'vertical');
    }
}