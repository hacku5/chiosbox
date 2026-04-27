import { type InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={twMerge(
        "w-full px-4 py-3 rounded-xl border bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/30 focus:outline-none transition-colors",
        error
          ? "border-red-400 focus:border-red-500"
          : "border-deep-sea-teal/10 focus:border-chios-purple/50 focus:ring-2 focus:ring-chios-purple/10",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
