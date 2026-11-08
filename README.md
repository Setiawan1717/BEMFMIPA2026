# FMIPA Connect

Portal layanan mahasiswa FMIPA Universitas Negeri Malang:
Info Lomba, Info Beasiswa, Info Pelatihan, Kanal Pengaduan, dan Cari Teman Lomba,
plus panel admin untuk pengurus.

Website ini berupa HTML, CSS, dan JavaScript biasa (tanpa framework), dengan database Supabase.

```
fmipa-connect/
├── index.html            ← situs mahasiswa
├── admin.html            ← panel admin pengurus
├── assets/
│   ├── css/style.css
│   ├── img/logo.svg      ← logo FMIPA Connect (orisinal)
│   ├── img/logo-um.webp  ← logo UM (dari file yang kamu unggah)
│   └── js/
│       ├── config.js     ← ⚙️ pengaturan Supabase & kontak
│       ├── org.js        ← ⚙️ isi beranda: kabinet, visi misi, pengurus, departemen, proker, agenda, prestasi
│       ├── data.js       ← koneksi Supabase + mode demo
│       ├── ui.js         ← komponen tampilan bersama
│       ├── app.js        ← halaman mahasiswa
│       └── admin.js      ← halaman admin
└── supabase/schema.sql   ← tabel, keamanan (RLS), dan fungsi database
```

## Mode demo vs mode asli

Selama `SUPABASE_URL` di `assets/js/config.js` masih kosong, website berjalan dalam **mode demo**:
data contoh, tersimpan di browser masing-masing. Akun demo:

| Peran | Email | Kata sandi |
|---|---|---|
| Admin | admin@demo.id | admin123 |
| Mahasiswa | nadia@demo.id / rafi@demo.id / sekar@demo.id | demo123 |

Mode demo cocok untuk presentasi. Untuk dipakai seluruh mahasiswa, sambungkan ke Supabase.

## Menyambungkan ke Supabase (± 15 menit)

1. Buat akun dan proyek baru di https://supabase.com (paket gratis cukup). Pilih region **Southeast Asia (Singapore)**.
2. Buka **SQL Editor → New query**, salin seluruh isi `supabase/schema.sql`, lalu klik **Run**.
3. Buka **Project Settings → API**, salin **Project URL** dan **anon public key** ke `assets/js/config.js`:
   ```js
   SUPABASE_URL: "https://xxxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi...",
   ```
   Anon key memang aman ditaruh di situs; keamanan data dijaga oleh aturan RLS di `schema.sql`.
4. **Authentication → URL Configuration**: isi *Site URL* dengan alamat situsmu (misalnya `https://fmipa-connect.netlify.app`).
5. (Opsional) Hanya email kampus yang boleh daftar: isi `EMAIL_DOMAIN_KAMPUS: "um.ac.id"` di config.js,
   dan aktifkan blok nomor 7 di `schema.sql` supaya pembatasan juga berlaku di server.

### Menjadikan pengurus sebagai admin

1. Pengurus mendaftar seperti mahasiswa biasa di situs.
2. Di SQL Editor Supabase jalankan (ganti emailnya):
   ```sql
   insert into public.admins (user_id, peran)
   select id, 'admin' from auth.users where email = 'email.pengurus@students.um.ac.id';
   ```
3. Pengurus membuka `admin.html` dan masuk.

Tetapkan sedikit saja admin yang boleh membaca Kanal Pengaduan (misalnya Ketua BEM dan Kadep Advokesma),
karena laporan kekerasan bersifat sangat rahasia.

## Deploy ke Netlify (gratis)

1. Buka https://app.netlify.com/drop.
2. Seret folder `fmipa-connect` ke halaman itu. Situs langsung online.
3. Ganti nama situs di **Site configuration → Change site name**.
4. Jangan lupa isi alamat situs itu di Supabase (langkah 4 di atas).

Alternatif: GitHub Pages, Vercel, atau hosting cPanel kampus. Cukup unggah semua file apa adanya.

## Mengedit situs tanpa kode (Panel Admin → Edit situs)

Setelah masuk ke `admin.html` sebagai admin, buka bagian **Edit situs** di menu kiri:

| Menu | Yang bisa diubah |
|---|---|
| Tampilan | Nama situs, subjudul, logo situs, logo kampus/organisasi, warna (6 pilihan palet siap pakai atau atur sendiri), huruf judul dan isi |
| Profil Kabinet | Nama organisasi, kabinet, tagline, periode, deskripsi, foto bersama, visi, misi, nilai, angka statistik, label "CONTOH" |
| Beranda | Link video YouTube, program kerja unggulan, kalender kegiatan, prestasi |
| Pengurus Inti | Nama, jabatan, foto, LinkedIn |
| Departemen | Tambah/hapus departemen, foto, deskripsi, fokus, program kerja, anggota + LinkedIn |
| Kontak | WhatsApp, email, Instagram, alamat, Google Maps, kontak Satgas |

Foto otomatis dikecilkan sebelum diunggah. Klik **Simpan perubahan** di bar bawah; perubahan langsung tampil untuk semua pengunjung.
Tombol **Kembalikan seluruh situs ke isi bawaan** mengembalikan semuanya ke isi `org.js`.

Satu-satunya hal yang tetap diatur lewat file adalah koneksi Supabase di `config.js` (cukup sekali saat pemasangan).
File `org.js` sekarang berfungsi sebagai isi bawaan/cadangan.

## Isi bawaan (assets/js/org.js)

Beranda (hero, video profil, program unggulan, kalender, prestasi, layanan, kontak) dan halaman **About** (siapa kami, arah gerak/visi misi, struktur kepengurusan, pengurus inti) mengambil isinya dari `assets/js/org.js`:

- **pengurusInti**: nama, jabatan, foto, dan `linkedin` (link profil lengkap). Nama saat ini masih contoh.
- **departemen**: deskripsi, fokus, `proker` (nama + deskripsi, tampil di halaman departemen), dan `anggota` (kepala, wakil, staff, masing-masing dengan foto dan `linkedin`). Halaman tiap departemen terbuka saat kartu departemen di About diklik.
- Tombol LinkedIn yang belum diisi tampil redup selama `TANDAI_CONTOH: true`, dan disembunyikan saat `false`.
- **program**: program kerja unggulan (masih contoh, silakan sesuaikan).
- **agenda**: isi seperti `{ tanggal: "2027-02-14", judul: "Rapat Kerja", tempat: "Aula FMIPA" }` dan kegiatan langsung muncul di kalender.
- **prestasi**: poster ucapan selamat (masih contoh).
- Foto: simpan di `assets/img/` (format .webp atau .jpg, maksimal ±300 KB), lalu isi kolom `foto`, misalnya `foto: "assets/img/pengurus/ketua.webp"`.
- Setelah semua contoh diganti, ubah `TANDAI_CONTOH: true` menjadi `false` supaya label "CONTOH" hilang.

## Yang perlu diganti

Semua ada di `assets/js/config.js`:

- `KONTAK`: nomor WhatsApp, email, Instagram, dan link Google Maps BEM FMIPA.
- `SATGAS.kontak` dan `SATGAS.link`: kontak resmi **Satgas PPK UM** (tampil di halaman laporan kekerasan).
- `LOGO_UM_URL`: taruh file logo resmi UM di `assets/img/` (misalnya `logo-um.png`) lalu isi path-nya.
  Logo akan muncul di samping logo FMIPA Connect.

Lainnya:

- Foto kegiatan untuk bagian "Tentang" di beranda (cari teks `[Ganti dengan foto kegiatan BEM FMIPA`) di `assets/js/app.js`.
- Info lomba, beasiswa, dan pelatihan diisi lewat **Panel Admin → Info**. Data contoh hanya ada di mode demo.

## Cara kerja fitur

**Info Lomba / Beasiswa / Pelatihan**: admin menambah info; mahasiswa memfilter per kategori, mencari,
dan melihat tenggat. Dari detail lomba, mahasiswa bisa langsung membuat lowongan tim untuk lomba itu.

**Kanal Pengaduan**: tiga jenis laporan (kekerasan, penurunan UKT, aspirasi lain). Laporan kekerasan bisa anonim;
nama dan NIM tidak disimpan. Setiap laporan mendapat kode `FC-XXXXXXXX` untuk cek status. Mahasiswa tidak bisa membaca
tabel pengaduan sama sekali; hanya admin. Admin mengubah status, menulis catatan untuk pelapor, dan catatan internal.

**Cari Teman Lomba**: mahasiswa membuat lowongan (lomba, departemen dan peran yang dibutuhkan, jumlah slot).
Mahasiswa lain menggeser kartu ke kanan untuk mendaftar. Pendaftaran masuk ke tab **Lowongan Saya** milik pembuat,
yang bisa menerima atau menolak, lalu menghubungi pendaftar yang diterima lewat WhatsApp.
Nomor WhatsApp hanya terlihat oleh pembuat lowongan yang didaftari.

## Catatan

- Unduh CSV pengaduan di panel admin bekerja di situs yang di-hosting sendiri (tidak di pratinjau claude.ai).
- Poster info lomba memakai URL gambar. Unggah poster ke Supabase Storage atau Google Drive (akses publik), lalu tempel URL-nya.
