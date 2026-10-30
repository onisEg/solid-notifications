# Task S2.06 — Notification System & SOLID (Study Guide)

> Goal: understand how a "bad" notification system (one class full of if/else) is refactored into clean code by applying the five SOLID principles, step by step.

---

## 1) What does this exercise train?

Applying the **five SOLID principles** in practice, leveraging **polymorphism** and **Dependency Injection**. It's a "guided refactoring" — the task gives you the solution so you understand it, not invent it.

---

## 2) Starting point: the bad code (`bad-code.ts`)

One class `NotificationService` with a `send` method full of `if/else` on the notification type.

**Its problems:**
- It knows how to send email, SMS, and push all in one place → **breaks SRP**.
- Adding a new type means opening and modifying the class → **breaks OCP**.
- `config?: any` → no type safety.

---

## 3) The solution: files and order (bottom-up)

### `interfaces.ts` — the contracts (ISP)
```ts
export interface EmailConfig { subject: string; sender: string; }
export interface SMSConfig   { fromNumber: string; }
export interface PushConfig  { deviceId: string; }
```
Each type has its own config in a small, specific interface → **ISP** (small interfaces, no giant one).

### `notifiers.ts` — separating responsibilities (SRP)
```ts
export interface INotifier {
    send(message: string, recipient: string): void;
}

export class EmailNotifier implements INotifier {
    constructor(private config: EmailConfig) {}
    send(message: string, recipient: string): void { /* email logic */ }
}
// same shape: SMSNotifier, PushNotifier
```
Each class is responsible for a single type → **SRP**. They all implement `INotifier` → sets up **LSP** and **polymorphism**.

### `notification-sender.ts` — the core (OCP + LSP + DIP)
```ts
import { INotifier } from './notifiers';

export class NotificationSender {
    constructor(private notifier: INotifier) {}
    notify(message: string, recipient: string): void {
        this.notifier.send(message, recipient);
    }
}
```
- **DIP:** depends on the `INotifier` abstraction, not on a concrete class.
- **OCP:** add a new notifier? It doesn't change a single line.
- **LSP:** any `INotifier` can replace another without breaking it.

### `index.ts` — wiring and injection (DI + Polymorphism)
- Create the notifiers and inject them: `new NotificationSender(emailNotifier)` → **DI**.
- Add WhatsApp and Telegram without touching `NotificationSender` → **OCP in action**.
- Loop over `INotifier[]` calling `send()` on each → **polymorphism**.

---

## 4) Map: where does each principle appear?

| Principle | Where |
|---|---|
| **S** Single Responsibility | each type in its own class (`notifiers.ts`) |
| **O** Open/Closed | `NotificationSender` unchanged when adding new types |
| **L** Liskov Substitution | any `INotifier` replaces another in the sender |
| **I** Interface Segregation | small `INotifier` + separate config per type |
| **D** Dependency Inversion | `NotificationSender` depends on `INotifier` + injection in `index.ts` |

---

## 5) Running it

If `ts-node` gives trouble, use `tsx`:
```bash
npm install -D tsx
npx tsx src/index.ts
```
You should see every type sending, and at the end a "Polymorphic" section sending with all types through the same call.

---

## 6) Adding Telegram (proof of OCP)
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
A whole new type **without touching `NotificationSender`** = open for extension, closed for modification.

---

## 7) Reflection answers

**How has the code improved?** Each type is now a small class with a single responsibility (SRP) instead of one class full of if/else. Adding a new type means a new class without modifying existing code (OCP). So the code is easier to understand, extend, and maintain.

**Is it easier to test now? Why?** Yes. Each notifier is isolated and implements `INotifier`, so it can be tested on its own. And since `NotificationSender` depends on the abstraction and receives the notifier by injection (DIP), we can inject a mock/stub instead of the real one — fast, predictable tests with no real emails/SMS sent.

**If configs came from a database, how does DI help?** Because object creation and configuration happen in one place (`index.ts`) and are then injected. We could load configs from the database at startup, build the notifiers with them, and inject them — without changing `NotificationSender` or the notifier classes. Separating construction from usage is what makes this possible.

---

## 8) Takeaways
1. **SRP** makes each class do one thing → understandable code.
2. **OCP** lets you add without modifying → safe to extend.
3. **DIP + DI** decouple components → easy to test and maintain.
4. **Polymorphism** lets the same call work with every type.
