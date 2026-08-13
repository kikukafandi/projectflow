"use client";

import { AlertTriangle, Pencil, Plus, X } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { TaskMoveSelect } from "@/components/task-move-select";
import { priorityLabels, taskStatus, type Tone } from "@/lib/labels";
import { dropOrder } from "@/lib/planner";
import { cn, formatDate } from "@/lib/utils";

export type BoardTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  priorityScore: number;
  deadline: string | null;
  checkTotal: number;
  checkDone: number;
};

type Patch =
  | { type: "set"; items: BoardTask[] }
  | { type: "add"; item: BoardTask }
  | { type: "rename"; id: string; title: string };

const dotTone: Record<Tone, string> = {
  gray: "bg-ink-muted",
  blue: "bg-info",
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-danger",
  purple: "bg-purple",
  orange: "bg-primary",
  cyan: "bg-cyan",
};

export function TaskBoard({
  projectId,
  columns,
  tasks,
  move,
  quickAdd,
  rename,
  moveAction,
}: {
  projectId: string;
  columns: readonly string[];
  tasks: BoardTask[];
  move: (
    taskId: string,
    status: string,
    orderedIds: string[],
  ) => Promise<{ error: string } | void>;
  quickAdd: (
    status: string,
    title: string,
  ) => Promise<{ error: string } | void>;
  rename: (taskId: string, title: string) => Promise<void>;
  /** Fallback sentuh — server action lama berbasis form. */
  moveAction: (taskId: string, formData: FormData) => void;
}) {
  const [items, patch] = useOptimistic<BoardTask[], Patch>(
    tasks,
    (state, p) => {
      if (p.type === "set") return p.items;
      if (p.type === "add") return [...state, p.item];
      return state.map((t) =>
        t.id === p.id ? { ...t, title: p.title } : t,
      );
    },
  );
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<{ col: string; index: number } | null>(null);

  const colItems = (col: string) => items.filter((t) => t.status === col);

  function drop(col: string, index: number) {
    const id = dragId;
    setDragId(null);
    setOver(null);
    if (!id) return;
    const nextCol = dropOrder(items, id, col, index);
    if (!nextCol) return;
    const next = [
      ...items.filter((t) => t.status !== col && t.id !== id),
      ...nextCol,
    ];

    startTransition(async () => {
      patch({ type: "set", items: next });
      const res = await move(
        id,
        col,
        nextCol.map((t) => t.id),
      );
      setError(res?.error ?? null);
    });
  }

  /** Alternatif keyboard: kartu fokus + panah kiri/kanan pindah kolom. */
  function moveByKey(task: BoardTask, dir: -1 | 1) {
    const i = columns.indexOf(task.status);
    const col = columns[i + dir];
    if (!col) return;
    const nextCol = [...colItems(col), { ...task, status: col }];
    const next = [
      ...items.filter((t) => t.status !== col && t.id !== task.id),
      ...nextCol,
    ];
    startTransition(async () => {
      patch({ type: "set", items: next });
      const res = await move(
        task.id,
        col,
        nextCol.map((t) => t.id),
      );
      setError(res?.error ?? null);
    });
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

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const ct = colItems(col);
          const active = dragId !== null && over?.col === col;
          return (
            <div key={col} className="w-[300px] shrink-0">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    dotTone[taskStatus[col]?.tone ?? "gray"],
                  )}
                />
                <span className="text-sm font-semibold text-ink">
                  {taskStatus[col]?.label ?? col}
                </span>
                <span className="ml-auto rounded-full bg-surface-muted px-2 py-0.5 text-[12px] text-ink-muted tabular">
                  {ct.length}
                </span>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(col, over?.col === col ? over.index : ct.length)}
                className={cn(
                  "space-y-2 rounded-[16px] p-2 transition-colors",
                  active
                    ? "bg-primary-soft ring-2 ring-primary/25"
                    : "bg-surface-muted/60",
                )}
              >
                {ct.map((t, idx) => (
                  <div key={t.id}>
                    <DropLine show={over?.col === col && over.index === idx} />
                    <Card
                      task={t}
                      projectId={projectId}
                      dragging={dragId === t.id}
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOver(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        const r = e.currentTarget.getBoundingClientRect();
                        const i = idx + (e.clientY > r.top + r.height / 2 ? 1 : 0);
                        // dragover menyala terus — jangan render ulang kalau posisinya sama.
                        setOver((p) =>
                          p?.col === col && p.index === i ? p : { col, index: i },
                        );
                      }}
                      onKeyMove={(dir) => moveByKey(t, dir)}
                      onRename={(title) =>
                        startTransition(async () => {
                          patch({ type: "rename", id: t.id, title });
                          await rename(t.id, title);
                        })
                      }
                      moveAction={(fd) => moveAction(t.id, fd)}
                    />
                  </div>
                ))}

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver((p) =>
                      p?.col === col && p.index === ct.length
                        ? p
                        : { col, index: ct.length },
                    );
                  }}
                  className="min-h-[8px]"
                >
                  <DropLine show={over?.col === col && over.index === ct.length} />
                  {ct.length === 0 && !active && (
                    <p className="px-2 py-5 text-center text-[12px] text-ink-muted">
                      Kosong
                    </p>
                  )}
                </div>

                <QuickAdd
                  onAdd={(title) =>
                    startTransition(async () => {
                      patch({
                        type: "add",
                        item: {
                          id: `tmp-${Date.now()}`,
                          title,
                          status: col,
                          priority: "medium",
                          priorityScore: 0,
                          deadline: null,
                          checkTotal: 0,
                          checkDone: 0,
                        },
                      });
                      const res = await quickAdd(col, title);
                      setError(res?.error ?? null);
                    })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DropLine({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-[3px] rounded-full transition-all",
        show ? "mb-2 bg-primary" : "h-0 bg-transparent",
      )}
    />
  );
}

function Card({
  task,
  projectId,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onKeyMove,
  onRename,
  moveAction,
}: {
  task: BoardTask;
  projectId: string;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onKeyMove: (dir: -1 | 1) => void;
  onRename: (title: string) => void;
  moveAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);
  const temp = task.id.startsWith("tmp-");

  return (
    <div
      draggable={!editing && !temp}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      tabIndex={0}
      onKeyDown={(e) => {
        if (editing) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onKeyMove(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          onKeyMove(1);
        }
      }}
      aria-label={`${task.title} — ${taskStatus[task.status]?.label ?? task.status}. Panah kiri/kanan untuk pindah kolom.`}
      className={cn(
        "group rounded-[12px] border border-line bg-surface p-3 shadow-sm transition-[box-shadow,opacity,transform] duration-150",
        temp ? "opacity-60" : "cursor-grab active:cursor-grabbing",
        dragging
          ? "opacity-40 ring-2 ring-primary/40"
          : "hover:shadow-md focus-visible:shadow-md",
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Badge tone={priorityLabels[task.priority]?.tone ?? "gray"}>
          {priorityLabels[task.priority]?.label ?? task.priority}
        </Badge>
        {task.priorityScore !== 0 && (
          <span className="text-[11px] text-ink-muted">
            skor {task.priorityScore}
          </span>
        )}
        {!temp && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Ubah judul"
            className="ml-auto rounded p-1 text-ink-muted opacity-0 transition-opacity hover:bg-surface-muted hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <input
          autoFocus
          defaultValue={task.title}
          onBlur={(e) => {
            setEditing(false);
            const v = e.target.value.trim();
            if (v && v !== task.title) onRename(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              e.currentTarget.value = task.title;
              e.currentTarget.blur();
            }
          }}
          className="w-full rounded-[8px] border border-primary bg-surface px-2 py-1 text-sm text-ink focus:outline-none"
        />
      ) : temp ? (
        <span className="line-clamp-2 text-sm font-medium text-ink">
          {task.title}
        </span>
      ) : (
        <Link
          href={`/projects/${projectId}/tasks/${task.id}`}
          draggable={false}
          className="line-clamp-2 text-sm font-medium text-ink hover:text-primary"
        >
          {task.title}
        </Link>
      )}

      <div className="mt-2 flex items-center gap-3 text-[12px] text-ink-muted">
        {task.deadline && <span>{formatDate(task.deadline)}</span>}
        {task.checkTotal > 0 && (
          <span>
            {task.checkDone}/{task.checkTotal} checklist
          </span>
        )}
      </div>

      {/* Sentuh tidak mendukung HTML5 drag — dropdown lama tetap dipakai di mobile. */}
      {!temp && (
        <div className="mt-2 sm:hidden">
          <TaskMoveSelect current={task.status} action={moveAction} />
        </div>
      )}
    </div>
  );
}

function QuickAdd({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-[10px] px-2 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
      >
        <Plus className="size-4" /> Tambah task
      </button>
    );
  }
  return (
    <form
      action={() => {
        const v = ref.current?.value.trim() ?? "";
        if (!v) return setOpen(false);
        onAdd(v);
        if (ref.current) ref.current.value = "";
        ref.current?.focus();
      }}
    >
      <input
        ref={ref}
        autoFocus
        placeholder="Judul task, Enter untuk simpan"
        onBlur={(e) => {
          if (!e.target.value.trim()) setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="w-full rounded-[10px] border border-primary bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
      />
    </form>
  );
}
