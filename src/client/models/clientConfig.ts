import { RouterConfig } from "./routerConfig";
import { SessionConfig } from "./sessionConfig";
import { WindowConfig } from "./windowConfig";

export interface ClientConfig extends WindowConfig, RouterConfig, SessionConfig {
    readonly debug: boolean;
    readonly loginEnabled?: boolean;
    readonly localizationPath: string;
    readonly defaultLanguage: string;
    readonly routes: {
        readonly default: string;
        readonly unauthorized: string;
    }
    readonly server: {
        readonly endpoint: string;
        readonly api: {
            readonly hasAccess: string;
            readonly login: string;
            readonly logout: string;
            readonly changePassword: string;
        }
    }
}