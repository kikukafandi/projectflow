"use client";

import { AlertTriangle, CalendarPlus, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { priorityLabels, taskStatus, type Tone } from "@/lib/labels";
import { addDays, diffDays, todayISO } from "@/lib/planner";
import { cn, formatDate } from "@/lib/utils";

export type TimelineTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  startDate: string | null;
  deadline: string | null;
};

const LEFT = 240; // lebar kolom nama task
const ZOOMS = [16, 24, 36, 56];

const barTone: Record<Tone, string> = {
  gray: "bg-ink-muted text-white",
  blue: "bg-info text-white",
  green: "bg-success text-white",
  yellow: "bg-warning text-ink",
  red: "bg-danger text-white",
  purple: "bg-purple text-white",
  orange: "bg-primary text-white",
  cyan: "bg-cyan text-white",
};

const MONTHS = "Jan Feb Mar Apr Mei Jun Jul Agu Sep Okt Nov Des".split(" ");

export function TaskTimeline({
  projectId,
  tasks,
  projectDeadline,
  setDates,
}: {
  projectId: string;
  tasks: TimelineTask[];
  projectDeadline: string | null;
  setDates: (
    taskId: string,
    startDate: string | null,
    deadline: string | null,
  ) => Promise<{ error: string } | void>;
}) {
  const [rows, patch] = useOptimistic<
    TimelineTask[],
    { id: string; start: string; end: string }
  >(tasks, (state, p) =>
    state.map((t) =>
      t.id === p.id ? { ...t, startDate: p.start, deadline: p.end } : t,
    ),
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dayW, setDayW] = useState(36);
  const [preview, setPreview] = useState<{
    id: string;
    start: string;
    end: string;
  } | null>(null);
  const previewRef = useRef(preview);
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = todayISO();
  const scheduled = rows
    .filter((t) => t.startDate || t.deadline)
    .map((t) => ({
      ...t,
      start: (t.startDate ?? t.deadline) as string,
      end: (t.deadline ?? t.startDate) as string,
    }))
    .sort((a, b) => a.start.localeCompare(b.start));
  const unscheduled = rows.filter((t) => !t.startDate && !t.deadline);

  const marks = scheduled.flatMap((t) => [t.start, t.end]).concat(today);
  if (projectDeadline) marks.push(projectDeadline);
  const rangeStart = addDays(marks.reduce((a, b) => (a < b ? a : b)), -3);
  const rangeEnd = addDays(marks.reduce((a, b) => (a > b ? a : b)), 14);
  const days = Math.min(diffDays(rangeEnd, rangeStart) + 1, 400);
  const grid = Array.from({ length: days }, (_, i) => {
    const d = addDays(rangeStart, i);
    const wd = new Date(`${d}T00:00:00Z`).getUTCDay();
    return { d, wd, dom: Number(d.slice(8)), month: Number(d.slice(5, 7)) - 1 };
  });
  const x = (d: string) => diffDays(d, rangeStart) * dayW;

  function commit(id: string, start: string, end: string) {
    startTransition(async () => {
      patch({ id, start, end });
      const res = await setDates(id, start, end);
      setError(res?.error ?? null);
    });
  }

  function beginDrag(
    e: React.PointerEvent,
    row: { id: string; start: string; end: string },
    mode: "move" | "start" | "end",
  ) {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const s0 = row.start;
    const e0 = row.end;

    const onMove = (ev: PointerEvent) => {
      const d = Math.round((ev.clientX - x0) / dayW);
      let s = s0;
      let en = e0;
      if (mode === "move") {
        s = addDays(s0, d);
        en = addDays(e0, d);
      } else if (mode === "start") {
        s = addDays(s0, d);
        if (s > en) s = en;
      } else {
        en = addDays(e0, d);
        if (en < s) en = s;
      }
      const next = { id: row.id, start: s, end: en };
      previewRef.current = next;
      setPreview(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const p = previewRef.current;
      previewRef.current = null;
      setPreview(null);
      if (p && (p.start !== s0 || p.end !== e0)) commit(p.id, p.start, p.end);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const zoomBy = (dir: -1 | 1) => {
    const i = ZOOMS.indexOf(dayW);
    setDayW(ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i + dir))] ?? dayW);
  };
  const goToday = () =>
    scrollRef.current?.scrollTo({
      left: Math.max(0, x(today) - 160),
      behavior: "smooth",
    });

  // Label bulan: satu sel per bulan, selebar jumlah harinya di rentang ini.
  const months: { label: string; span: number }[] = [];
  for (const g of grid) {
    const label = `${MONTHS[g.month]} ${g.d.slice(0, 4)}`;
    const last = months[months.length - 1];
    if (last && last.label === label) last.span += 1;
    else months.push({ label, span: 1 });
  }

  return (
    <>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-[12px] bg-warning-soft px-3 py-2 text-[13px] text-[#a9760f]">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Tutup peringatan"
            className="rounded p-0.5 hover:bg-black/5"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={goToday}
          className="rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-ink border border-line hover:bg-surface-muted"
        >
          Hari ini
        </button>
        <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => zoomBy(-1)}
            aria-label="Perkecil skala waktu"
            className="rounded-full p-1.5 text-ink-secondary hover:bg-surface-muted disabled:opacity-40"
            disabled={dayW === ZOOMS[0]}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1)}
            aria-label="Perbesar skala waktu"
            className="rounded-full p-1.5 text-ink-secondary hover:bg-surface-muted disabled:opacity-40"
            disabled={dayW === ZOOMS[ZOOMS.length - 1]}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="text-[12px] text-ink-muted">
          Seret bar untuk menggeser jadwal, tarik ujungnya untuk mengubah durasi.
        </span>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
        <div ref={scrollRef} className="overflow-x-auto">
          <div style={{ width: LEFT + days * dayW }}>
            {/* Header: bulan + hari */}
            <div className="flex border-b border-line bg-surface-soft">
              <div className="sticky left-0 z-20 shrink-0 border-r border-line bg-surface-soft px-3 py-2 text-[12px] font-semibold text-ink-secondary" style={{ width: LEFT }}>
                Task
              </div>
              <div>
                <div className="flex">
                  {months.map((m, i) => (
                    <div
                      key={i}
                      style={{ width: m.span * dayW }}
                      className="shrink-0 border-r border-line px-2 py-1 text-[11px] font-semibold text-ink-secondary"
                    >
                      <span className="sticky left-[248px] whitespace-nowrap">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  {grid.map((g) => (
                    <div
                      key={g.d}
                      style={{ width: dayW }}
                      className={cn(
                        "shrink-0 py-1 text-center text-[10px] tabular",
                        g.wd === 0 || g.wd === 6
                          ? "bg-surface-muted text-ink-muted"
                          : "text-ink-secondary",
                        g.d === today && "bg-primary-soft font-bold text-primary",
                      )}
                    >
                      {dayW >= 24 ? g.dom : g.dom % 5 === 0 ? g.dom : ""}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Baris task + lapisan grid */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-0"
                style={{
                  left: LEFT,
                  backgroundImage: `repeating-linear-gradient(to right, var(--color-line) 0px, var(--color-line) 1px, transparent 1px, transparent ${dayW}px)`,
                }}
              >
                {grid.map((g) =>
                  g.wd === 0 || g.wd === 6 ? (
                    <div
                      key={g.d}
                      className="absolute inset-y-0 bg-surface-muted/50"
                      style={{ left: x(g.d), width: dayW }}
                    />
                  ) : null,
                )}
                {projectDeadline && (
                  <div
                    className="absolute inset-y-0 w-px border-l border-dashed border-danger"
                    style={{ left: x(projectDeadline) }}
                    title={`Deadline proyek: ${formatDate(projectDeadline)}`}
                  />
                )}
                <div
                  className="absolute inset-y-0 w-[2px] bg-primary/70"
                  style={{ left: x(today) }}
                />
              </div>

              {scheduled.map((t) => {
                const p = preview?.id === t.id ? preview : null;
                const start = p?.start ?? t.start;
                const end = p?.end ?? t.end;
                const tone = taskStatus[t.status]?.tone ?? "gray";
                return (
                  <div
                    key={t.id}
                    className="flex border-b border-line/70 last:border-b-0"
                  >
                    <div
                      className="sticky left-0 z-20 flex shrink-0 items-center gap-2 border-r border-line bg-surface px-3 py-2"
                      style={{ width: LEFT }}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          barTone[priorityLabels[t.priority]?.tone ?? "gray"],
                        )}
                      />
                      <Link
                        href={`/projects/${projectId}/tasks/${t.id}`}
                        className="truncate text-[13px] text-ink hover:text-primary"
                        title={t.title}
                      >
                        {t.title}
                      </Link>
                    </div>
                    <div className="relative h-11" style={{ width: days * dayW }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onPointerDown={(e) => beginDrag(e, { ...t, start, end }, "move")}
                        aria-label={`${t.title}: ${formatDate(start)} sampai ${formatDate(end)}`}
                        className={cn(
                          "group absolute top-1/2 flex h-7 -translate-y-1/2 touch-none select-none items-center rounded-[8px] px-2 shadow-sm transition-shadow hover:shadow-md",
                          barTone[tone],
                          p ? "cursor-grabbing ring-2 ring-primary/50" : "cursor-grab",
                        )}
                        style={{
                          left: x(start) + 1,
                          width: Math.max(dayW - 2, (diffDays(end, start) + 1) * dayW - 2),
                        }}
                      >
                        <span
                          onPointerDown={(e) => beginDrag(e, { ...t, start, end }, "start")}
                          className="absolute inset-y-0 left-0 w-2 cursor-ew-resize rounded-l-[8px] bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                        <span className="truncate text-[12px] font-medium">
                          {t.title}
                        </span>
                        <span
                          onPointerDown={(e) => beginDrag(e, { ...t, start, end }, "end")}
                          className="absolute inset-y-0 right-0 w-2 cursor-ew-resize rounded-r-[8px] bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                      {p && (
                        <div
                          className="absolute top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-[8px] bg-ink px-2 py-1 text-[11px] text-white shadow-md"
                          style={{
                            left: x(p.start) + (diffDays(p.end, p.start) + 1) * dayW + 8,
                          }}
                        >
                          {formatDate(p.start)} – {formatDate(p.end)} (
                          {diffDays(p.end, p.start) + 1} hari)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {unscheduled.length > 0 && (
        <div className="mt-4 rounded-[16px] border border-line bg-surface p-3">
          <p className="mb-2 px-1 text-[13px] font-semibold text-ink">
            Belum dijadwalkan ({unscheduled.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-[10px] border border-line bg-surface-soft py-1 pl-3 pr-1 text-[13px]"
              >
                <Link
                  href={`/projects/${projectId}/tasks/${t.id}`}
                  className="max-w-[240px] truncate text-ink hover:text-primary"
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  onClick={() => commit(t.id, today, addDays(today, 2))}
                  title="Jadwalkan mulai hari ini (3 hari)"
                  aria-label={`Jadwalkan ${t.title}`}
                  className="rounded-[8px] p-1.5 text-ink-muted hover:bg-surface-muted hover:text-primary"
                >
                  <CalendarPlus className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
