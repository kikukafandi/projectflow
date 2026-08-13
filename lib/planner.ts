/**
 * Logika murni di balik board & timeline: hitung urutan hasil drop, dan
 * aritmetika tanggal `YYYY-MM-DD`. Dipisah dari komponen supaya bisa diuji
 * tanpa DOM — lihat `scripts/check-planner.ts`.
 */

const DAY = 86400000;

const ms = (d: string) => Date.parse(`${d}T00:00:00Z`);
const isoOf = (n: number) => new Date(n).toISOString().slice(0, 10);

export const addDays = (d: string, n: number) => isoOf(ms(d) + n * DAY);
export const diffDays = (a: string, b: string) => Math.round((ms(a) - ms(b)) / DAY);

/** Tanggal hari ini di zona waktu pengguna (bukan UTC) — PRD §33. */
export function todayISO(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/**
 * Urutan baru kolom tujuan setelah sebuah kartu dijatuhkan di posisi `index`
 * (index dihitung pada daftar yang TERLIHAT, jadi masih memuat kartu yang
 * diseret). Mengembalikan null kalau posisinya tidak berubah.
 */
export function dropOrder<T extends { id: string; status: string }>(
  items: T[],
  id: string,
  col: string,
  index: number,
): T[] | null {
  const task = items.find((t) => t.id === id);
  if (!task) return null;

  const shown = items.filter((t) => t.status === col);
  const from = shown.findIndex((t) => t.id === id);
  let at = Math.max(0, Math.min(index, shown.length));
  if (from !== -1 && from < at) at -= 1;
  if (from === at && task.status === col) return null;

  const rest = shown.filter((t) => t.id !== id);
  return [...rest.slice(0, at), { ...task, status: col }, ...rest.slice(at)];
}
