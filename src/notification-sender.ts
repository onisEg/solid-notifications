import { INotifier } from './notifiers';

export class NotificationSender {
    // La injecció de dependències es veurà millor en el DIP, però ja l'estem aplicant
    constructor(private notifier: INotifier) { }

    notify(message: string, recipient: string): void {
        this.notifier.send(message, recipient);
    }
}