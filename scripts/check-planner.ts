/**
 * Self-check logika board & timeline. Jalankan: `npm run check:planner`
 * (Node 24 melucuti tipe sendiri, tidak perlu test runner).
 */
import assert from "node:assert/strict";
import { addDays, diffDays, dropOrder, todayISO } from "../lib/planner.ts";

const t = (id: string, status: string) => ({ id, status });
const ids = (r: { id: string }[] | null) => r?.map((x) => x.id).join(",") ?? null;

// Pindah antar kolom: disisipkan tepat di index tujuan.
const items = [t("a", "todo"), t("b", "todo"), t("c", "doing")];
assert.equal(ids(dropOrder(items, "a", "doing", 0)), "a,c");
assert.equal(ids(dropOrder(items, "a", "doing", 1)), "c,a");
assert.equal(dropOrder(items, "a", "doing", 9)?.[1].status, "doing");

// Urut ulang di kolom sendiri: index digeser karena kartu yang diseret ikut terhitung.
const col = [t("a", "todo"), t("b", "todo"), t("c", "todo")];
assert.equal(ids(dropOrder(col, "a", "todo", 2)), "b,a,c");
assert.equal(ids(dropOrder(col, "c", "todo", 0)), "c,a,b");
assert.equal(ids(dropOrder(col, "a", "todo", 3)), "b,c,a");

// Tidak berubah → null (tidak perlu memanggil server).
assert.equal(dropOrder(col, "a", "todo", 0), null);
assert.equal(dropOrder(col, "a", "todo", 1), null);
assert.equal(dropOrder(col, "hantu", "todo", 0), null);

// Tanggal: lewat pergantian bulan, tahun, dan hari kabisat.
assert.equal(addDays("2026-01-31", 1), "2026-02-01");
assert.equal(addDays("2026-12-31", 1), "2027-01-01");
assert.equal(addDays("2024-02-28", 1), "2024-02-29");
assert.equal(addDays("2026-03-01", -1), "2026-02-28");
assert.equal(diffDays("2026-03-01", "2026-02-01"), 28);
assert.equal(diffDays("2026-02-01", "2026-03-01"), -28);
assert.equal(diffDays("2026-08-13", "2026-08-13"), 0);

// Timeline dipakai di Asia/Jakarta (UTC+7): tanggal lokal, bukan UTC.
assert.equal(todayISO(new Date(2026, 7, 13, 6, 0)), "2026-08-13");
assert.equal(todayISO(new Date(2026, 0, 1, 23, 30)), "2026-01-01");

console.log("planner OK");
