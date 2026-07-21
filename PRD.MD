# PRODUCT REQUIREMENTS DOCUMENT

## Sistem Manajemen Bisnis Proyek, RAB, Prioritas, dan Penagihan

**Nama sementara produk:** ProjectFlow
**Versi dokumen:** 2.0
**Status:** Draft MVP
**Jenis produk:** Web application
**Pengguna awal:** Pemilik produk sendiri
**Target lanjutan:** Freelancer, developer, solopreneur, dan bisnis jasa
**Development environment:** Windows
**Deployment:** Vercel
**Source code:** GitHub private repository
**Database:** Neon PostgreSQL

---

# 1. Ringkasan Produk

ProjectFlow adalah aplikasi web pribadi untuk membantu developer atau pemilik bisnis jasa mengelola pekerjaan proyek dari awal hingga pembayaran.

Aplikasi menghubungkan proses:

```text
Klien
↓
Proyek
↓
Daftar fitur
↓
RAB
↓
Task pengembangan
↓
Prioritas pekerjaan
↓
Invoice
↓
Pembayaran
↓
Kuitansi
```

Aplikasi dibuat untuk menyelesaikan tiga masalah utama:

1. Sulit menentukan prioritas pekerjaan.
2. Penyusunan RAB membutuhkan waktu lama.
3. Pembuatan invoice, nota, dan kuitansi masih dilakukan secara terpisah.

Seluruh sistem dapat diakses secara online melalui browser setelah di-deploy ke Vercel.

---

# 2. Latar Belakang

Sebagai developer yang mengelola proyek sendiri, pengguna harus menjalankan banyak peran sekaligus:

* Mencari dan berkomunikasi dengan klien
* Mengumpulkan kebutuhan proyek
* Menyusun daftar fitur
* Menghitung harga
* Membuat RAB
* Mengatur pekerjaan
* Menentukan prioritas
* Mengembangkan aplikasi
* Membuat invoice
* Mencatat pembayaran
* Mengirim kuitansi

Saat ini proses tersebut tersebar di beberapa tempat seperti:

* Catatan
* Chat
* Spreadsheet
* Task manager
* Dokumen invoice
* Folder project
* Aplikasi desain

Akibatnya, informasi mudah terpisah dan pengguna harus memasukkan data yang sama berulang kali.

---

# 3. Permasalahan Utama

## 3.1 Tidak Fokus pada Satu Pekerjaan

Pengguna sering memulai beberapa task sekaligus.

Dampaknya:

* Banyak pekerjaan tidak selesai
* Sulit menentukan pekerjaan paling penting
* Sering berpindah ke fitur baru
* Task lama tertunda
* Deadline menjadi tidak terkontrol
* Progress proyek sulit dinilai

Aplikasi harus membantu pengguna memilih sedikit pekerjaan utama dan membatasi pekerjaan yang sedang berjalan.

---

## 3.2 Penyusunan RAB Terlalu Lama

RAB saat ini dibuat secara manual menggunakan spreadsheet.

Setiap proyek membutuhkan daftar pekerjaan berbeda, tetapi banyak modul sebenarnya dapat digunakan kembali.

Contoh modul User Management:

```text
User Management
├── Registrasi
├── Login
├── Logout
├── Verifikasi email
├── Lupa password
├── Reset password
├── Kelola profil
├── Ganti password
├── Role dan permission
├── Suspend pengguna
├── Riwayat aktivitas
├── Validasi
├── Unit testing
├── Integration testing
└── End-to-end testing
```

Tanpa pustaka fitur, pengguna harus mengingat dan mengetik seluruh bagian tersebut setiap kali membuat RAB.

---

## 3.3 Penagihan Tidak Terintegrasi

Setelah RAB selesai, pengguna masih harus membuat ulang:

* Quotation
* Invoice
* Nota
* Kuitansi
* Detail termin
* Rekap pembayaran

Hal ini dapat menimbulkan:

* Perbedaan nominal
* Kesalahan penyalinan
* Nomor dokumen tidak teratur
* Dokumen terlihat kurang profesional
* Riwayat pembayaran sulit dilacak

---

# 4. Visi Produk

Menjadi sistem kerja pribadi yang membantu developer dan pemilik bisnis jasa mengubah kebutuhan klien menjadi scope, RAB, pekerjaan terstruktur, dan penagihan profesional dalam satu aplikasi.

---

# 5. Tujuan Produk

## 5.1 Tujuan Utama

* Memusatkan data klien dan proyek.
* Mempercepat penyusunan daftar fitur.
* Mengurangi waktu pembuatan RAB.
* Menjaga konsistensi harga dan estimasi.
* Mengubah scope proyek menjadi task.
* Membantu pengguna menentukan prioritas.
* Membatasi jumlah task aktif.
* Membuat invoice dari RAB tanpa mengetik ulang.
* Mencatat pembayaran dan sisa tagihan.
* Menghasilkan kuitansi profesional.
* Membuat aplikasi dapat diakses melalui internet.

## 5.2 Tujuan Jangka Panjang

* Menjadi sistem operasional bisnis jasa.
* Mendukung penggunaan oleh tim kecil.
* Menyediakan client portal.
* Menyediakan persetujuan RAB secara online.
* Menjadi produk SaaS untuk freelancer dan solopreneur.
* Menyediakan template fitur berdasarkan jenis proyek.

---

# 6. Sasaran Pengguna

## 6.1 Pengguna MVP

Versi pertama digunakan oleh satu pemilik akun.

Karakteristik pengguna:

* Developer independen
* Mengerjakan beberapa proyek
* Membuat estimasi dan RAB sendiri
* Menagih klien sendiri
* Membutuhkan sistem yang sederhana
* Tidak membutuhkan kolaborasi tim pada awal

## 6.2 Pengguna Lanjutan

Setelah sistem stabil, produk dapat dikembangkan untuk:

* Freelancer
* Software house kecil
* Digital agency
* Konsultan
* Desainer
* Content creator
* Event organizer
* Kontraktor jasa
* Solopreneur
* Pemilik bisnis berbasis proyek

---

# 7. Product Positioning

ProjectFlow bukan sekadar:

* Project management
* Task manager
* Aplikasi invoice
* Spreadsheet RAB
* CRM klien

ProjectFlow adalah:

> Sistem terintegrasi untuk menyusun scope, menghitung RAB, mengelola pekerjaan, dan menagih klien.

Alur utama:

```text
Project to Payment
```

---

# 8. Scope MVP

## 8.1 Termasuk dalam MVP

* Authentication
* Profil bisnis
* Manajemen klien
* Manajemen proyek
* Feature Library
* Scope Builder
* RAB
* Quotation
* Task Management
* Priority Management
* Work in Progress Limit
* Daily Focus
* Invoice
* Payment Tracking
* Kuitansi
* PDF Export
* Pengaturan nomor dokumen
* Dashboard ringkas
* Activity Log

## 8.2 Tidak Termasuk dalam MVP

* Multi-user
* Multi-tenant
* Client portal
* Payment gateway
* Mobile application
* Chat
* Integrasi WhatsApp
* Integrasi marketplace
* Akuntansi lengkap
* Jurnal keuangan
* Neraca
* Payroll
* Inventori
* AI generator
* Digital signature tersertifikasi
* Real-time collaboration
* Template marketplace
* Paket berlangganan

---

# 9. Prinsip Produk

## 9.1 Single User First

Versi pertama hanya perlu bekerja dengan baik untuk satu pengguna.

Sistem tidak perlu langsung mendukung:

* Organisasi
* Tim
* Banyak role
* Paket langganan
* White-label

## 9.2 Satu Kali Input

Data yang sudah dimasukkan harus dapat digunakan kembali.

Contoh:

```text
Data klien
→ digunakan pada proyek
→ digunakan pada quotation
→ digunakan pada invoice
→ digunakan pada kuitansi
```

## 9.3 Template dan Snapshot

Feature Library berfungsi sebagai template.

Ketika fitur dimasukkan ke proyek, sistem membuat salinan atau snapshot.

Perubahan template setelahnya tidak boleh mengubah proyek lama.

## 9.4 Memaksa Fokus

Aplikasi tidak hanya menampilkan task, tetapi juga membantu mencegah terlalu banyak task aktif.

## 9.5 Sederhana Sebelum Lengkap

Fitur dasar harus diselesaikan sebelum fitur lanjutan.

Contoh:

* Buat invoice manual terlebih dahulu.
* Email automation dapat ditambahkan kemudian.
* Buat PDF tetap terlebih dahulu.
* Editor template kompleks dapat ditambahkan kemudian.

---

# 10. Alur Utama Pengguna

```text
Login
↓
Melengkapi profil bisnis
↓
Membuat data klien
↓
Membuat proyek
↓
Memilih modul dari Feature Library
↓
Menyesuaikan scope proyek
↓
Menghasilkan RAB
↓
Menghasilkan quotation
↓
Mengubah scope menjadi task
↓
Menentukan prioritas
↓
Memilih fokus harian
↓
Mengerjakan task
↓
Membuat invoice
↓
Mencatat pembayaran
↓
Menghasilkan kuitansi
↓
Menutup proyek
```

---

# 11. Modul Authentication

## 11.1 Tujuan

Mengamankan aplikasi dan data bisnis.

## 11.2 Fitur

* Login
* Logout
* Lupa password
* Reset password
* Ubah password
* Session management
* Perlindungan halaman internal

## 11.3 Data Pengguna

* ID
* Nama
* Email
* Password hash
* Status akun
* Terakhir login
* Waktu dibuat
* Waktu diperbarui

## 11.4 Acceptance Criteria

* Pengguna dapat login dengan email dan password.
* Pengguna tidak dapat membuka dashboard tanpa login.
* Pengguna dapat logout.
* Password tidak disimpan sebagai plain text.
* Pengguna dapat mengubah password.
* Session yang tidak valid diarahkan ke halaman login.

---

# 12. Modul Profil Bisnis

## 12.1 Tujuan

Menyimpan identitas yang digunakan pada dokumen bisnis.

## 12.2 Informasi Bisnis

* Nama bisnis
* Nama pemilik
* Logo
* Alamat
* Kota
* Provinsi
* Kode pos
* Email
* Nomor telepon
* WhatsApp
* Website
* NPWP opsional
* Slogan opsional

## 12.3 Informasi Pembayaran

* Nama bank
* Nomor rekening
* Nama pemilik rekening
* Cabang
* QRIS opsional

## 12.4 Identitas Dokumen

* Logo
* Warna utama
* Tanda tangan
* Stempel
* Catatan default
* Syarat pembayaran
* Footer dokumen

## 12.5 Acceptance Criteria

* Pengguna dapat mengubah profil bisnis.
* Profil bisnis otomatis digunakan pada dokumen.
* Pengguna dapat menyimpan lebih dari satu rekening.
* Satu rekening dapat dipilih sebagai rekening utama.
* Logo, tanda tangan, dan stempel dapat diunggah.
* Dokumen lama tidak berubah ketika profil diperbarui jika sudah dikunci.

---

# 13. Modul Client Management

## 13.1 Tujuan

Menyimpan informasi klien agar dapat digunakan kembali.

## 13.2 Fitur

* Tambah klien
* Edit klien
* Lihat detail
* Cari klien
* Filter klien
* Arsipkan klien
* Catatan internal
* Riwayat proyek
* Riwayat invoice
* Riwayat pembayaran

## 13.3 Data Klien

* Jenis klien
* Nama
* Nama perusahaan
* Email
* WhatsApp
* Nomor telepon
* Alamat
* Kota
* Provinsi
* Kode pos
* NPWP opsional
* Nama PIC
* Jabatan PIC
* Catatan

## 13.4 Jenis Klien

* Individu
* Perusahaan
* Instansi
* Organisasi

## 13.5 Status Klien

* Active
* Inactive
* Archived

## 13.6 Acceptance Criteria

* Pengguna dapat membuat dan mengubah klien.
* Klien dapat dipilih saat membuat proyek.
* Klien yang diarsipkan tidak muncul sebagai pilihan aktif.
* Data klien otomatis masuk ke quotation dan invoice.
* Satu klien dapat memiliki banyak proyek.

---

# 14. Modul Project Management

## 14.1 Tujuan

Mengelola seluruh informasi proyek.

## 14.2 Fitur

* Buat proyek
* Edit proyek
* Duplikasi proyek
* Arsipkan proyek
* Status proyek
* Progress proyek
* Deadline
* Budget
* Nilai kontrak
* Catatan
* File lampiran
* Aktivitas terbaru

## 14.3 Data Proyek

* Kode proyek
* Nama proyek
* Klien
* Jenis proyek
* Deskripsi
* Tujuan
* Target pengguna
* Tanggal mulai
* Deadline
* Budget klien
* Nilai proyek
* Status
* Prioritas proyek
* Progress
* Catatan internal

## 14.4 Jenis Proyek

* Website
* Web application
* Company profile
* E-commerce
* Sistem informasi
* SaaS
* Mobile application
* UI/UX design
* Maintenance
* Konsultasi
* Custom

## 14.5 Status Proyek

* Lead
* Draft
* Proposal
* Approved
* In Progress
* On Hold
* Client Review
* Completed
* Cancelled
* Archived

## 14.6 Acceptance Criteria

* Setiap proyek terhubung ke satu klien.
* Pengguna dapat mengubah status proyek.
* Progress dapat dihitung dari task.
* Nilai proyek dapat diambil dari quotation yang disetujui.
* Proyek dapat diduplikasi beserta scope-nya.
* Proyek dapat diarsipkan tanpa menghapus data transaksi.

---

# 15. Modul Feature Library

## 15.1 Tujuan

Menyimpan modul dan fitur yang dapat digunakan berulang kali.

## 15.2 Struktur

```text
Kategori
└── Modul
    └── Fitur
        ├── Checklist pengembangan
        ├── Checklist testing
        └── Definition of Done
```

## 15.3 Contoh Kategori

* Planning
* UI/UX
* Authentication
* User Management
* Content Management
* Product Management
* Order Management
* Payment
* Notification
* Reporting
* Administration
* Infrastructure
* Testing
* Deployment
* Maintenance

## 15.4 Data Modul

* Nama
* Kategori
* Deskripsi
* Estimasi default
* Harga default
* Kompleksitas
* Status aktif
* Tag
* Catatan

## 15.5 Data Fitur

* Nama
* Deskripsi
* Estimasi jam
* Estimasi hari
* Harga tetap
* Tarif per jam
* Satuan
* Quantity default
* Kompleksitas
* Prioritas default
* Dependensi
* Checklist
* Definition of Done
* Status aktif

## 15.6 Metode Harga

* Harga tetap
* Tarif per jam
* Tarif per hari
* Quantity × harga satuan
* Harga berdasarkan kompleksitas
* Manual

## 15.7 Tingkat Kompleksitas

* Very Low
* Low
* Medium
* High
* Very High

## 15.8 Fitur Pengelolaan

* Tambah kategori
* Tambah modul
* Tambah fitur
* Edit
* Duplikasi
* Aktifkan atau nonaktifkan
* Cari
* Filter
* Urutkan
* Import template pada fase lanjutan

## 15.9 Acceptance Criteria

* Satu kategori dapat memiliki banyak modul.
* Satu modul dapat memiliki banyak fitur.
* Fitur dapat memiliki harga dan estimasi default.
* Fitur dapat dimasukkan ke proyek.
* Fitur dapat diduplikasi.
* Perubahan library tidak mengubah proyek lama.
* Fitur nonaktif tidak muncul pada pilihan default.

---

# 16. Modul Scope Builder

## 16.1 Tujuan

Menyusun ruang lingkup pekerjaan proyek dengan cepat.

## 16.2 Fitur

* Tambah modul dari library
* Tambah fitur dari library
* Tambah fitur manual
* Edit deskripsi
* Edit estimasi
* Edit quantity
* Edit harga
* Tandai fitur opsional
* Tandai fitur tidak termasuk
* Kelompokkan berdasarkan fase
* Tentukan milestone
* Atur urutan
* Duplikasi scope
* Hitung total estimasi
* Hitung total harga

## 16.3 Struktur Scope

```text
Project
├── Phase
│   ├── Module
│   │   ├── Feature
│   │   └── Feature
│   └── Module
└── Phase
```

## 16.4 Status Item Scope

* Draft
* Included
* Optional
* Excluded
* Approved
* Cancelled

## 16.5 Informasi Item Scope

* Nama
* Deskripsi
* Modul
* Phase
* Quantity
* Unit
* Estimasi
* Harga
* Kompleksitas
* Status
* Catatan
* Dependensi

## 16.6 Acceptance Criteria

* Pengguna dapat memilih modul dari Feature Library.
* Fitur dari library disalin sebagai snapshot.
* Pengguna dapat mengubah harga khusus proyek.
* Pengguna dapat menambah fitur manual.
* Item dapat diurutkan.
* Total estimasi dan harga dihitung otomatis.
* Scope dapat digunakan untuk membuat RAB.
* Scope dapat digunakan untuk membuat task.

---

# 17. Modul RAB

## 17.1 Tujuan

Menghasilkan rincian anggaran biaya dari scope proyek.

## 17.2 Fitur

* Buat RAB dari scope
* Buat RAB manual
* Tambah section
* Tambah item
* Edit quantity
* Edit satuan
* Edit harga
* Diskon
* Pajak
* Biaya tambahan
* Dana risiko
* Pembulatan
* Bobot pekerjaan
* Catatan
* Preview
* Export PDF
* Export spreadsheet
* Duplikasi
* Revisi

## 17.3 Struktur RAB

```text
A. Analisis dan Perencanaan
B. UI/UX
C. Frontend
D. Backend
E. Integrasi
F. Testing
G. Deployment
H. Maintenance
```

## 17.4 Data Item

* Nomor urut
* Kode item
* Nama pekerjaan
* Deskripsi
* Quantity
* Satuan
* Harga satuan
* Subtotal
* Bobot
* Estimasi
* Catatan

## 17.5 Satuan

* Paket
* Modul
* Fitur
* Halaman
* Jam
* Hari
* Bulan
* Integrasi
* Dokumen
* Custom

## 17.6 Perhitungan

```text
Subtotal item = Quantity × Harga satuan

Subtotal RAB = Total seluruh item

Nilai setelah diskon = Subtotal RAB - Diskon

Pajak = Nilai setelah diskon × Persentase pajak

Grand total =
Nilai setelah diskon
+ Pajak
+ Biaya tambahan
```

## 17.7 Tampilan Harga

* Detail setiap fitur
* Total per modul
* Total per section
* Hanya grand total
* Sembunyikan harga satuan
* Sembunyikan estimasi

## 17.8 Status RAB

* Draft
* Final
* Archived
* Cancelled

## 17.9 Acceptance Criteria

* RAB dapat dibuat dari scope.
* Item dapat diedit tanpa mengubah Feature Library.
* Semua total dihitung di server.
* Pengguna dapat menambahkan diskon dan pajak.
* RAB dapat diunduh sebagai PDF.
* RAB dapat diekspor ke spreadsheet.
* RAB dapat digunakan untuk membuat quotation.
* Versi lama tetap tersimpan ketika RAB direvisi.

---

# 18. Modul Quotation

## 18.1 Tujuan

Menghasilkan penawaran profesional untuk klien.

## 18.2 Perbedaan RAB dan Quotation

RAB digunakan sebagai rincian internal atau rincian biaya detail.

Quotation digunakan sebagai dokumen penawaran kepada klien.

Quotation dapat menampilkan data lebih ringkas daripada RAB.

## 18.3 Fitur

* Buat dari RAB
* Buat manual
* Pilih detail harga
* Masa berlaku
* Termin pembayaran
* Catatan
* Syarat dan ketentuan
* Preview
* Export PDF
* Duplikasi
* Revisi
* Nomor otomatis
* Status

## 18.4 Status

* Draft
* Sent
* Viewed
* Revised
* Approved
* Rejected
* Expired
* Cancelled

Untuk MVP, status Sent dan Viewed dapat diubah manual.

## 18.5 Nomor Revisi

```text
QT/2026/001
QT/2026/001-R1
QT/2026/001-R2
```

## 18.6 Acceptance Criteria

* Quotation dapat dibuat dari RAB.
* Nomor quotation bersifat unik.
* Pengguna dapat mengatur masa berlaku.
* Pengguna dapat menentukan termin.
* Quotation dapat diekspor ke PDF.
* Revisi menghasilkan versi baru.
* Quotation Approved dapat menjadi sumber invoice.
* Quotation Approved tidak dapat diedit langsung.

---

# 19. Modul Payment Terms

## 19.1 Tujuan

Membagi nilai proyek menjadi beberapa termin.

## 19.2 Jenis Termin

* Pembayaran penuh
* DP dan pelunasan
* Berdasarkan milestone
* Persentase
* Nominal tetap

## 19.3 Contoh

```text
Termin 1 — DP 40%
Termin 2 — Setelah staging 30%
Termin 3 — Setelah serah terima 30%
```

## 19.4 Data Termin

* Nama
* Deskripsi
* Persentase
* Nominal
* Urutan
* Trigger pembayaran
* Jatuh tempo
* Status

## 19.5 Validasi

* Total persentase harus 100%.
* Total nominal harus sama dengan grand total.
* Sistem memberi peringatan jika total berbeda.
* Pembulatan dapat dilakukan pada termin terakhir.

## 19.6 Acceptance Criteria

* Pengguna dapat membuat beberapa termin.
* Nominal dihitung otomatis dari persentase.
* Nilai termin dapat diedit.
* Sistem memvalidasi total termin.
* Termin dapat digunakan untuk membuat invoice.

---

# 20. Modul Task Management

## 20.1 Tujuan

Mengubah scope menjadi pekerjaan yang dapat dipantau.

## 20.2 Fitur

* Generate task dari scope
* Buat task manual
* Subtask
* Checklist
* Status
* Prioritas
* Due date
* Estimasi
* Actual time
* Label
* Milestone
* Dependensi
* Blocker
* Catatan
* Attachment
* Definition of Done
* Duplikasi task

## 20.3 Status Task

* Backlog
* Ready
* In Progress
* Blocked
* Review
* Testing
* Client Review
* Done
* Cancelled

## 20.4 Data Task

* Judul
* Deskripsi
* Proyek
* Phase
* Modul
* Feature source
* Status
* Prioritas
* Estimasi jam
* Actual time
* Deadline
* Tanggal mulai
* Tanggal selesai
* Dependensi
* Definition of Done
* Catatan

## 20.5 Definition of Done

Contoh task login:

```text
[ ] Halaman login tersedia
[ ] Validasi email tersedia
[ ] Validasi password tersedia
[ ] Error message tersedia
[ ] Remember me berjalan
[ ] Rate limit diterapkan
[ ] Redirect sesuai kondisi
[ ] Feature test tersedia
[ ] E2E test berhasil
```

## 20.6 Acceptance Criteria

* Scope dapat diubah menjadi task.
* Task menyimpan hubungan dengan fitur asal.
* Task dapat dipindahkan antar-status.
* Checklist wajib harus selesai sebelum Done.
* Dependensi yang belum selesai menghasilkan peringatan.
* Task Done memperbarui progress proyek.
* Task Cancelled tidak dihitung sebagai task selesai.

---

# 21. Modul Priority Management

## 21.1 Tujuan

Membantu memilih pekerjaan yang paling penting.

## 21.2 Faktor Prioritas

Setiap task dapat dinilai dari 1 sampai 5 berdasarkan:

* Business Value
* Urgency
* Dependency Importance
* Client Impact
* Revenue Impact
* Complexity
* Effort
* Risk

## 21.3 Rumus Awal

```text
Priority Score =
Business Value
+ Urgency
+ Dependency Importance
+ Client Impact
+ Revenue Impact
- Complexity
- Effort
- Risk
```

## 21.4 Tingkat Prioritas

* Critical
* High
* Medium
* Low
* Someday

## 21.5 Aturan

* Task yang membuka banyak dependensi mendapat prioritas tambahan.
* Task yang mendekati deadline mendapat peningkatan urgency.
* Task Blocked tidak direkomendasikan sebagai fokus.
* Pengguna dapat melakukan override.
* Alasan override dapat dicatat.

## 21.6 Acceptance Criteria

* Sistem menghitung priority score.
* Task dapat diurutkan berdasarkan skor.
* Pengguna dapat mengubah nilai faktor.
* Pengguna dapat menetapkan prioritas manual.
* Sistem menampilkan faktor yang membuat task menjadi prioritas.

---

# 22. Modul Work in Progress Limit

## 22.1 Tujuan

Mencegah pengguna mengerjakan terlalu banyak task secara bersamaan.

## 22.2 Pengaturan Default

* Maksimal proyek In Progress: 2
* Maksimal task In Progress: 2
* Maksimal daily focus: 3

## 22.3 Perilaku

Ketika batas tercapai:

* Pengguna mendapat peringatan.
* Tombol mulai task baru dinonaktifkan.
* Sistem menampilkan task yang sedang aktif.
* Pengguna dapat memindahkan task aktif ke Blocked atau Backlog.
* Override dapat diberikan dengan alasan.

## 22.4 Acceptance Criteria

* Sistem menghitung task aktif.
* Sistem mencegah task baru masuk In Progress setelah batas tercapai.
* Limit dapat diubah melalui Settings.
* Override harus menyimpan alasan.
* Override dicatat di Activity Log.

---

# 23. Modul Daily Focus

## 23.1 Tujuan

Menampilkan pekerjaan yang harus diselesaikan hari ini.

## 23.2 Informasi

* Maksimal tiga task
* Task utama
* Task terlambat
* Task blocker
* Target mingguan
* Progress harian
* Catatan harian

## 23.3 Fitur

* Pilih task fokus
* Rekomendasi otomatis
* Mulai task
* Tandai selesai
* Pindahkan ke besok
* Ganti urutan
* Review akhir hari
* Alasan tidak selesai

## 23.4 Urutan Rekomendasi

1. Task Critical
2. Task yang membuka dependensi
3. Task mendekati deadline
4. Task dengan business value tinggi
5. Task yang sesuai kapasitas waktu

## 23.5 Acceptance Criteria

* Maksimal tiga task menjadi fokus harian.
* Sistem memberi rekomendasi.
* Pengguna dapat mengganti rekomendasi.
* Task Done hilang dari fokus aktif.
* Task yang belum selesai dapat dipindahkan ke hari berikutnya.

---

# 24. Modul Invoice

## 24.1 Tujuan

Membuat tagihan berdasarkan quotation atau termin.

## 24.2 Fitur

* Buat invoice dari quotation
* Buat invoice dari termin
* Buat invoice manual
* Partial invoice
* Tambah item
* Diskon
* Pajak
* Jatuh tempo
* Pilih rekening
* Catatan
* Preview
* Export PDF
* Duplikasi
* Nomor otomatis

## 24.3 Status Invoice

* Draft
* Sent
* Partially Paid
* Paid
* Overdue
* Cancelled
* Void

## 24.4 Data Invoice

* Nomor invoice
* Klien
* Proyek
* Quotation
* Termin
* Tanggal terbit
* Jatuh tempo
* Daftar item
* Subtotal
* Diskon
* Pajak
* Total
* Nilai dibayar
* Sisa tagihan
* Status
* Catatan

## 24.5 Aturan

* Invoice dapat memiliki beberapa pembayaran.
* Invoice Paid ketika sisa tagihan nol.
* Invoice Overdue ketika melewati jatuh tempo dan belum lunas.
* Invoice yang memiliki pembayaran tidak dapat dihapus.
* Invoice dapat dibatalkan atau ditandai Void.

## 24.6 Acceptance Criteria

* Invoice dapat dibuat dari quotation.
* Invoice dapat mengambil nilai termin.
* Total dihitung di server.
* Invoice dapat memiliki pembayaran parsial.
* Status diperbarui berdasarkan pembayaran.
* Invoice dapat diekspor sebagai PDF.
* Invoice tidak dapat melebihi sisa nilai proyek tanpa peringatan.

---

# 25. Modul Payment Tracking

## 25.1 Tujuan

Mencatat pembayaran dari klien.

## 25.2 Fitur

* Tambah pembayaran
* Pilih invoice
* Input nominal
* Tanggal pembayaran
* Metode pembayaran
* Nomor referensi
* Upload bukti
* Catatan
* Pembatalan pembayaran

## 25.3 Metode Pembayaran

* Transfer bank
* Tunai
* QRIS
* E-wallet
* Payment gateway
* Lainnya

## 25.4 Data Pembayaran

* Invoice
* Nominal
* Tanggal
* Metode
* Rekening tujuan
* Nomor referensi
* Bukti pembayaran
* Catatan
* Status

## 25.5 Status Pembayaran

* Confirmed
* Cancelled

## 25.6 Acceptance Criteria

* Pembayaran harus terhubung ke invoice.
* Nominal pembayaran mengurangi sisa tagihan.
* Pembayaran sebagian mengubah status menjadi Partially Paid.
* Pembayaran penuh mengubah status menjadi Paid.
* Pembayaran yang dibatalkan mengembalikan sisa invoice.
* Bukti pembayaran dapat diunggah.
* Sistem meminta konfirmasi jika nominal melebihi sisa tagihan.

---

# 26. Modul Kuitansi dan Nota

## 26.1 Tujuan

Menghasilkan bukti pembayaran profesional.

## 26.2 Fitur

* Buat kuitansi dari pembayaran
* Buat nota pembayaran
* Nomor otomatis
* Nilai terbilang
* Tanda tangan
* Stempel
* Preview
* Export PDF
* Status Void

## 26.3 Data

* Nomor kuitansi
* Pembayaran
* Klien
* Proyek
* Invoice
* Nominal
* Terbilang
* Tujuan pembayaran
* Metode pembayaran
* Tanggal
* Tanda tangan
* Stempel
* Catatan

## 26.4 Acceptance Criteria

* Kuitansi hanya dapat dibuat dari pembayaran valid.
* Nilai terbilang dibuat otomatis.
* Nomor kuitansi unik.
* Dokumen dapat diunduh dalam PDF.
* Pembatalan pembayaran menandai kuitansi sebagai Void.
* Kuitansi tidak boleh dihapus setelah diterbitkan.

---

# 27. Modul Document Generator

## 27.1 Tujuan

Membuat dokumen dengan tampilan konsisten dan profesional.

## 27.2 Dokumen MVP

* RAB
* Quotation
* Invoice
* Kuitansi
* Nota pembayaran

## 27.3 Pengaturan Template

* Logo
* Warna utama
* Nama bisnis
* Alamat
* Kontak
* Header
* Footer
* Nomor halaman
* Tanda tangan
* Stempel
* Informasi rekening
* Catatan
* Syarat dan ketentuan

## 27.4 Output

* Tampilan web
* Print
* PDF
* Spreadsheet untuk RAB

## 27.5 Acceptance Criteria

* Semua dokumen menggunakan profil bisnis.
* Layout dokumen sesuai ukuran A4.
* Dokumen dapat dicetak tanpa navigasi aplikasi.
* Nilai dokumen sama dengan data di database.
* Dokumen mempunyai nomor unik.
* Dokumen lama mempertahankan snapshot identitas bisnisnya.

---

# 28. Modul File Management

## 28.1 Tujuan

Menyimpan file pendukung proyek dan transaksi.

## 28.2 Jenis File

* Logo
* Tanda tangan
* Stempel
* Brief klien
* Referensi desain
* Dokumen proyek
* Bukti pembayaran
* Hasil PDF

## 28.3 Data File

* Nama
* URL
* MIME type
* Ukuran
* Entitas terkait
* Tanggal upload
* Status akses

## 28.4 Aturan

* File tidak disimpan permanen pada filesystem deployment Vercel.
* File menggunakan object storage.
* Database hanya menyimpan metadata.
* File privat harus memerlukan otorisasi.

## 28.5 Acceptance Criteria

* Pengguna dapat upload dan menghapus file.
* Ukuran file divalidasi.
* Jenis file divalidasi.
* File dapat dikaitkan dengan proyek, pembayaran, atau profil.
* Penghapusan membutuhkan konfirmasi.

---

# 29. Modul Dashboard

## 29.1 Tujuan

Menampilkan ringkasan pekerjaan dan bisnis.

## 29.2 Bagian Dashboard

### Fokus Hari Ini

* Maksimal tiga task
* Prioritas
* Status
* Progress

### Proyek Aktif

* Nama proyek
* Klien
* Deadline
* Progress
* Status

### Keuangan

* Invoice belum dibayar
* Invoice overdue
* Sisa tagihan
* Pembayaran bulan ini

### Peringatan

* Task terlambat
* Task Blocked
* WIP limit tercapai
* Quotation hampir kedaluwarsa
* Invoice jatuh tempo

### Aktivitas Terbaru

* Proyek dibuat
* RAB dibuat
* Quotation disetujui
* Task selesai
* Invoice dibuat
* Pembayaran dicatat

## 29.3 Acceptance Criteria

* Dashboard menampilkan data aktual.
* Setiap kartu dapat membuka detail terkait.
* Empty state ditampilkan ketika belum ada data.
* Dashboard tidak menjadi modul pertama yang dikembangkan.

---

# 30. Search dan Filter

## 30.1 Search Global

Search mencakup:

* Klien
* Proyek
* Task
* Feature Library
* RAB
* Quotation
* Invoice

## 30.2 Filter

* Status
* Klien
* Proyek
* Tanggal
* Prioritas
* Deadline
* Jatuh tempo
* Nilai transaksi

## 30.3 Acceptance Criteria

* Search tidak case-sensitive.
* Filter dapat digabungkan.
* Filter dapat dibersihkan.
* Tabel menggunakan pagination.
* Search menggunakan debounce.

---

# 31. Notification Internal

## 31.1 Tujuan

Memberikan pengingat di dalam aplikasi.

## 31.2 Jenis Notifikasi

* Deadline task mendekat
* Task terlambat
* Task Blocked
* WIP limit tercapai
* Quotation hampir kedaluwarsa
* Invoice jatuh tempo
* Invoice overdue
* Proyek tidak memiliki aktivitas

## 31.3 Acceptance Criteria

* Notifikasi dapat ditandai dibaca.
* Notifikasi dapat membuka data terkait.
* Notifikasi memiliki tingkat urgensi.
* Pengguna dapat menonaktifkan jenis notifikasi.

---

# 32. Activity Log

## 32.1 Tujuan

Mencatat aktivitas penting.

## 32.2 Aktivitas yang Dicatat

* Login
* Klien dibuat
* Proyek dibuat
* Status proyek berubah
* Scope berubah
* RAB dibuat
* Quotation direvisi
* Quotation disetujui
* Task dimulai
* Task diselesaikan
* WIP override
* Invoice dibuat
* Pembayaran dicatat
* Pembayaran dibatalkan
* Dokumen menjadi Void

## 32.3 Data Log

* Pengguna
* Aksi
* Entitas
* ID entitas
* Nilai sebelum
* Nilai sesudah
* Waktu
* Catatan

## 32.4 Acceptance Criteria

* Aktivitas penting dicatat otomatis.
* Activity Log tidak dapat diedit.
* Log dapat difilter berdasarkan entitas.
* Password, token, dan secret tidak disimpan.

---

# 33. Pengaturan Sistem

## 33.1 General

* Nama aplikasi
* Bahasa
* Zona waktu
* Format tanggal
* Mata uang
* Format angka

Default:

```text
Bahasa: Indonesia
Zona waktu: Asia/Jakarta
Mata uang: IDR
Format tanggal: DD/MM/YYYY
```

## 33.2 Pricing

* Tarif per jam
* Tarif per hari
* Faktor kompleksitas
* Dana risiko default
* Diskon default
* Pajak default

## 33.3 Productivity

* Maksimal proyek aktif
* Maksimal task In Progress
* Maksimal Daily Focus
* Jam kerja per hari
* Hari kerja

## 33.4 Document Numbering

Contoh:

```text
Project:
PRJ/{YYYY}/{SEQUENCE}

RAB:
RAB/{YYYY}/{SEQUENCE}

Quotation:
QT/{YYYY}/{SEQUENCE}

Invoice:
INV/{YYYY}/{SEQUENCE}

Receipt:
RCP/{YYYY}/{SEQUENCE}
```

## 33.5 Acceptance Criteria

* Pengaturan digunakan sebagai default.
* Nilai default dapat diubah pada dokumen.
* Perubahan settings tidak mengubah transaksi lama.
* Nomor dokumen tidak boleh digunakan ulang.

---

# 34. Struktur Navigasi

```text
Dashboard

Clients
├── All Clients
└── Add Client

Projects
├── All Projects
├── Project Overview
├── Scope
├── Tasks
├── RAB
├── Invoices
└── Files

Feature Library
├── Categories
├── Modules
└── Features

Sales
├── RAB
├── Quotations
└── Payment Terms

Productivity
├── Daily Focus
├── Task Board
└── Priorities

Finance
├── Invoices
├── Payments
└── Receipts

Documents
├── Generated Documents
└── Templates

Settings
├── Business Profile
├── Bank Accounts
├── Pricing
├── Productivity
├── Numbering
└── Account
```

---

# 35. Model Data Awal

## Authentication

```text
users
sessions
accounts
verification_tokens
password_reset_tokens
```

## Business

```text
business_profiles
business_bank_accounts
business_assets
```

## Clients

```text
clients
client_contacts
client_notes
```

## Projects

```text
projects
project_phases
project_milestones
project_files
```

## Feature Library

```text
feature_categories
feature_modules
feature_items
feature_checklists
feature_dependencies
```

## Project Scope

```text
project_modules
project_features
project_feature_checklists
project_feature_dependencies
```

## Tasks

```text
tasks
task_checklists
task_dependencies
daily_focus_items
```

## RAB dan Quotation

```text
rabs
rab_versions
rab_sections
rab_items

quotations
quotation_versions
quotation_sections
quotation_items
payment_terms
```

## Finance

```text
invoices
invoice_items
payments
receipts
```

## Files dan Documents

```text
files
document_templates
generated_documents
```

## System

```text
settings
document_sequences
notifications
activity_logs
```

---

# 36. Relasi Data Utama

```text
Client
└── Project
    ├── Scope
    │   ├── Modules
    │   └── Features
    ├── RAB
    ├── Quotation
    │   └── Payment Terms
    ├── Tasks
    ├── Invoices
    │   └── Payments
    │       └── Receipts
    ├── Files
    └── Activity Logs
```

---

# 37. Aturan Bisnis Utama

## 37.1 Feature Snapshot

Ketika fitur dari library masuk ke proyek, data berikut disalin:

* Nama
* Deskripsi
* Estimasi
* Harga
* Quantity
* Satuan
* Kompleksitas
* Checklist
* Definition of Done

Perubahan library tidak mengubah proyek yang sudah dibuat.

## 37.2 Quotation Approved

Ketika quotation menjadi Approved:

* Versi dikunci.
* Nilai proyek diperbarui.
* Scope dapat ditandai Approved.
* Task dapat dibuat.
* Invoice dapat dibuat.
* Perubahan berikutnya harus melalui revisi.

## 37.3 Perubahan Scope

Jika scope yang sudah disetujui berubah:

* Sistem menampilkan peringatan.
* Perubahan dicatat.
* Harga tambahan tidak otomatis masuk invoice.
* Pada fase lanjutan perubahan dapat dibuat sebagai Change Request.

## 37.4 Invoice

* Satu invoice dapat memiliki banyak pembayaran.
* Invoice yang memiliki pembayaran tidak dapat dihapus.
* Invoice dapat dibatalkan atau di-Void.
* Invoice Paid jika sisa tagihan nol.
* Invoice Overdue jika lewat jatuh tempo.

## 37.5 Payment

* Pembayaran harus terhubung ke invoice.
* Pembayaran yang dibatalkan tidak dihapus.
* Pembatalan mengembalikan sisa tagihan.
* Semua perubahan nominal menggunakan database transaction.

## 37.6 Task

Task dapat menjadi Done ketika:

* Checklist wajib selesai.
* Dependensi selesai.
* Tidak memiliki blocker aktif.

Override diperbolehkan dengan alasan.

## 37.7 Soft Delete

Data transaksi tidak dihapus permanen.

Gunakan:

* Archived
* Cancelled
* Void
* Soft delete

---

# 38. Empty State

## Clients

```text
Belum ada klien.

Tambahkan klien pertama untuk mulai membuat proyek.
```

## Projects

```text
Belum ada proyek.

Buat proyek baru untuk mulai menyusun scope dan RAB.
```

## Feature Library

```text
Feature Library masih kosong.

Buat modul pertama agar penyusunan RAB lebih cepat.
```

## RAB

```text
Belum ada RAB.

Buat RAB dari scope proyek atau mulai secara manual.
```

## Invoice

```text
Belum ada invoice.

Invoice dapat dibuat dari quotation atau termin pembayaran.
```

## Daily Focus

```text
Belum ada fokus hari ini.

Pilih maksimal tiga task yang ingin diselesaikan.
```

---

# 39. Error State

Sistem harus menangani:

* Koneksi internet terputus
* Gagal memuat data
* Session expired
* Data tidak ditemukan
* Form tidak valid
* Konflik nomor dokumen
* Upload gagal
* Generate PDF gagal
* Database unavailable
* Total termin tidak sesuai
* Dependensi task belum selesai
* WIP limit tercapai
* Perubahan data konflik

Setiap error harus memiliki:

* Judul yang jelas
* Penjelasan sederhana
* Tombol coba lagi
* Tombol kembali jika diperlukan
* Kode error untuk debugging jika dibutuhkan

---

# 40. Non-Functional Requirements

## 40.1 Performance

* Halaman utama harus responsif.
* Tabel menggunakan pagination.
* Search menggunakan debounce.
* Kolom yang sering dicari harus memiliki database index.
* Query tidak mengambil data berlebihan.
* Dokumen PDF tidak boleh memblokir seluruh aplikasi.

## 40.2 Availability

* Aplikasi dapat diakses melalui internet.
* Aplikasi tidak membutuhkan server lokal.
* Deployment berjalan melalui Vercel.
* Database berjalan pada layanan cloud.
* Source code tersimpan di GitHub.

## 40.3 Security

* HTTPS wajib.
* Password disimpan dalam bentuk hash.
* Semua halaman internal memerlukan autentikasi.
* Authorization diperiksa di server.
* Input divalidasi di client dan server.
* Query menggunakan ORM atau parameterized query.
* Environment variable tidak dimasukkan ke repository.
* Upload file divalidasi.
* Dokumen privat memerlukan izin akses.
* Total keuangan dihitung ulang di server.

## 40.4 Backup

* Source code tersimpan pada GitHub private repository.
* Database production menggunakan backup yang tersedia dari penyedia database.
* File disimpan di object storage.
* Export manual data dapat ditambahkan pada fase lanjutan.

## 40.5 Responsive Design

Aplikasi harus nyaman digunakan pada:

* Desktop
* Laptop
* Tablet
* Smartphone untuk monitoring

Scope Builder, RAB Editor, dan Invoice Editor dioptimalkan untuk desktop.

## 40.6 Accessibility

* Form memiliki label.
* Navigasi keyboard didukung.
* Kontras warna memadai.
* Error tidak hanya ditunjukkan dengan warna.
* Ikon penting memiliki label.
* Tombol mempunyai area klik yang cukup.

---

# 41. Arsitektur Teknologi

## Frontend dan Backend

```text
Next.js App Router
TypeScript
React
Server Components
Server Actions atau Route Handlers
Tailwind CSS
shadcn/ui
```

## Database

```text
Neon PostgreSQL
Drizzle ORM
Drizzle Kit
```

## Authentication

```text
Better Auth atau Auth.js
```

Pilih satu dan jangan menggunakan dua library sekaligus.

## Form dan Validation

```text
Zod
React Hook Form
```

## Deployment

```text
Vercel
```

## Repository

```text
GitHub Private Repository
```

## File Storage

Pilihan awal:

```text
Vercel Blob
```

Alternatif jika kebutuhan file berkembang:

```text
Cloudflare R2
```

## PDF

Pendekatan awal:

```text
HTML template
+ print stylesheet
+ server-side PDF generation
```

## Spreadsheet

```text
ExcelJS
```

---

# 42. Deployment Workflow

## Development

Aplikasi dikembangkan pada Windows.

```text
Windows
↓
Local development
↓
Git commit
↓
GitHub
↓
Vercel deployment
```

## Alur Kerja

Sebelum mulai:

```bash
git pull --rebase
```

Setelah menyelesaikan perubahan:

```bash
git add .
git commit -m "Menambahkan modul invoice"
git push
```

Setelah push:

* GitHub menerima source code terbaru.
* Vercel menjalankan build.
* Jika build berhasil, aplikasi production diperbarui.
* Jika build gagal, versi production sebelumnya tetap digunakan.

---

# 43. Environment

## Local Development

```text
Next.js local server
Neon development database
Development file storage
```

## Preview

```text
Vercel Preview Deployment
Development atau preview database
```

## Production

```text
Vercel Production
Neon production database
Production file storage
```

## Environment Variables

```text
DATABASE_URL
AUTH_SECRET
NEXT_PUBLIC_APP_URL
STORAGE_TOKEN
```

Variabel tambahan dapat ditambahkan berdasarkan provider authentication, email, dan storage.

## Aturan Environment

* `.env.local` tidak masuk GitHub.
* `.env.example` masuk GitHub tanpa nilai rahasia.
* Production secret disimpan di Vercel Environment Variables.
* Database development dan production dipisahkan.
* Migration diuji sebelum dijalankan di production.

---

# 44. User Stories

## Klien

Sebagai pengguna, saya ingin menyimpan data klien agar tidak mengetik ulang identitas mereka pada setiap dokumen.

## Feature Library

Sebagai pengguna, saya ingin memiliki pustaka modul dan fitur agar dapat menyusun scope dengan cepat.

## Scope

Sebagai pengguna, saya ingin memilih fitur dari library dan menyesuaikannya untuk proyek tertentu.

## RAB

Sebagai pengguna, saya ingin RAB dihitung otomatis agar mengurangi kesalahan dan waktu pengerjaan.

## Quotation

Sebagai pengguna, saya ingin mengubah RAB menjadi quotation profesional untuk dikirim kepada klien.

## Task

Sebagai pengguna, saya ingin mengubah scope menjadi task agar pekerjaan sesuai dengan penawaran.

## Priority

Sebagai pengguna, saya ingin sistem membantu menentukan task yang harus dikerjakan terlebih dahulu.

## WIP Limit

Sebagai pengguna, saya ingin dibatasi saat memulai task baru agar pekerjaan lama diselesaikan.

## Invoice

Sebagai pengguna, saya ingin membuat invoice dari quotation atau termin agar tidak mengetik nominal ulang.

## Payment

Sebagai pengguna, saya ingin mencatat pembayaran agar mengetahui sisa tagihan.

## Receipt

Sebagai pengguna, saya ingin menghasilkan kuitansi dari pembayaran agar dapat mengirim bukti resmi.

---

# 45. KPI MVP

## Produktivitas

* Maksimal dua task berstatus In Progress.
* Maksimal tiga task menjadi fokus harian.
* Minimal 70% task yang dimulai selesai sebelum task baru dimulai.
* Jumlah WIP override dapat dipantau.

## RAB

* RAB sederhana dapat dibuat dalam kurang dari 15 menit.
* Minimal 60% item RAB berasal dari Feature Library.
* Tidak ada kesalahan perhitungan subtotal dan total.
* RAB dapat digunakan tanpa spreadsheet eksternal.

## Penagihan

* Invoice dapat dibuat dari quotation dalam kurang dari dua menit.
* Tidak ada perbedaan nilai antara invoice dan termin asal.
* Seluruh pembayaran terhubung ke invoice.
* Kuitansi dapat dibuat kurang dari satu menit setelah pembayaran dicatat.

## Akses

* Aplikasi dapat dibuka melalui URL Vercel.
* Source code tersimpan di GitHub.
* Data tetap tersedia ketika komputer dimatikan.
* Tidak membutuhkan server lokal untuk menggunakan aplikasi production.

---

# 46. Roadmap Pengembangan

## Fase 0 — Foundation

* Setup Next.js
* Setup TypeScript
* Setup Tailwind
* Setup shadcn/ui
* Setup Neon
* Setup Drizzle
* Authentication
* Layout aplikasi
* Environment configuration
* GitHub repository
* Vercel deployment

## Fase 1 — Business Foundation

* Business Profile
* Bank Accounts
* Client Management
* Project Management
* General Settings
* Document Numbering

## Fase 2 — Feature Library

* Feature Categories
* Feature Modules
* Feature Items
* Checklist
* Definition of Done
* Harga default
* Estimasi default

## Fase 3 — Scope dan RAB

* Scope Builder
* Project feature snapshot
* RAB calculation engine
* RAB sections
* RAB items
* PDF preview
* Spreadsheet export

## Fase 4 — Quotation

* Quotation generator
* Payment terms
* Revision
* Approval manual
* PDF export

## Fase 5 — Task dan Produktivitas

* Generate task
* Task Board
* Checklist
* Dependensi
* Priority Score
* WIP Limit
* Daily Focus
* Progress proyek

## Fase 6 — Finance

* Invoice
* Invoice from payment term
* Partial payment
* Payment tracking
* Receipt
* Nota
* PDF export

## Fase 7 — Dashboard dan Polishing

* Dashboard
* Notification internal
* Activity Log
* Global search
* Filter
* Responsive design
* Error monitoring
* Performance optimization

---

# 47. Prioritas MoSCoW

## Must Have

* Authentication
* Business Profile
* Client Management
* Project Management
* Feature Library
* Scope Builder
* RAB
* Quotation
* Task Management
* Priority
* WIP Limit
* Daily Focus
* Invoice
* Payment
* Kuitansi
* PDF Export
* GitHub repository
* Vercel deployment
* Neon database

## Should Have

* Spreadsheet export
* Quotation revision
* Task dependencies
* Activity Log
* Notification internal
* Project duplication
* File attachment
* Dashboard

## Could Have

* Public quotation link
* Email delivery
* Change Request
* Contract generator
* Client portal
* Recurring invoice
* Template proyek
* Analytics

## Won’t Have pada MVP

* Multi-tenant
* Team collaboration
* Mobile application
* Payment gateway
* AI generator
* Accounting lengkap
* WhatsApp automation
* Marketplace template
* Subscription billing

---

# 48. Risiko dan Mitigasi

## Risiko: Scope Terlalu Besar

Pengguna dapat tergoda membangun seluruh modul sekaligus.

**Mitigasi:**

* Ikuti urutan fase.
* Satu fase diselesaikan sebelum fase berikutnya.
* Fitur baru dimasukkan ke backlog.
* Dashboard dibuat setelah modul sumber data.

## Risiko: Terlalu Fokus pada UI

Pengembangan dapat tertunda karena terlalu banyak memperbaiki desain.

**Mitigasi:**

* Gunakan shadcn/ui.
* Gunakan satu layout.
* Gunakan komponen standar.
* Prioritaskan alur kerja sebelum visual khusus.

## Risiko: PDF Sulit Dibuat

Layout web dan PDF dapat berbeda.

**Mitigasi:**

* Gunakan satu template HTML.
* Buat print stylesheet.
* Mulai dari satu desain dokumen.
* Hindari drag-and-drop template editor pada MVP.

## Risiko: Estimasi Tidak Akurat

Harga dan estimasi library dapat meleset.

**Mitigasi:**

* Simpan estimasi awal.
* Catat actual time pada fase lanjutan.
* Review template setelah proyek selesai.
* Izinkan override harga per proyek.

## Risiko: Deployment Gagal

Perubahan source code dapat gagal dibangun di Vercel.

**Mitigasi:**

* Jalankan build lokal sebelum push.
* Gunakan TypeScript checking.
* Gunakan linting.
* Review migration.
* Pisahkan development dan production database.

## Risiko: Data Production Terganggu

Migration atau development dapat memengaruhi data utama.

**Mitigasi:**

* Pisahkan database development dan production.
* Backup database.
* Gunakan transaction untuk data keuangan.
* Hindari pengujian menggunakan production database.

---

# 49. Definition of Done per Fitur

Sebuah fitur dianggap selesai ketika:

* Requirement utama terpenuhi.
* Tampilan desktop berfungsi.
* Tampilan mobile tidak rusak.
* Validasi client tersedia.
* Validasi server tersedia.
* Authorization diperiksa.
* Error state tersedia.
* Empty state tersedia.
* Loading state tersedia.
* Database migration tersedia.
* Data dapat dibuat.
* Data dapat dibaca.
* Data dapat diperbarui.
* Data dapat diarsipkan atau dibatalkan.
* Build production berhasil.
* Fitur diuji pada deployment Vercel.

---

# 50. Definition of Done MVP

MVP dinyatakan selesai ketika pengguna dapat menjalankan alur berikut tanpa spreadsheet atau aplikasi invoice terpisah:

```text
Login
↓
Membuat profil bisnis
↓
Membuat klien
↓
Membuat proyek
↓
Memilih fitur dari Feature Library
↓
Menyusun scope
↓
Menghasilkan RAB
↓
Menghasilkan quotation PDF
↓
Mengubah scope menjadi task
↓
Menentukan fokus harian
↓
Menyelesaikan pekerjaan
↓
Membuat invoice
↓
Mencatat pembayaran
↓
Menghasilkan kuitansi PDF
```

Selain itu:

* Aplikasi online di Vercel.
* Source code tersimpan di GitHub.
* Database production tersimpan di Neon.
* File menggunakan object storage.
* Aplikasi dapat dibuka melalui browser.
* Aplikasi tidak membutuhkan server lokal.
* Database development dan production terpisah.
* Dokumen memiliki tampilan profesional.
* Data keuangan dihitung dan divalidasi di server.

---

# 51. Urutan Implementasi Teknis

```text
1. Repository GitHub
2. Next.js dan TypeScript
3. Tailwind dan shadcn/ui
4. Neon dan Drizzle
5. Authentication
6. Deployment Vercel
7. Business Profile
8. Client Management
9. Project Management
10. Document Numbering
11. Feature Categories
12. Feature Modules
13. Feature Items
14. Scope Builder
15. RAB Calculation Engine
16. RAB Editor
17. Quotation
18. Payment Terms
19. PDF Generator
20. Task Generator
21. Task Board
22. Priority Score
23. WIP Limit
24. Daily Focus
25. Invoice
26. Payment
27. Receipt
28. Dashboard
29. Activity Log
30. Notification
```

---

# 52. Keputusan Produk Final

1. Aplikasi dikembangkan menggunakan Windows.
2. Source code disimpan di GitHub private repository.
3. Aplikasi production di-deploy ke Vercel.
4. Database menggunakan Neon PostgreSQL.
5. ORM menggunakan Drizzle.
6. Aplikasi menggunakan Next.js dan TypeScript.
7. File menggunakan object storage.
8. Aplikasi versi pertama bersifat single-user.
9. Feature Library menjadi pusat penyusunan scope.
10. Fitur proyek menggunakan snapshot.
11. RAB menjadi sumber quotation.
12. Quotation menjadi sumber invoice.
13. Pembayaran menjadi sumber kuitansi.
14. WIP Limit menjadi fitur wajib.
15. Dashboard dikembangkan setelah modul utama.
16. Aplikasi tidak menggunakan server lokal untuk penggunaan sehari-hari.
17. MVP tidak dibangun sebagai SaaS.
18. MVP tidak menggunakan microservices.
19. MVP tidak membutuhkan mobile application.
20. Fokus utama adalah menyelesaikan kebutuhan pribadi pengguna.

---

# 53. Kesimpulan

ProjectFlow dibangun sebagai aplikasi web pribadi untuk menyelesaikan tiga masalah utama:

1. Kesulitan menentukan prioritas dan menjaga fokus.
2. Lamanya membuat daftar fitur dan RAB.
3. Terpisahnya proses proyek, invoice, pembayaran, dan kuitansi.

Keberhasilan produk tidak ditentukan dari jumlah fitur.

Keberhasilan ditentukan dari kemampuan aplikasi mempercepat alur:

> Menyusun scope lebih cepat, mengerjakan proyek lebih fokus, dan menagih klien secara profesional.
