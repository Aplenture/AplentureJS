import { Bar } from "./bar";
import { HorizontalFlexView } from "./horizontalFlexView";
import { Label } from "./label";
import { LeftFlexView } from "./leftFlexView";
import { RightFlexView } from "./rightFlexView";

export class TitleBar extends Bar {
    public readonly leftView = new LeftFlexView();
    public readonly middleView = new HorizontalFlexView('middle');
    public readonly rightView = new RightFlexView();
    public readonly titleLabel = new Label('title');

    constructor(...classes: string[]) {
        super(...classes, 'title');

        this.appendChild(this.leftView);
        this.appendChild(this.middleView);
        this.appendChild(this.rightView);

        this.middleView.appendChild(this.titleLabel);
    }

    public get title(): string { return this.titleLabel.text; }
    public set title(value: string) { this.titleLabel.text = value; }
}