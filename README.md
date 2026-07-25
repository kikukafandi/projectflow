# ProjectFlow

Aplikasi internal satu-pengguna untuk mengelola proyek jasa: dari klien → scope
pekerjaan → RAB → quotation → task → invoice → pembayaran → kuitansi. Dibangun
dengan Next.js 15 (App Router), Drizzle ORM, Postgres (Neon), dan Better Auth.

Acuan produk ada di `PRD.MD`, acuan visual di `DESIGN.MD`, status pengerjaan di
`NEXT_STEPS.md`. README ini fokus ke **cara menjalankan dan memakai** aplikasinya.

---

## 1. Menjalankan aplikasi

```bash
npm install
cp .env.example .env      # lalu isi nilainya (lihat di bawah)
npm run db:push           # bikin/sinkronkan tabel di database
npm run dev               # buka http://localhost:3000
```

Isi `.env`:

| Variabel | Isi |
|---|---|
| `DATABASE_URL` | Connection string Postgres/Neon (`postgresql://...?sslmode=require`) |
| `AUTH_SECRET` | Rahasia sesi. Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` saat lokal, domain asli saat production |

Perintah lain:

```bash
npm run build       # build production
npm run start       # jalankan hasil build
npm run typecheck   # cek TypeScript
npm run db:studio   # GUI untuk melihat isi database
```

**Login pertama kali:** buka `/login`, klik ke mode **daftar**, buat akun pemilik
(nama, email, password). Semua halaman selain `/login` butuh sesi ini. Tidak ada
data contoh — aplikasi mulai dari kosong, jadi ikuti urutan di bawah.

---

## 2. Setup awal (lakukan sekali, sebelum bikin proyek)

Buka **Settings** di sidebar dan isi berurutan:

1. **Business Profile** — nama usaha, alamat, kontak, dan URL logo / tanda tangan
   / stempel. Ini yang tercetak di RAB, quotation, invoice, dan kuitansi. Kalau
   dibiarkan kosong, dokumen tetap bisa dicetak tapi kop suratnya polos.
   *Catatan: gambar diisi lewat URL, belum ada fitur upload file.*
2. **Bank Accounts** — rekening tujuan pembayaran. Satu bisa ditandai utama, dan
   yang muncul di dokumen adalah rekening yang dipilih di sana.
3. **Pricing & Productivity** — tarif harian/jam default, pajak, diskon, dan
   **WIP limit** (default 2 = maksimal 2 task "in progress" sekaligus).
4. **Numbering** — format nomor dokumen (RAB, quotation, invoice, kuitansi).
   Nomor dibuat otomatis dan berurutan; ubah formatnya sebelum dokumen pertama
   terbit supaya tidak campur aduk.
5. **Feature Library** — isi Kategori → Modul → Fitur beserta estimasi dan harga.
   Ini bank pekerjaan yang nanti dipakai ulang di setiap proyek. Semakin lengkap,
   semakin cepat bikin scope proyek baru.

---

## 3. Alur kerja utama (urutan yang dimaksudkan)

### Langkah 1 — Klien
**Clients → Klien Baru.** Setelah tersimpan, halaman detail klien menampilkan
seluruh riwayat proyeknya.

### Langkah 2 — Proyek
**Projects → Proyek Baru**, pilih kliennya. Nomor/kode proyek dibuat otomatis.
Halaman detail proyek adalah pusat kendali: ada tab **Overview, Scope, RAB,
Quotations, Tasks**.

### Langkah 3 — Scope (tab **Scope**)
Menyusun apa saja yang dikerjakan:
- **Tambah dari Feature Library** — modul yang dipilih disalin (snapshot) ke
  proyek ini. Mengubah library nanti tidak mengubah proyek yang sudah jalan.
- **Tambah modul/fitur manual** — untuk pekerjaan yang belum ada di library.
- Tiap fitur bisa diedit, dihapus, dan punya status sendiri.

Scope adalah sumber untuk RAB **dan** untuk task. Selesaikan dulu di sini.

### Langkah 4 — RAB (tab **RAB**)
Klik **Generate dari Scope**. Semua fitur masuk jadi section + item dengan harga.
Di editor RAB kamu bisa menambah/mengubah item, memberi diskon, pajak, dan biaya
tambahan. **Semua total dihitung di server** — tidak usah menghitung manual.
Tombol **Cetak** membuka versi A4 siap print/PDF.

### Langkah 5 — Quotation (tab **Quotations**)
Klik **Generate Quotation** dari RAB yang dipilih. Lalu:
- Isi **termin pembayaran** (mis. DP 50%, pelunasan 50%). Aplikasi memperingatkan
  kalau jumlah termin tidak sama dengan grand total.
- **Revisi** membuat versi baru (`-R1`) dan menandai yang lama sebagai revised.
- **Approve** mengunci quotation (tidak bisa diedit lagi) dan mengisi nilai
  proyek di data proyek.

### Langkah 6 — Task (tab **Tasks**)
Klik **Generate dari Scope** untuk mengubah fitur jadi daftar pekerjaan, lalu
kerjakan lewat papan kanban (pindah kolom lewat dropdown di tiap task).
- Task punya **checklist**. Task tidak bisa ditandai *Done* kalau checklist
  wajibnya belum beres — ini disengaja.
- **WIP limit** menahan kamu mengerjakan terlalu banyak sekaligus; kalau memaksa,
  wajib mengisi alasan dan itu tercatat di Activity Log.
- **Priority Score** menghitung task mana yang paling mendesak.
- **Daily Focus** (sidebar) = maksimal 3 task lintas proyek untuk hari ini,
  dengan rekomendasi berdasarkan skor prioritas.

Progres proyek terisi otomatis dari task yang selesai.

### Langkah 7 — Invoice
Dua jalur:
- Dari quotation yang sudah approved: **Buat Invoice** (nilai penuh), atau tombol
  **Invoice** di baris termin (menagih satu termin saja).
- **Invoices → Invoice Baru** untuk tagihan manual di luar quotation.

Item invoice bisa ditambah/dihapus. Statusnya (draft → sent → partially paid →
paid / overdue) dihitung otomatis dari pembayaran yang tercatat.

### Langkah 8 — Pembayaran & kuitansi
Di halaman invoice, catat pembayaran masuk. Setiap pembayaran yang dikonfirmasi
otomatis membuat **kuitansi** lengkap dengan terbilang, dan sisa tagihan ikut
terhitung. Membatalkan pembayaran akan mem-void kuitansinya.
Halaman **Payments** menampilkan semua pembayaran lintas invoice.

---

## 4. Yang sering ditanyakan

**Bagaimana cara bikin PDF?**
Tekan tombol **Cetak** di RAB, quotation, invoice, atau kuitansi, lalu pilih
"Save as PDF" di dialog print browser. Halaman cetak sudah diformat A4.
Semua dokumen juga terkumpul di menu **Documents**.

**Kenapa data tidak bisa dihapus permanen?**
Data yang sudah dipakai di tempat lain diarsipkan, bukan dihapus, supaya riwayat
keuangan tidak rusak:
- Klien yang punya proyek/invoice → diarsipkan.
- Proyek yang punya invoice → diarsipkan.
- Invoice yang sudah terkirim atau sudah ada pembayarannya → di-void.

Yang belum terpakai bisa dihapus permanen, dan setiap tombol Hapus selalu minta
konfirmasi dulu. Data terarsip bisa dikembalikan lewat tombol **Kembalikan** di
halaman detailnya (proyek kembali ke status *draft*, karena status sebelum
diarsipkan tidak disimpan).

**Notifikasi datang dari mana?**
Dihitung ulang saat kamu membuka halaman (tidak ada cron): task telat/mendekati
deadline, WIP limit terlampaui, quotation mau kedaluwarsa, invoice jatuh tempo,
dan proyek yang 14 hari tidak ada aktivitas. Badge angka ada di header.

**Cari data cepat:** kotak pencarian di header mencakup klien, proyek, task,
feature library, quotation, dan invoice.

**Siapa mengubah apa:** semua aksi penting tercatat di **Activity Log**.

---

## 5. Batasan yang perlu diketahui

- **Satu pengguna.** Belum ada peran/tim; verifikasi email dimatikan.
- **Belum ada upload file.** Logo, tanda tangan, dan stempel diisi lewat URL.
- **Belum ada export spreadsheet RAB** (rencana ExcelJS).
- **PDF lewat print browser**, bukan file yang otomatis tersimpan di server.

---

## 6. Struktur folder singkat

```
app/(app)/       halaman aplikasi (butuh login) + server actions per modul
app/(auth)/      login & daftar
app/(print)/     halaman cetak A4, tanpa sidebar
components/      UI primitives (ui/), form (forms/), shell & navigasi
db/schema/       definisi tabel Drizzle
lib/             logika bersama: money, numbering, priority, notifications,
                 documents, terbilang, validations (zod), labels
drizzle/         file migrasi
```

Konvensi kalau kamu melanjutkan pengembangan: server action = validasi zod → db →
`logActivity` → `revalidatePath` → `redirect`; setiap halaman yang query DB pakai
`export const dynamic = "force-dynamic"`. Sebelum commit: `npm run typecheck &&
npm run build`.
