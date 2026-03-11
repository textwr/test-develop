import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/app/utils/cn";

type AppButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "dark" | "outline" | "ghost";
    fullWidth?: boolean;
    size?: "md" | "sm";
  }
>;

export function AppButton({
  children,
  className,
  fullWidth = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: AppButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[10px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        size === "md" ? "min-h-[50px] px-5 text-[17px]" : "min-h-[38px] px-4 text-[14px]",
        variant === "primary" && "bg-[#6175df] text-white hover:bg-[#566bd8]",
        variant === "secondary" && "bg-[#eef1f6] text-[#4b5563] hover:bg-[#e5e9f0]",
        variant === "dark" && "bg-black text-white hover:bg-[#111827]",
        variant === "outline" && "border border-[#9aa3b2] bg-white text-[#111827] hover:bg-[#f8fafc]",
        variant === "ghost" && "bg-transparent text-inherit hover:bg-black/5",
        fullWidth && "w-full",
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
