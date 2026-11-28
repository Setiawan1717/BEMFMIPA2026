/* =====================================================================
   ASWA — DATA STUDIO, OPEN PANGGUNG, DAN SPOTLIGHT
   Ubah isi file ini untuk memperbarui halaman Studio, Kirim Karya, dan Panggung.
   Setelah mengubah, naikkan angka ?v= untuk karya.js di aswa/index.html.

   Format tanggal: "2027-03-14" (tahun-bulan-tanggal), jam: "15.30".

   formKarya : link formulir kirim karya (mis. Google Form). Kosong → tombol "Segera dibuka".
   instagram : akun IG ASWA tanpa @ (dipakai untuk tombol "Ikuti" di Spotlight).

   bidang: empat bidang Studio ASWA (urutan = urutan giliran tiap bulan)
     { id, nama, isi, kegiatan: ["…"], pj: "nama penanggung jawab (opsional)" }

   studio: jadwal latihan Studio ASWA
     { bidang: "tari" | "teater" | "musik" | "rupa", tanggal, jam, selesai, tempat, materi, pelatih }

   panggung: jadwal Open Panggung
     { judul, tanggal, jam, tempat, penampil: ["ASWA Musik", "GSC-5", …], isi, video: "link" }

   spotlight: Spotlight "Karya Warga MIPA" yang sudah tayang di Instagram
     { nama, prodi, karya, jenis, ig: "link post", tanggal }
   ===================================================================== */
window.ASWA = {
  formKarya: "",
  instagram: "",

  bidang: [
    { id: "tari", nama: "Tari", isi: "Olah tubuh, dasar gerak, dan koreografi sederhana yang bisa dibawakan bersama.", kegiatan: ["Olah tubuh", "Dasar gerak", "Koreografi bersama"] },
    { id: "teater", nama: "Teater", isi: "Akting, olah vokal, dan improvisasi untuk berani tampil dan bercerita di depan orang.", kegiatan: ["Akting", "Olah vokal", "Improvisasi"] },
    { id: "musik", nama: "Musik", isi: "Jamming bareng, aransemen sederhana, dan latihan tampil sebagai band atau akustik.", kegiatan: ["Jamming", "Aransemen", "Akustik"] },
    { id: "rupa", nama: "Seni Rupa", isi: "Sketsa bersama, ilustrasi, dan desain yang bisa dipajang atau dipakai untuk BEM.", kegiatan: ["Sketsa bersama", "Ilustrasi", "Desain"] }
  ],

  studio: [],
  panggung: [],
  spotlight: [],

  // Data contoh: hanya muncul di mode demo selama data asli di atas masih kosong
  contoh() {
    const n = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    const tg = (tambahHari) => { const d = new Date(n.getFullYear(), n.getMonth(), n.getDate() + tambahHari); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    const urut = ["tari", "teater", "musik", "rupa"];
    const studio = [];
    for (let i = -3; i <= 4; i++) studio.push({ bidang: urut[(i + 8) % 4], tanggal: tg(i * 7 + 2), jam: "15.30", selesai: "17.00", tempat: "Selasar Gedung O5 FMIPA", materi: ["Olah tubuh & dasar gerak", "Membaca naskah pendek", "Jamming lagu pilihan", "Sketsa suasana kampus"][(i + 8) % 4], pelatih: "Contoh: alumni ASWA" });
    return {
      studio,
      panggung: [
        { judul: "Open Panggung #1", tanggal: tg(-20), jam: "16.00", tempat: "Gazebo FMIPA", penampil: ["ASWA Musik", "GSC-5", "Karya upload: puisi"], isi: "Open panggung perdana: akustik, pembacaan puisi, dan paduan suara.", video: "#" },
        { judul: "Open Panggung #2", tanggal: tg(16), jam: "16.00", tempat: "Selasar FMIPA", penampil: ["ASWA Teater", "ASWA Tari", "GSC-5"], isi: "Monolog pendek, tari kreasi, dan dua lagu dari GSC-5." }
      ],
      spotlight: [
        { nama: "Contoh: Nadia", prodi: "Biologi", karya: "Ilustrasi sel tumbuhan bergaya cat air", jenis: "Gambar", ig: "#", tanggal: tg(-12) },
        { nama: "Contoh: Raka", prodi: "Fisika", karya: "Lagu akustik \"Hukum Kedua\"", jenis: "Lagu", ig: "#", tanggal: tg(-26) },
        { nama: "Contoh: Salsa", prodi: "Matematika", karya: "Puisi \"Bilangan yang Tak Selesai\"", jenis: "Puisi", ig: "#", tanggal: tg(-40) }
      ]
    };
  }
};
