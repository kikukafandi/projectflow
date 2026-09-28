"use client";

import { Loader2, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

export function AddLibraryModuleButton({ name }: { name: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-sm transition hover:bg-surface-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Menambahkan…" : name}
      {pending ? <Loader2 className="size-4 animate-spin text-primary" /> : <Plus className="size-4 text-primary" />}
    </button>
  );
}
