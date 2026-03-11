import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function PasswordField({ className, label, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="grid gap-2">
      <span className="text-[14px] font-medium text-[#475569]">{label}</span>
      <span className="relative">
        <input
          className={cn(
            "min-h-[48px] w-full rounded-[10px] border border-[#d4d9e2] bg-white px-4 pr-12 text-[16px] text-[#334155] outline-none transition focus:border-[#6175df] focus:ring-2 focus:ring-[#dce2ff]",
            className,
          )}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8b95a7] transition hover:bg-[#f3f4f6]"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          <svg
            fill="none"
            height="18"
            viewBox="0 0 24 24"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 12C4.5 7.5 8 5.25 12 5.25C16 5.25 19.5 7.5 22 12C19.5 16.5 16 18.75 12 18.75C8 18.75 4.5 16.5 2 12Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
            <circle
              cx="12"
              cy="12"
              r="3.25"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </span>
    </label>
  );
}
