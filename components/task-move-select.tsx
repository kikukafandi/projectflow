"use client";

import { useRef } from "react";
import { taskStatus } from "@/lib/labels";
import { taskStatusValues } from "@/lib/validations";

/** Auto-submitting status changer for a task card. Calls the bound moveTask action. */
export function TaskMoveSelect({
  current,
  action,
}: {
  current: string;
  action: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={action}>
      <select
        name="status"
        defaultValue={current}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label="Ubah status task"
        className="w-full rounded-[8px] border border-line bg-surface px-2 py-1 text-[12px] text-ink-secondary focus:border-primary focus:outline-none"
      >
        {taskStatusValues.map((s) => (
          <option key={s} value={s}>
            {taskStatus[s]?.label ?? s}
          </option>
        ))}
      </select>
    </form>
  );
}
