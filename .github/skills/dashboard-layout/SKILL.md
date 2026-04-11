---
name: dashboard-layout
category: UI/UX
scope: workspace
summary: >
  Workflow untuk merapikan halaman Home/Dashboard Montana Bibit agar tampil profesional, modern, dan tanpa elemen dobel.
description: |
  Skill ini memandu developer untuk menata ulang halaman Dashboard Montana Bibit sesuai prinsip desain modern, profesional, dan bebas duplikasi elemen. Fokus pada urutan blok, konsistensi visual, responsivitas, dan penghapusan elemen ganda.

steps:
  - Rapikan urutan dan hierarki blok utama sesuai urutan:
    1. Header (judul & tanggal)
    2. Status Bar (online/offline, waktu update)
    3. Total Stok Bibit (card besar, satu-satunya di atas)
    4. Montana Bibit AI (card khusus, tepat di bawah stok bibit)
    5. Ringkasan Kinerja Bibit (grid 3x3, bibit penting, tanpa duplikat)
    6. Grafik Kinerja (satu blok saja)
    7. Stok Per Tanaman (list, satu blok)
    8. Peringatan (satu blok)
    9. Distribusi & Surat Jalan (satu blok)
  - Terapkan tata letak & spasi:
    - Gunakan `space-y-6` antar section utama
    - Setiap blok utama dibungkus card dengan sudut membulat & shadow ringan
    - Grid/list tidak overflow, padding cukup, antar elemen tidak terlalu rapat
  - Terapkan warna & tipografi:
    - Warna utama: hijau (stok), biru (info), merah (warning)
    - Judul blok: font bold, subjudul lebih kecil & abu-abu
    - Angka penting: font besar, tebal, mudah dibaca
  - Pastikan responsif:
    - Grid 3x3 ringkasan bibit: mobile=1, tablet=2, desktop=3 kolom
    - Semua card/list responsif, tidak pecah di layar kecil
  - Hapus duplikasi:
    - Pastikan setiap blok hanya muncul satu kali
    - Tidak ada card, grafik, atau list dobel
  - Checklist akhir:
    - Urutan blok sesuai hierarki
    - Satu card per jenis blok
    - Grid & spasi rapi
    - Warna & tipografi konsisten
    - Tampilan responsif
    - Tidak ada elemen dobel

criteria:
  - Semua blok utama hanya muncul satu kali
  - Tidak ada elemen dobel (card, grafik, list)
  - Layout rapi, spasi cukup, tidak overflow
  - Warna & tipografi konsisten
  - Responsif di semua device

examples:
  - "Rapikan layout dashboard Montana Bibit sesuai SKILL.md ini."
  - "Pastikan tidak ada card/grafik dobel di halaman Home."
  - "Buat grid ringkasan bibit responsif 3x3, tanpa duplikat."
  - "Konsistenkan warna dan tipografi dashboard."

related:
  - ui-consistency
  - responsive-design
  - no-duplicate-blocks
---

# Skill: Dashboard Layout Montana Bibit

Panduan workflow untuk menata ulang halaman Dashboard Montana Bibit agar tampil profesional, modern, dan tanpa elemen dobel. Ikuti langkah dan checklist di atas untuk hasil optimal.