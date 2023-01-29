import { FlexView } from "./flexView";

export class RightFlexView extends FlexView {
    constructor(...classes: string[]) {
        super(...classes, 'right');
    }
}