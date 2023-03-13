import { Router } from "./router";
import { Session } from "./session";
import { Request } from "./request";
import { ClientConfig } from "../models/clientConfig";
import { Localization } from "../../core/utils/localization";
import { RequestHeader } from "../../core/enums/constants";
import { JSONRequest } from "../requests/jsonRequest";
import { Window } from "./window";
import { LoginViewController } from "../viewControllers/loginViewController";
import { Event } from "../../core";
import { ViewController } from "./viewController";
import { PopupController } from "./popupController";

const DEFAULT_CONFIG_PATH = '/config.json';

interface Options {
    readonly configPath?: string;
}

export abstract class Client {
    public static readonly onLoaded = new Event<void, void>('Client.onLoaded');

    private static _initialized = false;
    private static _rootViewController: ViewController;
    private static _config: ClientConfig;

    public static get rootViewController(): ViewController { return this._rootViewController; }
    public static get config(): ClientConfig { return this._config; }

    public static async init(rootViewController: ViewController, options: Options = {}) {
        if (this._initialized)
            throw new Error('Client is already initialized');

        this._initialized = true;
        this._rootViewController = rootViewController;

        try {
            this._config = await new JSONRequest<void, ClientConfig>(options.configPath || DEFAULT_CONFIG_PATH).send();;
        } catch (error) {
            throw new Error('Something went wrong while loading the configuration. config.json may be missing.');
        }

        await Window.init(this.config);
        await PopupController.init();

        window.addEventListener('unhandledrejection', event => PopupController.pushError(event.reason || '#_something_went_wrong'));

        await this.loadTranslation(this.config.localizationPath, this.config.defaultLanguage);

        Router.onRouteChanged.on(route => route.isPrivate && !Session.access && Router.changeRoute(this.config.routes.unauthorized));
        Session.onAccessChanged.on(access => !access && Router.route.isPrivate && Router.changeRoute(this.config.routes.default));
        Request.onSending.on((params, request) => {
            if (!request.isPrivate) return;
            if (!Session.access) throw new Error('#_error_no_access');

            request.setHeader(RequestHeader.APIKey, Session.access.api);
            request.setHeader(RequestHeader.Signature, Session.access.sign(params));
        });

        document.body.appendChild((this.rootViewController.view as any).div);

        if (document.readyState === 'complete')
            await this.handleLoaded();
        else
            window.addEventListener('load', () => this.handleLoaded(), { once: true });
    }

    protected static async handleLoaded() {
        await this.rootViewController.load();
        await Session.init(this.config);
        await Router.init(this.config);

        if (this.config.loginEnabled && !Session.hasAccess && Router.route.has('login')) {
            const viewController = new LoginViewController();

            await viewController.load();

            PopupController.pushViewController(viewController);
        }

        this.onLoaded.emit();
    }

    private static async loadTranslation(path: string, defaultLanguage: string): Promise<void> {
        const request = new JSONRequest<void, NodeJS.ReadOnlyDict<string>>();

        try {
            Localization.init(window.navigator.language, await request.send(null, path + `${window.navigator.language}.json`));
        } catch (e) {
            try {
                Localization.init(defaultLanguage, await request.send(null, path + `${defaultLanguage}.json`));
            } catch (e) {
                Localization.init(window.navigator.language);
            }
        }
    }
}