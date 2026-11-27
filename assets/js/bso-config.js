/* =====================================================================
   FMIPA Connect — DAFTAR BADAN SEMI OTONOM (BSO)
   Teks bawaan tiap BSO. Deskripsi & status pendaftaran juga bisa diubah
   admin BSO lewat panel admin-nya (tersimpan di database).

   `slug` = nama folder <slug>/ (alamatnya situs.vercel.app/<slug>) dan nilai
   kolom `bso` di database.
   `departemen` = departemen BEM yang menaungi (harus sama persis dengan
   kolom departemen_bem di supabase/bso.sql).
   `pertanyaan` = isian formulir pendaftaran anggota. Jenis: text,
   textarea, select (isi `pilihan`), url. Data diri (nama, NIM, WA)
   otomatis diambil dari profil akun.
   ===================================================================== */
window.FC_BSO = {
  daftar: [
    {
      slug: "science-entrepreneur",
      nama: "Science Entrepreneur",
      departemen: "Hubeks",
      tagline: "Sains yang berdaya guna, ide yang bernilai usaha.",
      deskripsi: "Science Entrepreneur adalah Badan Semi Otonom Departemen Hubeks BEM FMIPA UM yang mewadahi mahasiswa FMIPA untuk mengembangkan jiwa wirausaha berbasis sains, dari ide hingga menjadi produk.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "ide_usaha", label: "Ide usaha berbasis sains yang ingin kamu kembangkan (opsional)", type: "textarea" }
      ]
    },
    {
      slug: "kharisma",
      nama: "Kharisma",
      departemen: "Kesma",
      tagline: "",
      deskripsi: "Kharisma adalah Badan Semi Otonom di bawah Departemen Kesma BEM FMIPA UM yang menjadi wadah bagi mahasiswa FMIPA untuk berkegiatan, berkembang, dan berkontribusi bersama.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "komipa",
      nama: "KOMIPA",
      departemen: "Seniora",
      tagline: "",
      deskripsi: "KOMIPA adalah Badan Semi Otonom di bawah Departemen Seniora BEM FMIPA UM yang menjadi wadah bagi mahasiswa FMIPA untuk menyalurkan minat, berkarya, dan berprestasi.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "portofolio", label: "Link portofolio (opsional)", type: "url" }
      ]
    },
    {
      slug: "gsc5",
      nama: "GSC-5",
      departemen: "Seniora",
      tagline: "",
      deskripsi: "GSC-5 adalah Badan Semi Otonom di bawah Departemen Seniora BEM FMIPA UM yang menjadi wadah bagi mahasiswa FMIPA untuk menyalurkan minat, berlatih, dan berprestasi.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "aswa",
      nama: "Aswa",
      departemen: "Seniora",
      tagline: "",
      deskripsi: "Aswa adalah Badan Semi Otonom di bawah Departemen Seniora BEM FMIPA UM yang menjadi wadah bagi mahasiswa FMIPA untuk menyalurkan minat, berkarya, dan berprestasi.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "fs2t",
      nama: "FS2T",
      departemen: "Riskel",
      tagline: "",
      deskripsi: "FS2T adalah Badan Semi Otonom di bawah Departemen Riskel BEM FMIPA UM yang menjadi wadah bagi mahasiswa FMIPA untuk berkembang di bidang riset dan keilmuan.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "minat_riset", label: "Bidang riset yang kamu minati", type: "text" }
      ]
    }
  ]
};
window.FC_BSO.cari = (slug) => window.FC_BSO.daftar.find((b) => b.slug === slug) || null;
