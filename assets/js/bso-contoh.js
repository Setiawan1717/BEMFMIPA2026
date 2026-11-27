/* =====================================================================
   FMIPA Connect — DATA CONTOH halaman BSO (hanya dipakai di MODE DEMO)
   Situs asli (Supabase) tidak memakai file ini. Data asli tiap BSO diisi
   di assets/js/bso-config.js (logo, kepanjangan, fokus, pengurus,
   program, galeri, kontak). Kolom yang sudah diisi di bso-config.js
   selalu menang atas data contoh ini.
   ===================================================================== */
(function () {
  const bln = (n) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
  const svg = (i, teks) => "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${[600, 900, 520, 700, 800, 600][i % 6]}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d3b0c"/><stop offset="1" stop-color="#${["9be15d", "c6f36b", "5dbb63", "e8f99a", "7ccf4a", "b5e86a"][i % 6]}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" fill="#0a1105" font-family="sans-serif" font-size="40" font-weight="700" text-anchor="middle">${teks}</text></svg>`);
  const contoh = (nama) => ({
    fokus: [
      { judul: "Wadah minat", isi: `Ruang rutin bagi anggota ${nama} untuk mengembangkan minat dan bakat.` },
      { judul: "Berkarya bersama", isi: "Proyek dan kegiatan kolaboratif antaranggota lintas prodi." },
      { judul: "Berprestasi", isi: "Pendampingan anggota untuk tampil dan berlomba di berbagai ajang." }
    ],
    pengurus: [
      { nama: "Contoh: Nama Ketua", jabatan: "Ketua", prodi: "S1 Biologi", bio: "Bio singkat ketua. Ganti dengan data asli di bso-config.js.", instagram: "contoh" },
      { nama: "Contoh: Nama Wakil", jabatan: "Wakil Ketua", prodi: "S1 Fisika" },
      { nama: "Contoh: Nama Sekretaris", jabatan: "Sekretaris", prodi: "S1 Kimia" },
      { nama: "Contoh: Nama Bendahara", jabatan: "Bendahara", prodi: "S1 Matematika" }
    ],
    program: [
      { judul: "Contoh: Open Recruitment", isi: "Penerimaan anggota baru periode ini.", mulai: bln(-3), selesai: bln(-2) },
      { judul: "Contoh: Kelas Rutin", isi: "Pertemuan rutin mingguan untuk anggota.", mulai: bln(-1), selesai: bln(2) },
      { judul: "Contoh: Showcase Akhir Semester", isi: "Pameran hasil karya dan kegiatan anggota.", mulai: bln(1) },
      { judul: "Contoh: Kunjungan & Kolaborasi", isi: "Kolaborasi dengan komunitas di luar kampus.", mulai: bln(3) }
    ],
    galeri: [0, 1, 2, 3, 4, 5].map((i) => ({ src: svg(i, `Foto contoh ${i + 1}`), caption: `Contoh kegiatan ${i + 1}` })),
    kontak: { instagram: "@contoh_bso", whatsapp: "081234567890", narahubung: "Contoh Narahubung" }
  });
  window.FC_BSO_CONTOH = {};
  (window.FC_BSO ? window.FC_BSO.daftar : []).forEach((b) => { window.FC_BSO_CONTOH[b.slug] = contoh(b.nama); });
})();
