import { Message } from "../../core/models/message";
import { Fifo } from "../../core/stacks/fifo";
import { Event } from "../../core/utils/event";
import { View } from "../utils/view";
import { ViewController } from "../utils/viewController";
import { Button } from "../views/button";
import { Label } from "../views/label";

export class MessageViewController extends ViewController {
    public static readonly onMessage = new Event<MessageViewController, Message>();
    public static readonly onDone = new Event<MessageViewController, void>();

    public readonly titleLabel = new Label('title');
    public readonly textLabel = new Label('text');
    public readonly doneButton = new Button('done');

    private readonly stack = new Fifo<Message>();

    private currentMessage: Message;

    constructor(...classes: readonly string[]) {
        super(...classes, 'message');
    }

    public init() {
        this.view.appendChild(this.titleLabel);
        this.view.appendChild(this.textLabel);
        this.view.appendChild(this.doneButton);

        this.doneButton.text = '#_done';

        View.onEnterKey.on(() => this.pop(), { sender: this.view });
        Button.onClick.on(() => this.pop(), { sender: this.doneButton });

        super.init();
    }

    public focus(): void {
        this.doneButton.focus();
    }

    public push(message: Message): Promise<void> {
        this.stack.push(message);

        if (!this.currentMessage)
            this.pop();

        return new Promise<void>(resolve => MessageViewController.onDone.once(resolve, { sender: this }));
    }

    public pop() {
        this.currentMessage = this.stack.pop();

        this.titleLabel.text = this.currentMessage && this.currentMessage.title || "";
        this.textLabel.text = this.currentMessage && this.currentMessage.text || "";

        if (this.currentMessage)
            MessageViewController.onMessage.emit(this, this.currentMessage);
        else
            MessageViewController.onDone.emit(this);
    }
}