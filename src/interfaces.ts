export interface EmailConfig {
    subject: string;
    sender: string;
}

export interface SMSConfig {
    fromNumber: string;
}

export interface PushConfig {
    deviceId: string;
}