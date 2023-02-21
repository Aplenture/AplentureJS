import * as HTTP from "http";
import { Protocol } from "../enums/protocol";

export interface HTTPConfig {
    readonly enabled?: boolean;
    readonly protocol: Protocol;
    readonly key?: string;
    readonly cert?: string;
    readonly host?: number;
    readonly port?: number;
    readonly timeout?: number;
    readonly timeWindow?: number;
    readonly headers: HTTP.OutgoingHttpHeaders;
}