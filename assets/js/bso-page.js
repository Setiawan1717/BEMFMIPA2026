/* =====================================================================
   FMIPA Connect — mesin halaman BSO (dipakai bersama semua BSO)
   Jangan diubah oleh pengurus BSO. Mekanisme khusus tiap BSO ditulis di
   <slug>/app.js lewat FC.bsoExt (lihat tools/bso-template/app.js).

   <body data-halaman="publik|admin" data-bso="<slug>" data-root="../">
   ===================================================================== */
(function () {
  const FC = window.FC;
  const REG = window.FC_BSO || { daftar: [], cari: () => null };
  const body = document.body;
  const HAL = body.dataset.halaman || "publik";
  const SLUG = body.dataset.bso || "";
  const ROOT = body.dataset.root || "../";
  const app = document.getElementById("app");
  const authArea = document.getElementById("authArea");
  const E = FC.esc;

  let D = null;
  const ctx = { slug: SLUG, root: ROOT, bso: null, info: null, user: null, profil: null, akses: [], admin: false };
  const ext = () => FC.bsoExt || {};

  const STATUS = { menunggu: ["Menunggu", "warn"], diterima: ["Diterima", ""], ditolak: ["Ditolak", "gray"] };
  const chipStatus = (s) => { const [t, c] = STATUS[s] || [s, "gray"]; return `<span class="chip ${c}">${E(t)}</span>`; };
  const waLink = (n) => { const d = String(n || "").replace(/\D/g, ""); return d ? "https://wa.me/" + (d.startsWith("0") ? "62" + d.slice(1) : d) : ""; };
  const pertanyaan = () => (ctx.bso && ctx.bso.pertanyaan) || [{ name: "motivasi", label: "Kenapa kamu ingin bergabung?", type: "textarea", wajib: true }];

  async function muatKonteks() {
    ctx.user = await D.user();
    ctx.profil = ctx.user ? await D.myProfile().catch(() => null) : null;
    ctx.akses = ctx.user ? await D.bsoAkses().catch(() => []) : [];
    ctx.admin = ctx.akses.includes(SLUG);
    if (SLUG) {
      const dbInfo = await D.getBso(SLUG).catch(() => null);
      ctx.info = Object.assign({ pendaftaran_buka: false, pendaftaran_info: "" }, dbInfo || {});
      ctx.deskripsi = (dbInfo && dbInfo.deskripsi) || (ctx.bso && ctx.bso.deskripsi) || "";
    }
  }
  let refreshing = null; // gabungkan panggilan yang datang bersamaan (mis. setelah masuk)
  ctx.refresh = () => refreshing || (refreshing = (async () => {
    try { await muatKonteks(); renderAuth(); render(); } finally { refreshing = null; }
  })());

  /* ---------------- akun ---------------- */
  function renderAuth() {
    if (!authArea) return;
    if (!ctx.user) {
      authArea.innerHTML = `<button class="btn btn-primary btn-sm" type="button" data-masuk>Masuk</button>`;
    } else {
      const nama = (ctx.profil && ctx.profil.nama) || ctx.user.email;
      const panel = ctx.admin && HAL === "publik" ? `<a class="btn btn-ghost btn-sm" href="admin.html">Panel admin</a>` : "";
      const lihat = HAL === "admin" ? `<a class="btn btn-ghost btn-sm" href="./">Lihat halaman</a>` : "";
      authArea.innerHTML = `${panel}${lihat}<span class="avatar" title="${E(nama)}" aria-label="${E(nama)}">${E(FC.initials(nama))}</span><button class="btn btn-ghost btn-sm" type="button" data-keluar>Keluar</button>`;
    }
  }
  document.addEventListener("click", async (e) => {
    if (e.target.closest("[data-masuk]")) { e.preventDefault(); bukaMasuk(); }
    if (e.target.closest("[data-keluar]")) { e.preventDefault(); await D.signOut(); await ctx.refresh(); FC.toast("Kamu sudah keluar."); }
  });

  function formMasuk() {
    const demo = D.mode === "demo" && D.demoAccounts
      ? `<div class="demo-accounts"><b>Akun demo</b> (kata sandi admin pusat: admin123, lainnya: demo123)<br>${D.demoAccounts().filter((a) => a.admin || a.bso).map((a) => `${E(a.email)}${a.admin ? " · admin pusat" : " · " + E(a.bso)}`).join("<br>")}</div>`
      : "";
    return `<form class="form-grid" data-form-masuk novalidate>
      <div class="field"><label for="m-email">Email</label><input id="m-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="m-pass">Kata sandi</label><input id="m-pass" name="password" type="password" autocomplete="current-password" required></div>
      <p class="error-text" data-err hidden></p>
      <button class="btn btn-primary btn-block" type="submit">Masuk</button>
      <p class="muted" style="font-size:.86rem">Belum punya akun? <a class="hl" href="${ROOT}index.html#/masuk">Daftar di FMIPA Connect</a>. Satu akun berlaku untuk semua BSO.</p>
    </form>${demo}`;
  }
  function pasangMasuk(root, after) {
    const f = root.querySelector("[data-form-masuk]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = FC.formData(f), err = f.querySelector("[data-err]");
      err.hidden = true;
      try {
        await FC.busy(f.querySelector("[type=submit]"), () => D.signIn(v.email, v.password));
        if (after) after();
        await ctx.refresh();
        FC.toast("Berhasil masuk.");
      } catch (x) { err.textContent = x.message; err.hidden = false; }
    });
  }
  function bukaMasuk() {
    const d = FC.openModal(`<h2>Masuk</h2><p class="lede">Pakai akun FMIPA Connect yang sama.</p><div style="margin-top:18px">${formMasuk()}</div>`, { label: "Masuk" });
    pasangMasuk(d, FC.closeModal);
  }

  /* =================================================================
     HALAMAN PUBLIK BSO
     ================================================================= */
  function renderPublik() {
    const b = ctx.bso;
    const extPub = ext().publik || [];
    const nav = document.getElementById("bsoNav");
    if (nav) nav.innerHTML = [["#top", "Beranda"], ["#pengumuman", "Pengumuman"]].concat(extPub.map((s) => ["#" + s.id, s.judul]), [["#pendaftaran", "Pendaftaran"]])
      .map(([h, t]) => `<a href="${E(h)}">${E(t)}</a>`).join("");

    app.innerHTML = `
      <section class="page-hero bso-hero"><div class="wrap">
        <nav class="crumbs" aria-label="Lokasi"><a href="${ROOT}">BEM FMIPA</a><span>/</span><span>${E(b.nama)}</span></nav>
        <h1>${E(b.nama)}</h1>
        ${b.tagline ? `<p class="tagline">${E(b.tagline)}</p>` : ""}
        <p>${E(ctx.deskripsi)}</p>
        <div class="cta">
          <a class="btn btn-primary" href="#pendaftaran">${ctx.info.pendaftaran_buka ? "Daftar jadi anggota" : "Info pendaftaran"}</a>
          <a class="btn btn-ghost" href="#pengumuman">Lihat pengumuman</a>
        </div>
      </div></section>
      <section class="bso-section" id="pengumuman"><div class="wrap"><span class="eyebrow">Kabar terbaru</span><h2>Pengumuman</h2><div data-pengumuman><div class="skeleton" style="min-height:120px"></div></div></div></section>
      ${extPub.map((s) => `<section class="bso-section" id="${E(s.id)}"><div class="wrap" data-ext="${E(s.id)}"></div></section>`).join("")}
      <section class="bso-section" id="pendaftaran"><div class="wrap"><span class="eyebrow">Bergabung</span><h2>Pendaftaran anggota</h2><div data-daftar></div></div></section>`;

    isiPengumuman(app.querySelector("[data-pengumuman]"));
    extPub.forEach((s) => { try { s.render(app.querySelector(`[data-ext="${s.id}"]`), ctx); } catch (e) { console.error(e); } });
    isiPendaftaran(app.querySelector("[data-daftar]"));
  }

  async function isiPengumuman(el) {
    try {
      const list = (await D.listPengumuman(SLUG)).filter((p) => p.terbit);
      if (!list.length) { el.innerHTML = `<div class="empty"><p>Belum ada pengumuman.</p></div>`; return; }
      el.innerHTML = `<div class="ann-list">${list.map((p) => {
        const img = FC.imgUrl(p.gambar_url), link = FC.safeUrl(p.link);
        return `<article class="ann">${img ? `<img src="${E(img)}" alt="" loading="lazy">` : ""}
          <div class="meta">${E(FC.fmtDate(p.created_at, true))}</div><h3>${E(p.judul)}</h3>
          ${p.isi ? `<p class="prose">${E(p.isi)}</p>` : ""}
          ${link ? `<a class="btn btn-ghost btn-sm" style="justify-self:start" href="${E(link)}" target="_blank" rel="noopener">Buka tautan ${FC.icon("arrow")}</a>` : ""}</article>`;
      }).join("")}</div>`;
    } catch (e) { el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; }
  }

  async function isiPendaftaran(el) {
    const info = ctx.info;
    const infoTeks = info.pendaftaran_info ? `<p class="muted" style="margin-top:8px">${E(info.pendaftaran_info)}</p>` : "";
    let mine = null;
    if (ctx.user) { try { mine = await D.pendaftaranSaya(SLUG); } catch (e) { /* abaikan */ } }

    if (mine) {
      el.innerHTML = `<div class="form-card status-card">
        <h3 class="form-section-title">Pendaftaranmu</h3>${chipStatus(mine.status)}
        <p class="muted">Dikirim ${E(FC.fmtDateTime(mine.created_at))}.</p>
        ${mine.catatan ? `<div><b>Pesan dari pengurus:</b><p class="prose">${E(mine.catatan)}</p></div>` : ""}
        ${mine.status === "menunggu" ? `<button class="btn btn-danger btn-sm" style="justify-self:start" type="button" data-batal>Batalkan pendaftaran</button>` : ""}
      </div>`;
      const bt = el.querySelector("[data-batal]");
      if (bt) bt.onclick = async () => {
        if (!(await FC.confirm("Batalkan pendaftaran?", "Data pendaftaranmu akan dihapus. Kamu bisa mendaftar lagi selama pendaftaran masih dibuka.", "Batalkan"))) return;
        try { await D.batalkanPendaftaran(mine.id); FC.toast("Pendaftaran dibatalkan."); isiPendaftaran(el); } catch (e) { FC.toast(e.message, "err"); }
      };
      return;
    }
    if (!info.pendaftaran_buka) { el.innerHTML = `<div class="empty"><h3>Pendaftaran sedang ditutup</h3>${infoTeks}</div>`; return; }
    if (!ctx.user) { el.innerHTML = `<div class="empty"><h3>Masuk dulu, ya</h3><p>Pendaftaran memakai akun FMIPA Connect supaya pengurus bisa menghubungimu.</p>${infoTeks}<button class="btn btn-primary" style="margin-top:18px" type="button" data-masuk>Masuk</button></div>`; return; }
    const p = ctx.profil || {};
    if (!p.nama || !p.whatsapp) { el.innerHTML = `<div class="empty"><h3>Lengkapi profilmu dulu</h3><p>Nama dan nomor WhatsApp diambil dari profil FMIPA Connect.</p><a class="btn btn-primary" style="margin-top:18px" href="${ROOT}index.html#/profil">Buka profil</a></div>`; return; }

    const field = (q) => {
      const id = "q-" + q.name, req = q.wajib ? " required" : "", star = q.wajib ? ' <span class="req">*</span>' : "";
      let input;
      if (q.type === "textarea") input = `<textarea id="${E(id)}" name="${E(q.name)}"${req}></textarea>`;
      else if (q.type === "select") input = `<select id="${E(id)}" name="${E(q.name)}"${req}><option value="">Pilih…</option>${(q.pilihan || []).map((o) => `<option>${E(o)}</option>`).join("")}</select>`;
      else input = `<input id="${E(id)}" name="${E(q.name)}" type="${q.type === "url" ? "url" : "text"}"${req}>`;
      return `<div class="field"><label for="${E(id)}">${E(q.label)}${star}</label>${input}${q.hint ? `<span class="hint">${E(q.hint)}</span>` : ""}</div>`;
    };
    el.innerHTML = `<form class="form-card form-grid" data-form-daftar novalidate>
      ${infoTeks}
      <dl class="profil-box"><dt>Nama</dt><dd>${E(p.nama)}</dd><dt>NIM</dt><dd>${E(p.nim || "-")}</dd><dt>Departemen</dt><dd>${E([p.departemen, p.prodi].filter(Boolean).join(" · ") || "-")}</dd><dt>WhatsApp</dt><dd>${E(p.whatsapp)}</dd></dl>
      <p class="muted" style="font-size:.82rem">Data diri di atas diambil dari <a class="hl" href="${ROOT}index.html#/profil">profilmu</a>.</p>
      ${pertanyaan().map(field).join("")}
      <p class="error-text" data-err hidden></p>
      <button class="btn btn-primary" type="submit">Kirim pendaftaran</button>
    </form>`;
    const f = el.querySelector("[data-form-daftar]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = FC.formData(f), err = f.querySelector("[data-err]");
      const kosong = pertanyaan().find((q) => q.wajib && !v[q.name]);
      if (kosong) { err.textContent = `"${kosong.label}" wajib diisi.`; err.hidden = false; return; }
      const bad = pertanyaan().find((q) => q.type === "url" && v[q.name] && !FC.safeUrl(v[q.name]));
      if (bad) { err.textContent = `"${bad.label}" harus berupa link yang diawali http:// atau https://.`; err.hidden = false; return; }
      try {
        await FC.busy(f.querySelector("[type=submit]"), () => D.kirimPendaftaran(SLUG, v));
        FC.toast("Pendaftaran terkirim. Pantau statusnya di halaman ini.");
        isiPendaftaran(el);
      } catch (x) { err.textContent = x.message; err.hidden = false; }
    });
  }

  /* =================================================================
     PANEL ADMIN BSO
     ================================================================= */
  let tab = "pendaftaran";
  function renderAdmin() {
    const b = ctx.bso;
    if (!ctx.user) {
      app.innerHTML = `<section class="bso-adm"><div class="wrap" style="max-width:480px"><span class="eyebrow">Panel admin</span><h1 style="margin:10px 0 20px">${E(b.nama)}</h1><div class="form-card">${formMasuk()}</div></div></section>`;
      pasangMasuk(app);
      return;
    }
    if (!ctx.admin) {
      app.innerHTML = `<section class="bso-adm"><div class="wrap" style="max-width:560px"><div class="empty"><h3>Akunmu tidak punya akses ke panel ${E(b.nama)}</h3>
        <p>Akses diberikan oleh admin pusat BEM FMIPA. Kalau kamu pengurus ${E(b.nama)}, minta admin pusat menambahkan emailmu.</p>${linkAksesLain()}</div></div></section>`;
      return;
    }
    const tabs = [["pendaftaran", "Pendaftaran"], ["pengumuman", "Pengumuman"], ["pengaturan", "Pengaturan"]].concat((ext().admin || []).map((t) => [t.id, t.judul]));
    if (!tabs.find((t) => t[0] === tab)) tab = "pendaftaran";
    app.innerHTML = `<section class="bso-adm"><div class="wrap">
      <div class="head"><div><span class="eyebrow">Panel admin · Departemen ${E(b.departemen)}</span><h1>${E(b.nama)}</h1></div>${linkAksesLain()}</div>
      <div class="tabs" role="tablist">${tabs.map(([id, t]) => `<button class="tab" role="tab" type="button" data-tab="${E(id)}" aria-selected="${id === tab}">${E(t)}</button>`).join("")}</div>
      <div data-isi></div></div></section>`;
    app.querySelectorAll("[data-tab]").forEach((x) => x.onclick = () => { tab = x.dataset.tab; renderAdmin(); });
    const el = app.querySelector("[data-isi]");
    if (tab === "pendaftaran") admPendaftaran(el);
    else if (tab === "pengumuman") admPengumuman(el);
    else if (tab === "pengaturan") admPengaturan(el);
    else { const t = (ext().admin || []).find((x) => x.id === tab); try { t.render(el, ctx); } catch (e) { console.error(e); el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; } }
  }
  function linkAksesLain() {
    const lain = ctx.akses.filter((s) => s !== SLUG).map((s) => REG.cari(s)).filter(Boolean);
    return lain.length ? `<p class="akses-note">Kamu juga mengelola: ${lain.map((x) => `<a href="../${E(x.slug)}/admin.html">${E(x.nama)}</a>`).join(", ")}</p>` : "";
  }

  let filterStatus = "";
  async function admPendaftaran(el) {
    el.innerHTML = `<div class="skeleton" style="min-height:160px"></div>`;
    let rows;
    try { rows = await D.listPendaftaran(SLUG); } catch (e) { el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; return; }
    const n = (s) => rows.filter((r) => !s || r.status === s).length;
    const shown = rows.filter((r) => !filterStatus || r.status === filterStatus);
    el.innerHTML = `<div class="bar"><div class="pills">${[["", "Semua"], ["menunggu", "Menunggu"], ["diterima", "Diterima"], ["ditolak", "Ditolak"]].map(([s, t]) => `<button class="pill" type="button" data-f="${s}" aria-pressed="${s === filterStatus}">${t} (${n(s)})</button>`).join("")}</div>
      <button class="btn btn-ghost btn-sm" type="button" data-csv ${rows.length ? "" : "disabled"}>${FC.icon("download")} Unduh CSV</button></div>
      <div class="adm-rows">${shown.length ? shown.map((r) => `<button class="adm-row" type="button" data-id="${E(r.id)}"><div class="top"><h3>${E(r.nama || "(tanpa nama)")}</h3>${chipStatus(r.status)}</div>
        <div class="sub">${E([r.nim, r.departemen, r.angkatan].filter(Boolean).join(" · "))} · ${E(FC.fmtDateTime(r.created_at))}</div></button>`).join("") : `<div class="empty"><p>Belum ada pendaftar${filterStatus ? " dengan status ini" : ""}.</p></div>`}</div>`;
    el.querySelectorAll("[data-f]").forEach((x) => x.onclick = () => { filterStatus = x.dataset.f; admPendaftaran(el); });
    el.querySelector("[data-csv]").onclick = () => unduhCsv(rows);
    el.querySelectorAll("[data-id]").forEach((x) => x.onclick = () => detailPendaftar(rows.find((r) => String(r.id) === x.dataset.id), () => admPendaftaran(el)));
  }

  function detailPendaftar(r, done) {
    const label = (k) => (pertanyaan().find((q) => q.name === k) || {}).label || k;
    const jaw = Object.entries(r.jawaban || {}).filter(([, v]) => v !== "" && v != null);
    const wa = waLink(r.whatsapp);
    const d = FC.openModal(`<h2>${E(r.nama || "Pendaftar")}</h2>
      <dl class="kv"><dt>NIM</dt><dd>${E(r.nim || "-")}</dd><dt>Departemen</dt><dd>${E([r.departemen, r.prodi].filter(Boolean).join(" · ") || "-")}</dd><dt>Angkatan</dt><dd>${E(r.angkatan || "-")}</dd>
        <dt>WhatsApp</dt><dd>${E(r.whatsapp || "-")}</dd><dt>Mendaftar</dt><dd>${E(FC.fmtDateTime(r.created_at))}</dd>
        ${jaw.map(([k, v]) => `<dt>${E(label(k))}</dt><dd>${E(v)}</dd>`).join("")}</dl>
      <form class="form-grid" data-f>
        <div class="field"><label for="d-status">Status</label><select id="d-status" name="status">${Object.keys(STATUS).map((s) => `<option value="${s}" ${s === r.status ? "selected" : ""}>${STATUS[s][0]}</option>`).join("")}</select></div>
        <div class="field"><label for="d-cat">Pesan untuk pendaftar</label><textarea id="d-cat" name="catatan" placeholder="Contoh: Selamat! Wawancara Sabtu 10.00 di Gedung O5.">${E(r.catatan || "")}</textarea><span class="hint">Pesan ini terlihat oleh pendaftar di halaman BSO.</span></div>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">Simpan</button>${wa ? `<a class="btn btn-ghost" href="${E(wa)}" target="_blank" rel="noopener">${FC.icon("chat")} WhatsApp</a>` : ""}<button class="btn btn-danger" type="button" data-hapus>Hapus</button></div>
      </form>`, { wide: true, label: "Detail pendaftar" });
    const f = d.querySelector("[data-f]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await FC.busy(f.querySelector("[type=submit]"), () => D.setStatusPendaftaran(r.id, FC.formData(f))); FC.closeModal(); FC.toast("Tersimpan."); done(); }
      catch (x) { FC.toast(x.message, "err"); }
    });
    d.querySelector("[data-hapus]").onclick = async () => {
      if (!(await FC.confirm("Hapus pendaftar ini?", "Data pendaftarannya hilang permanen.", "Hapus"))) return;
      try { await D.batalkanPendaftaran(r.id); FC.toast("Dihapus."); done(); } catch (x) { FC.toast(x.message, "err"); }
    };
  }

  function unduhCsv(rows) {
    const keys = pertanyaan().map((q) => q.name);
    Object.values(rows).forEach((r) => Object.keys(r.jawaban || {}).forEach((k) => { if (!keys.includes(k)) keys.push(k); }));
    const head = ["Nama", "NIM", "Departemen", "Prodi", "Angkatan", "WhatsApp", "Status", "Pesan", "Waktu daftar"].concat(keys.map((k) => (pertanyaan().find((q) => q.name === k) || {}).label || k));
    const cell = (v) => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    const lines = [head].concat(rows.map((r) => [r.nama, r.nim, r.departemen, r.prodi, r.angkatan, r.whatsapp, (STATUS[r.status] || [r.status])[0], r.catatan, FC.fmtDateTime(r.created_at)].concat(keys.map((k) => (r.jawaban || {})[k]))));
    const blob = new Blob(["﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `pendaftar-${SLUG}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  async function admPengumuman(el) {
    el.innerHTML = `<div class="skeleton" style="min-height:160px"></div>`;
    let rows;
    try { rows = await D.listPengumuman(SLUG); } catch (e) { el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; return; }
    el.innerHTML = `<div class="bar"><p class="muted">${rows.length} pengumuman</p><button class="btn btn-primary btn-sm" type="button" data-baru>${FC.icon("plus")} Tambah</button></div>
      <div class="adm-rows">${rows.length ? rows.map((p) => `<div class="adm-row"><div class="top"><h3>${E(p.judul)}</h3>${p.terbit ? '<span class="chip">Terbit</span>' : '<span class="chip gray">Draf</span>'}</div>
        <div class="sub">${E(FC.fmtDateTime(p.created_at))}</div>
        <div class="acts"><button class="btn btn-ghost btn-sm" type="button" data-edit="${E(p.id)}">${FC.icon("edit")} Ubah</button><button class="btn btn-danger btn-sm" type="button" data-del="${E(p.id)}">${FC.icon("trash")} Hapus</button></div></div>`).join("") : `<div class="empty"><p>Belum ada pengumuman.</p></div>`}</div>`;
    const reload = () => admPengumuman(el);
    el.querySelector("[data-baru]").onclick = () => formPengumuman({ terbit: true }, reload);
    el.querySelectorAll("[data-edit]").forEach((x) => x.onclick = () => formPengumuman(rows.find((p) => String(p.id) === x.dataset.edit), reload));
    el.querySelectorAll("[data-del]").forEach((x) => x.onclick = async () => {
      if (!(await FC.confirm("Hapus pengumuman?", "Pengumuman ini hilang permanen.", "Hapus"))) return;
      try { await D.deletePengumuman(rows.find((p) => String(p.id) === x.dataset.del).id); FC.toast("Dihapus."); reload(); } catch (e) { FC.toast(e.message, "err"); }
    });
  }

  function formPengumuman(p, done) {
    const d = FC.openModal(`<h2>${p.id ? "Ubah" : "Tambah"} pengumuman</h2>
      <form class="form-grid" style="margin-top:18px" data-f novalidate>
        <div class="field"><label for="p-judul">Judul <span class="req">*</span></label><input id="p-judul" name="judul" value="${E(p.judul || "")}" required></div>
        <div class="field"><label for="p-isi">Isi</label><textarea id="p-isi" name="isi">${E(p.isi || "")}</textarea></div>
        <div class="field"><label for="p-link">Link (opsional)</label><input id="p-link" name="link" type="url" placeholder="https://" value="${E(p.link || "")}"></div>
        <div class="field"><label for="p-img">URL gambar/poster (opsional)</label><input id="p-img" name="gambar_url" type="url" placeholder="https://" value="${E(p.gambar_url || "")}"><span class="hint">Unggah poster ke Google Drive (akses publik) atau hosting gambar, lalu tempel link-nya.</span></div>
        <label class="check"><input type="checkbox" name="terbit" ${p.terbit ? "checked" : ""}> Terbitkan (tampil di halaman publik)</label>
        <p class="error-text" data-err hidden></p>
        <div class="modal-actions"><button class="btn btn-primary" type="submit">Simpan</button><button class="btn btn-ghost" type="button" data-close>Batal</button></div>
      </form>`, { wide: true, label: "Form pengumuman" });
    const f = d.querySelector("[data-f]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = FC.formData(f), err = f.querySelector("[data-err]");
      if (!v.judul) { err.textContent = "Judul wajib diisi."; err.hidden = false; return; }
      if ((v.link && !FC.safeUrl(v.link)) || (v.gambar_url && !FC.safeUrl(v.gambar_url))) { err.textContent = "Link harus diawali http:// atau https://."; err.hidden = false; return; }
      try { await FC.busy(f.querySelector("[type=submit]"), () => D.savePengumuman(SLUG, Object.assign({ id: p.id }, v))); FC.closeModal(); FC.toast("Tersimpan."); done(); }
      catch (x) { err.textContent = x.message; err.hidden = false; }
    });
  }

  function admPengaturan(el) {
    const i = ctx.info;
    el.innerHTML = `<form class="form-card form-grid" style="max-width:720px" data-f>
      <div class="field"><label for="s-desk">Deskripsi BSO</label><textarea id="s-desk" name="deskripsi">${E(ctx.deskripsi)}</textarea><span class="hint">Tampil di bagian atas halaman publik.</span></div>
      <label class="check"><input type="checkbox" name="pendaftaran_buka" ${i.pendaftaran_buka ? "checked" : ""}> Pendaftaran anggota dibuka</label>
      <div class="field"><label for="s-info">Info pendaftaran</label><input id="s-info" name="pendaftaran_info" value="${E(i.pendaftaran_info || "")}" placeholder="Contoh: Dibuka 1–14 Maret, wawancara 20 Maret"></div>
      <p class="hint">Pertanyaan formulir pendaftaran diatur di <code>assets/js/bso-config.js</code>.</p>
      <div><button class="btn btn-primary" type="submit">Simpan pengaturan</button></div>
    </form>`;
    const f = el.querySelector("[data-f]");
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await FC.busy(f.querySelector("[type=submit]"), () => D.saveBso(SLUG, FC.formData(f))); FC.toast("Pengaturan tersimpan."); await muatKonteks(); }
      catch (x) { FC.toast(x.message, "err"); }
    });
  }

  /* ---------------- mulai ---------------- */
  function render() {
    if (!ctx.bso) { app.innerHTML = `<section class="page-hero"><div class="wrap"><h1>BSO tidak ditemukan</h1><p>Slug "${E(SLUG)}" belum ada di assets/js/bso-config.js.</p></div></section>`; return; }
    if (HAL === "admin") renderAdmin(); else renderPublik();
  }

  function demoBanner() {
    if (D.mode !== "demo") return;
    const b = document.createElement("div"); b.className = "demo-banner";
    b.innerHTML = `<span>Mode demo: data contoh, tersimpan di browser ini.</span>`;
    document.body.appendChild(b);
  }

  (async function start() {
    ctx.bso = SLUG ? REG.cari(SLUG) : null;
    if (ctx.bso) {
      document.title = `${HAL === "admin" ? "Panel admin · " : ""}${ctx.bso.nama} · by ${ctx.bso.departemen} BEM FMIPA`;
      const nm = document.querySelector("[data-bso-nama]"), sub = document.querySelector("[data-bso-sub]");
      if (nm) nm.textContent = ctx.bso.nama;
      if (sub) sub.textContent = `by ${ctx.bso.departemen} BEM FMIPA`;
    }
    const yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
    D = await FC.ready;
    ctx.D = D;
    try { const s = await D.getSettings(); if (s && s.tampilan) FC.applyTheme(s.tampilan.warna, s.tampilan.font); } catch (e) { /* pakai warna bawaan */ }
    await muatKonteks();
    renderAuth();
    render();
    demoBanner();
    // Muat ulang hanya bila akun berganti (mode demo memanggil onAuth di setiap perubahan data)
    D.onAuth(async () => { const u = await D.user(); if ((u && u.id) !== (ctx.user && ctx.user.id)) ctx.refresh(); });
  })();
})();
