/* =====================================================================
   Science Entrepreneur — MEKANISME KHUSUS
   File ini milik pengurus Science Entrepreneur. Ubah file di folder science-entrepreneur/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman khusus SE:
     #/unit-usaha  → katalog 3 unit usaha (Beli, Sewa, Cetak). Produk & harga di katalog.js
     #/member      → info member SE, kartu member, dan poin SE
   Galeri, Pengumuman, dan Daftar disembunyikan lewat `sembunyikan` di assets/js/bso-config.js.

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   Data khusus sub divisi ini disimpan di tabel berawalan science_entrepreneur_ (lihat
   supabase/bso/_template.sql), dan setiap tabel WAJIB memakai is_admin_bso('science-entrepreneur').
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const K = window.SE_KATALOG || { CASHBACK: 0.1, KARTU: { harga: 15000, poinAwal: 15000 }, unit: [] };

  const rp = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");
  const poin = (n) => Math.round(n).toLocaleString("id-ID");
  const cashback = (harga) => Math.round(harga * K.CASHBACK);
  const persen = Math.round(K.CASHBACK * 100);

  // Nomor WA pesanan: katalog.js → kontak di bso-config.js (mode demo: nomor contoh)
  function waPesan(ctx, teks) {
    const no = K.whatsapp || ((ctx.ui.data().kontak || {}).whatsapp) || "";
    const url = ctx.ui.waLink(no);
    return url ? url + "?text=" + encodeURIComponent(teks) : "";
  }
  const namaAkun = (ctx) => (ctx.profil && ctx.profil.nama) || "";

  /* ---------------- Unit Usaha ---------------- */
  let unitAktif = "";
  function kartuProduk(u, p, i) {
    const cb = cashback(p.harga);
    return `<article class="se-produk">
      <div class="se-produk-top"><span class="se-ikon" aria-hidden="true">${FC.icon(u.ikon)}</span>${u.tukarPoin ? `<span class="chip ok">Bisa ditukar poin</span>` : ""}</div>
      <h3>${E(p.nama)}</h3>
      ${p.ket ? `<p>${E(p.ket)}</p>` : ""}
      <div class="se-harga"><b>${rp(p.harga)}</b><small>/ ${E(p.satuan || "pcs")}</small></div>
      <p class="se-cashback"><span>${FC.icon("wallet")} Cashback ${persen}% poin SE</span><b>+${poin(cb)} poin</b></p>
      ${u.tukarPoin ? `<p class="se-tukar">atau tukar <b>${poin(p.harga)} poin</b> / ${E(p.satuan || "hari")}</p>` : ""}
      <button class="btn btn-primary btn-sm" type="button" data-pesan="${E(u.id)}:${i}">Pesan</button>
    </article>`;
  }

  function hUnitUsaha(el, ctx) {
    const units = K.unit || [];
    const dariHash = (location.hash.match(/^#\/unit-usaha\/([\w-]+)/) || [])[1];
    if (dariHash && units.find((u) => u.id === dariHash)) unitAktif = dariHash;
    if (!units.find((u) => u.id === unitAktif)) unitAktif = units.length ? units[0].id : "";
    const u = units.find((x) => x.id === unitAktif);

    el.innerHTML = ctx.ui.judulHal("Unit usaha", "Unit Usaha", `Semua kebutuhan acaramu di satu tempat. Setiap pesanan dapat cashback ${persen}% dalam bentuk poin SE.`) + `
      <section class="bso-section"><div class="wrap">
        <ol class="se-alur" aria-label="Cara kerja poin SE">
          <li><span>1</span><div><b>Pesan produk</b><small>Pilih dari unit Beli, Sewa, atau Cetak.</small></div></li>
          <li><span>2</span><div><b>Dapat ${persen}% poin</b><small>Poin masuk setelah pesanan lunas. 1 poin = Rp1.</small></div></li>
          <li><span>3</span><div><b>Tukar ke sewa</b><small>Poin hanya bisa ditukar untuk barang persewaan.</small></div></li>
        </ol>
        <div class="bso-toolbar" style="margin-top:34px">
          <div class="tabs" role="tablist" aria-label="Unit usaha">${units.map((x) => `<button class="tab" role="tab" type="button" data-unit="${E(x.id)}" aria-selected="${x.id === unitAktif}">${FC.icon(x.ikon)} ${E(x.singkat || x.nama)} <span class="count">${x.produk.length}</span></button>`).join("")}</div>
          <span class="chip warn">Harga sementara</span>
        </div>
        ${u ? `<div class="se-unit-head"><h2>${E(u.nama)}</h2><p class="muted">${E(u.deskripsi || "")}</p></div>
          <div class="se-produk-grid">${u.produk.map((p, i) => kartuProduk(u, p, i)).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Katalog belum diisi.</p></div>`}
        <p class="muted se-catatan">Belum punya poin? <a class="hl" href="#/member">Jadi member SE</a>: kartu member ${rp(K.KARTU.harga)} langsung berisi ${poin(K.KARTU.poinAwal)} poin.</p>
      </div></section>`;

    el.querySelectorAll("[data-unit]").forEach((b) => b.onclick = () => {
      unitAktif = b.dataset.unit;
      history.replaceState(null, "", "#/unit-usaha/" + unitAktif);
      hUnitUsaha(el, ctx);
    });
    el.querySelectorAll("[data-pesan]").forEach((b) => b.onclick = () => {
      const [uid, i] = b.dataset.pesan.split(":");
      const unit = units.find((x) => x.id === uid);
      formPesan(ctx, unit, unit.produk[+i]);
    });
  }

  function formPesan(ctx, u, p) {
    const sewa = !!u.tukarPoin;
    const d = FC.openModal(`<span class="eyebrow">${E(u.nama)}</span><h2>${E(p.nama)}</h2>
      <p class="lede">${rp(p.harga)} / ${E(p.satuan || "pcs")}</p>
      <form class="form-grid" style="margin-top:18px" data-f novalidate>
        <div class="field"><label for="se-jml">${sewa ? "Lama sewa (hari)" : "Jumlah (" + E(p.satuan || "pcs") + ")"}</label><input id="se-jml" name="jumlah" type="number" min="1" value="1" inputmode="numeric"></div>
        ${sewa ? `<div class="field"><label for="se-tgl">Tanggal mulai sewa</label><input id="se-tgl" name="tanggal" type="date"></div>
          <fieldset class="field se-bayar"><legend>Bayar dengan</legend>
            <label class="check"><input type="radio" name="bayar" value="uang" checked> Uang</label>
            <label class="check"><input type="radio" name="bayar" value="poin"> Poin SE (khusus member)</label></fieldset>` : ""}
        <div class="field"><label for="se-cat">Catatan (opsional)</label><textarea id="se-cat" name="catatan" placeholder="Contoh: nama acara, warna, ukuran, atau desain."></textarea></div>
        <div class="se-ringkas" data-ringkas aria-live="polite"></div>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">${FC.icon("chat")} Kirim pesanan via WhatsApp</button><button class="btn btn-ghost" type="button" data-close>Batal</button></div>
        <p class="muted" style="font-size:.82rem">Admin SE akan mengonfirmasi pesanan dan cara pembayaran. Poin cashback masuk setelah pesanan lunas.</p>
      </form>`, { label: "Pesan " + p.nama });
    const f = d.querySelector("[data-f]"), ring = d.querySelector("[data-ringkas]");
    const hitung = () => {
      const v = FC.formData(f), n = Math.max(1, parseInt(v.jumlah, 10) || 1), total = p.harga * n;
      const pakaiPoin = v.bayar === "poin";
      ring.innerHTML = pakaiPoin
        ? `<div><span>Total poin</span><b>${poin(total)} poin</b></div><div><span>Cashback</span><b>Tidak ada (bayar pakai poin)</b></div>`
        : `<div><span>Total</span><b>${rp(total)}</b></div><div><span>Cashback poin SE</span><b>+${poin(cashback(total))} poin</b></div>`;
      return { v, n, total, pakaiPoin };
    };
    f.addEventListener("input", hitung);
    hitung();
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const { v, n, total, pakaiPoin } = hitung(), err = f.querySelector("[data-err]");
      const baris = [
        `Halo admin Science Entrepreneur, saya ingin memesan:`,
        `• Unit: ${u.nama}`,
        `• Produk: ${p.nama}`,
        `• ${sewa ? "Lama sewa" : "Jumlah"}: ${n} ${p.satuan || "pcs"}`,
        sewa && v.tanggal ? `• Mulai: ${v.tanggal}` : "",
        pakaiPoin ? `• Bayar: tukar ${poin(total)} poin SE` : `• Total: ${rp(total)} (cashback ${poin(cashback(total))} poin SE)`,
        v.catatan ? `• Catatan: ${v.catatan}` : "",
        namaAkun(ctx) ? `Nama: ${namaAkun(ctx)}` : ""
      ].filter(Boolean).join("\n");
      const url = waPesan(ctx, baris);
      if (!url) { err.textContent = "Nomor WhatsApp admin SE belum diatur. Hubungi pengurus SE secara langsung, ya."; err.hidden = false; return; }
      window.open(url, "_blank", "noopener");
      FC.closeModal();
    });
  }

  /* ---------------- Member ---------------- */
  const TIPE = {
    ormawa: { judul: "Akun Ormawa", isi: "Untuk himpunan, UKM, atau kepanitiaan. Poin dikumpulkan bersama dari semua pesanan organisasi.", ikon: "users" },
    pribadi: { judul: "Akun Pribadi", isi: "Untuk mahasiswa perorangan. Poin dari setiap pesananmu masuk ke akunmu sendiri.", ikon: "user" }
  };
  function hMember(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Member SE", "Member Science Entrepreneur", `Kumpulkan poin dari setiap pesanan, lalu tukarkan untuk sewa perlengkapan acara.`) + `
      <section class="bso-section"><div class="wrap">
        <div class="se-kartu-wrap">
          <div class="se-kartu" aria-hidden="true">
            <div class="top"><b>Science Entrepreneur</b><small>Kartu Member</small></div>
            <div class="saldo"><small>Saldo awal</small><b>${poin(K.KARTU.poinAwal)} poin</b></div>
            <div class="bawah"><span>NAMA MEMBER</span><span>SE-0000</span></div>
          </div>
          <div>
            <span class="eyebrow">Kartu member</span>
            <h2 style="margin:10px 0 14px">Bayar ${rp(K.KARTU.harga)}, langsung dapat ${poin(K.KARTU.poinAwal)} poin</h2>
            <ul class="se-poin-list">
              <li>${FC.icon("check")}<span>Setiap pesanan dapat cashback <b>${persen}%</b> dalam bentuk poin SE.</span></li>
              <li>${FC.icon("check")}<span><b>1 poin = Rp1</b>. Poin masuk setelah pesanan dinyatakan lunas oleh admin SE.</span></li>
              <li>${FC.icon("check")}<span>Poin bisa ditukar untuk <b>barang persewaan</b> (kamera, proyektor, layar, dan lainnya).</span></li>
              <li>${FC.icon("x")}<span>Poin tidak bisa dipakai untuk pembelian atau cetak.</span></li>
            </ul>
          </div>
        </div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Pilih jenis akun</span><h2>Dua jenis member</h2>
        <div class="se-tipe-grid">${Object.entries(TIPE).map(([k, t]) => `<article class="bso-card se-tipe"><span class="se-ikon" aria-hidden="true">${FC.icon(t.ikon)}</span><h3>${E(t.judul)}</h3><p>${E(t.isi)}</p>
          <button class="btn btn-primary btn-sm" type="button" data-daftar-member="${k}">Daftar ${E(t.judul.replace("Akun ", ""))}</button></article>`).join("")}</div>
        <p class="muted se-catatan">Pendaftaran online dan cek saldo poin langsung di situs segera hadir. Untuk sementara, pendaftaran dikirim lewat WhatsApp admin SE.</p>
      </div></section>`;
    el.querySelectorAll("[data-daftar-member]").forEach((b) => b.onclick = () => formMember(ctx, b.dataset.daftarMember));
  }

  function formMember(ctx, tipe) {
    const t = TIPE[tipe], ormawa = tipe === "ormawa";
    const d = FC.openModal(`<span class="eyebrow">Daftar member SE</span><h2>${E(t.judul)}</h2>
      <form class="form-grid" style="margin-top:18px" data-f novalidate>
        ${ormawa ? `<div class="field"><label for="mb-org">Nama ormawa <span class="req">*</span></label><input id="mb-org" name="ormawa" placeholder="Contoh: HMJ Biologi" required></div>` : ""}
        <div class="field"><label for="mb-nama">${ormawa ? "Nama penanggung jawab" : "Nama lengkap"} <span class="req">*</span></label><input id="mb-nama" name="nama" value="${E(namaAkun(ctx))}" required></div>
        <div class="field"><label for="mb-wa">Nomor WhatsApp <span class="req">*</span></label><input id="mb-wa" name="whatsapp" type="tel" inputmode="tel" value="${E((ctx.profil && ctx.profil.whatsapp) || "")}" required></div>
        <div class="se-ringkas"><div><span>Biaya cetak kartu</span><b>${rp(K.KARTU.harga)}</b></div><div><span>Saldo awal</span><b>${poin(K.KARTU.poinAwal)} poin</b></div></div>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">${FC.icon("chat")} Kirim via WhatsApp</button><button class="btn btn-ghost" type="button" data-close>Batal</button></div>
      </form>`, { label: "Daftar " + t.judul });
    const f = d.querySelector("[data-f]");
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = FC.formData(f), err = f.querySelector("[data-err]");
      if ((ormawa && !v.ormawa) || !v.nama || !v.whatsapp) { err.textContent = "Lengkapi semua isian bertanda *."; err.hidden = false; return; }
      const teks = [`Halo admin Science Entrepreneur, saya ingin daftar member SE.`, `• Jenis: ${t.judul}`, ormawa ? `• Ormawa: ${v.ormawa}` : "", `• Nama: ${v.nama}`, `• WhatsApp: ${v.whatsapp}`, `Saya siap membayar kartu member ${rp(K.KARTU.harga)}.`].filter(Boolean).join("\n");
      const url = waPesan(ctx, teks);
      if (!url) { err.textContent = "Nomor WhatsApp admin SE belum diatur. Hubungi pengurus SE secara langsung, ya."; err.hidden = false; return; }
      window.open(url, "_blank", "noopener");
      FC.closeModal();
    });
  }

  FC.bsoExt = {
    publik: [
      { id: "unit-usaha", judul: "Unit Usaha", sub: `${(K.unit || []).length} unit · cashback ${persen}% poin`, penuh: true, render: hUnitUsaha },
      { id: "member", judul: "Member", sub: "Kartu member & poin SE", penuh: true, render: hMember }
    ],
    admin: []
  };
})();
