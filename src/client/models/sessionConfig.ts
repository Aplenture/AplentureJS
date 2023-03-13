export interface SessionConfig {
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