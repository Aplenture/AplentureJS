import { TextField, Switch, Button, TitleBar } from "../views";
import { Session, ViewController } from "../utils";
import { MessageViewController } from "./messageViewController";

export class LoginController extends ViewController {
    public readonly titleBar = new TitleBar();
    public readonly loginButton = new Button('login');

    public readonly usernameTextfield = new TextField('username');
    public readonly passwordTextfield = new TextField('password');

    public readonly keepLoginSwitch = new Switch('keepLogin');

    constructor(
        public readonly session: Session,
        public readonly messageViewController: MessageViewController,
        ...classes: string[]
    ) {
        super(...classes, 'login');
    }

    public init() {
        this.view.appendChild(this.titleBar);
        this.view.appendChild(this.usernameTextfield);
        this.view.appendChild(this.passwordTextfield);
        this.view.appendChild(this.keepLoginSwitch);
        this.view.appendChild(this.loginButton);

        TextField.onReturn.on(() => this.login(), { sender: this.usernameTextfield });
        TextField.onReturn.on(() => this.login(), { sender: this.passwordTextfield });
        Button.onClick.on(() => this.login(), { sender: this.loginButton });

        super.init();
    }

    public focus() {
        this.usernameTextfield.focus();
    }

    public clear() {
        this.usernameTextfield.text = '';
        this.passwordTextfield.text = '';
        this.keepLoginSwitch.enabled = false;
    }

    private async login() {
        const username = this.usernameTextfield.text;

        if (!username) {
            await this.messageViewController.push({ text: '#_username_not_set', title: '#_error' });
            this.usernameTextfield.focus();
            return;
        }

        const password = this.passwordTextfield.text;

        if (!password) {
            await this.messageViewController.push({ text: '#_password_not_set', title: '#_error' });
            this.passwordTextfield.focus();
            return;
        }

        const keepLogin = this.keepLoginSwitch.enabled;
        const label = navigator.userAgent;

        this.session
            .login(username, password, keepLogin, label)
            .then(() => this.clear())
            .catch(() => this.focus());
    }
}