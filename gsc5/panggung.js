/* =====================================================================
   GSC-5 — DATA PANGGUNG (jadwal tampil & latihan)
   Ubah isi file ini untuk memperbarui halaman Panggung dan Ikut Nyanyi.
   Setelah mengubah, naikkan angka ?v= untuk panggung.js di gsc5/index.html.

   Format tanggal: "2027-08-14" (tahun-bulan-tanggal), jam: "08.00".

   tampil: daftar penampilan GSC-5
     { acara: "PKKMB FMIPA 2027",
       jenis: "pkkmb" | "pelantikan" | "yudisium" | "dies" | "bem" | "aswa" | "lain",
       tanggal, jam, tempat,
       lagu: ["Mars UM", "Hymne UM"],            (opsional)
       latihan: [{ tanggal, jam, tempat }],        2–3 latihan menjelang tampil
       buka: true,      → anggota lepas masih bisa ikut (tampil di Ikut Nyanyi)
       video: "link video penampilan",             (diisi setelah tampil)
       catatan: "…" }                              (opsional)
   ===================================================================== */
window.GSC5 = {
  tampil: [
    // Isi jadwal tampil sungguhan di sini. Selama kosong, mode demo memakai contoh di bawah.
  ],

  // Data contoh: HANYA tampil di mode demo (situs belum tersambung ke database).
  contoh() {
    const t = (tambahHari) => { const d = new Date(); d.setDate(d.getDate() + tambahHari); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
    return [
      { acara: "Yudisium FMIPA", jenis: "yudisium", tanggal: t(-40), jam: "08.00", tempat: "Aula Gedung O5", lagu: ["Indonesia Raya", "Hymne UM", "Bagimu Negeri"], video: "#" },
      { acara: "Pelantikan Pengurus BEM FMIPA", jenis: "pelantikan", tanggal: t(-12), jam: "09.00", tempat: "Gedung Sasana Budaya", lagu: ["Indonesia Raya", "Mars UM"], video: "#" },
      { acara: "Dies Natalis FMIPA", jenis: "dies", tanggal: t(16), jam: "08.30", tempat: "Aula Gedung O5", lagu: ["Indonesia Raya", "Hymne UM", "Medley lagu daerah"], buka: true,
        latihan: [{ tanggal: t(9), jam: "15.30", tempat: "Selasar Gedung O5" }, { tanggal: t(12), jam: "15.30", tempat: "Selasar Gedung O5" }, { tanggal: t(15), jam: "15.30", tempat: "Aula Gedung O5 (gladi)" }] },
      { acara: "Open Panggung ASWA", jenis: "aswa", tanggal: t(30), jam: "16.00", tempat: "Gazebo FMIPA", lagu: ["Akustik bersama ASWA"], buka: true,
        latihan: [{ tanggal: t(24), jam: "16.00", tempat: "Gazebo FMIPA" }, { tanggal: t(28), jam: "16.00", tempat: "Gazebo FMIPA" }] },
      { acara: "Yudisium FMIPA periode berikutnya", jenis: "yudisium", tanggal: t(58), jam: "08.00", tempat: "Aula Gedung O5", lagu: ["Indonesia Raya", "Hymne UM"], buka: true,
        latihan: [{ tanggal: t(52), jam: "15.30", tempat: "Selasar Gedung O5" }, { tanggal: t(56), jam: "15.30", tempat: "Aula Gedung O5 (gladi)" }] }
    ];
  }
};
