ProjectFlow — Design System & UI Direction

Dokumen ini menjadi acuan utama bagi AI/coding assistant saat membangun antarmuka ProjectFlow, yaitu web app untuk mengelola klien, proyek, feature library, scope, RAB, task, invoice, pembayaran, dan kuitansi.

Desain harus mengambil inspirasi dari referensi visual yang diberikan pengguna: dashboard project management modern dengan sidebar gelap, area kerja terang, card putih, board berbasis kolom, tipografi bersih, dan aksen oranye.

AI harus mengikuti dokumen ini secara konsisten pada seluruh halaman dan komponen.

1. Design Goal

Buat antarmuka yang terasa:

Modern

Profesional

Ringan

Terorganisir

Fokus pada produktivitas

Mudah dipahami tanpa banyak instruksi

Cocok untuk developer, freelancer, solopreneur, dan pemilik bisnis jasa

Responsif pada desktop, tablet, dan mobile

Aplikasi tidak boleh terasa seperti dashboard admin generik yang kaku. Tampilannya harus lebih mirip workspace produktivitas modern.

2. Visual Direction

Gunakan karakter visual berikut:

Sidebar gelap dengan sudut membulat besar

Area konten utama berwarna putih atau off-white

Banyak whitespace

Card putih dengan border sangat tipis atau tanpa border berat

Shadow lembut dan minimal

Aksen oranye sebagai warna aksi utama

Heading hitam pekat

Deskripsi abu-abu netral

Badge pastel untuk status, kategori, dan label

Rounded corner besar

Ikon outline sederhana

Tabel dan board terasa ringan, bukan padat

Hindari:

Gradient berat

Efek 3D

Glassmorphism berlebihan

Border tebal

Terlalu banyak warna

Shadow gelap

Card terlalu kecil dan rapat

Layout admin panel kuno

Elemen dekoratif yang tidak memiliki fungsi

3. Brand Personality

ProjectFlow harus terasa seperti:

Asisten kerja yang tenang

Sistem bisnis yang terpercaya

Workspace pribadi yang rapi

Modern tetapi tidak terlalu korporat

Profesional tetapi tetap ramah

Kata kunci desain:

Focused, Clean, Structured, Calm, Professional, Efficient, Modern.

4. Color System

Primary

--primary: #FF7A1A;
--primary-hover: #F26B0B;
--primary-active: #DB5C00;
--primary-soft: #FFF1E6;

Gunakan warna primary untuk:

Tombol utama

CTA

Status aktif tertentu

Badge penting

Highlight progress

Ikon utama

Fokus navigasi

Dark Sidebar

--sidebar-bg: #202226;
--sidebar-surface: #292C31;
--sidebar-text: #F7F7F8;
--sidebar-muted: #9B9DA3;
--sidebar-border: #34373D;

Main Surface

--page-bg: #F4F4F2;
--surface: #FFFFFF;
--surface-soft: #FAFAF8;
--surface-muted: #F1F1EF;

Text

--text-primary: #202124;
--text-secondary: #5F6368;
--text-muted: #91959B;
--text-inverse: #FFFFFF;

Border

--border: #E8E8E4;
--border-strong: #D9D9D4;

Semantic Colors

--success: #2E9B63;
--success-soft: #E7F6EE;

--warning: #E8A11B;
--warning-soft: #FFF5D9;

--danger: #D94C4C;
--danger-soft: #FDECEC;

--info: #4D7CF3;
--info-soft: #EAF0FF;

--purple: #9B51E0;
--purple-soft: #F3E8FF;

--cyan: #3AAFB9;
--cyan-soft: #E4F7F8;

Gunakan warna semantic hanya untuk status dan feedback, bukan sebagai dekorasi utama.

5. Typography

Gunakan font sans-serif modern.

Pilihan utama:

Inter

Alternatif:

Geist
Manrope
Plus Jakarta Sans

Rekomendasi Next.js:

import { Inter } from 'next/font/google'

Type Scale

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 22px;
--text-2xl: 28px;
--text-3xl: 36px;

Usage

Page title: 28–32 px, semibold

Section title: 20–24 px, semibold

Card title: 16–18 px, semibold

Body: 14–16 px

Caption: 12–13 px

Table text: 13–14 px

Hindari font terlalu kecil. Minimum body text adalah 14 px.

6. Spacing System

Gunakan skala 4 px.

4, 8, 12, 16, 20, 24, 32, 40, 48, 64

Aturan:

Padding card: 16–24 px

Gap antar-card: 16–20 px

Gap antar-section: 24–32 px

Padding halaman desktop: 24–32 px

Padding halaman mobile: 16 px

Sidebar internal padding: 16–20 px

Jangan membuat layout terlalu padat.

7. Radius

Gunakan radius besar dan konsisten.

--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 28px;

Penggunaan:

Button: 10–12 px

Input: 10–12 px

Card: 14–18 px

Modal: 18–24 px

Sidebar container: 24–28 px

Badge: 999 px

8. Shadow

Gunakan shadow ringan.

--shadow-sm: 0 1px 2px rgba(24, 24, 27, 0.04);
--shadow-md: 0 4px 14px rgba(24, 24, 27, 0.06);
--shadow-lg: 0 12px 30px rgba(24, 24, 27, 0.08);

Jangan gunakan shadow hitam pekat.

9. Main Application Layout

Desktop

Struktur utama:

App Shell
├── Sidebar
└── Main Content
    ├── Top Header
    ├── Page Toolbar
    └── Page Content

Rekomendasi ukuran:

sidebar-width: 248px;
main-max-width: none;
page-min-height: 100vh;

Sidebar harus memiliki tinggi penuh, warna gelap, dan sudut membulat pada shell desktop.

Area main menggunakan background off-white. Konten utama menggunakan card putih atau kanvas putih.

Tablet

Sidebar dapat diperkecil menjadi icon rail 72–80 px

Label sidebar dapat disembunyikan

Main content tetap menggunakan padding 20–24 px

Board boleh scroll horizontal

Mobile

Sidebar berubah menjadi drawer

Header menampilkan tombol menu

Navigation utama dapat menggunakan bottom navigation untuk halaman inti

Board berubah menjadi horizontal scroll atau segmented tabs per status

Tabel berubah menjadi card list

Toolbar menjadi stack atau scroll horizontal

Form menggunakan satu kolom

Modal besar berubah menjadi bottom sheet atau full screen dialog

10. Sidebar

Struktur

Brand
Primary Navigation
Projects / Workspace
Finance
Settings
User Profile

Menu Utama

Dashboard
Clients
Projects
Feature Library
RAB & Quotations
Tasks
Invoices
Payments
Documents
Settings

Style

Background: #202226

Active item: background #2D3035

Active indicator dapat berupa pill atau garis kecil berwarna primary

Ikon 18–20 px

Tinggi item 42–46 px

Radius item 10–12 px

Label 14 px medium

Badge count berbentuk pill kecil

Active State

background: #2D3035;
color: #FFFFFF;

Badge aktif dapat menggunakan:

background: #FF7A1A;
color: white;

11. Top Header

Header berisi:

Breadcrumb atau nama halaman

Search global

Quick action

Notification

Profile menu

Contoh:

Projects / Website Company Profile
[Search] [Create] [Notification] [Profile]

Pada mobile:

[Menu] Page Title [Profile]

Search dapat disembunyikan ke command palette.

12. Page Header

Setiap halaman harus memiliki struktur konsisten:

Title
Description
Primary Action
Secondary Actions

Contoh:

Projects
Kelola seluruh proyek aktif dan progres pekerjaan.
[+ New Project] [Filter] [More]

Pada mobile, action utama tetap terlihat dan action tambahan masuk ke dropdown.

13. Buttons

Primary Button

background: #FF7A1A;
color: #FFFFFF;
border-radius: 12px;
height: 42px;
padding: 0 18px;
font-weight: 600;

Secondary Button

background: #FFFFFF;
color: #202124;
border: 1px solid #E8E8E4;

Ghost Button

background: transparent;
color: #5F6368;

Danger Button

Gunakan hanya pada tindakan destruktif.

Semua tombol harus memiliki:

Hover state

Active state

Focus ring

Disabled state

Loading state

14. Inputs

Gunakan input dengan karakter ringan.

height: 42px;
border: 1px solid #E8E8E4;
border-radius: 12px;
background: #FFFFFF;
padding: 0 14px;

Focus:

border-color: #FF7A1A;
box-shadow: 0 0 0 3px rgba(255, 122, 26, 0.12);

Form harus memiliki:

Label

Helper text bila diperlukan

Error message

Required indicator

Loading state

15. Cards

Card menjadi elemen utama.

Style:

background: #FFFFFF;
border: 1px solid #ECECE8;
border-radius: 16px;
box-shadow: 0 2px 8px rgba(24, 24, 27, 0.04);

Card tidak boleh terlalu banyak memiliki border internal.

Jenis card:

Project card

Task card

Financial summary card

Client card

Document card

Empty state card

Metric card

16. Task Board

Task board harus mengikuti karakter referensi.

Kolom default:

Backlog
Ready
In Progress
Review
Testing
Done

Setiap kolom memiliki:

Judul

Jumlah task

Tombol tambah

Daftar task card

Empty state

Task card memuat:

Badge proyek atau kategori

Judul task

Deskripsi singkat maksimal 3 baris

Deadline

Priority

Checklist progress

Label

Attachment count

Comment count

Status blocker bila ada

Task card tidak perlu menampilkan avatar untuk MVP single user.

Gunakan visual badge lembut.

Contoh:

[Backend] [High]
Implementasi Login dan Session
Buat autentikasi email dan password...
[30 Jul] [6/8 checklist]

Desktop:

Board horizontal

Lebar kolom 300–340 px

Bisa drag and drop

Mobile:

Gunakan segmented tabs status

Tampilkan satu kolom dalam satu waktu

Alternatif: horizontal scroll per kolom

17. Dashboard

Dashboard harus sederhana dan fokus.

Struktur Desktop

Welcome / Focus Summary
├── Daily Focus
├── Active Projects
├── Financial Summary
└── Recent Activity

Prioritas Tampilan

Fokus hari ini

Task yang terlambat

Proyek aktif

Invoice belum dibayar

Aktivitas terbaru

Jangan menampilkan terlalu banyak grafik.

Gunakan maksimal satu atau dua visual chart pada versi lanjutan.

18. Project Detail

Gunakan header proyek dan tab.

Project Header
├── Name
├── Client
├── Status
├── Progress
├── Deadline
└── Actions

Tabs
Overview | Scope | Tasks | RAB | Invoices | Files | Activity

Project header menggunakan card besar dengan progress bar.

Pada mobile, tab harus scroll horizontal.

19. Feature Library

Layout desktop:

Sidebar kategori
Main module list
Detail panel atau drawer

Fitur penting:

Search

Filter kategori

Add module

Add feature

Duplicate

Activate / deactivate

Card module harus menampilkan:

Nama modul

Deskripsi singkat

Jumlah fitur

Estimasi total

Harga total default

Complexity badge

Mobile:

Kategori menjadi filter dropdown

Detail dibuka dalam full-screen drawer

20. Scope Builder

Scope Builder harus terasa seperti editor modular.

Desktop:

Available Library | Project Scope | Cost Summary

Rekomendasi proporsi:

30% | 45% | 25%

Fitur:

Drag and drop module

Expand collapse module

Reorder item

Edit inline

Mark optional

Exclude item

View subtotal

Mobile:

Gunakan stepper tiga tahap:

Pilih fitur

Susun scope

Review biaya

Jangan menampilkan tiga panel sekaligus pada mobile.

21. RAB Editor

RAB editor harus profesional dan nyaman digunakan.

Desktop:

Document Form | Live Preview

atau:

Editable Table
Summary Sidebar

Tabel RAB mencakup:

Item Pekerjaan
Qty
Satuan
Harga
Subtotal
Bobot
Actions

Aturan responsif:

Desktop: tabel penuh

Tablet: tabel horizontal scroll

Mobile: setiap item menjadi card editable

Summary biaya harus sticky pada desktop.

Subtotal
Diskon
Pajak
Biaya Tambahan
Grand Total

Gunakan angka monospaced atau tabular-nums agar nominal rapi.

22. Invoice & Quotation Design

Editor:

Form dan preview terpisah

Preview berbentuk kertas A4

Background sekitar preview abu-abu lembut

Dokumen putih dengan shadow ringan

Dokumen harus tampil:

Bersih

Profesional

Tidak berlebihan

Banyak whitespace

Informasi total mudah ditemukan

Gunakan warna brand hanya pada:

Heading

Garis pemisah

Badge status

Total amount

Jangan membuat invoice terlalu penuh warna.

23. Tables

Tabel digunakan pada:

Clients

Projects

Quotations

Invoices

Payments

Documents

Style:

Header background sangat lembut

Row height 52–58 px

Border horizontal tipis

Tidak perlu border vertikal

Sticky header bila tabel panjang

Hover row ringan

Action menggunakan dropdown menu

Mobile:

Jangan memaksa tabel desktop mengecil

Ubah menjadi card list

Prioritaskan informasi utama

Secondary information ditampilkan di detail

24. Status Badge

Gunakan badge berbentuk pill.

Contoh mapping:

Draft         → Gray
In Progress   → Blue
Review        → Purple
Approved      → Green
Paid          → Green
Partially Paid→ Yellow
Overdue       → Red
Blocked       → Red
Optional      → Orange Soft
Completed     → Green

Badge tidak boleh terlalu kontras kecuali untuk error.

25. Modals, Drawers, and Sheets

Desktop:

Modal untuk aksi sederhana

Side drawer untuk detail dan edit cepat

Mobile:

Gunakan bottom sheet untuk filter dan action

Gunakan full-screen dialog untuk form panjang

Jangan menggunakan modal kecil untuk form kompleks.

26. Empty States

Empty state harus membantu pengguna melakukan aksi berikutnya.

Struktur:

Icon
Title
Short description
Primary action
Optional secondary action

Contoh:

Belum ada proyek
Buat proyek pertama untuk mulai menyusun scope dan RAB.
[Create Project]

Gunakan ilustrasi sederhana atau ikon besar, bukan gambar kompleks.

27. Loading States

Gunakan:

Skeleton untuk card dan tabel

Spinner kecil pada tombol

Progress state saat generate PDF

Optimistic update untuk task board bila aman

Hindari loading screen kosong.

28. Error States

Error harus menggunakan bahasa sederhana.

Contoh:

Gagal memuat data
Periksa koneksi internet lalu coba lagi.
[Try Again]

Jangan menampilkan error teknis langsung kepada pengguna.

29. Responsive Breakpoints

Gunakan breakpoint berikut:

sm: 640px;
md: 768px;
lg: 1024px;
xl: 1280px;
2xl: 1536px;

Panduan:

Mobile < 768px

Sidebar menjadi drawer

Konten satu kolom

Form satu kolom

Table menjadi card list

Toolbar scroll horizontal atau stack

Board menjadi satu status per tampilan

Floating primary action diperbolehkan

Tablet 768px–1023px

Sidebar dapat menjadi icon rail

Grid maksimum dua kolom

Table boleh scroll horizontal

Form dapat dua kolom untuk field pendek

Desktop >= 1024px

Sidebar penuh

Multi-column layout

Board horizontal

Sticky summary dan toolbar diperbolehkan

30. Mobile Navigation

Untuk mobile, gunakan salah satu pola berikut:

Primary Recommendation

Bottom navigation dengan 4–5 menu:

Home
Projects
Tasks
Finance
More

Menu lain berada pada halaman More atau drawer.

Hindari menampilkan seluruh menu desktop pada bottom navigation.

31. Interaction Principles

Primary action harus jelas

Jangan menampilkan terlalu banyak CTA sekaligus

Gunakan progressive disclosure

Detail kompleks dibuka ketika dibutuhkan

Konfirmasi hanya untuk tindakan destruktif

Autosave dapat digunakan pada editor panjang

Tampilkan feedback setelah save

Gunakan keyboard shortcut untuk power user pada fase lanjutan

32. Accessibility

Wajib:

Kontras minimal WCAG AA

Semua input memiliki label

Semua ikon tombol memiliki aria-label

Focus ring terlihat

Navigasi keyboard berjalan

Informasi status tidak hanya mengandalkan warna

Area klik minimum 40 × 40 px

Dialog memiliki focus trap

33. Iconography

Gunakan satu library ikon secara konsisten.

Rekomendasi:

Lucide React

Aturan:

Ukuran default 18–20 px

Stroke 1.75–2 px

Jangan mencampur banyak gaya ikon

Jangan menggunakan ikon filled dan outline secara acak

34. Motion

Gunakan animasi pendek dan halus.

transition-duration: 150ms–220ms;

Gunakan untuk:

Hover

Drawer

Modal

Dropdown

Drag and drop

Collapse module

Hindari animasi berlebihan.

35. Component Standards

AI harus membuat komponen reusable berikut:

AppShell
Sidebar
MobileNavigation
PageHeader
PageToolbar
SearchInput
FilterButton
StatusBadge
MetricCard
ProjectCard
TaskCard
ClientCard
DocumentCard
DataTable
ResponsiveCardList
EmptyState
ErrorState
LoadingSkeleton
ConfirmDialog
SideDrawer
FormSection
MoneyInput
DatePicker
DocumentPreview
ActivityItem

Jangan membuat komponen yang sama berulang kali di halaman berbeda.

36. shadcn/ui Usage

Gunakan shadcn/ui untuk fondasi:

Button
Input
Textarea
Select
Dropdown Menu
Dialog
Sheet
Tabs
Table
Badge
Card
Popover
Command
Tooltip
Skeleton
Toast
Calendar

Namun styling harus disesuaikan dengan design system ini. Jangan menggunakan tampilan default mentah tanpa penyesuaian.

37. Page-Specific Responsive Rules

Dashboard

Desktop: grid 12 kolom.

Mobile: semua section satu kolom.

Projects

Desktop: table atau grid card.

Mobile: card list.

Task Board

Desktop: horizontal kanban.

Mobile: segmented status tabs.

Feature Library

Desktop: category sidebar + content.

Mobile: category filter + stacked cards.

Scope Builder

Desktop: tiga panel.

Mobile: stepper.

RAB Editor

Desktop: editable table + summary.

Mobile: editable item cards.

Invoice Preview

Desktop: form + A4 preview.

Mobile: form dan preview dalam tab terpisah.

38. Suggested Main Screens

AI harus mendesain layar berikut secara konsisten:

1. Login
2. Dashboard
3. Clients List
4. Client Detail
5. Projects List
6. Project Detail
7. Feature Library
8. Scope Builder
9. RAB List
10. RAB Editor
11. Quotation Preview
12. Task Board
13. Daily Focus
14. Invoices List
15. Invoice Editor
16. Payments List
17. Receipt Preview
18. Documents
19. Business Profile
20. Settings

39. Recommended Layout Example

<AppShell>
  <Sidebar />

  <main className="min-w-0 flex-1 bg-[#F4F4F2]">
    <TopHeader />

    <div className="px-4 py-4 md:px-6 lg:px-8 lg:py-6">
      <PageHeader />
      <PageContent />
    </div>
  </main>
</AppShell>

40. AI Implementation Rules

Saat AI membuat halaman atau komponen, AI wajib:

Mengikuti warna, spacing, radius, dan typography pada dokumen ini.

Membuat layout responsif sejak awal, bukan setelah desktop selesai.

Tidak menggunakan fixed width yang menyebabkan overflow pada mobile.

Menggunakan semantic HTML.

Memisahkan komponen reusable.

Menghindari card berlebihan.

Menyediakan empty, loading, dan error state.

Memastikan tabel memiliki versi mobile.

Memastikan board dapat digunakan di mobile.

Menggunakan primary orange secara terbatas dan strategis.

Menggunakan sidebar gelap sebagai identitas utama aplikasi.

Tidak membuat UI seperti template admin generik.

Menjaga konsistensi visual antarhalaman.

Mengutamakan fungsi dan keterbacaan.

Menggunakan data dummy realistis ketika membuat prototype.

41. Final Design Summary

ProjectFlow harus terlihat seperti workspace project management modern dengan karakter berikut:

Dark rounded sidebar
Bright spacious workspace
White cards
Soft gray background
Orange primary accent
Large rounded corners
Light borders
Minimal shadow
Clear hierarchy
Responsive layouts
Professional document previews

Referensi visual utama adalah dashboard kanban modern yang diberikan pengguna, tetapi hasil akhir harus disesuaikan untuk kebutuhan ProjectFlow, bukan disalin mentah.

Desain harus membantu pengguna:

Mengetahui apa yang harus dikerjakan

Menyusun scope lebih cepat

Membuat RAB lebih mudah

Memantau proyek

Membuat invoice profesional

Mengurangi distraksi

Prioritas tertinggi desain adalah:

Clarity, focus, consistency, and responsiveness.
