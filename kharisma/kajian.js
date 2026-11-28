/* =====================================================================
   Kharisma — DATA KAJIAN, AGENDA, DAN FUN FACT
   Ubah isi file ini untuk memperbarui halaman Ngaji Sains, Agenda, dan Fun Fact.
   Setelah mengubah, naikkan angka ?v= untuk kajian.js di kharisma/index.html.

   Format tanggal: "2027-03-14" (tahun-bulan-tanggal), jam: "15.30".

   ngajiSains: arsip & rencana tema Ngaji Sains
     { judul, bidang: "Fisika" | "Biologi" | "Matematika" | "Kimia" | "Umum",
       ayat, ringkas, pemateri: ["Ustadz …", "Dosen …"], tanggal, format: "Online" | "Offline" | "Hybrid",
       tempat, materi: "link slide/catatan", rekaman: "link video" }
     Tanpa tanggal → tampil sebagai "Rencana tema".

   agenda: kegiatan di kalender (Ngaji Sains, Ngaji Online, Fun Fact, Ramadhan, lainnya)
     { judul, jenis: "ngaji-sains" | "ngaji-online" | "fun-fact" | "ramadhan" | "lain",
       tanggal, jam, selesai: "16.30", tempat, format, isi, link }

   libur: masa libur kegiatan (UTS, UAS) → diarsir di kalender
     { judul: "UTS", mulai: "2027-03-22", selesai: "2027-03-27" }

   funFact: konten Fun Fact MIPA yang sudah tayang di Instagram
     { judul, bidang, isi, ig: "link post Instagram", tanggal }

   tokoh: tokoh ilmuwan Muslim per bidang (tampil di halaman Fun Fact)
   ===================================================================== */
window.KHARISMA = {
  instagram: "", // contoh: "kharisma.fmipaum" → tombol "Ikuti di Instagram"

  ngajiSains: [
    {
      judul: "Penciptaan alam semesta dan kosmologi",
      bidang: "Fisika",
      ayat: "QS. Al-Anbiya: 30 · QS. Adz-Dzariyat: 47",
      ringkas: "Dari langit dan bumi yang dahulu menyatu hingga alam semesta yang terus mengembang: membaca ayat-ayat penciptaan bersama kosmologi modern."
    },
    {
      judul: "Proses penciptaan manusia",
      bidang: "Biologi",
      ayat: "QS. Al-Mu'minun: 12–14",
      ringkas: "Tahapan nutfah, 'alaqah, dan mudghah dibaca berdampingan dengan embriologi: bagaimana sains membantu kita merenungi diri sendiri."
    },
    {
      judul: "Al-Khawarizmi dan asal-usul aljabar",
      bidang: "Matematika",
      ayat: "QS. Al-Qamar: 49",
      ringkas: "Segala sesuatu diciptakan menurut ukuran. Kisah Al-Khawarizmi, kitab al-jabr, dan kenapa kata \"algoritma\" berasal dari namanya."
    },
    {
      judul: "Air, garam, dan keseimbangan alam",
      bidang: "Kimia",
      ayat: "QS. Al-Furqan: 53 · QS. Ar-Rahman: 19–20",
      ringkas: "Dua lautan, tawar dan asin, yang bertemu namun tidak bercampur: membahas sifat air, larutan garam, dan keseimbangan yang menjaga kehidupan."
    }
  ],

  agenda: [],
  libur: [],
  funFact: [],

  tokoh: [
    { nama: "Ibnu al-Haitham", bidang: "Fisika", masa: "965–1040 M", isi: "Bapak optika modern. Lewat Kitab al-Manazir ia menjelaskan bahwa kita melihat karena cahaya masuk ke mata, dan memakai eksperimen untuk menguji teori." },
    { nama: "Jabir bin Hayyan", bidang: "Kimia", masa: "± 721–815 M", isi: "Dikenal sebagai bapak kimia. Ia mengembangkan teknik distilasi, kristalisasi, dan penguapan yang menjadi dasar kerja laboratorium." },
    { nama: "Al-Khawarizmi", bidang: "Matematika", masa: "± 780–850 M", isi: "Penulis kitab al-jabr yang melahirkan kata \"aljabar\". Namanya dilatinkan menjadi \"algoritma\", istilah yang kini dipakai di seluruh dunia komputasi." },
    { nama: "Ibnu Sina", bidang: "Biologi", masa: "980–1037 M", isi: "Penulis Al-Qanun fi at-Tibb, ensiklopedia kedokteran yang menjadi rujukan di Eropa selama berabad-abad, termasuk tentang anatomi dan penyakit menular." }
  ],

  /* Data contoh: HANYA tampil di mode demo (situs tanpa database) supaya
     kalender & arsip bisa dicoba. Situs asli tidak memakai bagian ini. */
  contoh: function () {
    const t = (bulan, hari) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + bulan); d.setDate(hari); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
    return {
      agenda: [
        { judul: "Ngaji Sains: Air, garam, dan keseimbangan alam", jenis: "ngaji-sains", tanggal: t(0, 14), jam: "15.30", selesai: "16.30", format: "Hybrid", tempat: "Gazebo FMIPA & Zoom", isi: "Kajian bersama ustadz dan dosen Kimia, dilanjut tanya jawab." },
        { judul: "Ngaji Online: Tajwid dasar (mad dan waqaf)", jenis: "ngaji-online", tanggal: t(0, 6), jam: "19.30", selesai: "20.30", format: "Online", tempat: "Zoom", isi: "Belajar tajwid bareng pemateri tamu." },
        { judul: "Ngaji Online: Sejarah Baitul Hikmah", jenis: "ngaji-online", tanggal: t(0, 27), jam: "19.30", selesai: "20.30", format: "Online", tempat: "Zoom" },
        { judul: "Fun Fact MIPA: Jabir bin Hayyan", jenis: "fun-fact", tanggal: t(0, 20), format: "Instagram", isi: "Konten edukasi di Instagram." },
        { judul: "Ngaji Sains: Proses penciptaan manusia", jenis: "ngaji-sains", tanggal: t(1, 11), jam: "15.30", selesai: "16.30", format: "Offline", tempat: "Taman FMIPA" },
        { judul: "Bagi takjil bersama Sosling", jenis: "ramadhan", tanggal: t(2, 8), jam: "16.30", format: "Offline", tempat: "Depan Gedung FMIPA" }
      ],
      libur: [{ judul: "Libur UTS", mulai: t(1, 20), selesai: t(1, 26) }],
      funFact: [
        { judul: "Kenapa \"algoritma\" berasal dari nama orang?", bidang: "Matematika", isi: "Nama Al-Khawarizmi dilatinkan menjadi Algoritmi, lalu jadi kata algoritma.", tanggal: t(-1, 18) },
        { judul: "Kita melihat karena cahaya masuk ke mata", bidang: "Fisika", isi: "Ibnu al-Haitham membantah teori bahwa mata memancarkan sinar.", tanggal: t(0, 2) }
      ],
      // tanggal contoh untuk tema Ngaji Sains di atas (urutan ke-0, 1, 3)
      ngajiTanggal: { 0: t(-1, 10), 3: t(0, 14), 1: t(1, 11) }
    };
  }
};
