import { Router } from "./router";
import { Session } from "./session";
import { Request } from "./request";
import { ClientConfig } from "../models/clientConfig";
import { Localization } from "../../core/utils/localization";
import { RequestHeader } from "../../core/enums/constants";
import { JSONRequest } from "../requests/jsonRequest";
import { Window } from "./window";
import { ViewController } from "./viewController";
import { LoginViewController } from "../viewControllers/loginViewController";
import { PopupViewController } from "../viewControllers/popupViewController";

export abstract class Client<TConfig extends ClientConfig> {
    public readonly rootViewController = new ViewController('root');

    public readonly router: Router;
    public readonly session: Session;

    constructor(config: TConfig) {
        this.router = new Router(config);
        this.session = new Session(config);
    }

    public get window(): Window { return Window; }

    public async init(config: TConfig) {
        (window as any).app = this;

        Window.init(config.debug);

        window.addEventListener('unhandledrejection', event => PopupViewController.pushError(event.reason || '#_something_went_wrong'));

        await Client.loadTranslation(config.defaultLanguage);

        Router.onRouteChanged.on((route, router) => route.isPrivate && !this.session.access && router.changeRoute(config.unauthorizedRoute), { sender: this.router });
        Session.onAccessChanged.on(access => !access && this.router.route.isPrivate && this.router.changeRoute(config.defaultRoute), { sender: this.session });
        Request.onSending.on((params, request) => {
            if (!request.isPrivate) return;
            if (!this.session.access) throw new Error('#_error_no_access');

            request.setHeader(RequestHeader.APIKey, this.session.access.api);
            request.setHeader(RequestHeader.Signature, this.session.access.sign(params));
        });

        document.body.appendChild((this.rootViewController.view as any).div);

        if (document.readyState === 'complete')
            await this.handleLoaded(config);
        else
            window.addEventListener('load', () => this.handleLoaded(config), { once: true });
    }

    protected abstract setup(config: TConfig): Promise<void>;

    protected async handleLoaded(config: TConfig) {
        await this.setup(config);
        this.rootViewController.init();
        await this.session.init();
        this.router.init();
        await this.rootViewController.update();

        if (config.loginEnabled && !this.session.hasAccess && this.router.route.has('login')) {
            const viewController = new LoginViewController();

            viewController.session = this.session;
            viewController.init();
            viewController.update();

            PopupViewController.pushViewController(viewController);
        }
    }

    private static async loadTranslation(defaultLanguage: string): Promise<void> {
        const request = new JSONRequest<void, NodeJS.ReadOnlyDict<string>>();

        try {
            Localization.init(window.navigator.language, await request.send(null, `/${window.navigator.language}.json`));
        } catch (e) {
            try {
                Localization.init(defaultLanguage, await request.send(null, `/${defaultLanguage}.json`));
            } catch (e) {
                Localization.init(window.navigator.language);
            }
        }
    }
}