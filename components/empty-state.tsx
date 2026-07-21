import type { LucideIcon } from "lucide-react";

/** Empty state (DESIGN.MD §26): icon, title, description, primary action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-line-strong bg-surface-soft px-6 py-16 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-7" strokeWidth={1.8} />
      </span>
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
