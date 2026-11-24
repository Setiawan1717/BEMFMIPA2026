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
      tagline: "[Ganti dengan tagline Science Entrepreneur]",
      deskripsi: "[Ganti dengan deskripsi singkat Science Entrepreneur: tujuan, kegiatan utama, siapa yang bisa bergabung.]",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "ide_usaha", label: "Ide usaha berbasis sains yang ingin kamu kembangkan (opsional)", type: "textarea" }
      ]
    },
    {
      slug: "kharisma",
      nama: "Kharisma",
      departemen: "Kesma",
      tagline: "[Ganti dengan tagline Kharisma]",
      deskripsi: "[Ganti dengan deskripsi singkat Kharisma.]",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "komipa",
      nama: "KOMIPA",
      departemen: "Seniora",
      tagline: "[Ganti dengan tagline KOMIPA]",
      deskripsi: "[Ganti dengan deskripsi singkat KOMIPA.]",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "portofolio", label: "Link portofolio (opsional)", type: "url" }
      ]
    },
    {
      slug: "gsc5",
      nama: "GSC-5",
      departemen: "Seniora",
      tagline: "[Ganti dengan tagline GSC-5]",
      deskripsi: "[Ganti dengan deskripsi singkat GSC-5.]",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "aswa",
      nama: "Aswa",
      departemen: "Seniora",
      tagline: "[Ganti dengan tagline Aswa]",
      deskripsi: "[Ganti dengan deskripsi singkat Aswa.]",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "fs2t",
      nama: "FS2T",
      departemen: "Riskel",
      tagline: "[Ganti dengan tagline FS2T]",
      deskripsi: "[Ganti dengan deskripsi singkat FS2T.]",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "minat_riset", label: "Bidang riset yang kamu minati", type: "text" }
      ]
    }
  ]
};
window.FC_BSO.cari = (slug) => window.FC_BSO.daftar.find((b) => b.slug === slug) || null;
