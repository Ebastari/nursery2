# Workspace Instructions: Chatbot (Montana AI)

## Tujuan
Instruksi ini mengatur konvensi, arsitektur, dan praktik terbaik untuk pengembangan chatbot di aplikasi Montana AI (khusus folder `src/chatbot`).

---

## Struktur & Entry Point
- **Entry point utama:**
  - `src/chatbot/ChatbotButton.tsx` (tombol trigger)
  - `src/chatbot/ChatbotPanel.tsx` (UI panel utama)
- **Logika chatbot:**
  - `src/chatbot/chatbotLogic.ts` (semua pemrosesan, skenario, dan integrasi API)

---

## Prinsip Pengembangan
- **Pisahkan UI dan logika:**
  - Semua logic, rule, dan API call diletakkan di `chatbotLogic.ts`.
  - Komponen UI hanya mengelola tampilan dan event handler.
- **State percakapan** dikelola di level panel, bukan di tombol.
- **Modifikasi logic** (misal: skenario, respons, integrasi API) hanya di `chatbotLogic.ts`.
- **Modifikasi tampilan** (misal: layout, warna, animasi) di `ChatbotPanel.tsx` dan `ChatbotButton.tsx`.

---

## Potensi Masalah & Tips
- Hindari duplikasi state antara panel dan logic.
- Jika menambah fitur (misal: integrasi API eksternal), lakukan di `chatbotLogic.ts`.
- Pastikan event handler tidak tumpang tindih.
- Ikuti standar penamaan React/TypeScript.

---

## Contoh Prompt Penggunaan
- "Ubah respons default chatbot di `chatbotLogic.ts` menjadi bahasa Indonesia."
- "Tambahkan integrasi API cuaca ke chatbot."
- "Perbaiki bug input tidak bisa dikirim di ChatbotPanel."

---

## Lanjutkan Kustomisasi
- Untuk instruksi lebih spesifik (misal: hanya untuk logic, atau hanya UI), gunakan `applyTo` pada file terkait.
- Jika ingin menambah agent/skill baru, buat file instruksi baru dengan cakupan jelas.

---

**Link, jangan embed:** Jika ada dokumentasi tambahan, cukup link ke README atau file terkait, jangan duplikasi konten.

---

> Disusun otomatis oleh Copilot Workspace Bootstrapper, 2026.
