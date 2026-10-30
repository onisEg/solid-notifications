# SOLID Notifications

A small TypeScript project that refactors a monolithic notification service into clean, modular code by applying the five **SOLID** principles. It was built for **Task S2.06** of the IT Academy (Barcelona Activa) Frontend course.

## Overview

The starting point (`src/bad-code.ts`) is a single `NotificationService` class that handles email, SMS, and push notifications through a large `if/else` block. It violates several SOLID principles and is hard to extend or test.

The refactored version splits that logic into small, decoupled pieces, each with a single job, so new notification channels (WhatsApp, Telegram, …) can be added **without modifying existing code**.

## SOLID principles applied

| Principle | Where it's applied |
|-----------|--------------------|
| **S** — Single Responsibility | Each notifier (`EmailNotifier`, `SMSNotifier`, `PushNotifier`) handles one channel only |
| **O** — Open/Closed | `NotificationSender` never changes when a new notifier is added |
| **L** — Liskov Substitution | Any `INotifier` implementation can replace another without breaking the sender |
| **I** — Interface Segregation | A small `INotifier` interface plus a separate config interface per channel |
| **D** — Dependency Inversion | `NotificationSender` depends on the `INotifier` abstraction; dependencies are injected |

## Project structure

```
solid-notifications/
├── src/
│   ├── bad-code.ts            # The original monolithic version (before)
│   ├── interfaces.ts          # Config contracts: EmailConfig, SMSConfig, PushConfig (ISP)
│   ├── notifiers.ts           # INotifier + EmailNotifier / SMSNotifier / PushNotifier (SRP)
│   ├── notification-sender.ts # Depends on INotifier (OCP / LSP / DIP)
│   └── index.ts               # Wires everything via dependency injection (DI)
├── tsconfig.json
├── package.json
└── README.md
```

## Installation

```bash
git clone https://github.com/onisEg/solid-notifications.git
cd solid-notifications
npm install
```

## Usage

Run the refactored example:

```bash
npx tsx src/index.ts
```

> If you prefer `ts-node`, you can use `npx ts-node src/index.ts`. This project uses `tsx` because it avoids some common `ts-node` configuration issues.

You can also compare it with the original "bad" version:

```bash
npx tsx src/bad-code.ts
```

## Example output

```
--- Sending Emails ---
[Email] Sending to john.doe@example.com from noreply@example.com with subject "Welcome to our service": Your order has been shipped!

--- Sending SMS ---
[SMS] Sending to +34600112233 from +15551234567: Your package will arrive in 1 hour.

--- Sending Push Notifications ---
[Push] Sending to device mobile-app-user-abc for user@app.com: New message from a friend!

--- Sending Telegram (New) ---
[Telegram] Sending to +34600000000 (chat chat-12345): Welcome to Telegram notifications!

--- Polymorphic Sending ---
[Email] ... [SMS] ... [Push] ... [WhatsApp] ... [Telegram] ...
```

## Adding a new notifier (Open/Closed in action)

To support a new channel, create a class that implements `INotifier` and inject it — no existing file needs to change:

```ts
class TelegramNotifier implements INotifier {
    constructor(private chatId: string) {}
    send(message: string, recipient: string): void {
        console.log(`[Telegram] Sending to ${recipient} (chat ${this.chatId}): ${message}`);
    }
}

const telegramSender = new NotificationSender(new TelegramNotifier('chat-12345'));
telegramSender.notify('Welcome!', '+34600000000');
```

## Tech stack

- TypeScript
- tsx (TypeScript execution)

## Author

Anas Alnagar
