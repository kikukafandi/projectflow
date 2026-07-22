"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { priorityLabels } from "@/lib/labels";
import { priorityScore, scoreToLevel } from "@/lib/priority";
import type { PriorityFactorsInput } from "@/lib/validations";

const POSITIVE = [
  ["businessValue", "Business Value"],
  ["urgency", "Urgency"],
  ["dependencyImportance", "Dependency"],
  ["clientImpact", "Client Impact"],
  ["revenueImpact", "Revenue Impact"],
] as const;
const NEGATIVE = [
  ["complexity", "Complexity"],
  ["effort", "Effort"],
  ["risk", "Risk"],
] as const;

type Factors = Record<string, number>;

export function PriorityFactorsForm({
  action,
}: {
  action: (values: PriorityFactorsInput) => Promise<{ error: string } | void>;
}) {
  const router = useRouter();
  const [f, setF] = useState<Factors>({
    businessValue: 3,
    urgency: 3,
    dependencyImportance: 3,
    clientImpact: 3,
    revenueImpact: 3,
    complexity: 3,
    effort: 3,
    risk: 3,
  });
  const [saving, setSaving] = useState(false);

  const score = priorityScore(f as never);
  const level = scoreToLevel(score);

  function Row({ k, label }: { k: string; label: string }) {
    return (
      <label className="flex items-center justify-between gap-3 py-1 text-sm">
        <span className="text-ink-secondary">{label}</span>
        <input
          type="range"
          min={1}
          max={5}
          value={f[k]}
          onChange={(e) => setF({ ...f, [k]: Number(e.target.value) })}
          className="w-32 accent-[#FF7A1A]"
        />
        <span className="tabular w-4 text-right">{f[k]}</span>
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[12px] font-medium uppercase text-ink-muted">Nilai (+)</div>
      {POSITIVE.map(([k, l]) => (
        <Row key={k} k={k} label={l} />
      ))}
      <div className="mt-2 text-[12px] font-medium uppercase text-ink-muted">Biaya (−)</div>
      {NEGATIVE.map(([k, l]) => (
        <Row key={k} k={k} label={l} />
      ))}

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-ink-muted">Skor</span>
          <span className="tabular text-lg font-semibold text-ink">{score}</span>
          <Badge tone={priorityLabels[level].tone}>{priorityLabels[level].label}</Badge>
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await action(
              Object.fromEntries(
                Object.entries(f).map(([k, v]) => [k, String(v)]),
              ) as unknown as PriorityFactorsInput,
            );
            setSaving(false);
            router.refresh();
          }}
        >
          {saving ? "Menyimpan…" : "Simpan Skor"}
        </Button>
      </div>
    </div>
  );
}
