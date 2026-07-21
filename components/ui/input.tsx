import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-[42px] w-full rounded-[12px] border border-line bg-surface px-[14px] text-sm text-ink placeholder:text-ink-muted transition-colors",
      "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full rounded-[12px] border border-line bg-surface px-[14px] py-3 text-sm text-ink placeholder:text-ink-muted transition-colors",
      "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-danger",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-[42px] w-full rounded-[12px] border border-line bg-surface px-[12px] text-sm text-ink transition-colors",
      "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
