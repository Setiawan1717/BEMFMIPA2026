/* =====================================================================
   Aswa — MEKANISME KHUSUS
   File ini milik pengurus Aswa. Ubah file di folder aswa/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua BSO).

   Yang sudah tersedia tanpa perlu kode: Pengumuman, Pendaftaran anggota
   (pertanyaannya di assets/js/bso-config.js), dan Pengaturan.

   Tambahkan mekanisme sendiri lewat FC.bsoExt:
   - publik: bagian tambahan di halaman publik (muncul setelah Pengumuman)
   - admin : tab tambahan di panel admin

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, refresh() }
            ctx.D = lapisan data (ctx.D.client = klien Supabase, hanya di mode asli)
   Data khusus BSO ini disimpan di tabel berawalan aswa_ (lihat
   supabase/bso/_template.sql), dan setiap tabel WAJIB memakai is_admin_bso('aswa').
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;

  FC.bsoExt = {
    publik: [
      // Contoh bagian tambahan (hapus tanda // untuk mencoba):
      // {
      //   id: "tentang",
      //   judul: "Tentang",
      //   render(el, ctx) {
      //     el.innerHTML = `
      //       <span class="eyebrow">Tentang kami <span class="contoh-tag">CONTOH</span></span>
      //       <h2>Kenalan dengan ${E(ctx.bso.nama)}</h2>
      //       <p class="muted" style="max-width:680px">Bagian ini contoh mekanisme khusus. Ganti isinya di
      //       <code>${E(ctx.slug)}/app.js</code>: misalnya struktur pengurus, galeri karya, jadwal latihan,
      //       voting, absensi, atau formulir lomba.</p>`;
      //   }
      // }
    ],

    admin: [
      // Contoh tab admin tambahan (hapus tanda komentar untuk mencoba):
      // {
      //   id: "kegiatan",
      //   judul: "Kegiatan",
      //   render(el, ctx) {
      //     el.innerHTML = `<div class="empty"><p>Kelola kegiatan ${E(ctx.bso.nama)} di sini.</p></div>`;
      //   }
      // }
    ]
  };
})();
