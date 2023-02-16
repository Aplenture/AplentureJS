import { RequestMethod } from "../../core/enums/requestMethod";
import { ResponseCode } from "../../core/enums/responseCode";
import { encodeString } from "../../core/other/text";
import { Event } from "../../core/utils/event";

export interface RequestOptions {
    readonly type?: RequestMethod;
    readonly useCredentials?: boolean;
    readonly headers?: NodeJS.ReadOnlyDict<string>;
    readonly isPrivate?: boolean;
}

export abstract class Request<TParams, TResponse> {
    public static readonly onSending = new Event<Request<any, any>, string>('Request.onSending');

    public readonly type: RequestMethod;
    public readonly isPrivate: boolean;

    private readonly request = new XMLHttpRequest();

    private _running = false;

    constructor(
        public url = '',
        options: RequestOptions = {}
    ) {
        this.type = options.type || RequestMethod.Get;
        this.isPrivate = options.isPrivate || false;
        this.request.withCredentials = options.useCredentials;

        if (options.headers)
            Object.keys(options.headers).forEach(name => this.setHeader(name, options.headers[name]));
    }

    public get isRunning(): boolean { return this._running; }

    public send(params: TParams, url = this.url): Promise<TResponse> {
        for (const key in params)
            if (undefined === params[key])
                delete params[key];

        if (this._running)
            throw new Error('request is running already');

        this._running = true;

        return new Promise<TResponse>((resolve, reject) => {
            this.request.onreadystatechange = () => {
                if (this.request.readyState !== 4)
                    return;

                this._running = false;

                switch (this.request.status) {
                    case ResponseCode.OK: {
                        let result: TResponse;

                        try {
                            result = this.parse(this.request.responseText);
                        } catch (error) {
                            return reject(error);
                        }

                        return resolve(result);
                    }

                    case ResponseCode.NoContent:
                        return resolve(null);

                    default:
                        return reject(new Error(this.request.responseText));
                }
            };

            const paramString = this.paramsToString(params);
            const uri = this.createURI(paramString, url);
            const body = this.createBody(paramString);

            this.request.open(this.type, uri, true);
            this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

            Request.onSending.emit(this, paramString);

            this.request.send(body);
        });
    }

    public setHeader(name: string, value: string) {
        this.request.setRequestHeader(name, value);
    }

    protected abstract parse(data: string): TResponse;

    protected paramsToString(params: NodeJS.Dict<any> = {}): string {
        if (this.isPrivate)
            params['timestamp'] = Date.now();

        if (!params)
            return '';

        const args = [];

        for (const key in params) {
            if (typeof params[key] == 'boolean')
                args.push(`${key}=${params[key] ? 1 : 0}`);
            else if (Array.isArray(params[key]))
                (params[key] as any).forEach(value => args.push(`${key}=${encodeString(value)}`));
            else
                args.push(`${key}=${encodeString(params[key] as any)}`)
        }

        return args.join('&');
    }

    protected createURI(params: string, url: string): string {
        let result = '';

        switch (this.type) {
            case RequestMethod.Get:
                result += params
                    ? url + "?" + params
                    : url;
                break;

            default:
                result += url;
                break;
        }

        return result;
    }

    protected createBody(params: string): any {
        switch (this.type) {
            case RequestMethod.Post:
                return params;

            default:
                return "";
        }
    }
}