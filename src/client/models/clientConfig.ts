import { RouterConfig } from "./routerConfig";
import { SessionConfig } from "./sessionConfig";
import { WindowConfig } from "./windowConfig";

export interface ClientConfig extends WindowConfig, RouterConfig, SessionConfig {
    readonly loginEnabled?: boolean;
    readonly localizationPath: string;
    readonly defaultLanguage: string;
    readonly unauthorizedRoute: string;
}