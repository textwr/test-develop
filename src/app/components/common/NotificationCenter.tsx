import { AppButton } from "@/app/components/common/AppButton";

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
    <div className="pointer-events-none fixed right-6 top-6 z-50 grid w-full max-w-sm gap-3">
      {notifications.map((notification) => (
        <article
          className={[
            "pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-slate-200/60",
            notification.variant === "info" && "border-blue-100 bg-blue-50 text-blue-700",
            notification.variant === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
            notification.variant === "error" && "border-rose-200 bg-rose-50 text-rose-700",
          ]
            .filter(Boolean)
            .join(" ")}
          key={notification.id}
          role="alert"
        >
          <div className="grid gap-1">
            <strong className="text-sm font-semibold">{notification.title}</strong>
            <p className="text-sm leading-5">{notification.message}</p>
          </div>
          <AppButton
            aria-label="알림 닫기"
            className="!min-h-8 !rounded-full !px-2"
            onClick={() => onDismiss(notification.id)}
            size="sm"
            variant="ghost"
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
          </AppButton>
        </article>
      ))}
    </div>
  );
}
