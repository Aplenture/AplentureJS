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

export abstract class Client<TConfig extends ClientConfig> {
    public readonly rootViewController = new ViewController('root');
    public readonly messageViewController: MessageViewController;

    public readonly router: Router;
    public readonly session: Session;

    constructor(config: TConfig) {
        this.messageViewController = new MessageViewController();
        this.router = new Router(config);
        this.session = new Session(this.messageViewController, config);
    }

    public async init(config: TConfig) {
        if (config.debug) {
            Localization.onMissingTranslation.on(key => console.warn(`missing translation for key '${key}'`));
            (window as any).app = this;
        }

        Window.init();

        window.addEventListener('unhandledrejection', event => this.messageViewController ? this.messageViewController.push({
            title: '#_error',
            text: event.reason
        }) : alert(event.reason));

        await Client.loadTranslation(config.defaultLanguage || Localization.language);

        const messagePopupViewController = new PopupViewController('message');

        MessageViewController.onMessage.on(() => messagePopupViewController.view.visible = this.messageViewController.parent == messagePopupViewController, { sender: this.messageViewController });
        MessageViewController.onDone.on(() => messagePopupViewController.view.visible = false, { sender: this.messageViewController });

        Router.onRouteChanged.on((route, router) => route.isPrivate && !this.session.access && router.changeRoute(config.unauthorizedRoute), { sender: this.router });
        Session.onAccessChanged.on(access => !access && this.router.route.isPrivate && this.router.changeRoute(config.defaultLanguage), { sender: this.session });
        Request.onSending.on((params, request) => {
            if (!request.isPrivate) return;
            if (!this.session.access) throw new Error('#_error_no_access');

            request.setHeader(RequestHeader.APIKey, this.session.access.id);
            request.setHeader(RequestHeader.Signature, this.session.access.sign(params));
        });

        messagePopupViewController.appendChild(this.messageViewController);
        messagePopupViewController.view.visible = false;

        this.rootViewController.appendChild(messagePopupViewController);

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