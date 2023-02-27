import * as FS from "fs";
import * as hTTPS from "https";
import * as HTTP from "http";
import { ServerCommand } from "./serverCommand";
import { Event } from "../../core/utils/event";
import { Commander, COMMAND_HELP } from "../../core/utils/commander";
import { AccessRepository } from "../repositories/accessRepository";
import { ServerConfig } from "../models/serverConfig";
import { ServerHelp } from "../commands/other/serverHelp";
import { Protocol } from "../enums/protocol";
import { HTTPConfig } from "../models/httpConfig";
import { ResponseHeader } from "../../core/enums/responseHeader";
import { RequestHeader } from "../../core/enums/constants";
import { ResponseType } from "../../core/enums/responseType";
import { ResponseCode } from "../../core/enums/responseCode";
import { RequestMethod } from "../../core/enums/requestMethod";
import { BadRequestError, ClientError, ForbiddenError, UnauthorizedError } from "../../core/utils/error";
import { ErrorMessage } from "../../core/enums/errorMessage";
import { parseToString } from "../../core/other/text";
import { AccessEntity } from "../entities/accessEntity";
import { createSign } from "../../core/crypto/hash";
import { Response } from "./response";
import { HasAccess } from "../commands/user/hasAccess";

const DEFAULT_HOST = 'localhost';
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_TIME_WINDOW = 10000;
const DEFAULT_PORT_HTTP = 80;
const DEFAULT_PORT_HTTPS = 443;

const MESSAGE_STOP = "stop";

export class Server {
    public static readonly onMessage = new Event<Server, string>('Server.onMessage');
    public static readonly onError = new Event<Server, Error>('Server.onError');

    private readonly commander = new Commander();
    private readonly servers: HTTP.Server[] = [];

    public get name(): string { return this.config.name; }

    constructor(
        public readonly access: AccessRepository,
        public readonly config: ServerConfig
    ) {
        this.commander.addCommand(COMMAND_HELP, ServerHelp, config, { commands: this.commander.commands });

        Commander.onMessage.on(message => Server.onMessage.emit(this, message), { sender: this.commander });
    }

    public init() {
        Server.onMessage.emit(this, "init");
    }

    public start(...configs: readonly HTTPConfig[]): Promise<void> {
        configs.forEach(config => {
            if (!config.enabled)
                return;

            const isHTTPS = config.protocol == Protocol.HTTPS;
            const allowedOrigins = config.headers[ResponseHeader.AllowOrigin]
                ? (config.headers[ResponseHeader.AllowOrigin] as string).split(',')
                : ['*'];

            config.headers[ResponseHeader.AllowHeaders] = Object.values(RequestHeader).join(",");

            const server = isHTTPS ? hTTPS.createServer({
                key: FS.readFileSync(config.key),
                cert: FS.readFileSync(config.cert)
            }, (request, response) => this.onRequest(request, response, Protocol.HTTPS, Object.assign({}, config.headers), allowedOrigins, {
                timeWindow: config.timeWindow || DEFAULT_TIME_WINDOW
            })) : HTTP.createServer((request, response) => this.onRequest(request, response, Protocol.HTTP, Object.assign({}, config.headers), allowedOrigins, {
                timeWindow: config.timeWindow || DEFAULT_TIME_WINDOW
            }));

            server.setTimeout(config.timeout || DEFAULT_TIMEOUT);
            server.keepAliveTimeout = config.timeout || DEFAULT_TIMEOUT;

            server.listen({
                port: config.port || (isHTTPS && DEFAULT_PORT_HTTPS) || DEFAULT_PORT_HTTP,
                host: config.host || DEFAULT_HOST
            });

            this.servers.push(server);

            Server.onMessage.emit(this, `start ${config.protocol} ${Object.keys(config).map(key => `--${key} ${config[key]}`).join(' ')}`);
        });

        return new Promise(resolve => Server.onMessage.on(() => resolve(), { sender: this, args: MESSAGE_STOP }));
    }

    public stop() {
        this.servers.forEach(server => server.close());
        this.servers.splice(0, this.servers.length);

        Server.onMessage.emit(this, MESSAGE_STOP);
    }

    public addCommand(command: string, _constructor: new (...args: any[]) => ServerCommand<any, any, any>, ...args: any[]): void {
        Server.onMessage.emit(this, `add command '${command}'`);
        this.commander.addCommand(command, _constructor, ...args);
    }

    private async onRequest(
        request: HTTP.IncomingMessage,
        response: HTTP.ServerResponse,
        protocol: Protocol,
        responseHeaders: HTTP.OutgoingHttpHeaders,
        allowedOrigins: readonly string[],
        config: { readonly timeWindow: number }
    ) {
        // todo: catch allowed methods
        // todo: catch allowed headers
        // todo: catch max age

        responseHeaders[ResponseHeader.ContentType] = ResponseType.Text;

        if (!allowedOrigins.includes(request.headers.origin) && !allowedOrigins.includes('*')) {
            response.writeHead(ResponseCode.Forbidden, responseHeaders);
            response.end();
            return;
        }

        if (request.headers.origin)
            responseHeaders[ResponseHeader.AllowOrigin] = request.headers.origin;

        if (RequestMethod.Option == request.method) {
            response.writeHead(ResponseCode.NoContent, responseHeaders);
            response.end();
            return;
        }

        const time = Date.now();
        const ip = request.socket.remoteAddress;
        const url = new URL(request.url, protocol + '://' + request.headers.host + '/');

        const command = url.pathname
            .substring(1)
            .toLowerCase();

        const query = url.search
            .substring(1);

        const args: any = {};

        url.searchParams.forEach((value, key) => args[key]
            ? Array.isArray(args[key])
                ? args[key].push(value)
                : args[key] = [args[key], value]
            : args[key] = value
        );

        // delete account from url args
        // for securty reasons
        delete args.account;

        Server.onMessage.emit(this, `'${ip}' requested '${request.url}'`);

        try {
            const instance = this.commander.getCommand<ServerCommand<any, any, any>>(command || COMMAND_HELP);

            if (!instance)
                throw new BadRequestError(ErrorMessage.InvalidRoute);

            if (args.timestamp)
                if (!Server.validateTimestamp(Number(args.timestamp), time, config.timeWindow))
                    throw new ForbiddenError(ErrorMessage.InvalidTimestamp);

            if (instance.isPrivate) {
                const api = parseToString(request.headers[RequestHeader.APIKey], RequestHeader.APIKey);
                const signature = parseToString(request.headers[RequestHeader.Signature], RequestHeader.Signature);

                const access = await this.access.getByAPI(api);

                if (!Server.validateAccess(access, time))
                    throw new UnauthorizedError(ErrorMessage.InvalidAPIKey);

                if (!Server.validateSignature(signature, query, access.secret))
                    throw new UnauthorizedError(ErrorMessage.InvalidSignature);

                // overwrite security arguments
                args.account = access.account;
                args.api = api;
            } else if (instance.constructor.name != HasAccess.name) {
                // delete security arguments
                delete args.account;
                delete args.api;
            }

            const result: Response = await this.commander.execute(command || COMMAND_HELP, args);

            responseHeaders[ResponseHeader.ContentType] = result.type;

            response.writeHead(result.code, responseHeaders);
            response.end(result.data);
        } catch (error) {
            const code = isNaN(error.code)
                ? ResponseCode.InternalServerError
                : error.code;

            const message = error instanceof ClientError
                ? error.message
                : '#_something_went_wrong';

            response.writeHead(code, responseHeaders);
            response.end(message);

            Server.onError.emit(this, error);
        }
    }

    public static validateTimestamp(timestamp: number, time: number, timewindow: number): boolean {
        if (!timestamp)
            return false;

        if (isNaN(timestamp))
            return false;

        if (timestamp > time + timewindow)
            return false;

        if (timestamp < time - timewindow)
            return false;

        return true;
    }

    public static validateAccess(access: AccessEntity, time: number): boolean {
        if (!access)
            return false;

        if (access.expiration && access.expiration < time)
            return false;

        return true;
    }

    public static validateSignature(signature: string, query: string, secret: string): boolean {
        if (!signature)
            return false;

        if (isNaN(query as any) && !query.includes('timestamp='))
            return false;

        if (signature !== createSign(query, secret))
            return false;

        return true;
    }
}