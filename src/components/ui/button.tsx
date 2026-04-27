import { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-chios-purple text-white hover:bg-chios-purple/90 active:bg-chios-purple/80",
  secondary:
    "bg-white text-deep-sea-teal border border-deep-sea-teal/10 hover:bg-deep-sea-teal/5",
  ghost:
    "bg-transparent text-deep-sea-teal hover:bg-deep-sea-teal/5",
  danger:
    "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={twMerge(
        "rounded-xl font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
);

Button.displayName = "Button";

function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-14 h-14 border-4",
  };
  return (
    <div
      className={twMerge(
        "border-chios-purple/20 border-t-chios-purple rounded-full animate-spin",
        sizes[size]
      )}
    />
  );
}

export { Spinner };
