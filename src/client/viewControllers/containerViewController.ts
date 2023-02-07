import { ViewController } from "../utils/viewController";

export class ContainerViewController extends ViewController {
    public readonly contentViewController: ViewController;

    constructor(...classes: string[]) {
        super(...classes, 'container');

        this.contentViewController = new ViewController(...classes, 'container', 'content');
    }

    public get children(): readonly ViewController[] { return this.contentViewController.children; }

    public init(): void {
        super.appendChild(this.contentViewController);

        super.init();
    }

    public appendChild(child: ViewController): number {
        return this.contentViewController.appendChild(child);
    }

    public removeChild(child: ViewController): number {
        return this.contentViewController.removeChild(child);
    }

    public removeChildAtIndex(index: number): ViewController {
        return this.contentViewController.removeChildAtIndex(index);
    }

    public removeAllChildren() {
        return this.contentViewController.removeAllChildren();
    }
}