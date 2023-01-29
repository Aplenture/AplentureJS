import { EC } from "../../core/crypto/ec";
import { ECDSA } from "../../core/crypto/ecdsa";
import { toHashInt } from "../../core/crypto/hash";
import { Access } from "../../core/models/access";
import { Event } from "../../core/utils/event";
import { SessionConfig } from "../models/sessionConfig";
import { BoolRequest } from "../requests/boolRequest";
import { JSONRequest } from "../requests/jsonRequest";
import { MessageViewController } from "../viewControllers/messageViewController";

const KEY_ACCESS = 'session.access';

export class Session {
    public static readonly onAccessChanged = new Event<Session, Access>();

    private readonly logoutRequest: BoolRequest<{ session: string }>;
    private readonly hasAccessRequest: BoolRequest<{
        readonly session: string,
        readonly signature: string,
        readonly timestamp: number
    }>;

    private readonly loginRequest: JSONRequest<{
        readonly timestamp: number,
        readonly username: string,
        readonly sign: string,
        readonly keepLogin?: boolean,
        readonly label?: string
    }, {
        readonly session: string,
        readonly secret: string
    }>;

    private _access: Access = null;

    constructor(public readonly messageViewController: MessageViewController, config: SessionConfig) {
        this.hasAccessRequest = new BoolRequest(config.hasAccessURL);
        this.loginRequest = new JSONRequest(config.loginURL);
        this.logoutRequest = new BoolRequest(config.logoutURL);
    }

    public get access(): Access { return this._access; }

    public async init() {
        const serializedAccess = window.sessionStorage.getItem(KEY_ACCESS)
            || window.localStorage.getItem(KEY_ACCESS);

        if (!serializedAccess)
            return;

        const access = Access.fromHex(serializedAccess);

        if (!(await this.hasAccess(access))) {
            window.localStorage.removeItem(KEY_ACCESS);
            window.sessionStorage.removeItem(KEY_ACCESS);
            return;
        }

        this._access = access;

        Session.onAccessChanged.emit(this, this._access);
    }

    public updateAccess(access: Access, keepLogin = false) {
        const serialization = access.toHex();

        this._access = access;

        if (keepLogin) {
            window.localStorage.setItem(KEY_ACCESS, serialization);
            window.sessionStorage.removeItem(KEY_ACCESS);
        } else {
            window.sessionStorage.setItem(KEY_ACCESS, serialization);
            window.localStorage.removeItem(KEY_ACCESS);
        }

        Session.onAccessChanged.emit(this, access);
    }

    public resetAccess() {
        this._access = null;

        window.localStorage.removeItem(KEY_ACCESS);
        window.sessionStorage.removeItem(KEY_ACCESS);

        Session.onAccessChanged.emit(this, null);
    }

    public async login(username: string, password: string, keepLogin?: boolean, label?: string): Promise<Access> {
        const timestamp = Date.now();
        const hash = toHashInt(timestamp.toString());
        const privateKey = EC.createPrivateKey(password);
        const sign = ECDSA.sign(hash, privateKey).toString();

        try {
            const response = await this.loginRequest.send({
                timestamp,
                username,
                sign,
                keepLogin,
                label
            });

            const access = new Access(response.session, response.secret, label);

            this.updateAccess(access, keepLogin);

            return access;
        } catch (error) {
            this.messageViewController.push({ text: error.message, title: '#_error' });

            throw error;
        }
    }

    public async logout(): Promise<boolean> {
        if (!this._access)
            return true;

        try {
            await this.logoutRequest.send({ session: this._access.id });

            this.resetAccess();

            return true;
        } catch (error) {
            await this.messageViewController.push({ text: error.message, title: '#_error' });

            return false;
        }
    }

    private async hasAccess(access = this._access): Promise<boolean> {
        const timestamp = Date.now();

        try {
            return await this.hasAccessRequest.send({
                session: access.id,
                signature: access.sign(timestamp.toString()),
                timestamp
            });
        } catch (error) {
            await this.messageViewController.push({ text: error.message, title: '#_error' });

            return false;
        }
    }
}