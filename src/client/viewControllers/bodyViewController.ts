import { View } from "../utils/view";
import { ContainerViewController } from "./containerViewController";

export class BodyViewController extends ContainerViewController {
    public readonly headerView = new View('header');
    public readonly footerView = new View('footer');

    constructor(...classes: string[]) {
        super(...classes, 'body');
    }

    public init(): void {
        this.view.appendChild(this.headerView);
        super.init();
        this.view.appendChild(this.footerView);
    }
}