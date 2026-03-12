import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";

type AppFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelClassName?: string;
  wrapperClassName?: string;
};

export function AppField({ className, label, labelClassName, wrapperClassName, ...props }: AppFieldProps) {
  return (
    <label className={cn("grid gap-2", wrapperClassName)}>
      <span className={cn("text-[14px] font-medium text-[#475569]", labelClassName)}>{label}</span>
      <input
        className={cn(
          "min-h-[48px] rounded-[10px] border border-[#d4d9e2] bg-white px-4 text-[16px] text-[#334155] outline-none transition focus:border-[#6175df] focus:ring-2 focus:ring-[#dce2ff]",
          className,
        )}
        {...props}
      />
    </label>
  );
}
