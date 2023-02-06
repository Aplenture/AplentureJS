interface Listener<TSender, TArgs> extends Options<TSender, TArgs> {
    readonly handler: EventHandler<TSender, TArgs>;
    readonly once?: boolean;
    readonly this?: any;
    off?: boolean;
}

interface Options<TSender, TArgs> {
    readonly sender?: TSender;
    readonly args?: TArgs;
    readonly this?: any;
}

export type EventHandler<TSender, TArgs> = (input: TArgs, sender: TSender) => void;

export class Event<TSender, TArgs> {
    public static onEmit = new Event<Event<any, any>, { readonly sender: any, readonly args: any }>('Event.onEmit');

    private listeners: Listener<TSender, TArgs>[] = [];

    constructor(public readonly name: string) { }

    public get length(): number { return this.listeners.length; }

    public on(handler: EventHandler<TSender, TArgs>, options: Options<TSender, TArgs> = {}): void {
        this.listeners.push({ handler, sender: options.sender, args: options.args, this: options.this });
    }

    public off(handler: EventHandler<TSender, TArgs> | any): void {
        this.listeners.forEach(listener => listener.off = listener.handler == handler || listener.this == handler);
    }

    public once(handler: EventHandler<TSender, TArgs>, options: Options<TSender, TArgs> = {}): void {
        this.listeners.push({ handler, sender: options.sender, args: options.args, once: true });
    }

    public emit(sender: TSender, args: TArgs): void {
        if (Event.onEmit != this as any)
            Event.onEmit.emit(this, { sender, args });

        this.listeners.forEach(listener => {
            if (listener.off)
                return;

            if (undefined != listener.sender && sender != listener.sender)
                return;

            if (undefined != listener.args && args != listener.args)
                return;

            listener.handler.call(listener.this, args, sender);
        });

        this.listeners = this.listeners.filter(listener => !listener.once && !listener.off);
    }
}