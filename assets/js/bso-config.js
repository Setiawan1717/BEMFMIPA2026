/* =====================================================================
   FMIPA Connect — DAFTAR SUB DIVISI
   Teks bawaan tiap sub divisi. Deskripsi & status pendaftaran juga bisa diubah
   admin sub divisi lewat panel admin-nya (tersimpan di database).

   `slug` = nama folder <slug>/ (alamatnya situs.vercel.app/<slug>) dan nilai
   kolom `bso` di database.
   `departemen` = departemen BEM yang menaungi (harus sama persis dengan
   kolom departemen_bem di supabase/bso.sql).
   `pertanyaan` = isian formulir pendaftaran anggota. Jenis: text,
   textarea, select (isi `pilihan`), url. Data diri (nama, NIM, WA)
   otomatis diambil dari profil akun.

   ISIAN HALAMAN (semua opsional; halaman Program & Galeri baru muncul di
   menu kalau datanya ada). Contoh lengkap ada di assets/js/bso-contoh.js.
     kepanjangan: "Kepanjangan nama sub divisi",
     logo: "../assets/img/bso/<slug>.png" atau link gambar,
     fokus:    [{ judul, isi }],
     pengurus: [{ nama, jabatan, prodi, foto, bio, instagram }],
     program:  [{ judul, isi, mulai: "2027-03" atau "2027-03-14", selesai, status }]
               (status otomatis dari tanggal; boleh dipaksa "akan" | "berjalan" | "selesai"),
     galeri:   [{ src, caption }],
     kontak:   { instagram, whatsapp, narahubung, email }
     sembunyikan: ["galeri", "pengumuman", "daftar"] → halaman bawaan yang tidak dipakai
               (tab admin Pendaftaran/Pengumuman ikut tersembunyi),
     cta:      { teks, href } → tombol utama di Beranda (bawaan: Daftar)
   ===================================================================== */
window.FC_BSO = {
  daftar: [
    {
      slug: "science-entrepreneur",
      nama: "Science Entrepreneur",
      departemen: "Hubeks",
      tagline: "Sains yang berdaya guna, ide yang bernilai usaha.",
      deskripsi: "Science Entrepreneur adalah sub divisi Departemen Hubeks BEM FMIPA UM yang mewadahi mahasiswa FMIPA untuk mengembangkan jiwa wirausaha berbasis sains, dari ide hingga menjadi produk.",
      // Halaman bawaan yang tidak dipakai SE (diganti Unit Usaha & Member di science-entrepreneur/app.js)
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      cta: { teks: "Lihat unit usaha", href: "#/unit-usaha" },
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "ide_usaha", label: "Ide usaha berbasis sains yang ingin kamu kembangkan (opsional)", type: "textarea" }
      ]
    },
    {
      slug: "kharisma",
      nama: "Kharisma",
      departemen: "Kesma",
      kepanjangan: "Kreativitas Islam FMIPA",
      tagline: "Tempat sains dan iman bertemu.",
      deskripsi: "Kharisma (Kreativitas Islam FMIPA) adalah sub divisi Departemen Kesma BEM FMIPA UM yang membahas Islam lewat kacamata sains. Lewat kajian, konten, dan kegiatan sosial, kami mengajak mahasiswa MIPA mengenal ayat-ayat kauniyah dengan cara yang kreatif dan santai.",
      // Halaman khusus Kharisma (Gabung, Ngaji Sains, Agenda, Fun Fact) ada di kharisma/app.js, datanya di kharisma/kajian.js
      cta: { teks: "Gabung jadi anggota", href: "#/gabung" },
      fokus: [
        { judul: "Kajian sains dan iman", isi: "Ngaji Sains dan Ngaji Online: membahas ayat-ayat kauniyah bersama ustadz dan dosen MIPA, plus tajwid dan sejarah Islam." },
        { judul: "Konten kreatif", isi: "Fun Fact MIPA di Instagram: fakta seputar MIPA dari sudut pandang Islam dan kisah ilmuwan Muslim di tiap bidang." },
        { judul: "Peduli sesama", isi: "Program Ramadhan bersama Kementerian Sosial Lingkungan: buka bersama, bagi takjil, dan donasi." }
      ],
      program: [
        { judul: "Ngaji Sains", isi: "Kajian tematik sebulan sekali yang menghubungkan ilmu MIPA dengan Islam, dibawakan ustadz dan dosen MIPA. Format santai sekitar 60 menit dengan tanya jawab; bulan-bulan awal dicoba online atau hybrid." },
        { judul: "Fun Fact MIPA", isi: "Konten Instagram sebulan sekali tentang fakta seputar MIPA dari sudut pandang Islam, termasuk tokoh ilmuwan Muslim sesuai jurusan." },
        { judul: "Ngaji Online", isi: "Pertemuan online tiap beberapa minggu dengan materi bergilir: tajwid, sejarah Islam, dan topik keislaman lain bersama pemateri tamu." },
        { judul: "Program Ramadhan", isi: "Buka bersama, bagi-bagi takjil, dan donasi selama Ramadhan, bekerja sama dengan Kementerian Sosial Lingkungan." }
      ],
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "program", label: "Program yang ingin kamu pegang", type: "select", wajib: true,
          pilihan: ["Ngaji Sains (host & MC)", "Fun Fact MIPA (desain & konten IG)", "Ngaji Online (host & fasilitator)", "Program Ramadhan (acara & donasi)", "Belum tahu, ikut arahan pengurus"] },
        { name: "skill", label: "Skill apa yang ingin kamu asah tahun ini? (opsional)", type: "text", hint: "Contoh: public speaking, desain Canva, copywriting, mengelola acara." }
      ]
    },
    {
      slug: "komipa",
      nama: "KOMIPA",
      departemen: "Seniora",
      tagline: "Ruang berkarya mahasiswa MIPA.",
      deskripsi: "KOMIPA adalah sub divisi di bawah Departemen Seniora BEM FMIPA UM yang mewadahi mahasiswa FMIPA untuk menyalurkan minat, mengasah kreativitas, dan menampilkan karya terbaiknya.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "portofolio", label: "Link portofolio (opsional)", type: "url" }
      ]
    },
    {
      slug: "gsc5",
      nama: "GSC-5",
      departemen: "Seniora",
      tagline: "Berlatih tekun, berprestasi bersama.",
      deskripsi: "GSC-5 adalah sub divisi di bawah Departemen Seniora BEM FMIPA UM. Kami mewadahi mahasiswa FMIPA yang ingin berlatih rutin, mengasah kemampuan, dan membawa nama FMIPA berprestasi di berbagai ajang.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "aswa",
      nama: "Aswa",
      departemen: "Seniora",
      tagline: "Ekspresikan dirimu, banggakan FMIPA.",
      deskripsi: "Aswa adalah sub divisi di bawah Departemen Seniora BEM FMIPA UM yang menjadi tempat mahasiswa FMIPA mengekspresikan diri lewat seni, berkarya bersama, dan tampil membanggakan fakultas.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "fs2t",
      nama: "FS2T",
      departemen: "Riskel",
      tagline: "Dari rasa ingin tahu menjadi riset.",
      deskripsi: "FS2T adalah sub divisi di bawah Departemen Riskel BEM FMIPA UM yang menumbuhkan budaya riset di kalangan mahasiswa FMIPA, dari diskusi keilmuan hingga persiapan lomba karya tulis dan penelitian.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "minat_riset", label: "Bidang riset yang kamu minati", type: "text" }
      ]
    }
  ]
};
window.FC_BSO.cari = (slug) => window.FC_BSO.daftar.find((b) => b.slug === slug) || null;
