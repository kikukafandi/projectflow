import assert from "node:assert";
import { computeRabTotals } from "./money";

// Contoh dari desain: biaya 5,7jt, margin 30%, tanpa diskon/pajak.
const a = computeRabTotals({
  items: [{ quantity: 1, unitPrice: 5_700_000 }],
  profitPercent: 30,
});
assert.equal(a.subtotal, 5_700_000);
assert.equal(a.profit, 1_710_000);
assert.equal(a.grandTotal, 7_410_000);

// Urutan rumus: profit setelah diskon, pajak setelah profit.
const b = computeRabTotals({
  items: [{ quantity: 2, unitPrice: 1_000_000 }], // 2.000.000
  discount: 200_000, // → 1.800.000
  profitPercent: 50, // +900.000 → 2.700.000
  taxPercent: 10, // +270.000
  additionalCost: 30_000,
});
assert.equal(b.afterDiscount, 1_800_000);
assert.equal(b.profit, 900_000);
assert.equal(b.tax, 270_000);
assert.equal(b.grandTotal, 3_000_000);

// Margin 0 → harga jual = biaya (perilaku lama tak berubah).
const c = computeRabTotals({ items: [{ quantity: 1, unitPrice: 1_000_000 }] });
assert.equal(c.profit, 0);
assert.equal(c.grandTotal, 1_000_000);

console.log("money.test.ts OK");
