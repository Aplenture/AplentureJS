import { Event, EventHandler } from "../../core";
import { Route, RouterConfig } from "../models";

export class Router {
    public static readonly onRouteChanged = new Event<Router, Route>();

    private readonly routes: Route[] = [];

    private readonly defaultRoute: string;

    private _route: Route = null;

    constructor(config: RouterConfig) {
        this.defaultRoute = config.defaultRoute;

        window.addEventListener('popstate', async () => this.init());
    }

    public get route(): Route { return this._route; }
    public get index(): number { return this._route && this._route.index; }

    public init() {
        const parts = window.location.pathname
            .substring(1)
            .split('/');

        this._route = this.findRoute(parts[0], parseInt(parts[1]));

        Router.onRouteChanged.emit(this, this._route);
    }

    public addRoute(name: string, isPrivate = false, onRouteChanged?: EventHandler<Router, Route>) {
        const route = { name, isPrivate };

        this.routes.push(route);

        if (onRouteChanged)
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
        this._route = this.findRoute(name);

        window.history.pushState({}, this._route.name, index ? `/${this._route.name}/${index}` : `/${this._route.name}`);

        Router.onRouteChanged.emit(this, this._route);
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