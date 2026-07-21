# ProjectFlow — Progress & Next Steps

Roadmap acuan untuk melanjutkan pembangunan. Ikuti PRD.MD (§46 fase) dan DESIGN.MD.
Setiap fase: selesaikan, jalankan `npm run typecheck` + `npm run build`, lalu commit.

## ✅ Selesai (Fase 0 + sebagian Fase 1)

- Scaffold Next.js 15 App Router + TypeScript + Tailwind v4 + design tokens (DESIGN.MD).
- Drizzle schema LENGKAP semua tabel PRD §35 (`db/schema/*`).
- Better Auth (email+password) — `lib/auth.ts`, login/register page.
- App shell: dark rounded sidebar, top header, mobile drawer + bottom nav (`components/`).
- UI primitives: Button, Input/Textarea/Select, Card, Badge/StatusBadge, Table, Field, EmptyState, PageHeader.
- Document numbering atomik (`lib/numbering.ts`), activity log (`lib/activity.ts`).
- **Clients** CRUD lengkap (list/new/detail/edit/archive) + riwayat proyek.
- **Projects** CRUD lengkap (list/new/detail/edit/archive) + header card + progress.
- Dashboard ringkas (metrics + proyek aktif + aktivitas).

## ⏭️ Belum dikerjakan — kerjakan berurutan

Konvensi yang SUDAH ada, ikuti persis (jangan bikin pola baru):
- Server action pattern: lihat `app/(app)/clients/actions.ts` (validate zod → db → logActivity → revalidatePath → redirect).
- Form pattern: `components/forms/client-form.tsx` (RHF + zodResolver, terima `action` prop).
- List pattern: tabel desktop + card list mobile (`app/(app)/clients/page.tsx`).
- Validasi di `lib/validations.ts`, label/tone di `lib/labels.ts`.
- Semua page yang query DB: `export const dynamic = "force-dynamic"`.

### Fase 1 sisa — Business Foundation
1. **Settings > Business Profile** — form dari tabel `businessProfiles` (satu baris). Reuse `Field`, server action upsert.
2. **Settings > Bank Accounts** — CRUD `businessBankAccounts`, satu `isPrimary`.
3. **Settings > Pricing & Productivity & Numbering** — simpan ke tabel `settings` (key/value JSON).

### Fase 2 — Feature Library
4. Categories → Modules → Features CRUD (`featureCategories/Modules/Items`), layout §19 (sidebar kategori + list + drawer). Checklist & DoD per fitur.

### Fase 3 — Scope & RAB
5. **Scope Builder** (§20 DESIGN): 3 panel desktop / stepper mobile. Snapshot fitur library → `projectFeatures` (PRD §37.1: SALIN, jangan referensi).
6. **RAB calc engine** — hitung subtotal/diskon/pajak/grand total DI SERVER (`rabs/rabSections/rabItems`), editor §21, ringkasan sticky.

### Fase 4 — Quotation
7. Quotation dari RAB, payment terms (validasi total = 100% / grand total), revisi (nomor -R1), approval manual mengunci versi (PRD §37.2).

### Fase 5 — Task & Produktivitas
8. Generate task dari scope, Task Board kanban (§16 DESIGN, kolom Backlog→Done), checklist wajib, dependensi.
9. Priority Score (PRD §21.3), WIP Limit (§22, default proyek 2 / task 2 / focus 3, override + alasan → activity log), Daily Focus (§23, max 3).

### Fase 6 — Finance
10. Invoice dari quotation/termin, partial invoice, status otomatis dari pembayaran.
11. Payment tracking (kurangi sisa tagihan, transaction untuk nominal), Receipt/kuitansi + terbilang otomatis.

### Fase 7 — Dashboard & Polishing + PDF
12. PDF generator (HTML template + print stylesheet, server-side) untuk RAB/Quotation/Invoice/Kuitansi — PRD §27.
13. Notification internal, Global search, Activity Log page, Vercel Blob file upload.

## Perintah verifikasi
```bash
npm run typecheck && npm run build
npm run db:push      # sinkron schema ke Neon
```

## Definition of Done per fitur (PRD §49)
Desktop OK, mobile tidak rusak, validasi client+server, empty/loading/error state, migration ada, build sukses.
