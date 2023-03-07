import { PopupController } from "../utils/popupController";
import { Session } from "../utils/session";
import { BodyViewController } from "./bodyViewController";

export class LogoutViewController extends BodyViewController {
    constructor(...classes: string[]) {
        super(...classes, 'logout-view-controller');

        this.title = '#_logout';
    }

    public focus() {
        PopupController.queryBoolean('#_do_you_want_to_logout', '#_logout')
            .then(result => result && Session.logout());
    }
}