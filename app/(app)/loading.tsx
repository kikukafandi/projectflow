import { Loader2 } from "lucide-react";

/**
 * Loading antar-halaman untuk seluruh grup (app). Next menampilkan ini otomatis
 * saat navigasi ke rute mana pun di bawah sini sementara data server diambil,
 * jadi klik menu tidak lagi terasa diam. Shell (sidebar/header) tetap tampil.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink-secondary"
    >
      <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
      <span className="text-sm font-medium">Memuat…</span>
    </div>
  );
}
