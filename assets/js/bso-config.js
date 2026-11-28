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
      kepanjangan: "Komite Olahraga FMIPA",
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      tagline: "Di organisasi lain nambah capek, di KOMIPA ngilangin capek.",
      deskripsi: "KOMIPA (Komite Olahraga FMIPA) adalah sub divisi Departemen Seniora BEM FMIPA UM yang menjadi komunitas olahraga mahasiswa FMIPA sepanjang tahun. Lewat latihan rutin bersama pelatih dari FIK, Liga MIPA antar-departemen, dan apresiasi atlet MIPA, kami menjadikan olahraga sebagai waktu refreshing di sela laprak, praktikum, dan tugas.",
      // Halaman khusus KOMIPA (Rutin, Liga MIPA, Atlet MIPA) ada di komipa/app.js, datanya di komipa/liga.js
      cta: { teks: "Lihat jadwal latihan", href: "#/rutin" },
      fokus: [
        { judul: "Latihan rutin", isi: "KOMIPA Rutin: olahraga bareng 2 minggu sekali, sekitar 2 jam, dengan cabor bergilir dan pelatih dari FIK. Libur saat UTS dan UAS." },
        { judul: "Liga antar-departemen", isi: "Liga MIPA: futsal, voli, dan badminton antar-departemen setiap Sabtu, lengkap dengan klasemen, top skor, MVP, dan final." },
        { judul: "Panggung untuk atlet", isi: "Apresiasi Atlet MIPA: prestasi mahasiswa FMIPA di klub dan lomba olahraga diliput lewat rubrik Atlet MIPA Bulan Ini." }
      ],
      program: [
        { judul: "KOMIPA Rutin", isi: "Latihan olahraga bersama setiap 2 minggu sekali, sekitar 2 jam per sesi, dengan cabor bergilir: futsal, badminton, voli, basket, serta lari atau senam. Dilatih mahasiswa FIK lewat kerja sama dengan BEM FIK. Kalau pelatih berhalangan, latihan tetap jalan secara mandiri. Libur saat UTS dan UAS." },
        { judul: "Komunitas per cabor", isi: "Komunitas seperti FMIPA Futsal dan FMIPA Badminton, masing-masing dengan koordinator, supaya latihan tetap jalan sepanjang tahun." },
        { judul: "Liga MIPA", isi: "Liga antar-departemen dengan 3 cabor: futsal putra, voli putri, dan badminton ganda campuran. Format setengah kompetisi selama 3–5 pekan, pertandingan setiap Sabtu, lalu ditutup dengan final yang meriah." },
        { judul: "Apresiasi Atlet MIPA", isi: "Pendataan dan publikasi prestasi mahasiswa FMIPA yang aktif di klub atau lomba olahraga eksternal, termasuk rubrik Atlet MIPA Bulan Ini di Instagram BEM dan FMIPA Connect." },
        { judul: "Podcast olahraga bersama BEM", isi: "KOMIPA menyiapkan tema dan narasumber untuk episode olahraga di podcast BEM, misalnya obrolan dengan atlet MIPA dan sains di balik olahraga." },
        { judul: "Kolaborasi dengan Seniora", isi: "Penampilan seni di pembukaan atau final Liga MIPA, dan acara penutupan bersama di akhir periode." }
      ],
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }
      ]
    },
    {
      slug: "gsc5",
      nama: "GSC-5",
      departemen: "Seniora",
      kepanjangan: "Gema Suara Cipta 5",
      tagline: "Nyanyi tanpa ribet.",
      deskripsi: "GSC-5 (Gema Suara Cipta 5) adalah tim vokal dan paduan suara FMIPA UM di bawah Departemen Seniora BEM FMIPA. Kami tampil sepanjang tahun di acara-acara fakultas dan menjadi lengan vokal ASWA. Siapa pun boleh ikut tanpa audisi, cukup pilih acara yang jadwalnya cocok.",
      // Halaman khusus GSC-5 (Panggung, Ikut Nyanyi, Bareng ASWA) ada di gsc5/app.js, datanya di gsc5/panggung.js
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      cta: { teks: "Lihat jadwal tampil", href: "#/panggung" },
      // kontak: { whatsapp: "08xxxxxxxxxx", narahubung: "Nama", instagram: "gsc5.fmipaum" },
      //   → nomor WhatsApp dipakai tombol "Kirim ke WhatsApp" di halaman Ikut Nyanyi
      fokus: [
        { judul: "Tampil di acara fakultas", isi: "Mengisi suara di PKKMB, pelantikan, yudisium, dies natalis, dan acara BEM lain. Panggungnya sudah ada, kami tinggal tampil." },
        { judul: "Latihan menjelang tampil", isi: "Latihan cukup 2–3 kali sebelum tiap penampilan, bukan rutin mingguan sepanjang tahun." },
        { judul: "Lengan vokal ASWA", isi: "GSC-5 fokus di vokal dan paduan suara, ASWA di bidang seni lainnya. Jadwal disusun bersama dan panggung besar dipegang berdua." }
      ],
      program: [
        { judul: "Pengisi suara acara fakultas", isi: "Tampil di acara resmi FMIPA: PKKMB, pelantikan, yudisium, dies natalis, dan acara BEM lain, supaya GSC-5 terdengar sepanjang tahun. Jadwal lengkapnya ada di halaman Panggung." },
        { judul: "Latihan bareng UKM paduan suara UM", isi: "Direncanakan bekerja sama dengan UKM paduan suara tingkat universitas untuk pelatih dan metode latihan. Latihan difokuskan menjelang penampilan." },
        { judul: "Lomba paduan suara antarjurusan", isi: "Lomba tidak lagi berdiri sendiri, tetapi menjadi bagian dari panggung bersama ASWA supaya penonton lebih ramai. Dijalankan setelah tim terbentuk dan kolaborasi dengan ASWA berjalan." }
      ],
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
      kepanjangan: "Forum Studi Sains & Teknologi FMIPA",
      tagline: "Belajar, meneliti, menulis, lalu terbit.",
      deskripsi: "FS2T (Forum Studi Sains & Teknologi FMIPA) adalah sub divisi Departemen Riskel BEM FMIPA UM yang menjadi pusat riset dan publikasi mahasiswa FMIPA. Kelas, pendampingan naskah, dan riset bersama dirangkai menjadi satu alur: belajar, didampingi, meneliti, sampai karyamu terbit. Punya ide riset atau tulisan? Datang ke FS2T.",
      // Halaman khusus FS2T (Alur Riset, Kelas Publikasi, Klinik Naskah, Bank Ide Riset, Keuntungan) ada di fs2t/app.js, datanya di fs2t/riset.js
      sembunyikan: ["galeri", "pengumuman", "daftar"],
      cta: { teks: "Lihat alur riset", href: "#/alur" },
      fokus: [
        { judul: "Belajar", isi: "Kelas Publikasi sebulan sekali dan konten Riset 101 di Instagram: cara menulis, memilih jurnal, sampai submit." },
        { judul: "Didampingi", isi: "Klinik Naskah membantu mengecek naskahmu dan mencarikan jurnal tujuan yang sesuai. Kami mendampingi, bukan menuliskan." },
        { judul: "Meneliti", isi: "Riset Kolaboratif: tim kecil lintas prodi bersama dosen pembimbing, diarahkan menjadi proposal PKM atau artikel jurnal." },
        { judul: "Terbit", isi: "Hasilnya dipresentasikan di FS2T Research Day dan diarahkan sampai terbit, supaya riset tidak berhenti di laporan." }
      ],
      program: [
        { judul: "Kelas Publikasi", isi: "Kelas online sekitar 60 menit, sebulan sekali, tentang cara menulis dan menerbitkan artikel ilmiah. Topiknya bergilir, pematerinya dosen, pengelola jurnal, atau kakak tingkat yang sudah pernah publikasi." },
        { judul: "Riset 101", isi: "Konten carousel Instagram dua kali sebulan berisi tips riset dan publikasi, diambil dari materi Kelas Publikasi bulan itu." },
        { judul: "Klinik Naskah", isi: "Dibuka sebulan sekali dengan sistem daftar. Tim FS2T membantu mengecek format, struktur, dan sitasi, mencarikan jurnal tujuan, dan mendampingi proses submit sampai revisi." },
        { judul: "Riset Kolaboratif", isi: "Satu riset per semester oleh tim kecil 3–5 orang lintas prodi dengan satu dosen pembimbing. Hasilnya diarahkan menjadi proposal PKM atau artikel jurnal. Topiknya bisa diambil dari Bank Ide Riset." },
        { judul: "Kunjungan & Kerja Sama", isi: "Kunjungan kerja sekali per semester yang selalu membawa pulang satu hasil konkret: narasumber, rencana kolaborasi, atau kesepakatan kerja sama." },
        { judul: "FS2T Research Day", isi: "Acara puncak setahun sekali: presentasi hasil Riset Kolaboratif, pameran poster ilmiah, dan pemateri tamu. Direncanakan menjadi tempat peluncuran Antologi Karya Ilmiah FMIPA." }
      ],
      pertanyaan: [
        { name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true },
        { name: "minat_riset", label: "Bidang riset yang kamu minati", type: "text" }
      ]
    }
  ]
};
window.FC_BSO.cari = (slug) => window.FC_BSO.daftar.find((b) => b.slug === slug) || null;
