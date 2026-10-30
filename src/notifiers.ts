import { EmailConfig, SMSConfig, PushConfig } from './interfaces';

export interface INotifier {
    send(message: string, recipient: string): void;
}

export class EmailNotifier implements INotifier {
    constructor(private config: EmailConfig) { }

    send(message: string, recipient: string): void {
        console.log(`[Email] Sending to ${recipient} from ${this.config.sender} with subject "${this.config.subject}": ${message}`);
        // Lògica real d'enviament d'email
    }
}

export class SMSNotifier implements INotifier {
    constructor(private config: SMSConfig) { }

    send(message: string, recipient: string): void {
        console.log(`[SMS] Sending to ${recipient} from ${this.config.fromNumber}: ${message}`);
        // Lògica real d'enviament d'SMS
    }
}

export class PushNotifier implements INotifier {
    constructor(private config: PushConfig) { }

    send(message: string, recipient: string): void {
        console.log(`[Push] Sending to device ${this.config.deviceId} for ${recipient}: ${message}`);
        // Lògica real d'enviament de push notification
    }
}
