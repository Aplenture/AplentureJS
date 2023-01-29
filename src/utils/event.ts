interface Listener<TSender, TArgs> extends Options<TSender, TArgs> {
    readonly handler: EventHandler<TSender, TArgs>;
    readonly once?: boolean;
    off?: boolean;
}

interface Options<TSender, TArgs> {
    readonly sender?: TSender;
    readonly args?: TArgs;
}
export type EventHandler<TSender, TArgs> = (input: TArgs, sender: TSender) => void;

export class Event<TSender, TArgs> {
    private listeners: Listener<TSender, TArgs>[] = [];

    public get length(): number { return this.listeners.length; }

    public on(handler: EventHandler<TSender, TArgs>, options: Options<TSender, TArgs> = {}): void {
        this.listeners.push({ handler, sender: options.sender, args: options.args });
    }

    public off(handler: EventHandler<TSender, TArgs>): void {
        const listener = this.listeners.find(listener => listener.handler == handler);

        if (!listener)
            return;

        listener.off = true;
    }

    public once(handler: EventHandler<TSender, TArgs>, options: Options<TSender, TArgs> = {}): void {
        this.listeners.push({ handler, sender: options.sender, args: options.args, once: true });
    }

    public emit(sender: TSender, args: TArgs): void {
        this.listeners.forEach(listener => {
            if (listener.off)
                return;

            if (undefined != listener.sender && sender != listener.sender)
                return;

            if (undefined != listener.args && args != listener.args)
                return;

            listener.handler(args, sender);
        });

        this.listeners = this.listeners.filter(listener => !listener.once && !listener.off);
    }
}