/** Indonesian number-to-words for receipts (PRD §26.3 "Nilai terbilang"). Integers only. */

const ONES = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

function below1000(n: number): string {
  if (n < 12) return ONES[n];
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const rest = n % 10;
    return `${ONES[tens]} puluh${rest ? " " + ONES[rest] : ""}`;
  }
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const head = hundreds === 1 ? "seratus" : `${ONES[hundreds]} ratus`;
  return `${head}${rest ? " " + below1000(rest) : ""}`;
}

export function terbilang(value: number | string): string {
  let n = Math.floor(Math.abs(Number(value) || 0));
  if (n === 0) return "nol";

  const scales: [number, string][] = [
    [1_000_000_000_000, "triliun"],
    [1_000_000_000, "miliar"],
    [1_000_000, "juta"],
    [1000, "ribu"],
  ];

  const parts: string[] = [];
  for (const [scale, name] of scales) {
    if (n >= scale) {
      const count = Math.floor(n / scale);
      n %= scale;
      // "seribu" not "satu ribu"
      if (scale === 1000 && count === 1) parts.push("seribu");
      else parts.push(`${below1000(count)} ${name}`);
    }
  }
  if (n > 0) parts.push(below1000(n));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** "Rp … rupiah" phrase for documents. */
export function terbilangRupiah(value: number | string): string {
  const words = terbilang(value);
  return `${words} rupiah`.replace(/^./, (c) => c.toUpperCase());
}

// ponytail: self-check the money-words path. Run: npx tsx lib/terbilang.ts
if (process.argv[1]?.endsWith("terbilang.ts")) {
  const cases: [number, string][] = [
    [0, "nol"],
    [11, "sebelas"],
    [21, "dua puluh satu"],
    [100, "seratus"],
    [1000, "seribu"],
    [1500, "seribu lima ratus"],
    [2000000, "dua juta"],
    [1250000, "satu juta dua ratus lima puluh ribu"],
  ];
  for (const [n, want] of cases) {
    const got = terbilang(n);
    if (got !== want) throw new Error(`terbilang(${n}) = "${got}", want "${want}"`);
  }
  console.log("terbilang self-check OK");
}
