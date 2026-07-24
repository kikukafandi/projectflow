/** Server-side money math for RAB/quotation/invoice (PRD §17.6). All in IDR (no decimals used in UI). */

export function toNum(v: string | number | null | undefined): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export type RabTotalsInput = {
  items: {
    quantity?: string | number | null;
    unitPrice?: string | number | null;
  }[];
  discount?: string | number | null;
  taxPercent?: string | number | null;
  additionalCost?: string | number | null;
  profitPercent?: string | number | null;
};

export type RabTotals = {
  subtotal: number;
  afterDiscount: number;
  profit: number;
  tax: number;
  grandTotal: number;
};

/**
 * subtotal (biaya)  = Σ(qty × unitPrice)
 * afterDiscount     = subtotal − discount
 * profit            = afterDiscount × profitPercent%   (keuntungan, internal)
 * beforeTax         = afterDiscount + profit
 * tax               = beforeTax × taxPercent%
 * grandTotal (jual) = beforeTax + tax + additionalCost
 */
export function computeRabTotals(input: RabTotalsInput): RabTotals {
  const subtotal = input.items.reduce(
    (sum, it) => sum + toNum(it.quantity) * toNum(it.unitPrice),
    0,
  );
  const discount = toNum(input.discount);
  const afterDiscount = Math.max(0, subtotal - discount);
  const profit = afterDiscount * (toNum(input.profitPercent) / 100);
  const beforeTax = afterDiscount + profit;
  const tax = beforeTax * (toNum(input.taxPercent) / 100);
  const grandTotal = beforeTax + tax + toNum(input.additionalCost);
  return {
    subtotal: Math.round(subtotal),
    afterDiscount: Math.round(afterDiscount),
    profit: Math.round(profit),
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
