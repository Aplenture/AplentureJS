import { FlexView } from "./flexView";

export class LeftFlexView extends FlexView {
    constructor(...classes: string[]) {
        super(...classes, 'left');
    }
}