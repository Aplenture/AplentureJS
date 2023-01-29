import { HorizontalFlexView } from "./horizontalFlexView";

export class Bar extends HorizontalFlexView {
    constructor(...classes: string[]) {
        super(...classes, 'bar');
    }
}