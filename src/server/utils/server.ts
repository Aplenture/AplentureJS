import * as FS from "fs";
import * as hTTPS from "https";
import * as HTTP from "http";
import { ServerCommand } from "./serverCommand";
import { Commander, COMMAND_HELP } from "../../core/utils/commander";
import { AccessRepository } from "../repositories/accessRepository";
import { ServerConfig } from "../models/serverConfig";
import { Protocol } from "../enums/protocol";
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
import { Log } from "./log";
import { ServerContext } from "../models/serverContext";
import { Database } from "./database";
import { Command, Event, Singleton } from "../../core";
import { createInstance } from "../other/fs";
import { ServerInfo } from "../commands/other/serverInfo";
import { StartServer } from "../commands/server/startServer";
import { ResetDatabase } from "../commands/server/resetDatabase";
import { UpdateDatabase } from "../commands/server/updateDatabase";

const DEFAULT_HOST = 'localhost';
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_TIME_WINDOW = 10000;
const DEFAULT_PORT_HTTP = 80;
const DEFAULT_PORT_HTTPS = 443;

const COMMAND_INFO = "info";
const COMMAND_HAS_ACCESS = "hasAccess";
const COMMAND_START = "start";
const COMMAND_RESET = "reset";
const COMMAND_UPDATE = "update";

const MESSAGE_STOP = "stop";

interface Options {
    readonly debug?: boolean;
    readonly clearLog?: boolean;
    readonly context?: ServerContext;
    readonly configPath?: string;
}

export class Server {
    public readonly onStart = new Event<Server, void>('Server.onStart');
    public readonly onStop = new Event<Server, void>('Server.onStop');

    public readonly log: Log;
    public readonly config: ServerConfig;
    public readonly context: ServerContext;

    private readonly servers: HTTP.Server[] = [];

    private initialized = false;
    private localCommander: Commander;
    private globalCommander: Commander;

    constructor(options: Options = {}) {
        const infos = JSON.parse(FS.readFileSync(process.env.PWD + '/package.json').toString());
        const debug = infos.debug || options.debug || false;
        const name = debug
            ? infos.name + '.debug'
            : infos.name;

        this.config = Object.assign({}, require(process.env.PWD + (options.configPath || '/config.json')), {
            name,
            debug,
            version: infos.version,
            author: infos.author,
            description: infos.description,
        });

        this.context = options.context || {
            databases: {},
            repositories: {}
        };

        this.log = Log.createFileLog(`${process.env.PWD}/${name}.log`, options.clearLog);
    }

    public get name(): string { return this.config.name; }

    private get access(): AccessRepository { return this.context.repositories[AccessRepository.name] as AccessRepository; };

    public async init(setupProcessTitle = true) {
        if (this.initialized)
            throw new Error('Server is already initialized');

        const localCommands: NodeJS.Dict<Singleton<Command<any, any, any, any>>> = {};
        const globalCommands: NodeJS.Dict<Singleton<ServerCommand<any, any, any>>> = {};

        this.initialized = true;

        this.log.write("init");

        if (setupProcessTitle)
            process.title = this.config.name;

        process.on('exit', code => this.log.write("exit with code " + code));
        process.on('uncaughtException', error => this.log.error(error));
        process.on('unhandledRejection', reason => this.log.error(new Error(reason.toString())));

        // instanciate all databases by config
        Object.keys(this.config.databases).forEach(name => {
            const config = this.config.databases[name];

            if (this.config.debug)
                (config.database as any) += '_debug';

            (this.context.databases[name] as any) = new Database(name, config);
        });

        // instanciate all repositories by config
        Object.keys(this.config.repositories).forEach(name => {
            if (!this.context.databases[this.config.repositories[name].database])
                throw new Error(`missing database '${this.config.repositories[name].database}' for '${name}'`);

            (this.context.repositories[name] as any) = createInstance(
                this.config.repositories[name].path,
                this.config.repositories[name].class,
                this.context.databases[this.config.repositories[name].database],
                this.config.repositories[name].table
            );
        });

        // load global commands by config
        Object.keys(this.config.globalCommands).forEach(command => globalCommands[command] = localCommands[command] = new Singleton<ServerCommand<any, any, any>>(require(`${process.env.PWD}/${this.config.globalCommands[command].path}.js`)[this.config.globalCommands[command].class], this.config, this.context));

        // load local commands by config
        Object.keys(this.config.localCommands).forEach(command => localCommands[command] = new Singleton(require(`${process.env.PWD}/${this.config.localCommands[command].path}.js`)[this.config.localCommands[command].class], this.config, this.context));

        this.localCommander = new Commander(localCommands, true);
        this.localCommander.onMessage.on(message => this.log.write(message, this.constructor.name + '.local'));
        this.localCommander.onCommand.on((message, command) => this.log.write(message, command + '.local'));

        this.globalCommander = new Commander(globalCommands, false);
        this.globalCommander.onMessage.on(message => this.log.write(message, this.constructor.name + '.global'));
        this.globalCommander.onCommand.on((message, command) => this.log.write(message, command + '.global'));

        // initialize all databases
        await Promise.all(Object.values(this.context.databases).map(database => database.init()));
    }

    public async execute(command: string, args?: any): Promise<string> {
        const result = await this.localCommander.execute(command, args);

        return result.toString();
    }

    public async executeLine(commandLine: string): Promise<string> {
        const result = await this.localCommander.executeLine(commandLine);

        return result.toString();
    }

    public async executeCommandLine(): Promise<string> {
        const command = process.argv.slice(2).join(' ') || COMMAND_INFO;

        try {
            const result = await this.localCommander.executeLine(command);

            return result.toString();
        } catch (error) {
            this.log.error(error, this.constructor.name + '.local');
            return error.stack;
        }
    }

    public start(): Promise<void> {
        this.config.servers.forEach(config => {
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

            this.log.write(`start ${config.protocol} ${Object.keys(config).map(key => `--${key} ${config[key]}`).join(' ')}`);
        });

        this.onStart.emit(this);

        return new Promise(resolve => this.onStop.once(() => resolve()));
    }

    public stop() {
        this.servers.forEach(server => server.close());
        this.servers.splice(0, this.servers.length);

        Object.values(this.context.databases).forEach(database => database.close());

        this.log.write(MESSAGE_STOP);
        this.onStop.emit(this);
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

        this.log.write(`'${ip}' requested '${request.url}'`);

        try {
            const instance = this.globalCommander.getCommand<ServerCommand<any, any, any>>(command || COMMAND_HELP);

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

            const result: Response = await this.globalCommander.execute(command || COMMAND_HELP, args);

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

            this.log.error(error, this.constructor.name + '.global');
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