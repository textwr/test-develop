import type { PropsWithChildren } from "react";
import { cn } from "@/app/utils/cn";

type StatusBannerProps = PropsWithChildren<{
  variant?: "default" | "warning" | "info";
}>;

export function StatusBanner({ children, variant = "default" }: StatusBannerProps) {
  return (
    <p
      className={cn(
        "mb-3 rounded-[10px] border px-4 py-3 text-[13px]",
        variant === "default" && "border-[#e2e8f0] bg-white text-[#475569]",
        variant === "warning" && "border-[#fde2a7] bg-[#fffbeb] text-[#b45309]",
        variant === "info" && "border-[#cfe0ff] bg-[#f8fbff] text-[#3157a6]",
      )}
    >
      {children}
    </p>
  );
}
