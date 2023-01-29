import { FlexView } from "./flexView";

export class TopFlexView extends FlexView {
    constructor(...classes: string[]) {
        super(...classes, 'top');
    }
}