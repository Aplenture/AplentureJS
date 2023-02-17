import { Session } from "../utils/session";
import { View } from "../utils/view";
import { Button } from "../views/button";
import { TextField, TextFieldType } from "../views/textField";
import { BodyViewController } from "./bodyViewController";
import { PopupViewController } from "./popupViewController";

export class PasswordViewController extends BodyViewController {
    public readonly currentPasswordTextField = new TextField('current-password');
    public readonly newPasswordTextField = new TextField('new-password');
    public readonly repeatPasswordTextField = new TextField('repeat-password');

    public readonly changePasswordButton = new Button('change-password');

    public session: Session;

    constructor(...classes: string[]) {
        super(...classes, 'password-view-controller');

        this.title = '#_password';
    }

    public init(): void {
        this.contentView.appendChild(this.currentPasswordTextField);
        this.contentView.appendChild(this.newPasswordTextField);
        this.contentView.appendChild(this.repeatPasswordTextField);

        this.footerBar.appendChild(this.changePasswordButton);

        this.titleBar.title = '#_change_password';

        this.currentPasswordTextField.title = '#_current_password';
        this.currentPasswordTextField.type = TextFieldType.Password;

        this.newPasswordTextField.title = '#_new_password';
        this.newPasswordTextField.type = TextFieldType.Password;

        this.repeatPasswordTextField.title = '#_repeat_password';
        this.repeatPasswordTextField.type = TextFieldType.Password;

        View.onClick.on(() => this.changePassword(), { sender: this.changePasswordButton, listener: this });
        View.onEnterKey.on(() => this.changePassword(), { sender: this.view, listener: this });

        super.init();
    }

    public async update(): Promise<void> {
        this.clear();

        await super.update();
    }

    public deinit(): void {
        View.onClick.off({ listener: this });
        View.onEnterKey.off({ listener: this });

        super.deinit();
    }

    public focus(): void {
        this.currentPasswordTextField.focus();
    }

    public clear() {
        this.currentPasswordTextField.value = '';
        this.newPasswordTextField.value = '';
        this.repeatPasswordTextField.value = '';
    }

    public async changePassword() {
        if (!this.currentPasswordTextField.value) {
            await PopupViewController.pushMessage('#_current_password_not_set', '#_change_password');
            this.currentPasswordTextField.focus();
            return;
        }

        if (!this.newPasswordTextField.value) {
            await PopupViewController.pushMessage('#_new_password_not_set', '#_change_password');
            this.newPasswordTextField.focus();
            return;
        }

        if (!this.repeatPasswordTextField.value) {
            await PopupViewController.pushMessage('#_repeat_password_not_set', '#_change_password');
            this.repeatPasswordTextField.focus();
            return;
        }

        if (this.newPasswordTextField.value != this.repeatPasswordTextField.value) {
            await PopupViewController.pushMessage('#_repeat_password_not_matching', '#_change_password');
            this.repeatPasswordTextField.value = '';
            this.repeatPasswordTextField.focus();
            return;
        }

        await this.session.changePassword(this.currentPasswordTextField.value, this.newPasswordTextField.value);
    }
}