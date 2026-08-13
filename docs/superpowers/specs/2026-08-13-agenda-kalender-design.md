# Agenda & Kalender Kerja — Design

Tanggal: 2026-08-13
Status: disetujui untuk implementasi

## Masalah

ProjectFlow hanya bisa menjadwalkan pekerjaan yang menempel pada satu proyek.
`tasks.projectId` adalah `NOT NULL` (`db/schema/tasks.ts:18`), jadi meeting klien,
survei lokasi, atau agenda kerja lain tidak punya tempat di data model. Akibatnya
jadwal harian pengguna terpecah antara ProjectFlow dan kalender lain, dan beban
waktu yang sebenarnya tidak terlihat saat memilih task.

PRD.MD tidak menyebut meeting, agenda, maupun kalender — ini konsep baru.

## Keputusan yang sudah diambil

| Pertanyaan | Jawaban |
|---|---|
| Cakupan | ProjectFlow jadi kalender kerja utama — semua agenda kerja, tidak hanya yang terkait klien/proyek |
| Ketelitian waktu | Jam mulai + jam selesai, supaya bentrok terdeteksi |
| Agenda berulang | Belum perlu |
| Muncul di mana lagi | Daily Focus dan Dashboard. Bukan notifikasi, bukan halaman klien/proyek |

## Batasan yang diterima sejak awal

**Tidak ada pengingat aktif.** Notifikasi di app ini diturunkan saat halaman
dibuka (`lib/notifications.ts`) — tidak ada cron. Agenda hanya terlihat kalau app
dibuka. Kalau nanti butuh diingatkan 15 menit sebelum meeting, jalannya adalah
ekspor ICS ke kalender HP, bukan menambah notifikasi internal.

## Alternatif yang ditolak

**Numpang tabel `tasks`** (`projectId` dijadikan nullable + kolom `kind` + jam).
Terlihat lebih hemat, tapi `projectId` di-join ke `projects` di hampir semua query
task — `/tasks`, board, timeline, Daily Focus, notifikasi, priority score.
Melonggarkannya menyentuh semuanya demi menampung barang yang secara konsep bukan
task (meeting tidak punya checklist wajib, skor prioritas, atau WIP limit).
Diff lebih besar dari membuat tabel baru, dan risikonya jatuh ke Fase 5–8 yang baru
selesai.

**Tarik feed ICS dari Google Calendar, tidak bikin apa-apa.** Memberi pengingat
beneran di HP, tapi agenda tidak bisa dibuat dari dalam app — bertentangan dengan
keputusan "kalender kerja utama".

## Data

Satu tabel baru, `events`, di `db/schema/` (file baru `events.ts`, diekspor lewat
`db/schema/index.ts`):

```
events
  id          uuid pk
  title       text        NOT NULL
  eventDate   date        NOT NULL
  startTime   time        NOT NULL
  endTime     time        NOT NULL
  location    text        NULL
  notes       text        NULL
  clientId    uuid        NULL  → clients.id   (on delete set null)
  projectId   uuid        NULL  → projects.id  (on delete set null)
  createdAt / updatedAt          (…timestamps dari _shared.ts)
```

### Kenapa `date` + `time`, bukan `timestamptz`

Seluruh app sudah memperlakukan tanggal sebagai string lokal (`tasks.deadline`,
`tasks.startDate`, `dailyFocusItems.focusDate` semuanya `date`), dan ini app satu
pengguna di satu zona waktu (Asia/Jakarta, PRD §33). `timestamptz` memaksa konversi
UTC di setiap render; server produksi berjalan di UTC, sehingga "meeting 14:00"
berisiko tampil sebagai 07:00. Dengan `date` + `time` tidak ada konversi sama sekali.

Konsekuensi yang diterima: agenda tidak bisa melewati tengah malam. Untuk agenda
kerja ini batasan yang sehat.

`clientId` dan `projectId` sengaja opsional — agenda tanpa kaitan proyek harus tetap
bisa dibuat.

Migration dihasilkan lewat `npm run db:generate` (menjadi `drizzle/0005_*.sql`).

## Logika murni — `lib/agenda.ts`

Semua perhitungan yang tidak menyentuh DB atau React, mengikuti pola `lib/planner.ts`:

- `overlaps(a, b)` — dua agenda pada tanggal sama yang rentang jamnya beririsan.
  Bersentuhan ujung (10:00–11:00 dan 11:00–12:00) **bukan** bentrok.
- `findConflicts(event, others)` — daftar agenda yang bentrok dengan satu agenda.
- `layoutDay(events)` — tata letak blok yang bertumpuk: agenda yang beririsan dibagi
  jadi kolom berdampingan, masing-masing dapat `column` dan `columnCount`.
- `weekDays(anchorDate)` — 7 tanggal dari Senin minggu yang memuat `anchorDate`.
- `minutesFromMidnight(time)` — untuk memposisikan blok pada grid jam.

Self-check berbasis `assert` di `scripts/check-agenda.ts`, dijalankan lewat
`npm run check:agenda` — mengikuti `scripts/check-planner.ts` yang sudah ada.
Kasus yang wajib ada di self-check: bersentuhan ujung bukan bentrok, tumpang tindih
sebagian terdeteksi, satu agenda memuat agenda lain terdeteksi, tiga agenda
bertumpuk menghasilkan tiga kolom, dan `weekDays` selalu mulai Senin.

## Validasi — `lib/validations.ts`

`eventSchema` ditambahkan mengikuti gaya skema yang sudah ada di file itu:

- `title` wajib, tidak boleh string kosong
- `eventDate` wajib
- `startTime`, `endTime` wajib, format `HH:MM`
- `endTime` harus lebih besar dari `startTime` (`.refine`, pesan bahasa Indonesia)
- `location`, `notes` opsional (`optionalStr`)
- `clientId`, `projectId` opsional

Divalidasi di client (RHF + zodResolver) dan diulang di server action — sesuai
konvensi yang sudah berjalan.

## Halaman `/calendar`

Route group `(app)`, `export const dynamic = "force-dynamic"` seperti semua halaman
yang query DB.

**Desktop — tampilan minggu.** Grid 7 kolom hari × baris jam 07:00–21:00. Agenda
jadi blok berposisi absolut, tinggi sebanding durasi, kolom berdampingan saat
bertumpuk (dari `layoutDay`). Garis penanda jam sekarang pada kolom hari ini.
Klik slot kosong membuka form dengan tanggal dan jam sudah terisi.

**Mobile — daftar per hari.** Grid jam tidak terbaca di layar sempit, jadi turun jadi
daftar agenda dikelompokkan per tanggal. Ini pola tabel-desktop/kartu-mobile yang
sudah dipakai di seluruh app (`app/(app)/clients/page.tsx`).

**Navigasi minggu** lewat searchParam `?week=YYYY-MM-DD`, tombol minggu sebelumnya /
berikutnya / hari ini. Tanpa state client, konsisten dengan `?view=` dan `?status=`
yang sudah dipakai.

**Bentrok** ditampilkan sebagai peringatan pada form dan penanda pada blok — tidak
memblokir simpan. Double-booking kadang disengaja.

## Server actions — `app/(app)/calendar/actions.ts`

`createEvent`, `updateEvent`, `deleteEvent`, masing-masing mengikuti pola
`app/(app)/clients/actions.ts` persis:

```
requireUser() → eventSchema.safeParse → db → logActivity → revalidatePath
```

Action baru di activity log: `event.created`, `event.updated`, `event.deleted`,
dengan label bahasa Indonesia ditambahkan ke `lib/labels.ts` (sekitar baris 168,
tempat label aksi lain berada).

## Form — `components/forms/event-form.tsx`

RHF + zodResolver, menerima prop `action`, mengikuti `components/forms/client-form.tsx`.
Field: judul, tanggal, jam mulai, jam selesai, lokasi, catatan, klien (opsional),
proyek (opsional). Input jam memakai `<input type="time">` bawaan browser — tidak
menambah dependensi.

## Integrasi

**Daily Focus (`app/(app)/focus/page.tsx`).** Blok "Agenda hari ini" di atas daftar
3 task fokus: judul, jam, lokasi. Query terpisah pada `events` dengan
`eventDate = hari ini`, urut `startTime`.

**Dashboard (`app/(app)/dashboard/page.tsx`).** Kartu "Agenda terdekat" — 3 agenda
berikutnya dari hari ini ke depan.

**Sidebar (`components/nav.ts`).** Item baru **Kalender** → `/calendar`, ikon
`CalendarDays` dari lucide-react (sudah terpasang), `enabled: true`. Ditaruh setelah
Daily Focus supaya agenda dan fokus harian berdekatan.

## Di luar lingkup v1

Ditulis eksplisit supaya tidak diam-diam masuk saat implementasi:

- Agenda berulang — pengguna menyatakan belum perlu. Data model sekarang tidak
  menutup jalannya; penambahan nanti berupa kolom pengulangan, bukan pembongkaran.
- Peserta / undangan / balasan hadir
- Pengingat aktif — tidak mungkin tanpa cron, lihat Batasan di atas
- Ekspor ICS dan sinkron dua arah Google Calendar
- Seret blok untuk memindah atau mengubah durasi agenda. v1 memakai klik-untuk-edit;
  mesin seretnya sudah ada di `components/task-timeline.tsx` kalau nanti dibutuhkan.
- Menampilkan task berdampingan dengan agenda di grid kalender yang sama

## Definition of Done (PRD §49)

Desktop OK, mobile tidak rusak, validasi client + server, empty state pada minggu
kosong, migration ada, `npm run typecheck`, `npm run check:agenda`, dan
`npm run build` sukses.
