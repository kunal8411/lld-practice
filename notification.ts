// 1. Strong Types (fix #1)

type NotificationType = "email" | "sms" | "push";

type NotificationPayload = {
  userId: string;
  message: string;
  channels: NotificationType[];
};


// 2. Contract (rename fix)

interface Notification1 {
  send(message: string): Promise<void>;
}


// 3. Implementations

class EmailNotification implements Notification1 {
  async send(message: string): Promise<void> {
    console.log("Email sent:", message);
  }
}

class SmsNotification implements Notification1 {
  async send(message: string): Promise<void> {
    console.log("SMS sent:", message);
  }
}

class PushNotification implements Notification1 {
  async send(message: string): Promise<void> {
    console.log("Push sent:", message);
  }
}


// 4. Factory (type-safe fix)

class NotificationFactory {
  private static map: Record<NotificationType, new () => Notification1> = {
    email: EmailNotification,
    sms: SmsNotification,
    push: PushNotification,
  };

  static create(type: NotificationType): Notification1 {
    return new this.map[type]();
  }
}


// 5. Retry utility (small but powerful upgrade)

async function retry(
  fn: () => Promise<void>,
  retries = 2
): Promise<void> {
  let lastError: unknown;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}


// 6. Service (clean + safe + realistic)

class NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    this.validate(payload);

    const tasks = payload.channels.map(async (type) => {
      const notifier = NotificationFactory.create(type);

      try {
        await retry(() => notifier.send(payload.message), 2);
      } catch (err) {
        console.error(`Failed for ${type}:`, err);
      }
    });

    await Promise.all(tasks);
  }

  private validate(payload: NotificationPayload) {
    if (!payload.userId) {
      throw new Error("userId is required");
    }

    if (!payload.message) {
      throw new Error("message is required");
    }

    if (!payload.channels.length) {
      throw new Error("At least one channel is required");
    }
  }
}


// 7. Usage

const service = new NotificationService();

service.send({
  userId: "user-1",
  message: "Hello User!",
  channels: ["email", "sms"],
});