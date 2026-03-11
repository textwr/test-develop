import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type AppButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "dark" | "ghost";
    fullWidth?: boolean;
    size?: "md" | "sm";
  }
>;

export function AppButton({
  children,
  className = "",
  fullWidth = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: AppButtonProps) {
  const classes = [
    "app-button",
    `app-button--${variant}`,
    `app-button--${size}`,
    fullWidth ? "app-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
