/* =====================================================================
   DATA ORGANISASI — BEM FMIPA UM Kabinet Ruang Aksara
   Ubah file ini untuk mengganti isi beranda.
   Nama, foto, deskripsi departemen, program kerja, dan prestasi di bawah
   masih CONTOH. Setelah semuanya diganti, ubah TANDAI_CONTOH menjadi false
   supaya label "Contoh" hilang dari situs.

   Foto: taruh file di assets/img/ lalu isi kolom "foto", misalnya
   foto: "assets/img/pengurus/ketua.webp". Kosongkan untuk memakai
   kotak "Foto pengurus".
   LinkedIn: isi kolom "linkedin" dengan link profil lengkap, misalnya
   linkedin: "https://www.linkedin.com/in/nama-kamu". Kosongkan bila tidak ada.
   ===================================================================== */
window.FC_ORG = {
  TANDAI_CONTOH: true,

  organisasi: "BEM FMIPA UM",
  namaPanjang: "Badan Eksekutif Mahasiswa Fakultas Matematika dan Ilmu Pengetahuan Alam Universitas Negeri Malang",
  kabinet: "Ruang Aksara",
  tagline: "Rombak Rutinitas, Ciptakan Kualitas.",
  periode: "2027",
  deskripsi: "BEM FMIPA UM Kabinet Ruang Aksara adalah lembaga eksekutif mahasiswa yang menjadi ruang bagi setiap mahasiswa FMIPA untuk bersuara, berkarya, dan berkembang. Kami hadir untuk merombak kebiasaan yang sekadar rutin menjadi kerja yang berkualitas: gagasan yang substantif, kolaborasi yang inklusif, dan inovasi yang progresif.",
  fotoBersama: "",          // contoh: "assets/img/foto-bersama.webp"

  statistik: [
    { angka: "99+", label: "Fungsionaris", ikon: "users" },
    { angka: "10", label: "Program Kerja", ikon: "flag" },
    { angka: "8", label: "Departemen", ikon: "grid" },
    { angka: "2027", label: "Periode", ikon: "cal" }
  ],

  video: {
    youtubeId: "RO75uUZiAw0",
    url: "https://youtu.be/RO75uUZiAw0",
    judul: "Video Profil Kabinet Ruang Aksara",
    teks: "Kenali lebih dekat semangat, orang-orang, dan langkah Kabinet Ruang Aksara untuk FMIPA UM."
  },

  visi: "Mewujudkan BEM FMIPA UM yang substantif dalam gagasan, inklusif dalam kolaborasi, dan progresif dalam inovasi demi terciptanya Ruang Aktualisasi bagi mahasiswa FMIPA UM.",
  misi: [
    "Mendorong pengembangan potensi mahasiswa FMIPA melalui program yang relevan, terarah, dan berdampak nyata.",
    "Membangun ruang kolaborasi dan aktualisasi yang inklusif melalui penguatan sinergi antar elemen kemahasiswaan di FMIPA.",
    "Menciptakan organisasi yang progresif serta inovatif melalui pengembangan tata kelola secara adaptif dan transparan."
  ],
  nilai: [
    { judul: "Substantif", teks: "Bergerak dari gagasan yang matang dan berbasis data." },
    { judul: "Inklusif", teks: "Membuka ruang bagi semua departemen dan angkatan." },
    { judul: "Progresif", teks: "Berani mencoba cara baru yang lebih baik." },
    { judul: "Transparan", teks: "Terbuka dalam tata kelola dan penggunaan anggaran." }
  ],

  /* ---------------- STRUKTUR (sesuai bagan) ---------------- */
  pengurusInti: [
    { id: "ketum", jabatan: "Ketua Umum", nama: "Fajar Ramadhan", foto: "", linkedin: "" },
    { id: "waketum", jabatan: "Wakil Ketua Umum", nama: "Alya Putri Maharani", foto: "", linkedin: "" },
    { id: "sekum", jabatan: "Sekretaris Umum", nama: "Nabila Khairunnisa", foto: "", linkedin: "" },
    { id: "sek2", jabatan: "Sekretaris 2", nama: "Dimas Arya Pratama", foto: "", linkedin: "" },
    { id: "sek3", jabatan: "Sekretaris 3", nama: "Salsabila Azzahra", foto: "", linkedin: "" },
    { id: "bendum", jabatan: "Bendahara Umum", nama: "Rizky Aditya Nugroho", foto: "", linkedin: "" },
    { id: "wabendum", jabatan: "Wakil Bendahara Umum", nama: "Intan Permatasari", foto: "", linkedin: "" },
    { id: "kdk", jabatan: "Koordinator Dalam Kampus", nama: "Bagas Satria Wibowo", foto: "", linkedin: "" },
    { id: "klk", jabatan: "Koordinator Luar Kampus", nama: "Aulia Rahmawati", foto: "", linkedin: "" }
  ],

  departemen: [
    { id: "risdat", nama: "Risdat dan Keilmuan", bidang: "dalam", foto: "",
      deskripsi: "Mengembangkan budaya riset dan keilmuan mahasiswa FMIPA, mengelola data kemahasiswaan, serta mendampingi mahasiswa yang ingin berkompetisi di bidang ilmiah.",
      fokus: ["Kajian dan riset kemahasiswaan", "Pendampingan lomba karya ilmiah", "Pengelolaan data mahasiswa"],
      proker: [
        { nama: "Aksara Science Fair", deskripsi: "Pameran riset dan karya ilmiah mahasiswa FMIPA, lengkap dengan sesi presentasi dan penilaian juri dosen." },
        { nama: "Klinik Proposal Lomba", deskripsi: "Pendampingan rutin bagi tim yang sedang menyusun proposal atau karya tulis untuk kompetisi." },
        { nama: "Sensus Mahasiswa FMIPA", deskripsi: "Pendataan minat, kebutuhan, dan prestasi mahasiswa sebagai dasar perencanaan program BEM." },
        { nama: "Kajian Ilmiah Bulanan", deskripsi: "Diskusi santai membahas topik sains terkini bersama dosen atau alumni." }
      ],
      anggota: [
        { nama: "Hanif Al Farizi", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Adinda Rahma", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Bima Pratama", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Citra Ayuningtyas", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Daffa Maulana", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Elsa Novitasari", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "psdm", nama: "PSDM", bidang: "dalam", foto: "",
      deskripsi: "Pengembangan Sumber Daya Mahasiswa: merancang kaderisasi, peningkatan kapasitas fungsionaris, dan menjaga budaya organisasi yang sehat.",
      fokus: ["Kaderisasi dan upgrading", "Evaluasi kinerja fungsionaris", "Pembinaan budaya organisasi"],
      proker: [
        { nama: "Sekolah Aksara", deskripsi: "Kaderisasi bertahap untuk fungsionaris: kepemimpinan, manajemen proyek, dan komunikasi." },
        { nama: "Upgrading Fungsionaris", deskripsi: "Pelatihan keterampilan organisasi di awal periode agar seluruh fungsionaris siap bekerja." },
        { nama: "Rapor Kinerja", deskripsi: "Evaluasi kinerja fungsionaris setiap bulan yang hasilnya dibahas bersama secara terbuka." },
        { nama: "Malam Keakraban", deskripsi: "Kegiatan kebersamaan untuk mempererat hubungan antarfungsionaris lintas departemen." }
      ],
      anggota: [
        { nama: "Dewi Lestari", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Farhan Hakim", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Gita Puspitasari", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Hafidz Ramadhan", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Indah Wulandari", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Jihan Aulia", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "kesma", nama: "Kesma", bidang: "dalam", foto: "",
      deskripsi: "Kesejahteraan Mahasiswa: menjadi tempat mahasiswa mencari bantuan terkait beasiswa, UKT, dan kebutuhan kesejahteraan lainnya.",
      fokus: ["Informasi beasiswa", "Pendampingan keringanan UKT", "Layanan aduan kesejahteraan"],
      proker: [
        { nama: "Pos Aspirasi & UKT", deskripsi: "Pendampingan keringanan UKT dan layanan aduan kesejahteraan yang bisa dilacak statusnya." },
        { nama: "Info Beasiswa Terpadu", deskripsi: "Rangkuman beasiswa yang dibuka setiap bulan, disertai sesi tanya jawab persyaratan." },
        { nama: "Kesma Peduli", deskripsi: "Bantuan cepat bagi mahasiswa yang mengalami musibah, bekerja sama dengan fakultas." },
        { nama: "Survei Kesejahteraan", deskripsi: "Survei berkala tentang kondisi ekonomi, fasilitas, dan kesehatan mental mahasiswa." }
      ],
      anggota: [
        { nama: "Yoga Prasetyo", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Kevin Saputra", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Laila Fitriani", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Muhammad Rifqi", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Nadia Safitri", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Oktaviani Putri", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "seniora", nama: "Seniora", bidang: "dalam", foto: "",
      deskripsi: "Mewadahi minat dan bakat mahasiswa FMIPA di bidang seni dan olahraga, sekaligus mempererat kebersamaan antardepartemen.",
      fokus: ["Kompetisi olahraga internal", "Pentas dan pameran seni", "Pendampingan delegasi non-akademik"],
      proker: [
        { nama: "Aksara Cup", deskripsi: "Turnamen olahraga antardepartemen untuk merayakan kebersamaan FMIPA." },
        { nama: "Pentas Seni FMIPA", deskripsi: "Panggung bagi mahasiswa FMIPA untuk menampilkan musik, tari, dan karya seni lainnya." },
        { nama: "Delegasi Porseni", deskripsi: "Seleksi dan pendampingan kontingen FMIPA untuk ajang olahraga dan seni tingkat universitas." }
      ],
      anggota: [
        { nama: "Kirana Ayu Lestari", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Putra Wicaksono", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Qonita Zahra", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Raka Firmansyah", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Sinta Maharani", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Taufik Hidayat", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "advokastrat", nama: "Advokastrat", bidang: "luar", foto: "",
      deskripsi: "Mengawal isu kampus dan kebijakan yang berdampak pada mahasiswa melalui kajian strategis dan advokasi.",
      fokus: ["Kajian isu strategis", "Advokasi kebijakan kampus", "Aksi dan audiensi"],
      proker: [
        { nama: "Kajian Isu Strategis", deskripsi: "Kajian tertulis tentang kebijakan kampus dan isu nasional yang berdampak pada mahasiswa." },
        { nama: "Audiensi Dekanat", deskripsi: "Forum terbuka antara mahasiswa dan pimpinan fakultas untuk menyampaikan aspirasi." },
        { nama: "Rilis Sikap", deskripsi: "Pernyataan sikap BEM yang disusun dari hasil kajian dan diskusi bersama mahasiswa." }
      ],
      anggota: [
        { nama: "Rafael Ardiansyah", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Ulfa Khoirunnisa", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Vino Aditya", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Wulan Sari", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Yusuf Alfarizi", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Zalfa Nabila", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "sosling", nama: "Sosial Lingkungan", bidang: "luar", foto: "",
      deskripsi: "Mewujudkan kepedulian mahasiswa FMIPA kepada masyarakat dan lingkungan lewat pengabdian berbasis sains.",
      fokus: ["Pengabdian masyarakat", "Aksi peduli lingkungan", "Penggalangan bantuan sosial"],
      proker: [
        { nama: "FMIPA Mengabdi", deskripsi: "Pengabdian berbasis sains di desa mitra: edukasi STEM, cek kualitas air, dan aksi lingkungan." },
        { nama: "Aksi Hijau", deskripsi: "Gerakan menanam pohon, memilah sampah, dan mengurangi plastik di lingkungan kampus." },
        { nama: "Galang Peduli", deskripsi: "Penggalangan bantuan untuk masyarakat yang terdampak bencana." }
      ],
      anggota: [
        { nama: "Nurul Hidayah", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Akbar Setiawan", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Bunga Larasati", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Cahya Nugraha", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Dinda Amelia", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Erlangga Putra", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "hubdesk", nama: "Hubdesk", bidang: "luar", foto: "",
      deskripsi: "Menjalin hubungan dengan lembaga di luar FMIPA serta mitra kolaborasi, untuk membuka peluang kerja sama bagi mahasiswa.",
      fokus: ["Kemitraan eksternal", "Kunjungan dan studi banding", "Jejaring organisasi mahasiswa"],
      proker: [
        { nama: "Jejaring Mitra", deskripsi: "Membangun kerja sama dengan organisasi, instansi, dan komunitas di luar FMIPA." },
        { nama: "Kunjungan Lembaga", deskripsi: "Kunjungan dan studi banding ke BEM atau lembaga lain untuk bertukar praktik baik." },
        { nama: "Desa Mitra Aksara", deskripsi: "Pendampingan berkelanjutan bersama desa mitra yang menjadi lokasi pengabdian." }
      ],
      anggota: [
        { nama: "Galih Saputra", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Fauziah Rahmah", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Galang Prasetyo", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Hana Salsabila", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Ilham Kurniawan", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Jasmine Putri", jabatan: "Staff", foto: "", linkedin: "" }
      ] },
    { id: "medinfo", nama: "Medinfo", bidang: "luar", foto: "",
      deskripsi: "Media dan Informasi: mengelola media sosial, publikasi, dan kanal informasi BEM termasuk FMIPA Connect.",
      fokus: ["Publikasi dan desain konten", "Pengelolaan media sosial", "Pengelolaan FMIPA Connect"],
      proker: [
        { nama: "Aksara Media", deskripsi: "Pengelolaan media sosial dan publikasi BEM agar informasi sampai ke seluruh mahasiswa." },
        { nama: "Pengelolaan FMIPA Connect", deskripsi: "Memastikan info lomba, beasiswa, dan pelatihan di FMIPA Connect selalu terbaru." },
        { nama: "Kelas Desain Konten", deskripsi: "Pelatihan desain dan copywriting untuk fungsionaris dan mahasiswa umum." }
      ],
      anggota: [
        { nama: "Zahra Amalia", jabatan: "Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Kurnia Sandi", jabatan: "Wakil Kepala Departemen", foto: "", linkedin: "" },
        { nama: "Lutfi Hakim", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Maya Anggraini", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Naufal Rizki", jabatan: "Staff", foto: "", linkedin: "" },
        { nama: "Olivia Kusuma", jabatan: "Staff", foto: "", linkedin: "" }
      ] }
  ],

  /* ---------------- PROGRAM KERJA UNGGULAN ---------------- */
  program: [
    { judul: "Aksara Science Fair", dept: "Risdat dan Keilmuan", ikon: "spark",
      teks: "Pameran riset dan karya ilmiah mahasiswa FMIPA, lengkap dengan kelas menulis ilmiah dan klinik proposal lomba.", link: "#/lomba" },
    { judul: "Sekolah Aksara", dept: "PSDM", ikon: "cap",
      teks: "Kaderisasi bertahap untuk fungsionaris dan mahasiswa baru: kepemimpinan, manajemen proyek, dan komunikasi.", link: "#/pelatihan" },
    { judul: "Pos Aspirasi & UKT", dept: "Kesma × Advokastrat", ikon: "shield",
      teks: "Kanal pendampingan keringanan UKT dan aduan mahasiswa yang bisa dilacak statusnya secara transparan.", link: "#/pengaduan" },
    { judul: "Cari Teman Lomba", dept: "Risdat dan Keilmuan", ikon: "users",
      teks: "Mempertemukan mahasiswa lintas departemen untuk membentuk tim lomba yang saling melengkapi.", link: "#/teman" },
    { judul: "FMIPA Mengabdi", dept: "Sosial Lingkungan", ikon: "heart",
      teks: "Pengabdian berbasis sains di desa mitra: edukasi STEM, cek kualitas air, dan aksi lingkungan.", link: "" },
    { judul: "Aksara Cup", dept: "Seniora", ikon: "trophy",
      teks: "Turnamen olahraga dan festival seni antardepartemen untuk merayakan kebersamaan FMIPA.", link: "" }
  ],

  /* ---------------- AGENDA (kalender) ----------------
     Format: { tanggal: "2027-02-14", judul: "Nama kegiatan", tempat: "Aula FMIPA" }
     Kosongkan [] bila belum ada agenda.                                   */
  agenda: [],

  /* ---------------- PRESTASI (contoh) ---------------- */
  prestasi: [
    { peringkat: "Juara 1", lomba: "Olimpiade Sains Tingkat Nasional", nama: "Nama Mahasiswa", dept: "Matematika", tahun: "2027" },
    { peringkat: "Juara 2", lomba: "Lomba Karya Tulis Ilmiah Nasional", nama: "Nama Tim", dept: "Kimia", tahun: "2027" },
    { peringkat: "Medali Emas", lomba: "Kompetisi Inovasi Mahasiswa", nama: "Nama Mahasiswa", dept: "Fisika", tahun: "2027" },
    { peringkat: "Juara 3", lomba: "Kompetisi Esai Lingkungan", nama: "Nama Mahasiswa", dept: "Biologi", tahun: "2027" },
    { peringkat: "Best Paper", lomba: "Konferensi Ilmiah Mahasiswa", nama: "Nama Tim", dept: "Matematika", tahun: "2027" }
  ]
};
