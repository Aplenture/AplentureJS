import { ViewController } from "../utils/viewController";

export interface INavigationViewController {
    pushViewController(viewController: ViewController): Promise<void>;
    popViewController(): Promise<ViewController>;
}