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
      // Halaman khusus Kharisma (Ngaji Sains, Agenda, Fun Fact) ada di kharisma/app.js, datanya di kharisma/kajian.js
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      cta: { teks: "Lihat agenda", href: "#/agenda" },
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
      sembunyikan: ["galeri", "pengumuman", "daftar"],
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
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      tagline: "Berlatih tekun, berprestasi bersama.",
      deskripsi: "GSC-5 adalah sub divisi di bawah Departemen Seniora BEM FMIPA UM. Kami mewadahi mahasiswa FMIPA yang ingin berlatih rutin, mengasah kemampuan, dan membawa nama FMIPA berprestasi di berbagai ajang.",
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "aswa",
      nama: "ASWA",
      departemen: "Seniora",
      kepanjangan: "Arek Seni Warga MIPA",
      tagline: "Les seni gratis, panggung buat tampil, dan karyamu dilihat banyak orang.",
      deskripsi: "ASWA (Arek Seni Warga MIPA) adalah sub divisi Departemen Seniora BEM FMIPA UM untuk tari, teater, musik, dan seni rupa. ASWA menjadi ruang berkarya warga MIPA: belajar seni secara rutin, mengirim karya, lalu tampil dari panggung kecil sampai panggung besar BEM.",
      // Halaman khusus ASWA (Studio, Kirim Karya, Panggung, Keuntungan) ada di aswa/app.js, datanya di aswa/karya.js
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      cta: { teks: "Kirim karyamu", href: "#/kirim-karya" },
      fokus: [
        { judul: "Latihan bergilir", isi: "Studio ASWA: tiap minggu ada latihan dengan bidang yang bergantian, jadi tiap bidang cukup sebulan sekali." },
        { judul: "Upload karya", isi: "Siapa pun warga MIPA boleh mengirim karyanya, dari lagu, puisi, dan tari sampai gambar, desain, atau video." },
        { judul: "Open panggung", isi: "Karya dan hasil latihan ditampilkan di panggung kecil, seperti gladi yang serius dengan penonton sungguhan." },
        { judul: "Segmen puncak", isi: "Semua bidang tampil bersama GSC-5 dalam satu segmen penuh di acara Character Building BEM." }
      ],
      program: [
        { judul: "Studio ASWA", isi: "Latihan rutin bergilir per bidang (tari, teater, musik, seni rupa) dengan format santai 1–2 jam: olah tubuh dan vokal, akting, jamming, atau sketsa bersama. Peserta cukup ikut bidang yang diminati." },
        { judul: "Upload Karya Warga MIPA", isi: "Pengganti lomba poster. Warga MIPA mengirim karya apa pun, lalu karya dikurasi. Yang terpilih tampil di open panggung atau dipajang, dan yang terbaik naik ke segmen puncak. Tujuannya memberi panggung, bukan mencari juara." },
        { judul: "Open Panggung", isi: "Panggung kecil 2–3 kali per semester untuk penampil ASWA, GSC-5, dan karya hasil upload. Formatnya seperti gladi bersih: latihan serius dengan penonton sungguhan." },
        { judul: "Segmen Puncak di Character Building", isi: "ASWA dan GSC-5 direncanakan memegang satu segmen penuh di acara Character Building BEM: tari, teater, musik, paduan suara, pameran karya, dan penghargaan." },
        { judul: "Spotlight Karya Warga MIPA", isi: "Apresiasi dua kali sebulan di Instagram yang menampilkan orang dan karyanya, sekaligus mengajak warga MIPA mengirim karya." }
      ],
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "fs2t",
      nama: "FS2T",
      departemen: "Riskel",
      sembunyikan: ["galeri", "pengumuman", "daftar"],
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
