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
     HALAMAN PUBLIK BSO: mini-situs dengan 6 halaman (router #/…)
     Data tambahan (logo, fokus, pengurus, program, galeri, kontak) diisi
     di assets/js/bso-config.js. Halaman Program & Galeri disembunyikan
     dari menu selama datanya kosong.
     ================================================================= */
  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const tgl = (s) => { if (!s) return null; const [y, m, d] = String(s).split("-").map(Number); return y ? new Date(y, (m || 1) - 1, d || 1) : null; };
  const fmtTgl = (s) => { const x = tgl(s); if (!x) return ""; const parts = String(s).split("-").length; return parts >= 3 ? `${x.getDate()} ${BULAN[x.getMonth()]} ${x.getFullYear()}` : `${BULAN[x.getMonth()]} ${x.getFullYear()}`; };
  const STATUS_PROKER = { akan: ["Akan datang", "warn"], berjalan: ["Berjalan", ""], selesai: ["Selesai", "gray"] };
  function statusProker(p) {
    if (p.status && STATUS_PROKER[p.status]) return p.status;
    const now = new Date(), a = tgl(p.mulai), z = tgl(p.selesai) || a;
    if (!a) return "akan";
    const akhir = new Date(z); if (String(p.selesai || p.mulai).split("-").length < 3) akhir.setMonth(akhir.getMonth() + 1); else akhir.setDate(akhir.getDate() + 1);
    if (now < a) return "akan";
    return now < akhir ? "berjalan" : "selesai";
  }
  const data = () => { const b = ctx.bso || {}; const c = D && D.mode === "demo" && window.FC_BSO_CONTOH ? (window.FC_BSO_CONTOH[SLUG] || {}) : {}; return Object.assign({}, c, Object.fromEntries(Object.entries(b).filter(([, v]) => v && (!Array.isArray(v) || v.length)))); };
  const contohTag = () => (D && D.mode === "demo" && window.FC_BSO_CONTOH && window.FC_BSO_CONTOH[SLUG] ? ' <span class="contoh-tag">CONTOH</span>' : "");
  const foto = (src, alt, cls) => { const u = FC.imgUrl(src); return u ? `<img class="${cls || ""}" src="${E(u)}" alt="${E(alt || "")}" loading="lazy">` : ""; };
  const avatar = (p) => foto(p.foto, p.nama) || `<span class="bso-ava">${E(FC.initials(p.nama))}</span>`;

  function halaman() {
    const d = data();
    const list = [
      { id: "", judul: "Beranda", render: hBeranda },
      { id: "tentang", judul: "Tentang", render: hTentang },
      { id: "program", judul: "Program Kerja", render: hProgram, ada: (d.program || []).length > 0 },
      { id: "galeri", judul: "Galeri", render: hGaleri, ada: (d.galeri || []).length > 0 },
      { id: "pengumuman", judul: "Pengumuman", render: hPengumuman },
    ];
    (ext().publik || []).forEach((s) => list.push({ id: s.id, judul: s.judul, render: (el) => { el.innerHTML = `<section class="bso-page"><div class="wrap" data-ext></div></section>`; try { s.render(el.querySelector("[data-ext]"), ctx); } catch (e) { console.error(e); } } }));
    list.push({ id: "daftar", judul: "Daftar", render: hDaftar });
    return list.filter((h) => h.ada !== false);
  }
  const rute = () => (location.hash.match(/^#\/([\w-]*)/) || [, ""])[1];
  const href = (id) => "#/" + id;

  function pasangNav(list, aktif) {
    const nav = document.getElementById("bsoNav");
    const link = (h) => `<a href="${href(h.id)}"${h.id === aktif ? ' aria-current="page"' : ""}>${E(h.judul)}</a>`;
    if (nav) nav.innerHTML = list.map(link).join("");
    const header = document.querySelector(".bso-header .wrap");
    if (header && !document.getElementById("bsoBurger")) {
      header.insertAdjacentHTML("beforeend", `<button class="burger bso-burger" id="bsoBurger" type="button" aria-label="Buka menu" aria-expanded="false" aria-controls="bsoMobile"><span></span><span></span><span></span></button>`);
      document.querySelector(".bso-header").insertAdjacentHTML("afterend", `<nav class="bso-mobile" id="bsoMobile" aria-label="Menu ${E(ctx.bso.nama)}"></nav>`);
      const bt = document.getElementById("bsoBurger"), mn = document.getElementById("bsoMobile");
      bt.onclick = () => { const buka = bt.getAttribute("aria-expanded") !== "true"; bt.setAttribute("aria-expanded", buka); mn.classList.toggle("open", buka); };
      mn.addEventListener("click", (e) => { if (e.target.closest("a")) { bt.setAttribute("aria-expanded", "false"); mn.classList.remove("open"); } });
    }
    const mn = document.getElementById("bsoMobile");
    if (mn) mn.innerHTML = list.map(link).join("") + `<a class="sub" href="${ROOT}">← Kembali ke BEM FMIPA</a>`;
  }

  function renderPublik() {
    const list = halaman();
    let id = rute();
    let h = list.find((x) => x.id === id);
    if (!h) { h = list[0]; id = ""; }
    pasangNav(list, id);
    document.title = `${h.id ? h.judul + " · " : ""}${ctx.bso.nama} · by ${ctx.bso.departemen} BEM FMIPA`;
    app.innerHTML = "";
    h.render(app);
    renderFooterBso();
  }
  window.addEventListener("hashchange", () => {
    if (HAL !== "publik" || !ctx.bso || !D) return;
    if (!/^#\//.test(location.hash) && location.hash) return; // anchor biasa (mis. #app)
    if (document.querySelector(".modal")) FC.closeModal();
    const lb = document.querySelector(".bso-lightbox"); if (lb) lb.querySelector(".lb-close").click();
    renderPublik(); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  });

  function judulHal(eyebrow, judul, lede) {
    return `<section class="page-hero bso-hero bso-hero-sm"><div class="wrap">
      <nav class="crumbs" aria-label="Lokasi"><a href="${ROOT}">BEM FMIPA</a><span>/</span><a href="#/">${E(ctx.bso.nama)}</a><span>/</span><span>${E(judul)}</span></nav>
      <span class="eyebrow" style="margin-top:18px">${E(eyebrow)}</span><h1>${E(judul)}</h1>${lede ? `<p>${lede}</p>` : ""}</div></section>`;
  }

  /* ---------- Beranda ---------- */
  function hBeranda(el) {
    const b = ctx.bso, d = data();
    const logo = foto(d.logo, "Logo " + b.nama, "bso-logo");
    const prog = (d.program || []).map((p) => Object.assign({ _s: statusProker(p) }, p));
    const next = prog.filter((p) => p._s !== "selesai").sort((x, y) => (tgl(x.mulai) || 0) - (tgl(y.mulai) || 0))[0];
    const kartu = halaman().filter((h) => h.id && h.id !== "daftar").map((h) => {
      const sub = { tentang: (d.pengurus || []).length ? `${d.pengurus.length} pengurus` : "Kenalan dengan kami", program: `${prog.length} program`, galeri: `${(d.galeri || []).length} foto`, pengumuman: "Kabar terbaru" }[h.id] || "";
      return `<a class="bso-quick" href="${href(h.id)}"><b>${E(h.judul)}</b><small>${E(sub)}</small>${FC.icon("arrow")}</a>`;
    }).join("");
    el.innerHTML = `
      <section class="page-hero bso-hero"><div class="wrap bso-hero-grid">
        <div>
          <nav class="crumbs" aria-label="Lokasi"><a href="${ROOT}">BEM FMIPA</a><span>/</span><span>${E(b.nama)}</span></nav>
          <div class="chips" style="margin-top:18px"><span class="chip">BSO Departemen ${E(b.departemen)}</span>${ctx.info.pendaftaran_buka ? '<span class="chip ok">Pendaftaran dibuka</span>' : ""}</div>
          <h1>${E(b.nama)}</h1>
          ${d.kepanjangan ? `<p class="bso-kepanjangan">${E(d.kepanjangan)}</p>` : ""}
          ${b.tagline ? `<p class="tagline">${E(b.tagline)}</p>` : ""}
          <p>${E(ctx.deskripsi)}</p>
          <div class="cta">
            <a class="btn btn-primary" href="#/daftar">${ctx.info.pendaftaran_buka ? "Daftar jadi anggota" : "Info pendaftaran"}</a>
            <a class="btn btn-ghost" href="#/tentang">Kenalan dulu</a>
          </div>
        </div>
        <div class="bso-emblem" aria-hidden="${logo ? "false" : "true"}">${logo || `<span class="bso-mono">${E(b.nama)}</span>`}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <div class="bso-quick-grid">${kartu}</div>
      </div></section>
      <section class="bso-section"><div class="wrap bso-home-split">
        <div><div class="bso-sec-head"><div><span class="eyebrow">Kabar terbaru</span><h2>Pengumuman</h2></div><a class="hl" href="#/pengumuman">Lihat semua</a></div><div data-ann><div class="skeleton" style="min-height:120px"></div></div></div>
        <div><div class="bso-sec-head"><div><span class="eyebrow">Agenda</span><h2>Kegiatan terdekat</h2></div>${prog.length ? '<a class="hl" href="#/program">Semua program</a>' : ""}</div>
          ${next ? kartuProker(next) : `<div class="empty bso-empty-sm"><p>Belum ada agenda terdekat.</p></div>`}
          ${kontakHtml(d)}
        </div>
      </div></section>`;
    isiPengumuman(el.querySelector("[data-ann]"), { batas: 3 });
  }

  function kontakHtml(d) {
    const k = d.kontak || {}, out = [];
    if (k.instagram) out.push(`<a class="bso-kontak" href="https://instagram.com/${E(String(k.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">${FC.icon("link")}<span><small>Instagram</small>@${E(String(k.instagram).replace(/^@/, ""))}</span></a>`);
    if (k.whatsapp) out.push(`<a class="bso-kontak" href="${E(waLink(k.whatsapp))}" target="_blank" rel="noopener">${FC.icon("chat")}<span><small>WhatsApp${k.narahubung ? " · " + E(k.narahubung) : ""}</small>${E(k.whatsapp)}</span></a>`);
    if (k.email) out.push(`<a class="bso-kontak" href="mailto:${E(k.email)}">${FC.icon("mail") || FC.icon("chat")}<span><small>Email</small>${E(k.email)}</span></a>`);
    return out.length ? `<div class="bso-kontak-list"><span class="eyebrow">Hubungi kami</span>${out.join("")}</div>` : "";
  }

  /* ---------- Tentang ---------- */
  function hTentang(el) {
    const b = ctx.bso, d = data();
    const fokus = d.fokus || [], peng = d.pengurus || [];
    el.innerHTML = judulHal("Tentang kami", "Tentang " + b.nama, E(ctx.deskripsi)) + `
      ${fokus.length ? `<section class="bso-section"><div class="wrap"><span class="eyebrow">Fokus kegiatan${contohTag()}</span><h2>Apa yang kami lakukan</h2>
        <div class="bso-fokus">${fokus.map((f, i) => `<article class="bso-card"><span class="bso-num">${String(i + 1).padStart(2, "0")}</span><h3>${E(f.judul)}</h3><p>${E(f.isi || "")}</p></article>`).join("")}</div></div></section>` : ""}
      <section class="bso-section"><div class="wrap"><span class="eyebrow">Pengurus${peng.length ? contohTag() : ""}</span><h2>Orang-orang di balik ${E(b.nama)}</h2>
        ${peng.length ? `<p class="muted" style="margin:-12px 0 22px">Klik kartu untuk melihat profil singkat.</p><div class="bso-people">${peng.map((p, i) => `<button type="button" class="bso-person" data-p="${i}"><div class="pic">${avatar(p)}</div><b>${E(p.nama)}</b><small>${E(p.jabatan || "")}</small></button>`).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Daftar pengurus segera hadir.</p></div>`}
      </div></section>
      ${kontakHtml(d) ? `<section class="bso-section"><div class="wrap"><div style="max-width:520px">${kontakHtml(d)}</div></div></section>` : ""}`;
    el.querySelectorAll("[data-p]").forEach((x) => x.onclick = () => {
      const p = peng[+x.dataset.p];
      const ig = p.instagram ? `<a class="btn btn-ghost btn-sm" href="https://instagram.com/${E(String(p.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">Instagram @${E(String(p.instagram).replace(/^@/, ""))}</a>` : "";
      FC.openModal(`<div class="bso-person-modal"><div class="pic">${avatar(p)}</div><div><span class="eyebrow">${E(p.jabatan || "Pengurus")}</span><h2>${E(p.nama)}</h2>
        ${p.prodi ? `<p class="muted">${E(p.prodi)}</p>` : ""}${p.bio ? `<p class="prose" style="margin-top:12px">${E(p.bio)}</p>` : ""}${ig ? `<div style="margin-top:16px">${ig}</div>` : ""}</div></div>`, { label: p.nama });
    });
  }

  /* ---------- Program kerja ---------- */
  function kartuProker(p) {
    const s = p._s || statusProker(p), [t, c] = STATUS_PROKER[s];
    const waktu = [fmtTgl(p.mulai), p.selesai && p.selesai !== p.mulai ? fmtTgl(p.selesai) : ""].filter(Boolean).join(" – ");
    return `<article class="bso-card bso-proker"><div class="top"><span class="chip ${c}">${E(t)}</span>${waktu ? `<span class="meta">${E(waktu)}</span>` : ""}</div><h3>${E(p.judul)}</h3>${p.isi ? `<p>${E(p.isi)}</p>` : ""}</article>`;
  }
  let filterProker = "semua", modeProker = "kartu";
  function hProgram(el) {
    const prog = (data().program || []).map((p) => Object.assign({ _s: statusProker(p) }, p)).sort((x, y) => (tgl(x.mulai) || 0) - (tgl(y.mulai) || 0));
    const jml = (s) => prog.filter((p) => s === "semua" || p._s === s).length;
    el.innerHTML = judulHal("Program kerja", "Program Kerja", `Rencana dan kegiatan ${E(ctx.bso.nama)} sepanjang periode ini.`) + `
      <section class="bso-section"><div class="wrap">
        <div class="bso-toolbar">
          <div class="tabs" role="tablist" aria-label="Filter status">${[["semua", "Semua"], ["akan", "Akan datang"], ["berjalan", "Berjalan"], ["selesai", "Selesai"]].map(([k, t]) => `<button class="tab" role="tab" type="button" data-f="${k}" aria-selected="${k === filterProker}">${t} <span class="count">${jml(k)}</span></button>`).join("")}</div>
          <div class="tabs" aria-label="Tampilan">${[["kartu", "Kartu"], ["timeline", "Timeline"]].map(([k, t]) => `<button class="tab" type="button" data-v="${k}" aria-pressed="${k === modeProker}" aria-selected="${k === modeProker}">${t}</button>`).join("")}</div>
        </div>
        ${contohTag() ? `<p class="muted" style="margin-bottom:14px">${contohTag()} Data contoh untuk mode demo.</p>` : ""}
        <div data-isi></div>
      </div></section>`;
    const isi = el.querySelector("[data-isi]");
    const gambar = () => {
      const rows = prog.filter((p) => filterProker === "semua" || p._s === filterProker);
      if (!rows.length) { isi.innerHTML = `<div class="empty bso-empty-sm"><p>Tidak ada program dengan status ini.</p></div>`; return; }
      if (modeProker === "kartu") { isi.innerHTML = `<div class="bso-proker-grid">${rows.map(kartuProker).join("")}</div>`; return; }
      const grup = {};
      rows.forEach((p) => { const x = tgl(p.mulai); const k = x ? `${BULAN[x.getMonth()]} ${x.getFullYear()}` : "Tanpa tanggal"; (grup[k] = grup[k] || []).push(p); });
      isi.innerHTML = `<ol class="bso-timeline">${Object.entries(grup).map(([bln, ps]) => `<li><span class="bln">${E(bln)}</span><div class="items">${ps.map(kartuProker).join("")}</div></li>`).join("")}</ol>`;
    };
    el.querySelectorAll("[data-f]").forEach((b) => b.onclick = () => { filterProker = b.dataset.f; hProgram(el); });
    el.querySelectorAll("[data-v]").forEach((b) => b.onclick = () => { modeProker = b.dataset.v; hProgram(el); });
    gambar();
  }

  /* ---------- Galeri ---------- */
  function hGaleri(el) {
    const g = (data().galeri || []).map((x) => (typeof x === "string" ? { src: x } : x)).filter((x) => FC.imgUrl(x.src));
    el.innerHTML = judulHal("Galeri", "Galeri", `Momen kegiatan ${E(ctx.bso.nama)}.`) + `
      <section class="bso-section"><div class="wrap">${contohTag() ? `<p class="muted" style="margin-bottom:14px">${contohTag()} Foto contoh untuk mode demo.</p>` : ""}
        <div class="bso-galeri">${g.map((x, i) => `<button type="button" class="bso-gitem" data-g="${i}" aria-label="Perbesar foto${x.caption ? ": " + E(x.caption) : ""}">${foto(x.src, x.caption || "")}${x.caption ? `<span>${E(x.caption)}</span>` : ""}</button>`).join("")}</div>
      </div></section>`;
    el.querySelectorAll("[data-g]").forEach((b) => b.onclick = () => lightbox(g, +b.dataset.g));
  }
  function lightbox(g, i) {
    const lb = document.createElement("div");
    lb.className = "bso-lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Galeri foto");
    const kembali = document.activeElement;
    const tampil = () => {
      const x = g[i];
      lb.innerHTML = `<button class="lb-close" type="button" aria-label="Tutup">${FC.icon("x")}</button>
        ${g.length > 1 ? `<button class="lb-nav prev" type="button" aria-label="Foto sebelumnya">‹</button><button class="lb-nav next" type="button" aria-label="Foto berikutnya">›</button>` : ""}
        <figure><img src="${E(FC.imgUrl(x.src))}" alt="${E(x.caption || "")}"><figcaption>${x.caption ? E(x.caption) + " · " : ""}${i + 1} / ${g.length}</figcaption></figure>`;
      lb.querySelector(".lb-close").onclick = tutup;
      const pv = lb.querySelector(".prev"), nx = lb.querySelector(".next");
      if (pv) pv.onclick = (e) => { e.stopPropagation(); geser(-1); };
      if (nx) nx.onclick = (e) => { e.stopPropagation(); geser(1); };
      lb.querySelector(".lb-close").focus();
    };
    const geser = (n) => { i = (i + n + g.length) % g.length; tampil(); };
    const key = (e) => { if (e.key === "Escape") tutup(); if (e.key === "ArrowLeft") geser(-1); if (e.key === "ArrowRight") geser(1); };
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) geser(dx < 0 ? 1 : -1); x0 = null; });
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") tutup(); });
    function tutup() { document.removeEventListener("keydown", key); lb.remove(); document.body.style.overflow = ""; if (kembali) kembali.focus(); }
    document.addEventListener("keydown", key);
    document.body.appendChild(lb); document.body.style.overflow = "hidden";
    tampil();
  }

  /* ---------- Pengumuman ---------- */
  function hPengumuman(el) {
    el.innerHTML = judulHal("Kabar terbaru", "Pengumuman", `Informasi resmi dari pengurus ${E(ctx.bso.nama)}.`) + `
      <section class="bso-section"><div class="wrap" style="max-width:860px">
        <div class="bso-search"><label class="sr-only" for="annQ">Cari pengumuman</label><input id="annQ" type="search" placeholder="Cari pengumuman…" autocomplete="off"></div>
        <div data-ann><div class="skeleton" style="min-height:120px"></div></div>
      </div></section>`;
    isiPengumuman(el.querySelector("[data-ann]"), { cari: el.querySelector("#annQ") });
  }
  async function isiPengumuman(el, opt) {
    opt = opt || {};
    try {
      const semua = (await D.listPengumuman(SLUG)).filter((p) => p.terbit);
      const kartu = (p) => {
        const img = FC.imgUrl(p.gambar_url), link = FC.safeUrl(p.link);
        return `<article class="ann">${img ? `<img src="${E(img)}" alt="" loading="lazy">` : ""}
          <div class="meta">${E(FC.fmtDate(p.created_at, true))}</div><h3>${E(p.judul)}</h3>
          ${p.isi ? `<p class="prose">${E(p.isi)}</p>` : ""}
          ${link ? `<a class="btn btn-ghost btn-sm" style="justify-self:start" href="${E(link)}" target="_blank" rel="noopener">Buka tautan ${FC.icon("arrow")}</a>` : ""}</article>`;
      };
      const tampil = () => {
        const q = opt.cari ? opt.cari.value.trim().toLowerCase() : "";
        let list = q ? semua.filter((p) => `${p.judul} ${p.isi || ""}`.toLowerCase().includes(q)) : semua;
        if (opt.batas) list = list.slice(0, opt.batas);
        if (!semua.length) { el.innerHTML = `<div class="empty bso-empty-sm"><p>Belum ada pengumuman.</p></div>`; return; }
        if (!list.length) { el.innerHTML = `<div class="empty bso-empty-sm"><p>Tidak ada pengumuman yang cocok dengan "${E(q)}".</p></div>`; return; }
        el.innerHTML = `${q ? `<p class="muted" style="margin-bottom:12px">${list.length} hasil</p>` : ""}<div class="ann-list">${list.map(kartu).join("")}</div>`;
      };
      if (opt.cari) opt.cari.addEventListener("input", tampil);
      tampil();
    } catch (e) { el.innerHTML = `<p class="error-text">${E(e.message)}</p>`; }
  }

  /* ---------- Daftar ---------- */
  function hDaftar(el) {
    el.innerHTML = judulHal("Bergabung", "Daftar & cek status", `Daftar jadi anggota ${E(ctx.bso.nama)}, lalu pantau status pendaftaranmu di halaman ini.`) + `
      <section class="bso-section"><div class="wrap" style="max-width:760px"><div data-daftar></div></div></section>`;
    isiPendaftaran(el.querySelector("[data-daftar]"));
  }

  function renderFooterBso() {
    const f = document.querySelector(".site-footer .wrap");
    if (!f || f.querySelector(".bso-lain")) return;
    const lain = REG.daftar.filter((x) => x.slug !== SLUG);
    f.insertAdjacentHTML("afterbegin", `<nav class="bso-lain" aria-label="BSO lainnya"><span>Bagian Kami lainnya</span>${lain.map((x) => `<a href="${ROOT}${E(x.slug)}/">${E(x.nama)}</a>`).join("")}</nav>`);
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
