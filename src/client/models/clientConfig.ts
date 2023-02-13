import { RouterConfig } from "./routerConfig";
import { SessionConfig } from "./sessionConfig";

export interface ClientConfig extends RouterConfig, SessionConfig {
    readonly debug?: boolean;
    readonly loginEnabled?: boolean;
    readonly defaultLanguage: string;
    readonly unauthorizedRoute: string;
}