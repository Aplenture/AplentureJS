import { Lifo } from "../../core";
import { Event, EventHandler } from "../../core/utils/event";
import { Route } from "../models/route";
import { RouterConfig } from "../models/routerConfig";

export class Router {
    public static readonly onRouteChanged = new Event<Router, Route>('Router.onRouteChanged');

    private readonly routes: Route[] = [];

    private readonly defaultRoute: string;

    private _route: Route = null;
    private history = new Lifo<string>();

    constructor(config: RouterConfig) {
        this.defaultRoute = config.defaultRoute;

        window.addEventListener('popstate', async () => {
            this.history.pop();
            this.init();
        });
    }

    public get route(): Route { return this._route; }
    public get index(): number { return this._route && this._route.index; }
    public get historyLength(): number { return this.history.count; }

    public init() {
        const parts = window.location.pathname
            .substring(1)
            .split('/');

        this._route = this.findRoute(parts[0], parseInt(parts[1]));

        if (0 == this.history.count && this._route.name != this.defaultRoute)
            this.history.push(this.defaultRoute);

        Router.onRouteChanged.emit(this, this._route);
    }

    public addRoute(name: string, onRouteChanged: EventHandler<Router, Route>, isPrivate = false) {
        const route = { name, isPrivate };

        this.routes.push(route);

        Router.onRouteChanged.on(onRouteChanged, { args: route });
    }

    public removeRoute(name) {
        const index = this.routes.findIndex(route => route.name == name);

        if (0 > index)
            return;

        this.routes.splice(index, 1);
    }

    public removeAllRoutes() {
        this.routes.splice(0, this.routes.length);
    }

    public changeRoute(name: string, index: number = null) {
        const route = this.findRoute(name, index);

        if (this._route && route.name == this._route.name && route.index == this._route.index)
            return;

        const routeString = route.index
            ? `/${route.name}/${index}`
            : `/${route.name}`;

        this._route = route;

        this.history.push(routeString);
        window.history.pushState({}, route.name, routeString);

        Router.onRouteChanged.emit(this, route);
    }

    public back() {
        window.history.back();
    }

    private findRoute(name: string, index?: number) {
        const route = this.routes.find(route => route.name == name)
            || this.routes.find(route => route.name == this.defaultRoute)
            || this.routes[0];

        if (!route)
            throw new Error('#_no_routes');

        (route as any).index = index && !isNaN(index)
            ? index
            : null;

        return route;
    }
}