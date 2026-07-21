/** Server-side money math for RAB/quotation/invoice (PRD §17.6). All in IDR (no decimals used in UI). */

export function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export type RabTotalsInput = {
  items: { quantity: string | number | null; unitPrice: string | number | null }[];
  discount?: string | number | null;
  taxPercent?: string | number | null;
  additionalCost?: string | number | null;
};

export type RabTotals = {
  subtotal: number;
  afterDiscount: number;
  tax: number;
  grandTotal: number;
};

/**
 * subtotal = Σ(qty × unitPrice)
 * afterDiscount = subtotal − discount
 * tax = afterDiscount × taxPercent%
 * grandTotal = afterDiscount + tax + additionalCost
 */
export function computeRabTotals(input: RabTotalsInput): RabTotals {
  const subtotal = input.items.reduce(
    (sum, it) => sum + toNum(it.quantity) * toNum(it.unitPrice),
    0,
  );
  const discount = toNum(input.discount);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * (toNum(input.taxPercent) / 100);
  const grandTotal = afterDiscount + tax + toNum(input.additionalCost);
  return {
    subtotal: Math.round(subtotal),
    afterDiscount: Math.round(afterDiscount),
    tax: Math.round(tax),
    grandTotal: Math.round(grandTotal),
  };
}

/** Line subtotal = qty × unitPrice, rounded. */
export function lineSubtotal(
  quantity: string | number | null,
  unitPrice: string | number | null,
): number {
  return Math.round(toNum(quantity) * toNum(unitPrice));
}
