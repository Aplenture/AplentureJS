import { Session } from "../utils/session";
import { BodyViewController } from "./bodyViewController";
import { PopupViewController } from "./popupViewController";

export class LogoutViewController extends BodyViewController {
    public session: Session;

    constructor(...classes: string[]) {
        super(...classes, 'logout-view-controller');

        this.title = '#_logout';
    }

    public focus() {
        PopupViewController.queryBoolean('#_do_you_want_to_logout', '#_logout')
            .then(result => result && this.session.logout());
    }
}