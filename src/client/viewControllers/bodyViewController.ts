import { View } from "../utils/view";
import { ContainerViewController } from "./containerViewController";

export class BodyViewController extends ContainerViewController {
    public readonly headerView: View;
    public readonly footerView: View;

    constructor(...classes: string[]) {
        super(...classes, 'body');

        this.headerView = new View(...classes, 'body', 'header');
        this.footerView = new View(...classes, 'body', 'footer');
    }

    public init(): void {
        this.view.appendChild(this.headerView);
        super.init();
        this.view.appendChild(this.footerView);
    }
}