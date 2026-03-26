type NotificationType = 'order' | 'reservation';

interface DebouncedNotification {
  type: NotificationType;
  count: number;
  firstNotification: any;
  notifications: any[];
}

interface DebounceState {
  order: DebouncedNotification | null;
  reservation: DebouncedNotification | null;
}

const DEBOUNCE_WINDOW_MS = 3000;

class NotificationDebouncer {
  private state: DebounceState = {
    order: null,
    reservation: null,
  };

  private timers: {
    order: NodeJS.Timeout | null;
    reservation: NodeJS.Timeout | null;
  } = {
    order: null,
    reservation: null,
  };

  debounce(
    type: NotificationType,
    notification: any,
    onFlush: (grouped: DebouncedNotification) => void
  ): void {
    if (!this.state[type]) {
      this.state[type] = {
        type,
        count: 1,
        firstNotification: notification,
        notifications: [notification],
      };
    } else {
      this.state[type]!.count += 1;
      this.state[type]!.notifications.push(notification);
    }

    if (this.timers[type]) {
      clearTimeout(this.timers[type]!);
    }

    this.timers[type] = setTimeout(() => {
      if (this.state[type]) {
        onFlush(this.state[type]!);
        this.state[type] = null;
      }
      this.timers[type] = null;
    }, DEBOUNCE_WINDOW_MS);
  }

  reset(type?: NotificationType): void {
    if (type) {
      if (this.timers[type]) {
        clearTimeout(this.timers[type]!);
        this.timers[type] = null;
      }
      this.state[type] = null;
    } else {
      Object.keys(this.timers).forEach((key) => {
        const timerKey = key as NotificationType;
        if (this.timers[timerKey]) {
          clearTimeout(this.timers[timerKey]!);
          this.timers[timerKey] = null;
        }
      });
      this.state = {
        order: null,
        reservation: null,
      };
    }
  }

  getState(type: NotificationType): DebouncedNotification | null {
    return this.state[type];
  }
}

export const notificationDebouncer = new NotificationDebouncer();

export type { NotificationType, DebouncedNotification };
