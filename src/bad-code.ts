class NotificationService {
    send(type: string, message: string, recipient: string, config?: any): void {
        if (type === 'email') {
            console.log(`Sending email to ${recipient}: ${message}`);
            // Lògica complexa d'enviament d'email amb configuració
            if (config && config.subject) {
                console.log(`Subject: ${config.subject}`);
            }
        } else if (type === 'sms') {
            console.log(`Sending SMS to ${recipient}: ${message}`);
            // Lògica complexa d'enviament d'SMS
            if (config && config.fromNumber) {
                console.log(`From: ${config.fromNumber}`);
            }
        } else if (type === 'push') {
            console.log(`Sending Push Notification to ${recipient}: ${message}`);
            // Lògica complexa d'enviament de push notification
            if (config && config.deviceId) {
                console.log(`Device ID: ${config.deviceId}`);
            }
        } else {
            console.log(`Unsupported notification type: ${type}`);
        }
    }
}

// Ús del codi
const service = new NotificationService();
service.send('email', 'Hola, això és un email!', 'user@example.com', { subject: 'Test' });
service.send('sms', 'Alerta! Nova promoció!', '123-456-7890');
service.send('push', 'Nou missatge!, 'device - xyz - 123', { deviceId: 'device - xyz - 123' });