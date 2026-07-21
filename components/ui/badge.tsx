import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/labels";

const toneClasses: Record<Tone, string> = {
  gray: "bg-surface-muted text-ink-secondary",
  blue: "bg-info-soft text-info",
  green: "bg-success-soft text-success",
  yellow: "bg-warning-soft text-[#a9760f]",
  red: "bg-danger-soft text-danger",
  purple: "bg-purple-soft text-purple",
  orange: "bg-primary-soft text-primary-active",
  cyan: "bg-cyan-soft text-cyan",
};

/** Pill badge (DESIGN.MD §24). Pastel tones, never harshly contrasted. */
export function Badge({
  tone = "gray",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Looks up a status map entry ({label, tone}) and renders a Badge. */
export function StatusBadge({
  map,
  value,
}: {
  map: Record<string, { label: string; tone: Tone }>;
  value: string;
}) {
  const entry = map[value] ?? { label: value, tone: "gray" as Tone };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
