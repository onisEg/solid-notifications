# تمرين S2.06 — نظام الإشعارات و SOLID (دليل الفهم)

> الهدف: تفهم إزاي نظام إشعارات «وحش» (كلاس واحد فيه if/else) اتحوّل لنظام نضيف بتطبيق مبادئ SOLID الخمسة خطوة خطوة.

---

## 1) التمرين بيدرّبك على إيه؟

تطبيق **مبادئ SOLID الخمسة** عملياً، مع الاستفادة من **polymorphism** و**Dependency Injection**. نوعه «refactoring مُوجَّه» — التاسك بيديك الحل جاهز عشان تفهم، مش تخترع.

---

## 2) نقطة البداية: الكود الوحش (`bad-code.ts`)

كلاس واحد `NotificationService` فيه ميثود `send` مليانة `if/else` على نوع الإشعار.

**مشاكله:**
- بيعرف يبعت email و SMS و push كلهم في مكان واحد → **بيكسر SRP**.
- عايز تضيف نوع جديد؟ لازم تفتح الكلاس وتعدّله → **بيكسر OCP**.
- `config?: any` → مفيش أمان في الأنواع.

---

## 3) الحل: الملفات والترتيب (من تحت لفوق)

### `interfaces.ts` — العقود (ISP)
```ts
export interface EmailConfig { subject: string; sender: string; }
export interface SMSConfig   { fromNumber: string; }
export interface PushConfig  { deviceId: string; }
```
كل نوع ليه إعداداته في interface صغير متخصص → **ISP** (واجهات صغيرة، مفيش واحد ضخم).

### `notifiers.ts` — فصل المسؤوليات (SRP)
```ts
export interface INotifier {
    send(message: string, recipient: string): void;
}

export class EmailNotifier implements INotifier {
    constructor(private config: EmailConfig) {}
    send(message: string, recipient: string): void { /* email logic */ }
}
// ونفس الشكل: SMSNotifier, PushNotifier
```
كل كلاس مسؤوليته نوع واحد بس → **SRP**. وكلهم بينفّذوا `INotifier` → يمهّد لـ **LSP** و**polymorphism**.

### `notification-sender.ts` — القلب (OCP + LSP + DIP)
```ts
import { INotifier } from './notifiers';

export class NotificationSender {
    constructor(private notifier: INotifier) {}
    notify(message: string, recipient: string): void {
        this.notifier.send(message, recipient);
    }
}
```
- **DIP:** بيعتمد على التجريد `INotifier` مش على كلاس محدد.
- **OCP:** تضيف notifier جديد؟ ما بيتغيّرش ولا حرف.
- **LSP:** أي `INotifier` يحلّ محل أي واحد تاني من غير ما يكسر.

### `index.ts` — التجميع والحقن (DI + Polymorphism)
- تخلق الـ notifiers وتحقنهم: `new NotificationSender(emailNotifier)` → **DI**.
- تضيف WhatsApp و Telegram من غير ما تلمس `NotificationSender` → **OCP عملياً**.
- loop على `INotifier[]` بتنادي `send()` على الكل → **polymorphism**.

---

## 4) خريطة: كل مبدأ بيظهر فين؟

| المبدأ | المكان |
|---|---|
| **S** مسؤولية واحدة | فصل كل نوع في كلاس (`notifiers.ts`) |
| **O** مفتوح/مقفول | `NotificationSender` ثابت عند إضافة أنواع جديدة |
| **L** الاستبدال | أي `INotifier` يحلّ محل أي واحد في الـ sender |
| **I** فصل الواجهات | `INotifier` صغيرة + config منفصل لكل نوع |
| **D** عكس الاعتماد | `NotificationSender` يعتمد على `INotifier` + الحقن في `index.ts` |

---

## 5) التشغيل

لو `ts-node` عمل مشكلة، استخدم `tsx`:
```bash
npm install -D tsx
npx tsx src/index.ts
```
المفروض تشوف كل الأنواع بتبعت، وفي الآخر قسم «Polymorphic» بيبعت بكل الأنواع بنفس النداء.

---

## 6) إضافة Telegram (إثبات OCP)
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
نوع جديد كامل **من غير ما تلمس `NotificationSender`** = مفتوح للتوسّع، مقفول للتعديل.

---

## 7) إجابات الـ Reflection

**كيف تحسّن الكود؟** كل نوع بقى في كلاس صغير بمسؤولية واحدة (SRP) بدل كلاس واحد مليان if/else. إضافة نوع جديد = كلاس جديد من غير تعديل القديم (OCP). فالكود أسهل في الفهم والتوسّع والصيانة.

**هل الاختبار بقى أسهل؟ ليه؟** أيوه. كل notifier معزول وبينفّذ `INotifier`، فيتختبر لوحده. وبما إن `NotificationSender` بيعتمد على التجريد ويستقبل الـ notifier بالحقن (DIP)، نقدر نحقن mock/stub بدل الحقيقي — فالاختبار سريع ومضمون من غير ما نبعت إيميل/SMS فعلي.

**لو الإعدادات جت من database، إزاي الـ DI بيسهّل؟** لأن إنشاء وتهيئة الأوبجكتس بيحصل في مكان واحد (`index.ts`) وبعدها بيتحقن. فنقدر نحمّل الإعدادات من الـ database عند البداية، نبني بيها الـ notifiers، ونحقنهم — من غير ما نغيّر `NotificationSender` ولا الـ notifiers. فصل البناء عن الاستخدام هو اللي بيخلّي ده ممكن.

---

## 8) الخلاصة
1. **SRP** بيخلّي كل كلاس يعمل حاجة واحدة → كود مفهوم.
2. **OCP** بيخلّيك تضيف من غير ما تعدّل → كود آمن للتوسّع.
3. **DIP + DI** بيفكّوا الارتباط → كود سهل الاختبار والصيانة.
4. **Polymorphism** بيخلّي نفس النداء يشتغل مع كل الأنواع.
