/* =====================================================================
   FS2T — DATA KELAS PUBLIKASI, RISET 101, KLINIK NASKAH, DAN BANK IDE RISET
   Ubah isi file ini untuk memperbarui halaman Kelas Publikasi, Klinik Naskah,
   dan Bank Ide Riset. Setelah mengubah, naikkan angka ?v= untuk riset.js
   di fs2t/index.html.

   Format tanggal: "2027-03-14" (tahun-bulan-tanggal), jam: "19.00".

   whatsapp   : nomor WA narahubung Klinik Naskah (mis. "08123456789").
                Kosong → memakai kontak.whatsapp FS2T di bso-config.js (jika ada).
   instagram  : akun IG FS2T tanpa @ (dipakai untuk tombol "Ikuti" di Riset 101).
   klinikBuka : true kalau pendaftaran Klinik Naskah bulan ini sedang dibuka.

   kelas: jadwal Kelas Publikasi
     { tanggal, jam, selesai, topik, pemateri, tempat: "Zoom" / "Google Meet", link: "link daftar/ruang" }

   riset101: konten Riset 101 yang sudah tayang di Instagram
     { judul, ig: "link post", tanggal }

   bankIde: Bank Ide Riset (topik yang bisa diambil siapa saja)
     { judul, prodi: "Biologi" / "Lintas prodi" / …, dari: "dosen" | "mahasiswa",
       pengusul: "nama (opsional)", isi, status: "terbuka" | "diambil" }
   ===================================================================== */
window.FS2T = {
  whatsapp: "",
  instagram: "",
  klinikBuka: false,

  kelas: [],
  riset101: [],
  bankIde: [],

  // Data contoh: hanya tampil di mode demo selama daftar di atas masih kosong.
  contoh() {
    const pad = (n) => String(n).padStart(2, "0");
    const tg = (hari) => { const d = new Date(); d.setDate(d.getDate() + hari); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    return {
      kelas: [
        { tanggal: tg(-30), jam: "19.00", selesai: "20.00", topik: "Cara memilih jurnal: SINTA, Scopus, dan DOAJ", pemateri: "Contoh: dosen FMIPA", tempat: "Zoom", link: "#" },
        { tanggal: tg(9), jam: "19.00", selesai: "20.00", topik: "Mengenali jurnal predator", pemateri: "Contoh: pengelola jurnal UM", tempat: "Zoom", link: "#" },
        { tanggal: tg(39), jam: "19.00", selesai: "20.00", topik: "Alur submit, review, sampai revisi", pemateri: "Contoh: kakak tingkat yang sudah publikasi", tempat: "Google Meet" }
      ],
      riset101: [
        { judul: "5 tanda jurnal predator", ig: "#", tanggal: tg(-8) },
        { judul: "Beda artikel review dan artikel riset", ig: "#", tanggal: tg(-22) },
        { judul: "Mulai pakai Zotero dalam 10 menit", ig: "#", tanggal: tg(-36) }
      ],
      bankIde: [
        { judul: "Kualitas air sumur di sekitar kampus UM", prodi: "Kimia", dari: "dosen", pengusul: "Contoh: dosen Kimia", isi: "Uji parameter sederhana (pH, kesadahan, bakteri coliform) dan peta sebarannya.", status: "terbuka" },
        { judul: "Model penyebaran informasi hoaks di grup WhatsApp", prodi: "Matematika", dari: "mahasiswa", isi: "Pemodelan matematis dengan data survei mahasiswa.", status: "terbuka" },
        { judul: "Keanekaragaman serangga penyerbuk di taman kampus", prodi: "Biologi", dari: "dosen", isi: "Pengamatan lapangan dan identifikasi spesies selama satu musim.", status: "diambil" },
        { judul: "Alat ukur kebisingan kelas berbasis Arduino", prodi: "Fisika", dari: "mahasiswa", isi: "Rancang bangun alat murah dan uji di beberapa ruang kuliah.", status: "terbuka" },
        { judul: "Literasi sains mahasiswa baru FMIPA", prodi: "Lintas prodi", dari: "mahasiswa", isi: "Survei dan analisis data lintas jurusan, cocok untuk tim campuran.", status: "terbuka" }
      ]
    };
  }
};
