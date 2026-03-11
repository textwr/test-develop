import type { InputHTMLAttributes } from "react";

type AppFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function AppField({ className = "", label, ...props }: AppFieldProps) {
  return (
    <label className="app-field">
      <span className="app-field__label">{label}</span>
      <input
        className={["app-field__input", className].filter(Boolean).join(" ")}
        {...props}
      />
    </label>
  );
}
