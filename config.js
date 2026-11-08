/* =====================================================================
   FMIPA Connect — PENGATURAN
   Ubah file ini saja untuk menyambungkan website ke Supabase dan
   mengganti kontak. Selama SUPABASE_URL kosong, website berjalan dalam
   MODE DEMO (data contoh, tersimpan di browser masing-masing).
   ===================================================================== */
window.FC_CONFIG = {
  // Supabase → Project Settings → API
  SUPABASE_URL: "",        // contoh: "https://abcdxyz.supabase.co"
  SUPABASE_ANON_KEY: "",   // "anon public" key (aman ditaruh di sini)

  // Kosongkan jika semua email boleh mendaftar
  EMAIL_DOMAIN_KAMPUS: "", // contoh: "um.ac.id" (juga menerima students.um.ac.id)

  // Identitas
  NAMA_SITUS: "FMIPA Connect",
  PENGELOLA: "BEM FMIPA UM Kabinet Ruang Aksara",
  KAMPUS: "Universitas Negeri Malang",
  LOGO_UM_URL: "assets/img/logo-um.webp", // logo resmi UM; kosongkan untuk menyembunyikan

  // Kontak (tampil di footer & halaman pengaduan)
  KONTAK: {
    whatsapp: "0821-1474-5200",
    whatsapp_link: "https://wa.me/6282114745200",
    email: "bemfmipa2026@gmail.com",
    instagram: "",           // contoh: "@bemfmipaum" (kosong = disembunyikan)
    instagram_link: "",
    alamat: "FMIPA Universitas Negeri Malang, Jl. Semarang 5, Kota Malang",
    maps_link: "https://www.google.com/maps/search/?api=1&query=FMIPA+Universitas+Negeri+Malang"
  },

  // Rujukan untuk laporan kekerasan
  SATGAS: {
    nama: "Satgas PPK Universitas Negeri Malang",
    kontak: "[Ganti dengan kontak resmi Satgas PPK UM]",
    link: ""
  }
};
