import { cn } from "@/lib/utils";

/** Light table styling (DESIGN.MD §23): soft header, thin horizontal rows, hover. */
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-[#ECECE8] bg-surface">
      <table className="w-full min-w-[560px] text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-surface-soft text-[12px] uppercase tracking-wide text-ink-muted">
      {children}
    </thead>
  );
}

export function TH({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>
  );
}

export function TR({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr className={cn("border-t border-line hover:bg-surface-soft", className)}>
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
  ...props
}: React.ComponentProps<"td">) {
  return (
    <td className={cn("px-4 py-3.5 align-middle text-ink", className)} {...props}>
      {children}
    </td>
  );
}
