/* =====================================================================
   Science Entrepreneur — MEKANISME KHUSUS
   File ini milik pengurus Science Entrepreneur. Ubah file di folder science-entrepreneur/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman publik khusus SE:
     #/unit-usaha  → katalog 3 unit usaha (Beli, Sewa, Cetak) + form pesan. Produk & harga di katalog.js
     #/member      → info & daftar member (ormawa/pribadi)
     #/akun        → Akun Saya: saldo poin + tombol Tukar poin, ubah data diri, pesanan, riwayat poin
     #/tukar-poin  → katalog barang sewa dengan harga dalam poin (tidak tampil di menu)
   Tab panel admin khusus SE:
     Pesanan → tandai lunas (poin cashback 10% otomatis) atau batalkan
     Member  → tandai kartu lunas (aktif + 15.000 poin), tolak, sesuaikan poin
   Galeri, Pengumuman, dan Daftar disembunyikan lewat `sembunyikan` di assets/js/bso-config.js.
   Data: science-entrepreneur/se-data.js → tabel supabase/bso/science-entrepreneur.sql

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const K = window.SE_KATALOG || { CASHBACK: 0.1, KARTU: { harga: 15000, poinAwal: 15000 }, unit: [] };
  const api = (ctx) => window.SE_DATA(ctx);

  const rp = (n) => "Rp" + Math.round(n || 0).toLocaleString("id-ID");
  const poin = (n) => Math.round(n || 0).toLocaleString("id-ID");
  const cashback = (harga) => Math.floor(harga * K.CASHBACK);
  const persen = Math.round(K.CASHBACK * 100);
  const UNIT = Object.fromEntries((K.unit || []).map((u) => [u.id, u]));
  const ST_PESANAN = { menunggu: ["Menunggu pembayaran", "warn"], lunas: ["Lunas", ""], batal: ["Dibatalkan", "gray"] };
  const ST_MEMBER = { menunggu: ["Menunggu bayar kartu", "warn"], aktif: ["Aktif", ""], ditolak: ["Ditolak", "gray"] };
  const chip = (map, s) => { const [t, c] = map[s] || [s, "gray"]; return `<span class="chip ${c}">${E(t)}</span>`; };
  const TIPE = {
    ormawa: { judul: "Akun Ormawa", isi: "Untuk himpunan, UKM, atau kepanitiaan. Poin dikumpulkan bersama dari semua pesanan organisasi.", ikon: "users" },
    pribadi: { judul: "Akun Pribadi", isi: "Untuk mahasiswa perorangan. Poin dari setiap pesananmu masuk ke akunmu sendiri.", ikon: "user" }
  };
  const namaMember = (m) => (m.tipe === "ormawa" && m.nama_ormawa ? `${m.nama_ormawa} (${m.nama})` : m.nama);

  // Nomor WA admin SE: katalog.js → kontak di bso-config.js (mode demo: nomor contoh)
  function waAdmin(ctx, teks) {
    const no = K.whatsapp || ((ctx.ui.data().kontak || {}).whatsapp) || "";
    const url = ctx.ui.waLink(no);
    return url ? url + (teks ? "?text=" + encodeURIComponent(teks) : "") : "";
  }
  const waOrang = (ctx, no, teks) => { const u = ctx.ui.waLink(no); return u ? u + (teks ? "?text=" + encodeURIComponent(teks) : "") : ""; };

  /* =================================================================
     UNIT USAHA
     ================================================================= */
  let unitAktif = "";
  function kartuProduk(u, p, i) {
    return `<article class="se-produk">
      <div class="se-produk-top"><span class="se-ikon" aria-hidden="true">${FC.icon(u.ikon)}</span>${u.tukarPoin ? `<span class="chip ok">Bisa ditukar poin</span>` : ""}</div>
      <h3>${E(p.nama)}</h3>
      ${p.ket ? `<p>${E(p.ket)}</p>` : ""}
      <div class="se-harga"><b>${rp(p.harga)}</b><small>/ ${E(p.satuan || "pcs")}</small></div>
      <p class="se-cashback"><span>${FC.icon("wallet")} Cashback ${persen}% poin SE</span><b>+${poin(cashback(p.harga))} poin</b></p>
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
      formPesan(ctx, UNIT[uid], UNIT[uid].produk[+i]);
    });
  }

  // opt.tukar = true → form Tukar Poin (selalu bayar pakai poin, khusus member aktif)
  async function formPesan(ctx, u, p, opt) {
    const sewa = !!u.tukarPoin, tukar = !!(opt && opt.tukar);
    const kepala = tukar
      ? `<span class="eyebrow">Tukar poin · ${E(u.nama)}</span><h2>${E(p.nama)}</h2><p class="lede">${poin(p.harga)} poin / ${E(p.satuan || "hari")}</p>`
      : `<span class="eyebrow">${E(u.nama)}</span><h2>${E(p.nama)}</h2><p class="lede">${rp(p.harga)} / ${E(p.satuan || "pcs")}</p>`;
    if (!ctx.user) {
      FC.openModal(`${kepala}<div class="empty" style="margin-top:18px"><h3>Masuk dulu, ya</h3><p>Pesanan dan poin SE tercatat di akun FMIPA Connect-mu.</p>
        <button class="btn btn-primary" style="margin-top:16px" type="button" data-masuk>Masuk</button></div>`, { label: "Pesan " + p.nama });
      return;
    }
    const d = FC.openModal(`${kepala}<div data-isi><div class="skeleton" style="min-height:200px;margin-top:18px"></div></div>`, { label: "Pesan " + p.nama });
    const isi = d.querySelector("[data-isi]");
    const m = await api(ctx).memberSaya().catch(() => null);
    const aktif = m && m.status === "aktif";
    if (tukar && !aktif) {
      isi.innerHTML = `<div class="empty" style="margin-top:18px"><h3>Khusus member aktif</h3><p>Tukar poin hanya untuk member SE yang kartunya sudah aktif.</p><a class="btn btn-primary" style="margin-top:16px" href="#/member">Lihat cara jadi member</a></div>`;
      return;
    }
    isi.innerHTML = `<form class="form-grid" style="margin-top:18px" data-f novalidate>
        <div class="field"><label for="se-jml">${sewa ? "Lama sewa (hari)" : "Jumlah (" + E(p.satuan || "pcs") + ")"}</label><input id="se-jml" name="jumlah" type="number" min="1" max="10000" value="1" inputmode="numeric"></div>
        <div class="field"><label for="se-tgl">${sewa ? "Tanggal mulai sewa" : "Dibutuhkan tanggal (opsional)"}</label><input id="se-tgl" name="tanggal" type="date"></div>
        ${tukar ? `<input type="hidden" name="bayar" value="poin"><p class="muted">Saldo kamu: <b>${poin(m.saldo)} poin</b></p>` : sewa ? `<fieldset class="field se-bayar"><legend>Bayar dengan</legend>
            <label class="check"><input type="radio" name="bayar" value="uang" checked> Uang</label>
            <label class="check"><input type="radio" name="bayar" value="poin" ${aktif ? "" : "disabled"}> Poin SE ${aktif ? `(saldo ${poin(m.saldo)})` : "(khusus member aktif)"}</label></fieldset>` : ""}
        <div class="field"><label for="se-cat">Catatan (opsional)</label><textarea id="se-cat" name="catatan" placeholder="Contoh: nama acara, warna, ukuran, atau desain."></textarea></div>
        <div class="se-ringkas" data-ringkas aria-live="polite"></div>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">${tukar ? "Tukar poin" : "Kirim pesanan"}</button><button class="btn btn-ghost" type="button" data-close>Batal</button></div>
        <p class="muted" style="font-size:.82rem">${tukar ? "Poin baru dipotong setelah admin SE mengonfirmasi penukaran." : `Admin SE akan menghubungimu lewat WhatsApp untuk pembayaran. ${aktif ? "Poin cashback masuk ke kartu member-mu setelah pesanan lunas." : `Poin cashback hanya untuk <a class="hl" href="#/member">member SE</a>.`}`}</p>
      </form>`;
    const f = isi.querySelector("[data-f]"), ring = isi.querySelector("[data-ringkas]");
    const hitung = () => {
      const v = FC.formData(f), n = Math.min(10000, Math.max(1, parseInt(v.jumlah, 10) || 1)), total = p.harga * n;
      const pakaiPoin = v.bayar === "poin";
      ring.innerHTML = pakaiPoin
        ? `<div><span>Total poin</span><b>${poin(total)} poin</b></div><div><span>Sisa saldo</span><b>${poin(m.saldo - total)} poin</b></div>`
        : `<div><span>Total</span><b>${rp(total)}</b></div><div><span>Cashback poin SE${aktif ? "" : " (member)"}</span><b>+${poin(cashback(total))} poin</b></div>`;
      return { v, n, total, pakaiPoin };
    };
    f.addEventListener("input", hitung);
    hitung();
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const { v, n, total, pakaiPoin } = hitung(), err = f.querySelector("[data-err]");
      err.hidden = true;
      if (pakaiPoin && m.saldo < total) { err.textContent = `Saldo poin tidak cukup (butuh ${poin(total)} poin).`; err.hidden = false; return; }
      if (sewa && !v.tanggal) { err.textContent = "Isi tanggal mulai sewa."; err.hidden = false; return; }
      try {
        const ps = await FC.busy(f.querySelector("[type=submit]"), () => api(ctx).kirimPesanan({ unit: u.id, produk: p.nama, harga: p.harga, jumlah: n, satuan: p.satuan, bayar: pakaiPoin ? "poin" : "uang", tanggal: v.tanggal, catatan: v.catatan }));
        const wa = waAdmin(ctx, `Halo admin Science Entrepreneur, saya baru memesan ${p.nama} (${n} ${p.satuan || "pcs"}) lewat situs SE, total ${pakaiPoin ? poin(total) + " poin" : rp(total)}. Nama: ${(ctx.profil && ctx.profil.nama) || ""}`);
        isi.innerHTML = `<div class="empty" style="margin-top:18px"><h3>${pakaiPoin ? "Penukaran poin terkirim" : "Pesanan terkirim"}</h3>
          <p>${pakaiPoin ? `Admin SE akan mengonfirmasi penukaran ${poin(ps.total)} poin.` : `Total ${rp(ps.total)}. Admin SE akan menghubungimu untuk pembayaran.`} Pantau statusnya di halaman Akun Saya.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:16px"><a class="btn btn-primary" href="#/akun">Lihat pesanan saya</a>${wa ? `<a class="btn btn-ghost" href="${E(wa)}" target="_blank" rel="noopener">${FC.icon("chat")} Kabari admin</a>` : ""}</div></div>`;
      } catch (x) { err.textContent = x.message; err.hidden = false; }
    });
  }

  /* =================================================================
     MEMBER (publik)
     ================================================================= */
  function kartuMember(m) {
    const nama = m ? (m.tipe === "ormawa" ? m.nama_ormawa : m.nama) : "NAMA MEMBER";
    const saldo = m && m.status === "aktif" ? m.saldo : K.KARTU.poinAwal;
    return `<div class="se-kartu"${m ? "" : ' aria-hidden="true"'}>
      <div class="top"><b>Science Entrepreneur</b><small>${m ? E(TIPE[m.tipe].judul) : "Kartu Member"}</small></div>
      <div class="saldo"><small>${m && m.status === "aktif" ? "Saldo poin" : "Saldo awal"}</small><b>${poin(saldo)} poin</b></div>
      <div class="bawah"><span>${E(String(nama).toUpperCase())}</span><span>${E((m && m.kode) || "SE-0000")}</span></div>
    </div>`;
  }

  function hMember(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Member SE", "Member Science Entrepreneur", `Kumpulkan poin dari setiap pesanan, lalu tukarkan untuk sewa perlengkapan acara.`) + `<div data-akun><section class="bso-section"><div class="wrap"><div class="skeleton" style="min-height:220px"></div></div></section></div>`;
    isiMember(el.querySelector("[data-akun]"), ctx);
  }

  async function isiMember(el, ctx) {
    let m = null;
    try { if (ctx.user) m = await api(ctx).memberSaya(); } catch (e) { el.innerHTML = `<section class="bso-section"><div class="wrap"><p class="error-text">${E(e.message)}</p></div></section>`; return; }
    const ulang = () => isiMember(el, ctx);

    const aturan = `<ul class="se-poin-list">
        <li>${FC.icon("check")}<span>Setiap pesanan dapat cashback <b>${persen}%</b> dalam bentuk poin SE.</span></li>
        <li>${FC.icon("check")}<span><b>1 poin = Rp1</b>. Poin masuk setelah pesanan dinyatakan lunas oleh admin SE.</span></li>
        <li>${FC.icon("check")}<span>Poin bisa ditukar untuk <b>barang persewaan</b> (kamera, proyektor, layar, dan lainnya).</span></li>
        <li>${FC.icon("x")}<span>Poin tidak bisa dipakai untuk pembelian atau cetak.</span></li>
      </ul>`;

    let atas;
    if (m && m.status === "aktif") {
      atas = `<div class="se-kartu-wrap">${kartuMember(m)}<div>
        <span class="eyebrow">Kartu member-mu</span>
        <h2 style="margin:10px 0 6px">${poin(m.saldo)} poin</h2>
        <p class="muted" style="margin-bottom:16px">${E(namaMember(m))} · ${E(m.kode || "")} · setara ${rp(m.saldo)} untuk sewa.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px"><a class="btn btn-primary btn-sm" href="#/tukar-poin">Tukar poin</a><a class="btn btn-ghost btn-sm" href="#/akun">Buka Akun Saya</a></div>
        ${aturan}</div></div>`;
    } else if (m && m.status === "menunggu") {
      const wa = waAdmin(ctx, `Halo admin Science Entrepreneur, saya sudah daftar member SE (${TIPE[m.tipe].judul}${m.nama_ormawa ? ": " + m.nama_ormawa : ""}) atas nama ${m.nama}. Saya ingin membayar kartu member ${rp(K.KARTU.harga)}.`);
      atas = `<div class="se-kartu-wrap">${kartuMember(m)}<div>
        <span class="eyebrow">Pendaftaran member</span> ${chip(ST_MEMBER, m.status)}
        <h2 style="margin:12px 0 10px">Tinggal bayar kartu ${rp(K.KARTU.harga)}</h2>
        <p class="muted" style="margin-bottom:16px">Setelah admin SE menerima pembayaran, kartumu aktif dan langsung berisi ${poin(K.KARTU.poinAwal)} poin.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">${wa ? `<a class="btn btn-primary btn-sm" href="${E(wa)}" target="_blank" rel="noopener">${FC.icon("chat")} Hubungi admin SE</a>` : ""}<button class="btn btn-danger btn-sm" type="button" data-batal-member>Batalkan pendaftaran</button></div>
      </div></div>`;
    } else {
      atas = `<div class="se-kartu-wrap">${kartuMember(null)}<div>
        <span class="eyebrow">Kartu member</span>
        <h2 style="margin:10px 0 14px">Bayar ${rp(K.KARTU.harga)}, langsung dapat ${poin(K.KARTU.poinAwal)} poin</h2>
        ${m && m.status === "ditolak" ? `<div class="form-card status-card" style="margin-bottom:16px">${chip(ST_MEMBER, "ditolak")}<p>Pendaftaran sebelumnya ditolak.${m.catatan ? " Pesan admin: " + E(m.catatan) : ""}</p><button class="btn btn-ghost btn-sm" style="justify-self:start" type="button" data-batal-member>Daftar ulang</button></div>` : ""}
        ${aturan}</div></div>`;
    }

    const pilihTipe = !m ? `<section class="bso-section"><div class="wrap">
        <span class="eyebrow">Pilih jenis akun</span><h2>Dua jenis member</h2>
        <div class="se-tipe-grid">${Object.entries(TIPE).map(([k, t]) => `<article class="bso-card se-tipe"><span class="se-ikon" aria-hidden="true">${FC.icon(t.ikon)}</span><h3>${E(t.judul)}</h3><p>${E(t.isi)}</p>
          <button class="btn btn-primary btn-sm" type="button" ${ctx.user ? `data-daftar-member="${k}"` : "data-masuk"}>${ctx.user ? "Daftar " + E(t.judul.replace("Akun ", "")) : "Masuk untuk daftar"}</button></article>`).join("")}</div>
        <p class="muted se-catatan">Satu akun FMIPA Connect hanya bisa punya satu kartu member. Untuk ormawa, daftarkan dengan akun penanggung jawab (misalnya bendahara).</p>
      </div></section>` : "";

    el.innerHTML = `<section class="bso-section"><div class="wrap">${atas}</div></section>${pilihTipe}`;

    el.querySelectorAll("[data-daftar-member]").forEach((b) => b.onclick = () => formMember(ctx, b.dataset.daftarMember, ulang));
    el.querySelectorAll("[data-batal-member]").forEach((b) => b.onclick = async () => {
      const ditolak = m.status === "ditolak";
      if (!ditolak && !(await FC.confirm("Batalkan pendaftaran member?", "Data pendaftaranmu dihapus. Kamu bisa mendaftar lagi kapan saja.", "Batalkan"))) return;
      try { await api(ctx).batalMember(m.id); FC.toast(ditolak ? "Silakan daftar ulang." : "Pendaftaran dibatalkan."); ulang(); } catch (e) { FC.toast(e.message, "err"); }
    });
  }

  function tabelRiwayat(rows) {
    if (!rows.length) return `<div class="empty bso-empty-sm"><p>Belum ada mutasi poin.</p></div>`;
    return `<ul class="se-mutasi">${rows.map((r) => `<li><div><b>${E(r.keterangan)}</b><small>${E(FC.fmtDateTime(r.created_at))}</small></div><span class="${r.jumlah < 0 ? "min" : "plus"}">${r.jumlah > 0 ? "+" : ""}${poin(r.jumlah)}</span></li>`).join("")}</ul>`;
  }

  /* =================================================================
     AKUN SAYA (#/akun): saldo poin, tombol tukar, data pribadi, pesanan, riwayat
     ================================================================= */
  function perluMasuk(judul) {
    return `<section class="bso-section"><div class="wrap" style="max-width:560px"><div class="empty"><h3>Masuk dulu, ya</h3>
      <p>${E(judul)} memakai akun FMIPA Connect yang sama.</p><button class="btn btn-primary" style="margin-top:16px" type="button" data-masuk>Masuk</button></div></div></section>`;
  }

  function hAkun(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Akun SE", "Akun Saya", "Lihat saldo poin, tukar poin, ubah data diri, dan pantau pesananmu.") + `<div data-akun>${ctx.user ? `<section class="bso-section"><div class="wrap"><div class="skeleton" style="min-height:220px"></div></div></section>` : perluMasuk("Akun SE")}</div>`;
    if (ctx.user) isiAkun(el.querySelector("[data-akun]"), ctx);
  }

  async function isiAkun(el, ctx) {
    let m, pesanan, riwayat = [];
    try {
      [m, pesanan] = await Promise.all([api(ctx).memberSaya(), api(ctx).pesananSaya()]);
      if (m && m.status === "aktif") riwayat = await api(ctx).riwayatPoin(m.id);
    } catch (e) { el.innerHTML = `<section class="bso-section"><div class="wrap"><p class="error-text">${E(e.message)}</p></div></section>`; return; }
    const ulang = () => isiAkun(el, ctx);
    const aktif = m && m.status === "aktif", pr = ctx.profil || {};

    const saldo = aktif
      ? `<div class="se-saldo">${kartuMember(m)}
          <div class="se-saldo-info"><small>Saldo poin SE</small><b>${poin(m.saldo)} poin</b><span class="muted">Setara ${rp(m.saldo)} untuk sewa perlengkapan.</span></div>
          <a class="btn btn-primary btn-block" href="#/tukar-poin">${FC.icon("wallet")} Tukar poin</a></div>`
      : `<div class="se-saldo"><div class="form-card status-card"><span class="eyebrow">Poin SE</span>
          ${m ? chip(ST_MEMBER, m.status) : ""}
          <h3>${m && m.status === "menunggu" ? `Kartu belum aktif` : "Belum jadi member"}</h3>
          <p class="muted">${m && m.status === "menunggu" ? `Bayar kartu ${rp(K.KARTU.harga)} ke admin SE. Setelah aktif, saldo langsung ${poin(K.KARTU.poinAwal)} poin dan tombol Tukar poin muncul di sini.` : `Jadi member SE untuk mengumpulkan poin dari setiap pesanan dan menukarnya dengan sewa perlengkapan.`}</p>
          <a class="btn btn-primary btn-sm" style="justify-self:start" href="#/member">${m ? "Lihat status member" : "Daftar member"}</a></div></div>`;

    const dataDiri = `<form class="form-card form-grid" data-f-diri novalidate>
        <h3 class="form-section-title">Data pribadi</h3>
        <dl class="profil-box"><dt>Email</dt><dd>${E(ctx.user.email || "-")}</dd>${m ? `<dt>Jenis akun</dt><dd>${E(TIPE[m.tipe].judul)}</dd>` : ""}${m && m.kode ? `<dt>Kode kartu</dt><dd>${E(m.kode)}</dd>` : ""}<dt>NIM</dt><dd>${E(pr.nim || "-")}</dd><dt>Prodi</dt><dd>${E(pr.prodi || pr.departemen || "-")}</dd></dl>
        ${m ? `${m.tipe === "ormawa" ? `<div class="field"><label for="ak-org">Nama ormawa <span class="req">*</span></label><input id="ak-org" name="nama_ormawa" value="${E(m.nama_ormawa || "")}" required></div>` : ""}
          <div class="field"><label for="ak-nama">${m.tipe === "ormawa" ? "Nama penanggung jawab" : "Nama lengkap"} <span class="req">*</span></label><input id="ak-nama" name="nama" value="${E(m.nama)}" required></div>
          <div class="field"><label for="ak-wa">Nomor WhatsApp <span class="req">*</span></label><input id="ak-wa" name="whatsapp" type="tel" inputmode="tel" value="${E(m.whatsapp)}" required><span class="hint">Nomor ini dipakai admin SE untuk menghubungimu soal pesanan.</span></div>
          <p class="error-text" data-err hidden></p>
          <div><button class="btn btn-primary" type="submit">Simpan data</button></div>`
          : `<dl class="profil-box"><dt>Nama</dt><dd>${E(pr.nama || "-")}</dd><dt>WhatsApp</dt><dd>${E(pr.whatsapp || "-")}</dd></dl>`}
        <p class="muted" style="font-size:.84rem">NIM, prodi, dan data akun lainnya diubah di <a class="hl" href="${E(ctx.root)}index.html#/profil">profil FMIPA Connect</a>.</p>
      </form>`;

    const daftarPesanan = `<section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Pesanan</span><h2>Pesanan saya</h2></div><a class="hl" href="#/unit-usaha">Pesan lagi</a></div>
        ${pesanan.length ? `<div class="adm-rows">${pesanan.map((p) => `<div class="adm-row"><div class="top"><h3>${E(p.produk)} · ${E(p.jumlah)} ${E(p.satuan || "")}</h3>${p.bayar === "poin" && p.status === "menunggu" ? '<span class="chip warn">Menunggu konfirmasi</span>' : chip(ST_PESANAN, p.status)}</div>
          <div class="sub">${p.bayar === "poin" ? "Tukar poin" : E((UNIT[p.unit] || {}).singkat || p.unit)} · ${p.bayar === "poin" ? `${poin(p.total)} poin` : rp(p.total)}${p.status === "lunas" && p.poin_cashback ? ` · <b class="se-plus">+${poin(p.poin_cashback)} poin</b>` : ""} · ${E(FC.fmtDateTime(p.created_at))}</div>
          ${p.pesan_admin ? `<p class="muted" style="font-size:.88rem">Pesan admin: ${E(p.pesan_admin)}</p>` : ""}
          ${p.status === "menunggu" ? `<div class="acts"><button class="btn btn-danger btn-sm" type="button" data-batal-pesanan="${E(p.id)}">Batalkan</button></div>` : ""}</div>`).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Belum ada pesanan.</p></div>`}
      </div></section>`;

    const riwayatHtml = aktif ? `<section class="bso-section"><div class="wrap">
        <span class="eyebrow">Riwayat poin</span><h2>Mutasi poin SE</h2><div style="max-width:760px">${tabelRiwayat(riwayat)}</div></div></section>` : "";

    el.innerHTML = `<section class="bso-section"><div class="wrap se-akun-grid">${saldo}${dataDiri}</div></section>${daftarPesanan}${riwayatHtml}`;

    const f = el.querySelector("[data-f-diri]");
    if (m) f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = FC.formData(f), err = f.querySelector("[data-err]");
      err.hidden = true;
      if (!v.nama || !v.whatsapp || (m.tipe === "ormawa" && !v.nama_ormawa)) { err.textContent = "Lengkapi semua isian bertanda *."; err.hidden = false; return; }
      try { await FC.busy(f.querySelector("[type=submit]"), () => api(ctx).ubahMember(m.id, v)); FC.toast("Data tersimpan."); ulang(); }
      catch (x) { err.textContent = x.message; err.hidden = false; }
    });
    el.querySelectorAll("[data-batal-pesanan]").forEach((b) => b.onclick = async () => {
      if (!(await FC.confirm("Batalkan pesanan?", "Pesanan ini dihapus.", "Batalkan"))) return;
      try { await api(ctx).batalPesanan(b.dataset.batalPesanan); FC.toast("Pesanan dibatalkan."); ulang(); } catch (e) { FC.toast(e.message, "err"); }
    });
  }

  /* =================================================================
     TUKAR POIN (#/tukar-poin): katalog sewa dengan harga dalam poin
     ================================================================= */
  async function hTukarPoin(el, ctx) {
    const unitSewa = (K.unit || []).filter((u) => u.tukarPoin);
    el.innerHTML = ctx.ui.judulHal("Tukar poin", "Tukar Poin", "Pakai poin SE-mu untuk menyewa perlengkapan acara. 1 poin = Rp1.") + `
      <section class="bso-section"><div class="wrap"><div data-saldo><div class="skeleton" style="min-height:84px"></div></div><div data-grid style="margin-top:26px"></div></div></section>`;
    let m = null;
    if (ctx.user) m = await api(ctx).memberSaya().catch(() => null);
    const aktif = m && m.status === "aktif", saldo = aktif ? m.saldo : 0;
    el.querySelector("[data-saldo]").innerHTML = aktif
      ? `<div class="se-saldo-bar"><div><small>Saldo poin kamu</small><b>${poin(saldo)} poin</b></div><a class="btn btn-ghost btn-sm" href="#/akun">Riwayat poin</a></div>`
      : `<div class="se-saldo-bar"><div><small>${ctx.user ? (m ? "Kartu member belum aktif" : "Kamu belum jadi member SE") : "Belum masuk"}</small><b>Tukar poin khusus member aktif</b></div>
          ${ctx.user ? `<a class="btn btn-primary btn-sm" href="#/member">${m ? "Lihat status member" : "Daftar member"}</a>` : `<button class="btn btn-primary btn-sm" type="button" data-masuk>Masuk</button>`}</div>`;
    el.querySelector("[data-grid]").innerHTML = unitSewa.length ? unitSewa.map((u) => `
      <div class="se-unit-head"><h2>${E(u.nama)}</h2><p class="muted">Harga ditulis dalam poin per ${E((u.produk[0] || {}).satuan || "hari")}.</p></div>
      <div class="se-produk-grid">${u.produk.map((p, i) => {
        const kurang = p.harga - saldo;
        return `<article class="se-produk">
          <div class="se-produk-top"><span class="se-ikon" aria-hidden="true">${FC.icon(u.ikon)}</span>${aktif ? (kurang > 0 ? `<span class="chip gray">Kurang ${poin(kurang)}</span>` : `<span class="chip ok">Poin cukup</span>`) : ""}</div>
          <h3>${E(p.nama)}</h3>${p.ket ? `<p>${E(p.ket)}</p>` : ""}
          <div class="se-harga"><b>${poin(p.harga)} poin</b><small>/ ${E(p.satuan || "hari")}</small></div>
          <p class="se-tukar">Setara ${rp(p.harga)}</p>
          <button class="btn btn-primary btn-sm" type="button" data-tukar="${E(u.id)}:${i}" ${aktif && kurang > 0 ? "disabled" : ""}>Tukar</button>
        </article>`;
      }).join("")}</div>`).join("") : `<div class="empty bso-empty-sm"><p>Belum ada barang persewaan.</p></div>`;
    el.querySelectorAll("[data-tukar]").forEach((b) => b.onclick = () => {
      const [uid, i] = b.dataset.tukar.split(":");
      formPesan(ctx, UNIT[uid], UNIT[uid].produk[+i], { tukar: true });
    });
  }

  function formMember(ctx, tipe, done) {
    const t = TIPE[tipe], ormawa = tipe === "ormawa", p = ctx.profil || {};
    const d = FC.openModal(`<span class="eyebrow">Daftar member SE</span><h2>${E(t.judul)}</h2>
      <form class="form-grid" style="margin-top:18px" data-f novalidate>
        ${ormawa ? `<div class="field"><label for="mb-org">Nama ormawa <span class="req">*</span></label><input id="mb-org" name="nama_ormawa" placeholder="Contoh: HMJ Biologi" required></div>` : ""}
        <div class="field"><label for="mb-nama">${ormawa ? "Nama penanggung jawab" : "Nama lengkap"} <span class="req">*</span></label><input id="mb-nama" name="nama" value="${E(p.nama || "")}" required></div>
        <div class="field"><label for="mb-wa">Nomor WhatsApp <span class="req">*</span></label><input id="mb-wa" name="whatsapp" type="tel" inputmode="tel" value="${E(p.whatsapp || "")}" required></div>
        <div class="se-ringkas"><div><span>Biaya cetak kartu</span><b>${rp(K.KARTU.harga)}</b></div><div><span>Saldo awal setelah lunas</span><b>${poin(K.KARTU.poinAwal)} poin</b></div></div>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">Kirim pendaftaran</button><button class="btn btn-ghost" type="button" data-close>Batal</button></div>
      </form>`, { label: "Daftar " + t.judul });
    const f = d.querySelector("[data-f]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = FC.formData(f), err = f.querySelector("[data-err]");
      if ((ormawa && !v.nama_ormawa) || !v.nama || !v.whatsapp) { err.textContent = "Lengkapi semua isian bertanda *."; err.hidden = false; return; }
      try {
        await FC.busy(f.querySelector("[type=submit]"), () => api(ctx).daftarMember(Object.assign({ tipe }, v)));
        FC.closeModal(); FC.toast("Pendaftaran member terkirim. Selanjutnya bayar kartu ke admin SE."); done();
      } catch (x) { err.textContent = x.message; err.hidden = false; }
    });
  }

  /* =================================================================
     PANEL ADMIN SE
     ================================================================= */
  let fPesanan = "menunggu", fMember = "menunggu";
  const pills = (opsi, aktif, n, attr) => `<div class="pills">${opsi.map(([s, t]) => `<button class="pill" type="button" ${attr}="${s}" aria-pressed="${s === aktif}">${t} (${n(s)})</button>`).join("")}</div>`;

  async function admPesanan(el, ctx) {
    el.innerHTML = `<div class="skeleton" style="min-height:160px"></div>`;
    let rows, members;
    try { [rows, members] = await Promise.all([api(ctx).listPesanan(), api(ctx).listMember()]); } catch (e) { el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; return; }
    const mOf = (u) => members.find((m) => m.user_id === u && m.status === "aktif");
    const n = (s) => rows.filter((r) => !s || r.status === s).length;
    const shown = rows.filter((r) => !fPesanan || r.status === fPesanan);
    el.innerHTML = `<div class="bar">${pills([["menunggu", "Menunggu"], ["lunas", "Lunas"], ["batal", "Batal"], ["", "Semua"]], fPesanan, n, "data-f")}
      <p class="muted" style="font-size:.86rem">Klik pesanan untuk menandai lunas. Poin cashback ${persen}% masuk otomatis ke member aktif.</p></div>
      <div class="adm-rows">${shown.length ? shown.map((r) => { const m = mOf(r.user_id); return `<button class="adm-row" type="button" data-id="${E(r.id)}"><div class="top"><h3>${E(r.produk)} · ${E(r.jumlah)} ${E(r.satuan || "")}</h3>${chip(ST_PESANAN, r.status)}</div>
        <div class="sub">${E(r.nama || "(tanpa nama)")}${m ? ` · <b>${E(m.kode)}</b>` : " · bukan member"} · ${E((UNIT[r.unit] || {}).singkat || r.unit)} · ${r.bayar === "poin" ? `<b>${poin(r.total)} poin</b>` : rp(r.total)}${r.tanggal ? " · mulai " + E(r.tanggal) : ""} · ${E(FC.fmtDateTime(r.created_at))}</div></button>`; }).join("")
        : `<div class="empty"><p>Tidak ada pesanan${fPesanan ? " dengan status ini" : ""}.</p></div>`}</div>`;
    el.querySelectorAll("[data-f]").forEach((x) => x.onclick = () => { fPesanan = x.dataset.f; admPesanan(el, ctx); });
    el.querySelectorAll("[data-id]").forEach((x) => x.onclick = () => { const r = rows.find((p) => String(p.id) === x.dataset.id); detailPesanan(ctx, r, mOf(r.user_id), () => admPesanan(el, ctx)); });
  }

  function detailPesanan(ctx, r, m, done) {
    const wa = waOrang(ctx, r.whatsapp, `Halo ${r.nama || ""}, ini admin Science Entrepreneur terkait pesanan ${r.produk} (${r.jumlah} ${r.satuan || ""}).`);
    const menunggu = r.status === "menunggu";
    const waBtn = wa ? `<a class="btn btn-ghost" href="${E(wa)}" target="_blank" rel="noopener">${FC.icon("chat")} WhatsApp</a>` : "";
    const d = FC.openModal(`<span class="eyebrow">${E((UNIT[r.unit] || {}).nama || r.unit)}</span><h2>${E(r.produk)}</h2>
      <dl class="kv"><dt>Pemesan</dt><dd>${E(r.nama || "-")}${m ? ` · member ${E(m.kode)} (${E(namaMember(m))}), saldo ${poin(m.saldo)} poin` : " · bukan member aktif"}</dd>
        <dt>WhatsApp</dt><dd>${E(r.whatsapp || "-")}</dd>
        <dt>Jumlah</dt><dd>${E(r.jumlah)} ${E(r.satuan || "")} × ${rp(r.harga)}</dd>
        <dt>Bayar</dt><dd>${r.bayar === "poin" ? `Tukar <b>${poin(r.total)} poin</b>` : `Uang <b>${rp(r.total)}</b>`}</dd>
        ${r.tanggal ? `<dt>Tanggal</dt><dd>${E(r.tanggal)}</dd>` : ""}
        ${r.catatan ? `<dt>Catatan</dt><dd>${E(r.catatan)}</dd>` : ""}
        <dt>Dipesan</dt><dd>${E(FC.fmtDateTime(r.created_at))}</dd>
        <dt>Status</dt><dd>${chip(ST_PESANAN, r.status)}${r.status === "lunas" && r.poin_cashback ? ` +${poin(r.poin_cashback)} poin cashback` : ""}</dd>
        ${r.pesan_admin ? `<dt>Pesan admin</dt><dd>${E(r.pesan_admin)}</dd>` : ""}</dl>
      ${menunggu ? `<form class="form-grid" data-f>
        ${r.bayar === "uang" ? `<div class="field"><label for="p-total">Total yang dibayar (Rp)</label><input id="p-total" name="total" type="number" min="0" value="${E(r.total)}" inputmode="numeric"><span class="hint" data-hint></span></div>` : `<p class="muted">Saat ditandai lunas, saldo member berkurang ${poin(r.total)} poin.</p>`}
        <div class="field"><label for="p-pesan">Pesan untuk pemesan (opsional)</label><input id="p-pesan" name="pesan" placeholder="Contoh: Barang bisa diambil Jumat di sekre BEM."></div>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">${FC.icon("check")} Tandai lunas</button>${waBtn}<button class="btn btn-danger" type="button" data-batal>Batalkan pesanan</button></div>
      </form>` : (waBtn ? `<div class="modal-actions">${waBtn}</div>` : "")}`, { wide: true, label: "Detail pesanan" });
    const f = d.querySelector("[data-f]");
    if (!f) return;
    const hint = f.querySelector("[data-hint]"), tot = f.querySelector("[name=total]");
    const upd = () => { if (hint) hint.textContent = m ? `Member ${m.kode} akan dapat +${poin(cashback(+tot.value || 0))} poin.` : "Pemesan bukan member aktif, jadi tidak ada poin cashback."; };
    if (tot) tot.addEventListener("input", upd);
    upd();
    const err = f.querySelector("[data-err]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = FC.formData(f);
      try { await FC.busy(f.querySelector("[type=submit]"), () => api(ctx).statusPesanan(r.id, "lunas", r.bayar === "uang" ? v.total : null, v.pesan)); FC.closeModal(); FC.toast("Pesanan lunas. Poin sudah diperbarui."); done(); }
      catch (x) { err.textContent = x.message; err.hidden = false; }
    });
    d.querySelector("[data-batal]").onclick = async () => {
      const v = FC.formData(f);
      if (!(await FC.confirm("Batalkan pesanan ini?", "Status pesanan menjadi Dibatalkan. Tidak ada poin yang berubah.", "Batalkan"))) return;
      try { await api(ctx).statusPesanan(r.id, "batal", null, v.pesan); FC.toast("Pesanan dibatalkan."); done(); } catch (x) { FC.toast(x.message, "err"); }
    };
  }

  async function admMember(el, ctx) {
    el.innerHTML = `<div class="skeleton" style="min-height:160px"></div>`;
    let rows;
    try { rows = await api(ctx).listMember(); } catch (e) { el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; return; }
    const n = (s) => rows.filter((r) => !s || r.status === s).length;
    const shown = rows.filter((r) => !fMember || r.status === fMember);
    const totalPoin = rows.filter((r) => r.status === "aktif").reduce((a, r) => a + r.saldo, 0);
    el.innerHTML = `<div class="bar">${pills([["menunggu", "Menunggu bayar"], ["aktif", "Aktif"], ["ditolak", "Ditolak"], ["", "Semua"]], fMember, n, "data-f")}
      <p class="muted" style="font-size:.86rem">Total poin beredar: <b>${poin(totalPoin)}</b></p></div>
      <div class="adm-rows">${shown.length ? shown.map((r) => `<button class="adm-row" type="button" data-id="${E(r.id)}"><div class="top"><h3>${E(namaMember(r))}</h3>${chip(ST_MEMBER, r.status)}</div>
        <div class="sub">${E(TIPE[r.tipe].judul)}${r.kode ? " · " + E(r.kode) : ""}${r.status === "aktif" ? ` · <b>${poin(r.saldo)} poin</b>` : ""} · ${E(r.whatsapp)} · ${E(FC.fmtDateTime(r.created_at))}</div></button>`).join("")
        : `<div class="empty"><p>Tidak ada member${fMember ? " dengan status ini" : ""}.</p></div>`}</div>`;
    el.querySelectorAll("[data-f]").forEach((x) => x.onclick = () => { fMember = x.dataset.f; admMember(el, ctx); });
    el.querySelectorAll("[data-id]").forEach((x) => x.onclick = () => detailMember(ctx, rows.find((m) => String(m.id) === x.dataset.id), () => admMember(el, ctx)));
  }

  async function detailMember(ctx, m, done) {
    const wa = waOrang(ctx, m.whatsapp, `Halo ${m.nama}, ini admin Science Entrepreneur terkait kartu member SE.`);
    const d = FC.openModal(`<span class="eyebrow">${E(TIPE[m.tipe].judul)}</span><h2>${E(namaMember(m))}</h2>
      <dl class="kv"><dt>Status</dt><dd>${chip(ST_MEMBER, m.status)}</dd>${m.kode ? `<dt>Kode</dt><dd>${E(m.kode)}</dd>` : ""}
        ${m.tipe === "ormawa" ? `<dt>Ormawa</dt><dd>${E(m.nama_ormawa)}</dd><dt>Penanggung jawab</dt><dd>${E(m.nama)}</dd>` : `<dt>Nama</dt><dd>${E(m.nama)}</dd>`}
        <dt>WhatsApp</dt><dd>${E(m.whatsapp)}</dd><dt>Daftar</dt><dd>${E(FC.fmtDateTime(m.created_at))}</dd>
        ${m.status === "aktif" ? `<dt>Saldo</dt><dd><b>${poin(m.saldo)} poin</b></dd>` : ""}${m.catatan ? `<dt>Catatan</dt><dd>${E(m.catatan)}</dd>` : ""}</dl>
      <div data-aksi></div>`, { wide: true, label: "Detail member" });
    const aksi = d.querySelector("[data-aksi]");
    const waBtn = wa ? `<a class="btn btn-ghost" href="${E(wa)}" target="_blank" rel="noopener">${FC.icon("chat")} WhatsApp</a>` : "";
    if (m.status === "menunggu") {
      aksi.innerHTML = `<form class="form-grid" data-f><p class="muted">Sudah menerima pembayaran kartu ${rp(K.KARTU.harga)}? Aktifkan member ini: kode kartu dibuat dan saldo langsung +${poin(K.KARTU.poinAwal)} poin.</p>
        <div class="field"><label for="m-cat">Alasan jika ditolak</label><input id="m-cat" name="catatan" placeholder="Contoh: Belum ada pembayaran dalam 7 hari."></div>
        <div class="modal-actions"><button class="btn btn-primary" type="button" data-aktif>${FC.icon("check")} Kartu lunas, aktifkan</button>${waBtn}<button class="btn btn-danger" type="button" data-tolak>Tolak</button></div></form>`;
      aksi.querySelector("[data-aktif]").onclick = async (e) => {
        try { const r = await FC.busy(e.currentTarget, () => api(ctx).aktifkanMember(m.id)); FC.closeModal(); FC.toast(`Member aktif${r && r.kode ? " dengan kode " + r.kode : ""}. Saldo +${poin(K.KARTU.poinAwal)} poin.`); done(); } catch (x) { FC.toast(x.message, "err"); }
      };
      aksi.querySelector("[data-tolak]").onclick = async () => {
        try { await api(ctx).tolakMember(m.id, FC.formData(aksi.querySelector("[data-f]")).catatan); FC.closeModal(); FC.toast("Pendaftaran ditolak."); done(); } catch (x) { FC.toast(x.message, "err"); }
      };
    } else if (m.status === "aktif") {
      aksi.innerHTML = `<form class="form-grid" data-f style="margin-top:8px"><h3 class="form-section-title">Sesuaikan poin</h3>
        <div class="field"><label for="m-jml">Jumlah poin (pakai minus untuk mengurangi)</label><input id="m-jml" name="jumlah" type="number" placeholder="Contoh: 5000 atau -2000"></div>
        <div class="field"><label for="m-ket">Keterangan <span class="req">*</span></label><input id="m-ket" name="ket" placeholder="Contoh: Koreksi pesanan 12 Desember"></div>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">Simpan penyesuaian</button>${waBtn}</div></form>
        <h3 class="form-section-title" style="margin-top:22px">Riwayat poin</h3><div data-riwayat><div class="skeleton" style="min-height:80px"></div></div>`;
      const f = aksi.querySelector("[data-f]"), err = f.querySelector("[data-err]");
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const v = FC.formData(f), j = parseInt(v.jumlah, 10);
        if (!j || !v.ket) { err.textContent = "Isi jumlah poin (bukan 0) dan keterangan."; err.hidden = false; return; }
        try { await FC.busy(f.querySelector("[type=submit]"), () => api(ctx).sesuaikanPoin(m.id, j, v.ket)); FC.closeModal(); FC.toast("Poin disesuaikan."); done(); }
        catch (x) { err.textContent = x.message; err.hidden = false; }
      });
      try { aksi.querySelector("[data-riwayat]").innerHTML = tabelRiwayat(await api(ctx).riwayatPoin(m.id)); } catch (x) { aksi.querySelector("[data-riwayat]").innerHTML = `<p class="error-text">${E(x.message)}</p>`; }
    } else {
      aksi.innerHTML = `<div class="modal-actions">${waBtn}<button class="btn btn-danger" type="button" data-hapus>Hapus data</button></div>`;
      aksi.querySelector("[data-hapus]").onclick = async () => { try { await api(ctx).batalMember(m.id); FC.closeModal(); FC.toast("Dihapus."); done(); } catch (x) { FC.toast(x.message, "err"); } };
    }
  }

  FC.bsoExt = {
    publik: [
      { id: "unit-usaha", judul: "Unit Usaha", sub: `${(K.unit || []).length} unit · cashback ${persen}% poin`, penuh: true, render: hUnitUsaha },
      { id: "member", judul: "Member", sub: "Kartu member & poin SE", penuh: true, render: hMember },
      { id: "akun", judul: "Akun Saya", sub: "Saldo poin, data diri, pesanan", penuh: true, render: hAkun },
      { id: "tukar-poin", judul: "Tukar Poin", menu: false, penuh: true, render: hTukarPoin }
    ],
    admin: [
      { id: "pesanan", judul: "Pesanan", render: admPesanan },
      { id: "member", judul: "Member", render: admMember }
    ]
  };
})();
