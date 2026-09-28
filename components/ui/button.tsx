"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-semibold transition-[transform,background-color,border-color,box-shadow,color] duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-sm",
        secondary:
          "bg-surface text-ink border border-line hover:bg-surface-muted",
        ghost: "bg-transparent text-ink-secondary hover:bg-surface-muted",
        danger: "bg-danger text-white hover:brightness-95",
      },
      size: {
        default: "h-[42px] px-[18px]",
        sm: "h-9 px-3 text-[13px]",
        icon: "h-[42px] w-[42px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const { pending } = useFormStatus();
    const isLoading = loading || (!asChild && props.type !== "button" && pending);
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {/* asChild membungkus satu elemen (mis. <Link>) — Slot menolak anak ganda,
            jadi spinner hanya disisipkan untuk <button> biasa. */}
        {asChild ? (
          children
        ) : (
          <>
            {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
