import { Router } from "./router";
import { Session } from "./session";
import { Request } from "./request";
import { ClientConfig } from "../models/clientConfig";
import { Localization } from "../../core/utils/localization";
import { RequestHeader } from "../../core/enums/constants";
import { JSONRequest } from "../requests/jsonRequest";
import { Window } from "./window";
import { LoginViewController } from "../viewControllers/loginViewController";
import { PopupViewController } from "../viewControllers/popupViewController";
import { Event } from "../../core";
import { ViewController } from "./viewController";

export abstract class Client {
    public static readonly onLoaded = new Event<void, void>('Client.onLoaded');

    private static _initialized = false;
    private static _rootViewController: ViewController;

    public static get rootViewController(): ViewController { return this._rootViewController; }

    public static async init(rootViewController: ViewController, config: ClientConfig) {
        if (this._initialized)
            throw new Error('Client is already initialized');

        this._initialized = true;
        this._rootViewController = rootViewController;

        Window.init(config);

        window.addEventListener('unhandledrejection', event => PopupViewController.pushError(event.reason || '#_something_went_wrong'));

        await this.loadTranslation(config.localizationPath, config.defaultLanguage);

        Router.onRouteChanged.on(route => route.isPrivate && !Session.access && Router.changeRoute(config.unauthorizedRoute));
        Session.onAccessChanged.on(access => !access && Router.route.isPrivate && Router.changeRoute(config.defaultRoute));
        Request.onSending.on((params, request) => {
            if (!request.isPrivate) return;
            if (!Session.access) throw new Error('#_error_no_access');

            request.setHeader(RequestHeader.APIKey, Session.access.api);
            request.setHeader(RequestHeader.Signature, Session.access.sign(params));
        });

        document.body.appendChild((this.rootViewController.view as any).div);

        if (document.readyState === 'complete')
            await this.handleLoaded(config);
        else
            window.addEventListener('load', () => this.handleLoaded(config), { once: true });
    }

    protected static async handleLoaded(config: ClientConfig) {
        await this.rootViewController.load();
        await Session.init(config);
        await Router.init(config);

        if (config.loginEnabled && !Session.hasAccess && Router.route.has('login')) {
            const viewController = new LoginViewController();

            await viewController.load();

            PopupViewController.pushViewController(viewController);
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