/* =====================================================================
   FMIPA Connect — panel admin
   ===================================================================== */
(function () {
  const FC = window.FC;
  const { icon, esc } = FC;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const root = $("#root");
  let D, user, view = "ringkasan";
  let cache = { info: [], aduan: [], tim: [] };

  const JENIS_ADUAN = { kekerasan: "Kekerasan", ukt: "Penurunan UKT", fasilitas: "Fasilitas", akademik: "Akademik", lainnya: "Lainnya" };
  const ST_CHIP = { diterima: "warn", diproses: "", ditindaklanjuti: "", selesai: "ok", ditolak: "gray" };

  async function start() {
    D = await FC.ready;
    user = await D.user();
    if (!user) return loginView();
    if (!(await D.isAdmin())) return notAdmin();
    shell();
  }

  function loginView(msg) {
    root.innerHTML = `
      <div class="login-box">
        <a href="index.html" class="brand" style="margin-bottom:28px"><img src="assets/img/logo.svg" alt="" width="34" height="34"><span><b>FMIPA Connect</b><small>Panel Admin</small></span></a>
        <form class="form-card" id="lf" novalidate>
          <h1 style="font-size:2rem;margin-bottom:6px">Masuk <em class="hl">admin</em></h1>
          <p class="muted" style="font-size:.9rem;margin-bottom:20px">Khusus pengurus yang sudah didaftarkan sebagai admin.</p>
          <div class="form-grid">
            <div class="field"><label for="le">Email</label><input id="le" type="email" name="email" required autocomplete="email"></div>
            <div class="field"><label for="lp">Kata sandi</label><input id="lp" type="password" name="password" required autocomplete="current-password"></div>
            <p class="error-text" id="lerr" role="alert">${esc(msg || "")}</p>
            <button class="btn btn-primary btn-lg btn-block">Masuk</button>
          </div>
          ${D.mode === "demo" ? '<div class="demo-accounts">Mode demo: <code>admin@demo.id</code> / <code>admin123</code></div>' : ""}
        </form>
        <p style="text-align:center;margin-top:18px"><a class="muted" href="index.html">← Kembali ke situs</a></p>
      </div>`;
    $("#lf").onsubmit = async (e) => {
      e.preventDefault(); const v = FC.formData(e.target);
      await FC.busy(e.target.querySelector("button"), async () => {
        try { await D.signIn(v.email, v.password); start(); } catch (ex) { $("#lerr").textContent = ex.message; }
      });
    };
  }

  function notAdmin() {
    root.innerHTML = `<div class="login-box"><div class="form-card"><h1 style="font-size:1.8rem">Akun ini belum menjadi admin</h1>
      <p class="muted" style="margin:10px 0 20px">Masuk sebagai <b>${esc(user.email)}</b>. Minta pengelola menambahkan akunmu ke tabel <code>admins</code> di Supabase (lihat README).</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost" id="so">Keluar</button><a class="btn btn-primary" href="index.html">Ke situs</a></div></div></div>`;
    $("#so").onclick = async () => { await D.signOut(); start(); };
  }

  function shell() {
    root.innerHTML = `
      <div class="adm">
        <aside class="adm-side">
          <a href="index.html" class="brand"><img src="assets/img/logo.svg" alt="" width="34" height="34"><span><b>FMIPA Connect</b><small>Panel Admin${D.mode === "demo" ? " · demo" : ""}</small></span></a>
          <nav aria-label="Menu admin">
            ${[["ringkasan", "grid", "Ringkasan"], ["info", "trophy", "Info"], ["pengaduan", "shield", "Pengaduan"], ["tim", "users", "Lowongan Tim"]].map(([k, ic, l]) => `<button data-v="${k}">${icon(ic)} ${l}${k === "pengaduan" ? '<span class="badge-n" id="nBaru" hidden></span>' : ""}</button>`).join("")}
          </nav>
          <div class="who">${esc(user.email)}<br><button class="btn btn-ghost btn-sm" style="margin-top:10px" id="out">${icon("out")} Keluar</button></div>
        </aside>
        <main class="adm-main" id="main" tabindex="-1"></main>
      </div>`;
    $$("[data-v]").forEach((b) => b.onclick = () => { view = b.dataset.v; draw(); });
    $("#out").onclick = async () => { await D.signOut(); start(); };
    load().then(draw);
  }

  async function load() {
    const [info, aduan, tim] = await Promise.all([D.listInfo().catch(() => []), D.listPengaduan().catch((e) => { FC.toast(e.message, "err"); return []; }), D.listTim().catch(() => [])]);
    cache = { info, aduan, tim };
    const baru = aduan.filter((a) => a.status === "diterima").length;
    const n = $("#nBaru"); if (n) { n.hidden = !baru; n.textContent = baru; }
  }

  function draw() {
    $$("[data-v]").forEach((b) => b.dataset.v === view ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
    ({ ringkasan, info: infoView, pengaduan: aduanView, tim: timView })[view]();
    $("#main").focus({ preventScroll: true });
  }

  /* ---------------- ringkasan ---------------- */
  function ringkasan() {
    const { info, aduan, tim } = cache;
    const aktif = info.filter((x) => { const n = FC.daysLeft(x.deadline); return x.terbit && (n === null || n >= 0); }).length;
    const baru = aduan.filter((a) => a.status === "diterima");
    $("#main").innerHTML = `
      <div class="adm-head"><div><span class="eyebrow">Panel admin</span><h1 style="margin-top:10px">Ringkasan</h1></div><a class="btn btn-ghost btn-sm" href="index.html" target="_blank" rel="noopener">Lihat situs ${icon("arrow")}</a></div>
      <div class="kpis">
        ${[["shield", baru.length, "Laporan baru"], ["mega", aduan.filter((a) => ["diproses", "ditindaklanjuti"].includes(a.status)).length, "Sedang ditangani"], ["trophy", aktif, "Info aktif"], ["users", tim.filter((t) => t.status === "buka").length, "Tim mencari anggota"]].map(([ic, n, l]) => `<div class="stat"><div><b>${n}</b><span>${l}</span></div>${icon(ic)}</div>`).join("")}
      </div>
      <h2 style="font-size:1.6rem;margin-bottom:14px">Laporan yang perlu dibaca</h2>
      <div class="row-list" id="baruList">${baru.length ? baru.slice(0, 6).map(aduanRow).join("") : '<div class="empty"><p>Tidak ada laporan baru.</p></div>'}</div>
      <h2 style="font-size:1.6rem;margin:32px 0 14px">Info yang segera ditutup</h2>
      <div class="row-list">${info.filter((x) => { const n = FC.daysLeft(x.deadline); return x.terbit && n !== null && n >= 0 && n <= 7; }).map(infoRow).join("") || '<div class="empty"><p>Tidak ada info yang tutup dalam 7 hari.</p></div>'}</div>`;
    bindAduanRows(); bindInfoRows();
  }

  /* ---------------- info ---------------- */
  let infoFilter = { jenis: "semua", cari: "" };
  const infoRow = (x) => `
    <div class="row">
      <div class="row-top">
        <div><h3>${esc(x.judul)}</h3><p class="sub">${FC.jenisLabel[x.jenis]} · ${esc(x.kategori || "-")} · ${esc(x.penyelenggara || "")}</p></div>
        <div class="chips">${x.terbit ? "" : '<span class="chip gray">Draf</span>'}${x.unggulan ? '<span class="chip">Unggulan</span>' : ""}${FC.deadlineChip(x.deadline)}</div>
      </div>
      <div class="acts">
        <button class="btn btn-ghost btn-sm" data-edit="${x.id}">${icon("edit")} Ubah</button>
        <button class="btn btn-ghost btn-sm" data-pub="${x.id}">${x.terbit ? "Jadikan draf" : "Terbitkan"}</button>
        <button class="btn btn-danger btn-sm" data-delinfo="${x.id}" aria-label="Hapus ${esc(x.judul)}">${icon("trash")}</button>
      </div>
    </div>`;

  function infoView() {
    $("#main").innerHTML = `
      <div class="adm-head"><div><span class="eyebrow">Konten</span><h1 style="margin-top:10px">Info Lomba, Beasiswa & Pelatihan</h1></div><button class="btn btn-primary" id="addInfo">${icon("plus")} Tambah info</button></div>
      <div class="toolbar-row" style="margin-bottom:20px">
        <div class="pills">${["semua", "lomba", "beasiswa", "pelatihan"].map((j) => `<button class="pill" data-j="${j}" aria-pressed="${infoFilter.jenis === j}">${j === "semua" ? "Semua" : FC.jenisLabel[j]}</button>`).join("")}</div>
        <label class="search"><span class="sr-only">Cari</span>${icon("search")}<input type="search" id="ic" placeholder="Cari judul…" value="${esc(infoFilter.cari)}"></label>
      </div>
      <div class="row-list" id="infoList"></div>`;
    const list = () => {
      const r = cache.info.filter((x) => (infoFilter.jenis === "semua" || x.jenis === infoFilter.jenis) && (!infoFilter.cari || x.judul.toLowerCase().includes(infoFilter.cari.toLowerCase())));
      $("#infoList").innerHTML = r.length ? r.map(infoRow).join("") : '<div class="empty"><p>Belum ada info.</p></div>';
      bindInfoRows();
    };
    $$("[data-j]").forEach((b) => b.onclick = () => { infoFilter.jenis = b.dataset.j; $$("[data-j]").forEach((x) => x.setAttribute("aria-pressed", x === b)); list(); });
    $("#ic").oninput = (e) => { infoFilter.cari = e.target.value; list(); };
    $("#addInfo").onclick = () => infoForm({ jenis: infoFilter.jenis === "semua" ? "lomba" : infoFilter.jenis });
    list();
  }

  function bindInfoRows() {
    $$("[data-edit]").forEach((b) => b.onclick = () => infoForm(cache.info.find((x) => String(x.id) === b.dataset.edit)));
    $$("[data-pub]").forEach((b) => b.onclick = () => FC.busy(b, async () => { const x = cache.info.find((i) => String(i.id) === b.dataset.pub); try { await D.saveInfo({ id: x.id, terbit: !x.terbit }); await load(); draw(); } catch (e) { FC.toast(e.message, "err"); } }));
    $$("[data-delinfo]").forEach((b) => b.onclick = async () => { if (await FC.confirm("Hapus info ini?", "Info akan dihapus permanen dari situs.", "Hapus")) { try { await D.deleteInfo(isNaN(+b.dataset.delinfo) ? b.dataset.delinfo : +b.dataset.delinfo); await load(); draw(); FC.toast("Info dihapus."); } catch (e) { FC.toast(e.message, "err"); } } });
  }

  function infoForm(x) {
    x = x || {};
    const opt = (arr, v) => arr.map((a) => `<option ${a === v ? "selected" : ""}>${esc(a)}</option>`).join("");
    const d = FC.openModal(`
      <h2>${x.id ? "Ubah info" : "Tambah info"}</h2>
      <form id="inf" class="form-grid two" style="margin-top:18px" novalidate>
        <div class="field"><label for="f-jenis">Jenis <span class="req">*</span></label><select id="f-jenis" name="jenis" required>${["lomba", "beasiswa", "pelatihan"].map((j) => `<option value="${j}" ${x.jenis === j ? "selected" : ""}>${FC.jenisLabel[j]}</option>`).join("")}</select></div>
        <div class="field"><label for="f-kat">Kategori</label><select id="f-kat" name="kategori"></select></div>
        <div class="field span-2"><label for="f-judul">Judul <span class="req">*</span></label><input id="f-judul" name="judul" required value="${esc(x.judul || "")}"></div>
        <div class="field span-2"><label for="f-org">Penyelenggara</label><input id="f-org" name="penyelenggara" value="${esc(x.penyelenggara || "")}"></div>
        <div class="field"><label for="f-dl">Tenggat pendaftaran</label><input id="f-dl" type="date" name="deadline" value="${esc(x.deadline || "")}"></div>
        <div class="field"><label for="f-acara">Tanggal pelaksanaan</label><input id="f-acara" type="date" name="tanggal_acara" value="${esc(x.tanggal_acara || "")}"></div>
        <div class="field"><label for="f-tingkat">Tingkat</label><select id="f-tingkat" name="tingkat"><option value="">-</option>${opt(FC.TINGKAT, x.tingkat)}</select></div>
        <div class="field"><label for="f-lok">Lokasi</label><input id="f-lok" name="lokasi" placeholder="Daring / Luring, kota" value="${esc(x.lokasi || "")}"></div>
        <div class="field span-2"><label for="f-biaya">Biaya / benefit</label><input id="f-biaya" name="biaya" placeholder="Gratis, Rp50.000/tim, biaya hidup per bulan…" value="${esc(x.biaya || "")}"></div>
        <div class="field span-2"><label for="f-desk">Deskripsi & syarat</label><textarea id="f-desk" name="deskripsi" style="min-height:160px">${esc(x.deskripsi || "")}</textarea></div>
        <div class="field span-2"><label for="f-link">Tautan resmi / pendaftaran</label><input id="f-link" type="url" name="link" placeholder="https://…" value="${esc(x.link || "")}"></div>
        <div class="field span-2"><label for="f-poster">URL poster (opsional)</label><input id="f-poster" type="url" name="poster_url" placeholder="https://… (gambar .jpg/.png/.webp)" value="${esc(x.poster_url || "")}"><span class="hint">Kosongkan untuk memakai sampul otomatis.</span></div>
        <label class="check"><input type="checkbox" name="terbit" ${x.terbit !== false ? "checked" : ""}><span>Terbitkan</span></label>
        <label class="check"><input type="checkbox" name="unggulan" ${x.unggulan ? "checked" : ""}><span>Tandai unggulan</span></label>
        <p class="error-text span-2" id="ferr" role="alert"></p>
        <div class="span-2 modal-actions" style="margin-top:0"><button class="btn btn-primary">Simpan</button><button type="button" class="btn btn-ghost" data-close>Batal</button></div>
      </form>`, { wide: true, label: "Form info" });
    const f = d.querySelector("#inf");
    const fillKat = () => { const j = f.jenis.value; f.kategori.innerHTML = `<option value="">-</option>` + opt(FC.KATEGORI[j], x.kategori); };
    f.jenis.onchange = fillKat; fillKat();
    f.onsubmit = async (e) => {
      e.preventDefault(); const err = d.querySelector("#ferr"); err.textContent = "";
      if (!f.checkValidity()) { err.textContent = "Jenis dan judul wajib diisi; tautan harus diawali https://"; return; }
      const v = FC.formData(f);
      ["deadline", "tanggal_acara", "tingkat", "kategori", "link", "poster_url"].forEach((k) => { if (v[k] === "") v[k] = null; });
      if (x.id) v.id = x.id;
      await FC.busy(f.querySelector("button.btn-primary"), async () => {
        try { await D.saveInfo(v); FC.closeModal(); FC.toast("Info tersimpan."); await load(); draw(); } catch (ex) { err.textContent = ex.message; }
      });
    };
  }

  /* ---------------- pengaduan ---------------- */
  let aduanFilter = { jenis: "semua", status: "aktif" };
  const aduanRow = (a) => `
    <button class="row clickable ${a.jenis === "kekerasan" && a.status === "diterima" ? "urgent" : ""}" data-aduan="${a.id}">
      <div class="row-top">
        <div><h3>${esc(a.judul || JENIS_ADUAN[a.jenis])}</h3><p class="sub">${esc(a.kode)} · ${JENIS_ADUAN[a.jenis] || a.jenis} · ${a.anonim ? "Anonim" : esc(a.nama || "-")} · ${FC.fmtDateTime(a.created_at)}</p></div>
        <span class="chip ${ST_CHIP[a.status]}">${FC.STATUS_PENGADUAN[a.status]}</span>
      </div>
      <p class="sub" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(a.isi)}</p>
    </button>`;
  const bindAduanRows = () => $$("[data-aduan]").forEach((b) => b.onclick = () => aduanDetail(cache.aduan.find((a) => a.id === b.dataset.aduan)));

  function aduanView() {
    $("#main").innerHTML = `
      <div class="adm-head"><div><span class="eyebrow">Rahasia</span><h1 style="margin-top:10px">Kanal Pengaduan</h1></div><button class="btn btn-ghost btn-sm" id="csv">${icon("download")} Unduh CSV</button></div>
      <div class="safety" style="margin-bottom:20px"><b>Jaga kerahasiaan.</b><span class="muted" style="font-size:.86rem">Jangan membagikan isi laporan kekerasan di grup. Teruskan ke Satgas hanya dengan persetujuan pelapor, dan gunakan catatan internal untuk koordinasi.</span></div>
      <div class="toolbar-row" style="margin-bottom:12px"><div class="pills">${["semua"].concat(Object.keys(JENIS_ADUAN)).map((j) => `<button class="pill" data-aj="${j}" aria-pressed="${aduanFilter.jenis === j}">${j === "semua" ? "Semua jenis" : JENIS_ADUAN[j]}</button>`).join("")}</div></div>
      <div class="toolbar-row" style="margin-bottom:20px"><div class="pills">${[["aktif", "Belum selesai"], ["semua", "Semua status"]].concat(Object.entries(FC.STATUS_PENGADUAN)).map(([k, l]) => `<button class="pill" data-as="${k}" aria-pressed="${aduanFilter.status === k}">${l}</button>`).join("")}</div></div>
      <div class="row-list" id="aduanList"></div>`;
    const list = () => {
      const r = cache.aduan.filter((a) => (aduanFilter.jenis === "semua" || a.jenis === aduanFilter.jenis) && (aduanFilter.status === "semua" || (aduanFilter.status === "aktif" ? !["selesai", "ditolak"].includes(a.status) : a.status === aduanFilter.status)));
      $("#aduanList").innerHTML = r.length ? r.map(aduanRow).join("") : '<div class="empty"><p>Tidak ada laporan pada filter ini.</p></div>';
      bindAduanRows();
    };
    $$("[data-aj]").forEach((b) => b.onclick = () => { aduanFilter.jenis = b.dataset.aj; $$("[data-aj]").forEach((x) => x.setAttribute("aria-pressed", x === b)); list(); });
    $$("[data-as]").forEach((b) => b.onclick = () => { aduanFilter.status = b.dataset.as; $$("[data-as]").forEach((x) => x.setAttribute("aria-pressed", x === b)); list(); });
    $("#csv").onclick = exportCsv;
    list();
  }

  const DETAIL_LABEL = { peran: "Pelapor sebagai", bentuk: "Bentuk kekerasan", tanggal_kejadian: "Tanggal kejadian", lokasi: "Lokasi", pendampingan: "Pendampingan", golongan: "Golongan UKT", nominal: "Nominal UKT", alasan: "Alasan", semester: "Semester" };

  function aduanDetail(a) {
    if (!a) return;
    const det = a.detail || {};
    const bukti = FC.safeUrl(a.link_bukti);
    const kontak = a.kontak || "";
    const wa = /^[0-9+\s-]{8,}$/.test(kontak) ? "https://wa.me/" + kontak.replace(/\D/g, "").replace(/^0/, "62") : "";
    const d = FC.openModal(`
      <div class="chips" style="margin-bottom:10px"><span class="chip">${esc(a.kode)}</span><span class="chip gray">${JENIS_ADUAN[a.jenis] || a.jenis}</span>${a.anonim ? '<span class="chip warn">Anonim</span>' : ""}</div>
      <h2>${esc(a.judul || JENIS_ADUAN[a.jenis])}</h2>
      <p class="lede">Masuk ${FC.fmtDateTime(a.created_at)} · diperbarui ${FC.fmtDateTime(a.updated_at)}</p>
      <dl class="dl">
        ${!a.anonim ? `<dt>Nama</dt><dd>${esc(a.nama || "-")}</dd><dt>NIM</dt><dd>${esc(a.nim || "-")}</dd>` : ""}
        <dt>Departemen</dt><dd>${esc(a.departemen || "-")} ${a.angkatan ? "· " + esc(a.angkatan) : ""}</dd>
        <dt>Kontak</dt><dd>${esc(kontak || "Tidak diberikan")} ${wa ? `<a class="hl" href="${wa}" target="_blank" rel="noopener">(WhatsApp)</a>` : ""}</dd>
        ${Object.entries(det).map(([k, v]) => `<dt>${esc(DETAIL_LABEL[k] || k)}</dt><dd>${esc(Array.isArray(v) ? v.join(", ") : v)}</dd>`).join("")}
        ${bukti ? `<dt>Bukti</dt><dd><a class="hl" href="${esc(bukti)}" target="_blank" rel="noopener">Buka tautan</a></dd>` : ""}
      </dl>
      <div class="value" style="margin-bottom:20px"><small>Uraian</small><p class="prose" style="margin-top:6px;color:var(--text)">${esc(a.isi)}</p></div>
      <form id="stf" class="form-grid">
        <div class="field"><label for="st">Status</label><select id="st" name="status">${Object.entries(FC.STATUS_PENGADUAN).map(([k, l]) => `<option value="${k}" ${a.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label for="cp">Catatan untuk pelapor</label><textarea id="cp" name="catatan_publik" style="min-height:80px" placeholder="Terlihat oleh pelapor saat cek status dengan kode.">${esc(a.catatan_publik || "")}</textarea></div>
        <div class="field"><label for="ci">Catatan internal</label><textarea id="ci" name="catatan_internal" style="min-height:80px" placeholder="Hanya terlihat oleh admin.">${esc(a.catatan_internal || "")}</textarea></div>
        <div class="modal-actions" style="margin-top:0"><button class="btn btn-primary">Simpan</button><button type="button" class="btn btn-danger" id="delA">${icon("trash")} Hapus</button></div>
      </form>`, { wide: true, label: "Detail laporan" });
    const f = d.querySelector("#stf");
    f.onsubmit = async (e) => {
      e.preventDefault(); const v = FC.formData(f);
      await FC.busy(f.querySelector("button.btn-primary"), async () => {
        try { await D.updatePengaduan(a.id, v); FC.closeModal(); FC.toast("Laporan diperbarui."); await load(); draw(); } catch (ex) { FC.toast(ex.message, "err"); }
      });
    };
    d.querySelector("#delA").onclick = async () => { if (await FC.confirm("Hapus laporan?", "Laporan akan dihapus permanen dan pelapor tidak bisa lagi mengecek statusnya.", "Hapus")) { try { await D.deletePengaduan(a.id); await load(); draw(); FC.toast("Laporan dihapus."); } catch (e) { FC.toast(e.message, "err"); } } };
  }

  function exportCsv() {
    const cols = ["kode", "jenis", "status", "anonim", "nama", "nim", "kontak", "departemen", "angkatan", "judul", "isi", "link_bukti", "catatan_publik", "catatan_internal", "created_at", "updated_at"];
    const q = (v) => { v = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return '"' + v.replace(/"/g, '""') + '"'; };
    const rows = [cols.concat("detail").join(",")].concat(cache.aduan.map((a) => cols.map((c) => q(a[c])).concat(q(a.detail)).join(",")));
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "pengaduan-fmipa-connect-" + new Date().toISOString().slice(0, 10) + ".csv"; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------------- lowongan tim ---------------- */
  function timView() {
    const t = cache.tim;
    $("#main").innerHTML = `
      <div class="adm-head"><div><span class="eyebrow">Moderasi</span><h1 style="margin-top:10px">Lowongan Tim</h1></div></div>
      <p class="muted" style="margin:-8px 0 20px;font-size:.9rem">Tutup atau hapus lowongan yang tidak pantas atau sudah tidak relevan.</p>
      <div class="row-list">${t.length ? t.map((x) => `
        <div class="row"><div class="row-top"><div><h3>${esc(x.judul)}</h3><p class="sub">${esc(x.nama_lomba)} · oleh ${esc(x.owner_nama || "-")} (${esc(x.owner_departemen || "-")}) · ${x.jumlah_pelamar || 0} pendaftar · dibuat ${FC.fmtDate(x.created_at)}</p></div>
        <span class="chip ${x.status === "buka" ? "ok" : "gray"}">${x.status === "buka" ? "Dibuka" : "Ditutup"}</span></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-tt="${x.id}">${x.status === "buka" ? "Tutup" : "Buka lagi"}</button><button class="btn btn-danger btn-sm" data-td="${x.id}">${icon("trash")} Hapus</button></div></div>`).join("") : '<div class="empty"><p>Belum ada lowongan.</p></div>'}</div>`;
    $$("[data-tt]").forEach((b) => b.onclick = () => FC.busy(b, async () => { const x = t.find((i) => i.id === b.dataset.tt); try { await D.saveTim({ id: x.id, status: x.status === "buka" ? "tutup" : "buka" }); await load(); draw(); } catch (e) { FC.toast(e.message, "err"); } }));
    $$("[data-td]").forEach((b) => b.onclick = async () => { if (await FC.confirm("Hapus lowongan?", "Lowongan dan semua pendaftarnya akan dihapus.", "Hapus")) { try { await D.deleteTim(b.dataset.td); await load(); draw(); FC.toast("Lowongan dihapus."); } catch (e) { FC.toast(e.message, "err"); } } });
  }

  start();
})();
