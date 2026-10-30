import { EmailNotifier, SMSNotifier, PushNotifier, INotifier } from './notifiers';
import { NotificationSender } from './notification-sender';

// Creació de notificadors amb les seves configuracions

// 1) Create notifiers with their configs

const emailNotifier = new EmailNotifier({ subject: 'Welcome to our service', sender: 'noreply@example.com' });
const smsNotifier = new SMSNotifier({ fromNumber: '+15551234567' });
const pushNotifier = new PushNotifier({ deviceId: 'mobile-app-user-abc' });

// Injecció de dependències: el NotificationSender rep el Notificador
// NO el crea ell mateix
// 2) Dependency Injection: the sender RECEIVES the notifier, it does NOT create it
const emailSender = new NotificationSender(emailNotifier);
const smsSender = new NotificationSender(smsNotifier);
const pushSender = new NotificationSender(pushNotifier);

console.log('--- Enviament d\'Emails ---');
emailSender.notify('Your order has been shipped!', 'john.doe@example.com');

console.log('\n--- Enviament d\'SMS ---');
smsSender.notify('Your package will arrive in 1 hour.', '+34600112233');

console.log('\n--- Enviament de Push Notifications ---');
pushSender.notify('New message from a friend!', 'user@app.com');

// Afegint un nou tipus de notificació (p. ex., WhatsApp) sense modificar NotificationSender
// OCP en acció!

class WhatsAppNotifier implements INotifier {
    constructor(private apiKey: string) { }

    send(message: string, recipient: string): void {
        console.log(`[WhatsApp] Sending to ${recipient} (via API Key: ${this.apiKey.substring(0, 5)}...): ${message}`);
        // Lògica real d'enviament de WhatsApp
    }
}
class TelegramNotifier implements INotifier {
    constructor(private chatId: string) { }
    send(message: string, recipient: string): void {
        console.log(`[Telegram] Sending to ${recipient} (chat ${this.chatId}): ${message}`);
    }
}

const whatsappSender = new NotificationSender(new WhatsAppNotifier('my-super-secret-whatsapp-api-key'));
console.log('\n--- Enviament de WhatsApp (Nou) ---');
whatsappSender.notify('Have a great day!', '+34699887766');


const telegramSender = new NotificationSender(new TelegramNotifier('chat-12345'));
console.log('\n--- Sending Telegram (New) ---');
telegramSender.notify('Welcome to Telegram notifications!', '+34600000000');


// Demostració de la substitució de Liskov:
// Qualsevol objecte que implementi INotifier es pot usar on s'espera un INotifier.
const notifiers: INotifier[] = [
    emailNotifier,
    smsNotifier,
    pushNotifier,
    new WhatsAppNotifier('key'),
    new TelegramNotifier('chat-999'),
];

console.log('\n--- Enviament Polimòrfic ---');
notifiers.forEach(notifier => {
    // Aquí el mètode 'send' es comporta de forma diferent segons el tipus concret de notificador
    notifier.send("Aquest és un missatge polimòrfic!", "recipient@example.com");
});