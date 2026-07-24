/* eslint-disable @next/next/no-img-element */
import type { BusinessProfile, DocData } from "@/lib/documents";
import { toNum } from "@/lib/money";
import { formatIDR } from "@/lib/utils";

/**
 * A4 document sheet (PRD §27). Print-only styling lives in globals.css under
 * `@media print`; on screen this renders the same sheet centered on the page.
 */
export function DocumentPaper({
  profile,
  doc,
}: {
  profile: BusinessProfile | null;
  doc: DocData;
}) {
  const accent = profile?.primaryColor || "#FF7A1A";
  const address = [
    profile?.address,
    [profile?.city, profile?.province, profile?.postalCode]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);
  const contact = [profile?.phone || profile?.whatsapp, profile?.email, profile?.website]
    .filter(Boolean)
    .join(" · ");
  const hasUnitColumn = doc.sections.some((s) =>
    s.items.some((i) => toNum(i.quantity) !== 1 || i.unit),
  );

  return (
    <article className="doc-sheet mx-auto bg-white text-ink">
      <header
        className="flex items-start justify-between gap-6 border-b-2 pb-4"
        style={{ borderColor: accent }}
      >
        <div className="flex items-start gap-3">
          {profile?.logoUrl && (
            <img src={profile.logoUrl} alt="" className="h-12 w-auto object-contain" />
          )}
          <div>
            <div className="text-[17px] font-semibold leading-tight">
              {profile?.businessName ?? "Business Profile belum diisi"}
            </div>
            {profile?.slogan && (
              <div className="text-[11px] text-ink-muted">{profile.slogan}</div>
            )}
            {address.map((line) => (
              <div key={line} className="text-[11px] text-ink-secondary">
                {line}
              </div>
            ))}
            {contact && (
              <div className="text-[11px] text-ink-secondary">{contact}</div>
            )}
            {profile?.npwp && (
              <div className="text-[11px] text-ink-secondary">NPWP: {profile.npwp}</div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-[20px] font-semibold uppercase leading-tight"
            style={{ color: accent }}
          >
            {doc.docLabel}
          </div>
          <div className="tabular text-[13px] font-medium">{doc.number}</div>
        </div>
      </header>

      <section className="mt-5 flex justify-between gap-8">
        <div className="min-w-0">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-ink-muted">
            Kepada
          </div>
          {doc.recipient ? (
            <>
              <div className="text-[13px] font-semibold">{doc.recipient.name}</div>
              {doc.recipient.lines.map((l) => (
                <div key={l} className="text-[11.5px] text-ink-secondary">
                  {l}
                </div>
              ))}
            </>
          ) : (
            <div className="text-[11.5px] text-ink-muted">—</div>
          )}
        </div>
        <dl className="shrink-0 text-right text-[11.5px]">
          {doc.meta.map((m) => (
            <div key={m.label} className="flex justify-end gap-3">
              <dt className="text-ink-muted">{m.label}</dt>
              <dd className="min-w-[110px] text-left font-medium">{m.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <table className="mt-5 w-full border-collapse text-[11.5px]">
        <thead>
          <tr style={{ background: accent + "1a" }}>
            <th className="w-8 border border-line px-2 py-1.5 text-left font-semibold">
              #
            </th>
            <th className="border border-line px-2 py-1.5 text-left font-semibold">
              Uraian
            </th>
            {hasUnitColumn && (
              <>
                <th className="w-16 border border-line px-2 py-1.5 text-right font-semibold">
                  Qty
                </th>
                <th className="w-20 border border-line px-2 py-1.5 text-left font-semibold">
                  Satuan
                </th>
              </>
            )}
            <th className="w-32 border border-line px-2 py-1.5 text-right font-semibold">
              Harga
            </th>
            <th className="w-32 border border-line px-2 py-1.5 text-right font-semibold">
              Jumlah
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.sections.map((section, si) => (
            <SectionRows
              key={section.name + si}
              section={section}
              hasUnitColumn={hasUnitColumn}
              showHeading={doc.sections.length > 1 || Boolean(section.name)}
              accent={accent}
            />
          ))}
        </tbody>
      </table>

      <section className="mt-4 flex justify-end">
        <dl className="w-full max-w-[280px] text-[12px]">
          {doc.totals.map((t) => (
            <div
              key={t.label}
              className={
                "flex justify-between py-1 " +
                (t.strong ? "border-t border-line font-semibold" : "")
              }
            >
              <dt className={t.strong ? "" : "text-ink-secondary"}>{t.label}</dt>
              <dd className="tabular" style={t.strong ? { color: accent } : undefined}>
                {t.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {doc.amountInWords && (
        <p className="mt-3 rounded-[8px] bg-surface-muted px-3 py-2 text-[11.5px] italic">
          Terbilang: {doc.amountInWords}
        </p>
      )}

      {doc.bank && (
        <section className="mt-4 text-[11.5px]">
          <div className="mb-0.5 font-semibold">Pembayaran</div>
          <div className="text-ink-secondary">
            {doc.bank.bankName} · {doc.bank.accountNumber} a.n. {doc.bank.accountHolder}
          </div>
        </section>
      )}

      {doc.terms && (
        <section className="mt-4 text-[11.5px]">
          <div className="mb-0.5 font-semibold">Syarat & Ketentuan</div>
          <p className="whitespace-pre-line text-ink-secondary">{doc.terms}</p>
        </section>
      )}

      {(doc.notes || profile?.defaultNote) && (
        <section className="mt-4 text-[11.5px]">
          <div className="mb-0.5 font-semibold">Catatan</div>
          <p className="whitespace-pre-line text-ink-secondary">
            {doc.notes || profile?.defaultNote}
          </p>
        </section>
      )}

      <section className="mt-8 flex justify-end">
        <div className="w-56 text-center text-[11.5px]">
          <div className="text-ink-secondary">{doc.signedLabel},</div>
          {/* Stempel ~30mm (h-28 ≈ 112px @96dpi) mendekati ukuran cap asli.
              Ubah h-/w- bila stempelmu lebih besar/kecil. */}
          <div className="relative h-28">
            {profile?.stampUrl && (
              <img
                src={profile.stampUrl}
                alt=""
                className="absolute left-1/2 top-1 h-28 w-28 -translate-x-1/2 object-contain opacity-80"
              />
            )}
            {profile?.signatureUrl && (
              <img
                src={profile.signatureUrl}
                alt=""
                className="absolute left-1/2 top-4 h-20 w-auto -translate-x-1/2 object-contain"
              />
            )}
          </div>
          <div className="border-t border-line pt-1 font-medium">
            {profile?.ownerName ?? profile?.businessName ?? ""}
          </div>
          {/* Jabatan per jenis dokumen. Sengaja "Owner"/"Pemilik", BUKAN
              Direktur/CEO PT — dipakai hanya jika PT sudah resmi berdiri. */}
          {(() => {
            const isFinance =
              doc.docLabel === "Invoice" || doc.docLabel === "Kuitansi";
            const title = isFinance
              ? profile?.businessName
                ? `Pemilik ${profile.businessName}`
                : "Pemilik"
              : "Owner / Project Lead";
            return <div className="text-[10.5px] text-ink-secondary">{title}</div>;
          })()}
        </div>
      </section>

      {profile?.documentFooter && (
        <footer className="mt-6 border-t border-line pt-2 text-center text-[10.5px] text-ink-muted">
          {profile.documentFooter}
        </footer>
      )}
    </article>
  );
}

function SectionRows({
  section,
  hasUnitColumn,
  showHeading,
  accent,
}: {
  section: { name: string; items: DocData["sections"][number]["items"] };
  hasUnitColumn: boolean;
  showHeading: boolean;
  accent: string;
}) {
  const span = hasUnitColumn ? 6 : 4;
  return (
    <>
      {showHeading && section.name && (
        <tr>
          <td
            colSpan={span}
            className="border border-line px-2 py-1.5 text-[11.5px] font-semibold"
            style={{ background: accent + "0d" }}
          >
            {section.name}
          </td>
        </tr>
      )}
      {section.items.length === 0 ? (
        <tr>
          <td
            colSpan={span}
            className="border border-line px-2 py-2 text-center text-ink-muted"
          >
            Tidak ada item.
          </td>
        </tr>
      ) : (
        section.items.map((it, i) => (
          <tr key={it.name + i} className="break-inside-avoid">
            <td className="border border-line px-2 py-1.5 align-top text-ink-muted">
              {i + 1}
            </td>
            <td className="border border-line px-2 py-1.5 align-top">
              <div>{it.name}</div>
              {it.description && (
                <div className="text-[10.5px] text-ink-muted">{it.description}</div>
              )}
            </td>
            {hasUnitColumn && (
              <>
                <td className="tabular border border-line px-2 py-1.5 text-right align-top">
                  {Number(it.quantity ?? 1)}
                </td>
                <td className="border border-line px-2 py-1.5 align-top">
                  {it.unit ?? "—"}
                </td>
              </>
            )}
            <td className="tabular border border-line px-2 py-1.5 text-right align-top">
              {formatIDR(it.unitPrice)}
            </td>
            <td className="tabular border border-line px-2 py-1.5 text-right align-top">
              {formatIDR(it.subtotal)}
            </td>
          </tr>
        ))
      )}
    </>
  );
}
