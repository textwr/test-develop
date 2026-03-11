import { useState } from "react";
import type { InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function PasswordField({ className = "", label, ...props }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="app-field">
      <span className="app-field__label">{label}</span>
      <span className="password-field">
        <input
          className={["app-field__input", "password-field__input", className].filter(Boolean).join(" ")}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="password-field__toggle"
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
