import { PopupController } from "../utils/popupController";
import { Session } from "../utils/session";
import { Button } from "../views/button";
import { Switch } from "../views/switch";
import { TextField, TextFieldType } from "../views/textField";
import { BodyViewController } from "./bodyViewController";

export class LoginViewController extends BodyViewController {
    public readonly loginButton = new Button('login');

    public readonly usernameTextfield = new TextField('username');
    public readonly passwordTextfield = new TextField('password');

    public readonly keepLoginSwitch = new Switch('keepLogin');

    constructor(...classes: string[]) {
        super(...classes, 'login-view-controller');

        this.contentView.appendChild(this.usernameTextfield);
        this.contentView.appendChild(this.passwordTextfield);
        this.contentView.appendChild(this.keepLoginSwitch);

        this.footerBar.appendChild(this.loginButton);

        this.usernameTextfield.onEnterKey.on(() => this.login());
        this.passwordTextfield.onEnterKey.on(() => this.login());
        this.loginButton.onClick.on(() => this.login());

        this.titleBar.title = '#_login';
        this.loginButton.text = '#_login';

        this.usernameTextfield.title = '#_username';
        this.usernameTextfield.placeholder = '#_username';

        this.passwordTextfield.title = '#_password';
        this.passwordTextfield.placeholder = '#_password';
        this.passwordTextfield.type = TextFieldType.Password;

        this.keepLoginSwitch.title = '#_remember_me';
        this.keepLoginSwitch.description = '#_remember_me_description';
    }

    public focus() {
        this.usernameTextfield.focus();
    }

    public clear() {
        this.usernameTextfield.value = '';
        this.passwordTextfield.value = '';
        this.keepLoginSwitch.isEnabled = false;
    }

    private async login() {
        const username = this.usernameTextfield.value;

        if (!username) {
            await PopupController.pushMessage('#_username_not_set', '#_login');
            this.usernameTextfield.focus();
            return;
        }

        const password = this.passwordTextfield.value;

        if (!password) {
            await PopupController.pushMessage('#_password_not_set', '#_login');
            this.passwordTextfield.focus();
            return;
        }

        const keepLogin = this.keepLoginSwitch.isEnabled;
        const label = navigator.userAgent;

        Session
            .login(username, password, keepLogin, label)
            .then(() => this.clear())
            .then(() => this.removeFromParent())
            .catch(() => this.focus());
    }
}