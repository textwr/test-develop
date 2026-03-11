export type NotificationItem = {
  id: string;
  message: string;
  title: string;
  variant: "info" | "warning" | "error";
};

type NotificationCenterProps = {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
};

export function NotificationCenter({ notifications, onDismiss }: NotificationCenterProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="notification-center"
    >
      {notifications.map((notification) => (
        <article
          className={["notification-toast", `notification-toast--${notification.variant}`].join(" ")}
          key={notification.id}
          role="alert"
        >
          <div className="notification-toast__body">
            <strong className="notification-toast__title">{notification.title}</strong>
            <p className="notification-toast__message">{notification.message}</p>
          </div>
          <button
            aria-label="알림 닫기"
            className="notification-toast__close"
            onClick={() => onDismiss(notification.id)}
            type="button"
          >
            <svg
              fill="none"
              height="14"
              viewBox="0 0 24 24"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </article>
      ))}
    </div>
  );
}
