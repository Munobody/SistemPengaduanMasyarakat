# 📢 Sistem Pengaduan & Pelaporan Masyarakat

Website resmi **Sistem Pengaduan & Pelaporan Masyarakat** yang dibangun menggunakan teknologi modern untuk memudahkan masyarakat dalam menyampaikan aduan dan laporan secara cepat dan efisien.

🌐 [Kunjungi Aplikasi](https://sistem-pengaduan-masyarakat-ten.vercel.app/)

---

## 🚀 Tech Stack

| Teknologi | Deskripsi |
|-----------|-----------|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white) | Framework React untuk aplikasi fullstack |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | Bahasa pemrograman berbasis JavaScript |
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) | Library UI berbasis komponen |
| ![MUI](https://img.shields.io/badge/MUI-007FFF?logo=mui&logoColor=white) | UI Library berbasis Material Design |
| ![Scrum](https://img.shields.io/badge/Scrum-6DB33F?logo=scrum&logoColor=white&label=Metodologi) | Metodologi Agile berbasis sprint |

---

## 📦 Cara Clone dan Jalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/<username>/sistem-pengaduan-masyarakat.git
cd sistem-pengaduan-masyarakat
```

> Gantilah `<username>` dengan nama pengguna GitHub Anda.

### 2. Install Dependencies

Menggunakan **npm**:

```bash
npm install
```

Atau menggunakan **yarn**:

```bash
yarn install
```

### 3. Jalankan Proyek di Localhost

Menggunakan **npm**:

```bash
npm run dev
```

Atau menggunakan **yarn**:

```bash
yarn dev
```

Akses aplikasi Anda di: [http://localhost:3000](http://localhost:3000)

---

## 🧩 Fitur Utama

- 📨 Form pengaduan masyarakat secara online  
- 📝 Pelaporan dengan deskripsi dan bukti  
- 👤 Autentikasi pengguna  
- 🗃️ Manajemen data aduan  
- 📊 Dashboard dan tampilan data aduan untuk admin  

---

## 🧠 Metodologi Scrum

Proyek ini dikembangkan menggunakan metodologi **Scrum**, yang terdiri dari tahapan berikut:

- 🔹 *Sprint Planning*  
- 🔹 *Daily Stand-Up Meeting*  
- 🔹 *Sprint Review*  
- 🔹 *Sprint Retrospective*

Scrum memungkinkan kolaborasi tim yang lebih baik, perencanaan yang adaptif, dan peningkatan berkelanjutan dalam setiap iterasi.

---

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi!  
Jika Anda ingin berkontribusi:

1. Fork repositori ini  
2. Buat branch fitur:  
   ```bash
   git checkout -b fitur-baru
   ```
3. Commit perubahan Anda:  
   ```bash
   git commit -m "Menambahkan fitur baru"
   ```
4. Push ke branch:  
   ```bash
   git push origin fitur-baru
   ```
5. Buat **Pull Request**

---
---

## 📚 Catatan Teknis & Panduan Developer

### 📂 Struktur Proyek

- **`/src/components/dashboard/pengaduan/`**  
  Komponen form pengaduan masyarakat.
- **`/src/components/dashboard/wbs/`**  
  Komponen form pelaporan Whistle Blowing System (WBS).
- **`/src/lib/api/api.ts`**  
  Konfigurasi utama request API (axios).

---

### 📝 Aturan Validasi & UX Form

#### Pengaduan & WBS

- **Judul Laporan:**  
  - Maksimal **50 karakter**.  
  - Jumlah karakter tampil di bawah input.
- **Isi Laporan:**  
  - Maksimal **150 karakter**.  
  - Jumlah karakter tampil di bawah input.
- **Kategori, Jenis Unit, dan Unit:**  
  - Default kosong, user wajib memilih.
  - **Unit** hanya muncul setelah **Jenis Unit** dipilih.
- **Upload File:**  
  - Hanya menerima file gambar (jpg, jpeg, png) maksimal 1MB.
  - File diupload ke endpoint `/upload` sebelum submit data utama.
- **Reset Otomatis:**  
  - Setelah submit berhasil, semua field otomatis dikosongkan.

#### UX Lainnya

- **Helper text** pada form menampilkan jumlah karakter yang sudah diisi.
- **Toast** dari `react-toastify` digunakan untuk feedback error/sukses.

---

### 🛠️ Pengembangan & Penambahan Fitur

- Untuk menambah field baru, tambahkan pada state, validasi, dan tampilan form.
- Untuk endpoint baru, gunakan `/src/lib/api/api.ts` sebagai referensi.
- Gunakan komponen MUI (`@mui/material`) untuk konsistensi UI.
- Validasi tambahan? Gunakan toast untuk feedback user.

---

### 🧑‍💻 Tips Debugging & Maintenance

- Cek error API di console dan tampilkan pesan error yang jelas ke user.
- Jika ada perubahan pada struktur data backend, sesuaikan mapping data di frontend.
- Jangan lupa: **jangan set otomatis value select** pada kategori/jenis unit—biarkan user memilih sendiri.

---

### 🧪 Testing & QA

- Pastikan setiap perubahan pada form tetap menjaga validasi dan UX.
- Lakukan pengujian pada berbagai ukuran layar (mobile, tablet, desktop).
- Cek kembali reset form setelah submit sukses.

---

### 🚦 Alur Submit Data

1. **User mengisi form** (judul, isi, kategori, jenis unit, unit, dll).
2. **Validasi karakter** pada judul (50) & isi laporan (150).
3. **Upload file** (jika ada) ke `/upload`, dapatkan URL.
4. **Submit data utama** ke endpoint pengaduan/WBS.
5. **Tampilkan toast** sukses/gagal.
6. **Reset form** jika sukses.

---

### 💡 Catatan Lain

- Untuk perubahan besar, buat

---

> Dibuat dengan ❤️ oleh Tim Sistem Pengaduan & Pelaporan Masyarakat