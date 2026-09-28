"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, type CSSProperties, type ReactNode } from "react";
import type { BusinessProfile, DocData } from "@/lib/documents";
import { toNum } from "@/lib/money";
import { formatIDR } from "@/lib/utils";

function validColor(value: string | null | undefined): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value));
}

export function DocumentPaper({
  profile,
  doc,
}: {
  profile: BusinessProfile | null;
  doc: DocData;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const accent = validColor(profile?.primaryColor) ? profile.primaryColor : "#FF7A1A";
  const address = [[profile?.city, profile?.province, profile?.postalCode].filter(Boolean).join(", ")].filter(Boolean);
  const contacts = [
    profile?.whatsapp ? `WhatsApp ${profile.whatsapp}` : null,
    profile?.phone && profile.phone !== profile.whatsapp ? `Telepon ${profile.phone}` : null,
    profile?.email,
    profile?.website,
  ].filter((value): value is string => Boolean(value));
  const showLogo = Boolean(profile?.logoUrl && profile.showLogoInDocumentHeader && !logoFailed);
  const hasUnitColumn = doc.sections.some((section) =>
    section.items.some((item) => toNum(item.quantity) !== 1 || item.unit),
  );
  const showPrice = doc.showPrice ?? true;
  const hasSignature = Boolean(profile?.signatureUrl || profile?.stampUrl || profile?.ownerName || profile?.businessName);

  return (
    <article className="doc-sheet mx-auto bg-white text-ink" style={{ "--document-accent": accent } as CSSProperties}>
      <header className="doc-header">
        <section className="doc-title-block">
          <h1>{doc.docLabel}</h1>
          <div className="doc-number">{doc.number}</div>

        </section>
        <dl className="doc-meta">
          {doc.meta.filter((item) => item.value && item.value !== "—").map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt><dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="doc-parties">
        <div className="doc-party">
          <div className="doc-kicker">Diterbitkan oleh</div>
          <div className="doc-brand">
            {showLogo ? (
              <img src={profile?.logoUrl ?? undefined} alt={profile?.businessName ?? "Logo bisnis"} className="doc-logo" onError={() => setLogoFailed(true)} />
            ) : profile?.businessName ? (
              <div className="doc-business-name">{profile.businessName}</div>
            ) : null}
            <div className="doc-contact">
              {profile?.slogan && <div className="doc-slogan">{profile.slogan}</div>}
              {address.map((line) => <div key={line}>{line}</div>)}
              {contacts.map((contact) => <div key={contact}>{contact}</div>)}
              {profile?.nib && <div>NIB {profile.nib}</div>}
              {profile?.showNpwpInDocumentHeader && profile.npwp && <div>NPWP {profile.npwp}</div>}
            </div>
          </div>
        </div>
        <div className="doc-recipient">
          <div className="doc-kicker">Kepada</div>
          {doc.recipient ? (
            <>
              <div className="doc-recipient-name">{doc.recipient.name}</div>
              {doc.recipient.lines.map((line) => <div key={line}>{line}</div>)}
            </>
          ) : <div className="doc-empty">Informasi penerima belum tersedia</div>}
        </div>
      </section>

      <table className="doc-items">
        <thead><tr>
          <th className="doc-col-number">#</th><th>Uraian</th>
          {hasUnitColumn && <><th className="doc-col-quantity">Qty</th><th className="doc-col-unit">Satuan</th></>}
          {showPrice && <><th className="doc-col-money">Harga</th><th className="doc-col-money">Jumlah</th></>}
        </tr></thead>
        <tbody>{doc.sections.map((section, index) => <SectionRows key={section.name + index} section={section} hasUnitColumn={hasUnitColumn} showPrice={showPrice} showHeading={doc.sections.length > 1 || Boolean(section.name)} />)}</tbody>
      </table>

      {showPrice && <section className="doc-totals"><dl>{doc.totals.map((total) => <div key={total.label} className={total.strong ? "doc-total-strong" : ""}><dt>{total.label}</dt><dd>{total.value}</dd></div>)}</dl></section>}
      {doc.amountInWords && <p className="doc-words"><span>Terbilang</span>{doc.amountInWords}</p>}
      {doc.bank && <DocumentSection title="Informasi Pembayaran"><p>{doc.bank.bankName} · {doc.bank.accountNumber} · a.n. {doc.bank.accountHolder}</p></DocumentSection>}
      {doc.terms && <DocumentSection title="Syarat & Ketentuan"><p className="whitespace-pre-line">{doc.terms}</p></DocumentSection>}
      {(doc.notes || profile?.defaultNote) && <DocumentSection title="Catatan"><p className="whitespace-pre-line">{doc.notes || profile?.defaultNote}</p></DocumentSection>}

      {hasSignature && <section className="doc-signature">
        <div>{doc.signedLabel},</div>
        <div className="doc-signature-media">
          {profile?.stampUrl && <img src={profile.stampUrl} alt="" className="doc-stamp" />}
          {profile?.signatureUrl && <img src={profile.signatureUrl} alt="Tanda tangan" className="doc-signature-image" />}
        </div>
        {(profile?.ownerName || profile?.businessName) && <div className="doc-signatory">{profile?.ownerName ?? profile?.businessName}</div>}
      </section>}
      {profile?.documentFooter && <footer className="doc-footer">{profile.documentFooter}</footer>}
    </article>
  );
}

function DocumentSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="doc-detail"><h2>{title}</h2>{children}</section>;
}

function SectionRows({ section, hasUnitColumn, showPrice, showHeading }: { section: { name: string; items: DocData["sections"][number]["items"] }; hasUnitColumn: boolean; showPrice: boolean; showHeading: boolean }) {
  const span = 2 + (hasUnitColumn ? 2 : 0) + (showPrice ? 2 : 0);
  return <>
    {showHeading && section.name && <tr className="doc-section-row"><td colSpan={span}>{section.name}</td></tr>}
    {section.items.length === 0 ? <tr><td colSpan={span} className="doc-empty-row">Tidak ada item.</td></tr> : section.items.map((item, index) => <tr key={item.name + index}>
      <td>{index + 1}</td><td><div className="doc-item-name">{item.name}</div>{item.description && <div className="doc-item-description">{item.description}</div>}</td>
      {hasUnitColumn && <><td className="doc-quantity">{Number(item.quantity ?? 1)}</td><td>{item.unit || ""}</td></>}
      {showPrice && <><td className="doc-money">{formatIDR(item.unitPrice)}</td><td className="doc-money">{formatIDR(item.subtotal)}</td></>}
    </tr>)}
    {showPrice && section.items.length > 0 && <tr className="doc-section-subtotal">
      <td colSpan={span - 1}>Subtotal section</td>
      <td className="doc-money">{formatIDR(section.items.reduce((sum, item) => sum + toNum(item.subtotal), 0))}</td>
    </tr>}
  </>;
}
