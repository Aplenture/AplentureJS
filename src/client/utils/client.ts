import { ViewController } from "./viewController";
import { Router } from "./router";
import { Session } from "./session";
import { Request } from "./request";
import { ClientConfig } from "../models/clientConfig";
import { MessageViewController } from "../viewControllers/messageViewController";
import { Localization } from "../../core/utils/localization";
import { PopupViewController } from "../viewControllers/popupViewController";
import { RequestHeader } from "../../core/enums/constants";
import { JSONRequest } from "../requests/jsonRequest";
import { Window } from "./window";
import { LoginViewController } from "../viewControllers/loginViewController";

export abstract class Client<TConfig extends ClientConfig> {
    public readonly rootViewController = new ViewController('root');
    public readonly messageViewController = new MessageViewController('root');
    public readonly loginViewController: LoginViewController;
    public readonly popupViewController = new PopupViewController('root');

    public readonly router: Router;
    public readonly session: Session;

    constructor(config: TConfig) {
        this.router = new Router(config);
        this.session = new Session(this.messageViewController, config);
        this.loginViewController = new LoginViewController(this.session, this.messageViewController, 'root');
    }

    public async init(config: TConfig) {
        if (config.debug) {
            Localization.onMissingTranslation.on(key => console.warn(`missing translation for key '${key}'`));
            (window as any).app = this;
        }

        Window.init(config.debug);

        window.addEventListener('unhandledrejection', event => this.messageViewController ? this.messageViewController.push({
            title: '#_error',
            text: '#_something_went_wrong'
        }) : alert(event.reason));

        await Client.loadTranslation(config.defaultLanguage || Localization.language);

        MessageViewController.onMessage.on(() => !this.messageViewController.parent && this.popupViewController.push(this.messageViewController), { sender: this.messageViewController });
        MessageViewController.onDone.on(() => this.popupViewController.pop(), { sender: this.messageViewController });

        Router.onRouteChanged.on((route, router) => route.isPrivate && !this.session.access && router.changeRoute(config.unauthorizedRoute), { sender: this.router });
        Session.onAccessChanged.on(access => !access && this.router.route.isPrivate && this.router.changeRoute(config.defaultLanguage), { sender: this.session });
        Request.onSending.on((params, request) => {
            if (!request.isPrivate) return;
            if (!this.session.access) throw new Error('#_error_no_access');

            request.setHeader(RequestHeader.APIKey, this.session.access.api);
            request.setHeader(RequestHeader.Signature, this.session.access.sign(params));
        });

        this.rootViewController.appendChild(this.popupViewController);

        this.messageViewController.init();
        await this.messageViewController.update();

        this.loginViewController.init();
        await this.loginViewController.update();

        document.body.appendChild((this.rootViewController.view as any).div);

        if (document.readyState === 'complete')
            await this.handleLoaded(config);
        else
            window.addEventListener('load', () => this.handleLoaded(config), { once: true });
    }

    protected abstract setup(confg: TConfig): Promise<void>;

    protected async handleLoaded(confg: TConfig) {
        await this.setup(confg);

        this.rootViewController.init();
        await this.rootViewController.update();

        await this.session.init();
        this.router.init();
    }

    private static async loadTranslation(defaultLanguage: string): Promise<void> {
        const request = new JSONRequest<void, NodeJS.ReadOnlyDict<string>>();

        try {
            Localization.dictionary = await request.send(null, `/${window.navigator.language}.json`);
            Localization.language = window.navigator.language;
        } catch (e) {
            Localization.dictionary = await request.send(null, `/${defaultLanguage}.json`);
            Localization.language = defaultLanguage;
        }
    }
}