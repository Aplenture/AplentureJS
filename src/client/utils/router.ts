import { Lifo } from "../../core";
import { Event, EventHandler } from "../../core/utils/event";
import { Route } from "../models/route";
import { RouterConfig } from "../models/routerConfig";

export abstract class Router {
    public static readonly onRouteChanged = new Event<void, Route>('Router.onRouteChanged');

    private static readonly _routes: Route[] = [];
    private static readonly _history = new Lifo<string>();

    private static _initialized = false;
    private static _route: Route = null;
    private static _defaultRoute: string;

    public static get route(): Route { return this._route; }

    public static get index(): number { return this._route && this._route.index; }
    public static get historyLength(): number { return this._history.count; }

    public static init(config: RouterConfig) {
        if (this._initialized)
            throw new Error('Router is already initialized');

        this._initialized = true;
        this._defaultRoute = config.routes.default;

        window.addEventListener('popstate', async () => {
            this._history.pop();
            this.setupRoute();
        });

        this.setupRoute();
    }

    public static addRoute(name: string, onRouteChanged: EventHandler<void, Route>, isPrivate = false) {
        const route = new Route(name, isPrivate);

        this._routes.push(route);

        Router.onRouteChanged.on(onRouteChanged, { args: route });
    }

    public static changeRoute(name: string, index: number = null) {
        const route = this.findRoute(name, index);

        if (this._route && route.name == this._route.name && route.index == this._route.index)
            return;

        const routeString = route.toString();

        this._history.push(routeString);
        window.history.pushState({}, route.name, routeString);

        this._route = route;

        Router.onRouteChanged.emit(null, route);
    }

    public static back() {
        window.history.back();
    }

    public static reload() {
        Router.onRouteChanged.emit(null, this._route);
    }

    private static setupRoute() {
        const routeParts = window.location.pathname.split('/');

        this._route = this.findRoute(routeParts[1], parseInt(routeParts[2]));

        if (this._route.name != routeParts[1])
            window.history.replaceState({}, this._route.name, this._route.toString());

        if (0 == this._history.count && this._route.name != this._defaultRoute)
            this._history.push(this._defaultRoute);

        Router.onRouteChanged.emit(null, this._route);
    }

    private static findRoute(name: string, index?: number) {
        const route = this._routes.find(route => route.name == name)
            || this._routes.find(route => route.name == this._defaultRoute)
            || this._routes[0];

        if (!route)
            throw new Error('#_no_routes');

        (route as any).index = index && !isNaN(index)
            ? index
            : null;

        route.init();

        return route;
    }
}