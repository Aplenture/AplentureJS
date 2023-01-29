import { RouterConfig } from "./routerConfig";
import { SessionConfig } from "./sessionConfig";

export interface AppConfig extends RouterConfig, SessionConfig {
    readonly debug?: boolean;
    readonly defaultLanguage?: string;
    readonly unauthorizedRoute: string;
}