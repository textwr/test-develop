import type { PropsWithChildren } from "react";

type StatusBannerProps = PropsWithChildren<{
  variant?: "default" | "warning" | "info";
}>;

export function StatusBanner({ children, variant = "default" }: StatusBannerProps) {
  return <p className={["status-banner", `status-banner--${variant}`].join(" ")}>{children}</p>;
}
