"use client";

import { useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Tombol submit yang minta konfirmasi dulu lewat <dialog> native.
 * Dipakai di dalam <form action={serverAction}> — tombol "Hapus" di dalam
 * dialog men-submit form induknya (dialog-nya masih anak dari form itu).
 */
export function ConfirmSubmit({
  title = "Yakin?",
  message,
  confirmLabel = "Hapus",
  children,
  ...props
}: ButtonProps & {
  title?: string;
  message: string;
  confirmLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button {...props} type="button" onClick={() => ref.current?.showModal()}>
        {children}
      </Button>
      <dialog
        ref={ref}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[16px] bg-surface p-5 text-ink shadow-lg backdrop:bg-black/40"
      >
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => ref.current?.close()}
          >
            Batal
          </Button>
          <Button type="submit" variant="danger" size="sm">
            {confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
