import { EC } from "../../core/crypto/ec";
import { ECDSA } from "../../core/crypto/ecdsa";
import { toHashInt } from "../../core/crypto/hash";
import { Access } from "../../core/models/access";
import { Event } from "../../core/utils/event";
import { SessionConfig } from "../models/sessionConfig";
import { BoolRequest } from "../requests/boolRequest";
import { JSONRequest } from "../requests/jsonRequest";

const KEY_ACCESS = 'session.access';

export abstract class Session {
    public static readonly onAccessChanged = new Event<Session, Access>('Session.onAccessChanged');
    public static readonly onLogin = new Event<Session, Access>('Session.onLogin');
    public static readonly onLogout = new Event<Session, void>('Session.onLogout');

    private static logoutRequest: BoolRequest<void>;
    private static hasAccessRequest: BoolRequest<{
        readonly api: string,
        readonly signature: string,
        readonly timestamp: number
    }>;

    private static loginRequest: JSONRequest<{
        readonly timestamp: number,
        readonly username: string,
        readonly sign: string,
        readonly keepLogin?: boolean,
        readonly label?: string
    }, {
        readonly api: string,
        readonly secret: string
    }>;

    private static changePasswordRequest: BoolRequest<{
        readonly old: string;
        readonly new: string;
    }>;

    private static _initialized = false;
    private static _access: Access = null;

    public static get access(): Access { return this._access; }
    public static get hasAccess(): boolean { return !!this._access; }

    public static async init(config: SessionConfig) {
        if (this._initialized)
            throw new Error('Session is already initialized');

        this._initialized = true;

        const serializedAccess = window.sessionStorage.getItem(KEY_ACCESS)
            || window.localStorage.getItem(KEY_ACCESS);

        this.hasAccessRequest = new BoolRequest(config.server.endpoint + config.server.api.hasAccess);
        this.loginRequest = new JSONRequest(config.server.endpoint + config.server.api.login);
        this.logoutRequest = new BoolRequest(config.server.endpoint + config.server.api.logout, { isPrivate: true });
        this.changePasswordRequest = new BoolRequest(config.server.endpoint + config.server.api.changePassword, { isPrivate: true });

        if (!serializedAccess)
            return;

        const access = Access.fromHex(serializedAccess);

        if (!(await this.testAccess(access))) {
            window.localStorage.removeItem(KEY_ACCESS);
            window.sessionStorage.removeItem(KEY_ACCESS);
            return;
        }

        this._access = access;

        Session.onAccessChanged.emit(this, access);
    }

    public static updateAccess(access: Access, keepLogin = false) {
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

    public static resetAccess() {
        this._access = null;

        window.localStorage.removeItem(KEY_ACCESS);
        window.sessionStorage.removeItem(KEY_ACCESS);

        Session.onAccessChanged.emit(this, null);
    }

    public static async login(username: string, password: string, keepLogin?: boolean, label?: string): Promise<Access> {
        const timestamp = Date.now();
        const hash = toHashInt(timestamp.toString());
        const privateKey = EC.createPrivateKey(password);
        const sign = ECDSA.sign(hash, privateKey).toString();

        const response = await this.loginRequest.send({
            timestamp,
            username,
            sign,
            keepLogin,
            label
        });

        const access = new Access(response.api, response.secret, label);

        this.updateAccess(access, keepLogin);

        Session.onLogin.emit(this, access);

        return access;
    }

    public static async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        const oldPrivateKey = EC.createPrivateKey(oldPassword);
        const oldPublickey = EC.secp256k1.createPublicKey(oldPrivateKey).toString();

        const newPrivateKey = EC.createPrivateKey(newPassword);
        const newPublickey = EC.secp256k1.createPublicKey(newPrivateKey).toString();

        await this.changePasswordRequest.send({
            old: oldPublickey,
            new: newPublickey
        });

        return true;
    }

    public static async logout(): Promise<boolean> {
        if (!this._access)
            return true;

        await this.logoutRequest.send();

        this.resetAccess();

        Session.onLogout.emit(this);

        return true;
    }

    private static async testAccess(access = this._access): Promise<boolean> {
        const timestamp = Date.now();

        return await this.hasAccessRequest.send({
            api: access.api,
            signature: access.sign(timestamp.toString()),
            timestamp
        });
    }
}