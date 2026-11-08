/* =====================================================================
   FMIPA Connect — aplikasi mahasiswa (router + halaman)
   ===================================================================== */
(function () {
  const FC = window.FC, CFG = window.FC_CONFIG || {};
  const { icon, esc } = FC;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const app = $("#app");
  let D = null;          // FC.data
  let state = { user: null, profile: null, admin: false };

  /* ---------------- util ---------------- */
  /* Rute disimpan di variabel supaya tetap jalan di bingkai yang membatasi
     location.hash; tautan "#/..." dicegat lalu disinkronkan ke URL bila boleh. */
  let current = /^#\//.test(location.hash) ? location.hash : "#/";
  const route = () => {
    const h = current.replace(/^#/, "") || "/";
    const [path, qs] = h.split("?");
    return { path: path.replace(/\/+$/, "") || "/", q: new URLSearchParams(qs || "") };
  };
  const syncUrl = (hash, replace) => { try { if (location.hash !== hash) history[replace ? "replaceState" : "pushState"](null, "", hash); } catch (e) { /* bingkai tidak mengizinkan */ } };
  const go = (hash, replace) => { current = hash; syncUrl(hash, replace); render(); };
  const waLink = (num) => { const d = String(num || "").replace(/\D/g, ""); if (!d) return ""; return "https://wa.me/" + (d.startsWith("0") ? "62" + d.slice(1) : d); };
  const isDemo = () => D && D.mode === "demo";
  const demoTag = (item) => (isDemo() && item ? '<span class="demo-tag">CONTOH</span>' : "");
  const loadingGrid = (n) => `<div class="grid-cards">${Array.from({ length: n || 3 }, () => '<div class="skeleton"></div>').join("")}</div>`;

  async function refreshAuth() {
    state.user = await D.user();
    state.profile = state.user ? await D.myProfile().catch(() => null) : null;
    state.admin = state.user ? await D.isAdmin().catch(() => false) : false;
    renderAuthArea();
  }

  function renderAuthArea() {
    const box = $("#authArea"), mob = $("#mobileAuth");
    if (state.user) {
      const nm = (state.profile && state.profile.nama) || state.user.email;
      box.innerHTML = `
        <a class="btn btn-ghost btn-sm hide-m" href="#/teman?tab=saya">Lowongan Saya</a>
        <div class="dd" id="userDd">
          <button class="avatar" type="button" aria-haspopup="true" aria-label="Menu akun ${esc(nm)}">${esc(FC.initials(nm))}</button>
          <div class="dd-menu" style="left:auto;right:0">
            <a href="#/profil">${esc(nm)}<span>${esc(state.user.email)}</span></a>
            <a href="#/teman?tab=saya">Lowongan Saya</a>
            <a href="#/teman?tab=lamaran">Lamaran Saya</a>
            ${state.admin ? '<a href="admin.html">Panel Admin</a>' : ""}
            <a href="#" data-logout>Keluar</a>
          </div>
        </div>`;
      mob.innerHTML = `<a href="#/profil" class="sub">Profil saya</a><a href="#/teman?tab=saya" class="sub">Lowongan & lamaran saya</a>${state.admin ? '<a href="admin.html" class="sub">Panel Admin</a>' : ""}<button class="btn btn-ghost btn-block" data-logout>Keluar</button>`;
    } else {
      box.innerHTML = `<a class="btn btn-primary btn-sm" href="#/masuk">Masuk</a>`;
      mob.innerHTML = `<a class="btn btn-primary btn-block" href="#/masuk">Masuk / Daftar</a>`;
    }
    const dd = $("#userDd");
    if (dd) dd.querySelector("button").onclick = () => dd.classList.toggle("open");
    $$("[data-logout]").forEach((b) => b.onclick = async (e) => { e.preventDefault(); await D.signOut(); await refreshAuth(); FC.toast("Kamu sudah keluar."); go("#/"); });
  }

  function setActiveNav(path) {
    let key = path === "/" ? "home" : path.slice(1).split("/")[0];
    if (key === "departemen") key = "about";
    $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === key));
    $$("[data-nav-group]").forEach((g) => g.classList.toggle("active", ["lomba", "beasiswa", "pelatihan"].includes(key)));
  }

  function afterRender() {
    const els = $$(".reveal", app);
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* =================================================================
     BERANDA — profil kepengurusan (data dari assets/js/org.js)
     ================================================================= */
  const ORG = window.FC_ORG || {};
  const contoh = () => (ORG.TANDAI_CONTOH ? ' <span class="contoh-tag">CONTOH</span>' : "");

  const SIL_ONE = '<svg class="sil" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="40" r="17" fill="currentColor"/><path d="M14 100c0-24 16-36 36-36s36 12 36 36Z" fill="currentColor"/></svg>';
  const SIL_GROUP = '<svg class="sil" viewBox="0 0 160 90" style="width:92%" aria-hidden="true"><g fill="currentColor"><circle cx="40" cy="38" r="12"/><path d="M14 90c0-18 11-28 26-28s26 10 26 28Z"/><circle cx="120" cy="38" r="12"/><path d="M94 90c0-18 11-28 26-28s26 10 26 28Z"/><circle cx="80" cy="30" r="14"/><path d="M50 90c0-21 13-32 30-32s30 11 30 32Z"/></g></svg>';
  const SCENE = (seed) => { const h = 40 + ((seed * 37) % 30); return `<svg class="scene" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="sk${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D4D0E"/><stop offset="1" stop-color="#0C1606"/></linearGradient></defs><rect width="400" height="250" fill="url(#sk${seed})"/><circle cx="${300 - seed * 20}" cy="70" r="34" fill="rgba(223,247,91,.18)"/><path d="M0 ${150 + h} Q100 ${120 + h / 2} 200 ${150 + h / 3} T400 ${140 + h / 2} V250 H0Z" fill="rgba(162,210,30,.18)"/><g fill="rgba(5,9,3,.55)"><rect x="60" y="120" width="70" height="90"/><rect x="140" y="95" width="110" height="115"/><rect x="260" y="130" width="60" height="80"/></g><g fill="rgba(246,253,173,.18)">${Array.from({ length: 12 }, (_, i) => `<rect x="${152 + (i % 4) * 24}" y="${108 + Math.floor(i / 4) * 28}" width="12" height="14"/>`).join("")}</g></svg>`; };

  function ph(label, kind, seed, src) {
    const url = src ? FC.safeUrl(src) : "";
    if (url) return `<div class="ph"><img src="${esc(url)}" alt="${esc(label)}" loading="lazy"></div>`;
    const art = kind === "person" ? SIL_ONE : kind === "group" ? SIL_GROUP : SCENE(seed || 1);
    return `<div class="ph" role="img" aria-label="${esc(label)}">${art}<span class="ph-label">${esc(label)}</span></div>`;
  }

  const scrollToSec = (id) => { const el = document.querySelector(`[data-sec="${id}"]`); if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };

  async function pageHome() {
    const O = ORG, CFGK = CFG.KONTAK || {};
    const st = O.statistik || [];
    const umLogo = CFG.LOGO_UM_URL ? FC.safeUrl(CFG.LOGO_UM_URL) : "";

    app.innerHTML = `
      <section class="hero hero-org" data-sec="hero">
        <div class="wrap hero-grid">
          <div class="reveal">
            <span class="eyebrow">Selamat datang di</span>
            <h1>${esc(O.organisasi || "BEM FMIPA UM")}<em>${esc(O.kabinet || "")}</em></h1>
            <div class="period">Periode ${esc(O.periode || "")}</div>
            <p class="tagline" style="margin-top:14px">${esc(O.tagline || "")}</p>
            <p class="lead">${esc(O.deskripsi || "")}</p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" data-scroll="program">Program Kerja ${icon("arrow")}</button>
              <a class="btn btn-ghost btn-lg" href="#/about">Tentang Kami</a>
            </div>
            <div class="stats">${st.map((x) => `<div class="stat"><div><b>${esc(x.angka)}</b><span>${esc(x.label)}</span></div>${icon(x.ikon || "spark")}</div>`).join("")}</div>
          </div>
          <div class="emblem reveal" aria-hidden="true">
            <span class="ring r1"></span><span class="ring r2"></span>
            <div class="logo-disc ${umLogo ? "" : "fallback"}">${umLogo ? `<img src="${esc(umLogo)}" alt="">` : `<img src="assets/img/logo.svg" alt="" style="width:60%;height:60%">`}</div>
            ${st[0] ? `<div class="badge e1">${icon(st[0].ikon)} <span><b>${esc(st[0].angka)}</b> ${esc(st[0].label)}</span></div>` : ""}
            ${st[2] ? `<div class="badge e2">${icon(st[2].ikon)} <span><b>${esc(st[2].angka)}</b> ${esc(st[2].label)}</span></div>` : ""}
            ${st[1] ? `<div class="badge e3">${icon(st[1].ikon)} <span><b>${esc(st[1].angka)}</b> ${esc(st[1].label)}</span></div>` : ""}
          </div>
        </div>
      </section>

      <div class="marquee" aria-hidden="true"><div class="marquee-track">${Array(2).fill((O.departemen || []).map((d) => `<span>${esc(d.nama)}</span>`).join("")).join("")}</div></div>

      ${O.video && O.video.youtubeId ? `
      <section class="section" style="padding-top:0" data-sec="video">
        <div class="wrap">
          <div class="video-card reveal">
            <button class="video-thumb" data-video aria-label="Putar ${esc(O.video.judul)}">${ph("", "scene", 3)}<span class="play">${icon("play")}</span><span class="vt-cap">Kabinet ${esc(O.kabinet)} · ${esc(O.periode)}</span></button>
            <div>
              <span class="eyebrow">Video profil</span>
              <h2 style="font-size:clamp(2rem,4.5vw,3rem);margin:14px 0 12px">${esc(O.video.judul)}</h2>
              <p class="muted">${esc(O.video.teks || "")}</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px"><button class="btn btn-primary" data-video>Tonton sekarang</button><a class="btn btn-ghost" href="${esc(FC.safeUrl(O.video.url))}" target="_blank" rel="noopener">Buka di YouTube</a></div>
            </div>
          </div>
        </div>
      </section>` : ""}

      <section class="section" style="padding-top:0" data-sec="program">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Program kerja</span><h2 style="margin-top:14px">Program <em>unggulan</em>${contoh()}</h2></div>
            <p>Sebagian dari ${esc((st.find((x) => /program/i.test(x.label)) || {}).angka || "")} program kerja Kabinet ${esc(O.kabinet || "")} yang paling dekat dengan keseharian mahasiswa.</p>
          </div>
          <div class="services">
            ${(O.program || []).map((p, i) => `
              <article class="service reveal">
                <span class="num">${String(i + 1).padStart(2, "0")}</span>
                <div class="ic">${icon(p.ikon || "spark")}</div>
                <span class="dept">${esc(p.dept || "")}</span>
                <h3>${esc(p.judul)}</h3><p>${esc(p.teks)}</p>
                ${p.link ? `<a class="btn btn-ghost btn-sm" href="${esc(p.link)}">Buka ${icon("arrow")}</a>` : ""}
              </article>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0" data-sec="agenda">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Agenda</span><h2 style="margin-top:14px">Kalender <em>kegiatan</em></h2></div>
            <p>Jadwal kegiatan BEM FMIPA yang terbuka untuk seluruh mahasiswa.</p>
          </div>
          <div class="cal reveal" id="cal"></div>
        </div>
      </section>

      ${(O.prestasi || []).length ? `
      <section class="section" style="padding-top:0" data-sec="prestasi">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Kebanggaan FMIPA</span><h2 style="margin-top:14px">Prestasi <em>mahasiswa</em>${contoh()}</h2></div>
            <div class="carousel-nav"><button class="icon-btn" data-car="prev" data-target="prestasiTrack" aria-label="Sebelumnya">${icon("arrow")}</button><button class="icon-btn" data-car="next" data-target="prestasiTrack" aria-label="Berikutnya">${icon("arrow")}</button></div>
          </div>
          <div class="carousel reveal"><div class="carousel-track" id="prestasiTrack" tabindex="0" aria-label="Daftar prestasi">
            ${O.prestasi.map((x, i) => `<article class="award">${ORG.TANDAI_CONTOH ? '<span class="contoh-tag">CONTOH</span>' : ""}
              <span class="aw-top">${esc(O.organisasi)} · ${esc(O.kabinet)}</span>
              <span class="aw-h">Selamat &amp; Sukses</span>
              <div class="aw-face">${ph("Foto", "person", i + 1, x.foto)}</div>
              <span class="aw-rank">${esc(x.peringkat)}</span>
              <span class="aw-lomba">${esc(x.lomba)} ${esc(x.tahun || "")}</span>
              <span class="aw-name">${esc(x.nama)} · ${esc(x.dept)}</span>
            </article>`).join("")}
          </div></div>
        </div>
      </section>` : ""}

      <section class="section" style="padding-top:0" data-sec="layanan">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Student info</span><h2 style="margin-top:14px">Layanan <em>mahasiswa</em></h2></div>
            <p>Informasi peluang dan layanan untuk mahasiswa FMIPA, dikelola lewat FMIPA Connect.</p>
          </div>
          <div class="services five">
            ${[["trophy", "Info Lomba", "Kompetisi ilmiah, olimpiade, data, dan inovasi yang dikurasi untuk mahasiswa FMIPA.", "#/lomba", "lomba"],
               ["cap", "Info Beasiswa", "Beasiswa pemerintah, swasta, kampus, dan luar negeri lengkap dengan tenggatnya.", "#/beasiswa", "beasiswa"],
               ["book", "Info Pelatihan", "Kelas, bootcamp, sertifikasi, dan webinar untuk menambah keterampilan.", "#/pelatihan", "pelatihan"],
               ["shield", "Kanal Pengaduan", "Laporkan kekerasan atau ajukan pendampingan penurunan UKT secara aman dan bisa dilacak.", "#/pengaduan", ""],
               ["users", "Cari Teman Lomba", "Buat lowongan tim atau temukan tim lintas departemen. Geser, daftar, terhubung.", "#/teman", "tim"]
              ].map(([ic, t, d, h, k]) => `
              <article class="service reveal">
                <div class="ic">${icon(ic)}</div>
                <span class="dept" data-count="${k}"></span>
                <h3>${t}</h3><p>${d}</p>
                <a class="btn btn-ghost btn-sm" href="${h}">Buka ${icon("arrow")}</a>
              </article>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0" data-sec="kontak">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Kontak</span><h2 style="margin-top:14px">Hubungi <em>kami</em></h2></div>
            <p>Punya pertanyaan, ajakan kolaborasi, atau ingin berkunjung ke sekretariat? Sampaikan langsung.</p>
          </div>
          <div class="contact-grid">
            <div class="ci-list reveal">
              ${CFGK.alamat ? `<div class="ci"><span class="ic">${icon("pin")}</span><div><small>Alamat</small><span>${esc(CFGK.alamat)}</span></div></div>` : ""}
              ${CFGK.whatsapp && !CFGK.whatsapp.startsWith("[") ? `<div class="ci"><span class="ic">${icon("phone")}</span><div><small>WhatsApp</small><a href="${esc(FC.safeUrl(CFGK.whatsapp_link))}" target="_blank" rel="noopener">${esc(CFGK.whatsapp)}</a></div></div>` : ""}
              ${CFGK.email && !CFGK.email.startsWith("[") ? `<div class="ci"><span class="ic">${icon("mail")}</span><div><small>Email</small><a href="mailto:${esc(CFGK.email)}">${esc(CFGK.email)}</a></div></div>` : ""}
              ${CFGK.instagram && !CFGK.instagram.startsWith("[") ? `<div class="ci"><span class="ic">${icon("camera")}</span><div><small>Instagram</small><a href="${esc(FC.safeUrl(CFGK.instagram_link))}" target="_blank" rel="noopener">${esc(CFGK.instagram)}</a></div></div>` : ""}
            </div>
            <div class="map-card reveal">
              <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <rect width="400" height="250" fill="#0D1707"/>
                <g stroke="rgba(223,247,91,.12)" stroke-width="10" fill="none" stroke-linecap="round"><path d="M-10 70 L420 40"/><path d="M-10 180 Q200 150 420 200"/><path d="M120 -10 L160 260"/><path d="M290 -10 Q270 120 310 260"/></g>
                <g stroke="rgba(223,247,91,.06)" stroke-width="4" fill="none"><path d="M0 120 L400 110"/><path d="M60 0 L80 250"/><path d="M220 0 L230 250"/><path d="M350 0 L360 250"/></g>
                <g fill="rgba(162,210,30,.10)"><rect x="170" y="80" width="40" height="30" rx="4"/><rect x="230" y="60" width="50" height="38" rx="4"/><rect x="60" y="130" width="46" height="30" rx="4"/><rect x="320" y="120" width="40" height="44" rx="4"/></g>
                <g transform="translate(220 80)"><circle r="26" fill="rgba(223,247,91,.15)"/><path d="M0 14s-14-12.4-14-23a14 14 0 0 1 28 0C14 1.6 0 14 0 14Z" fill="#DFF75B"/><circle cy="-9" r="5" fill="#12200A"/></g>
              </svg>
              ${FC.safeUrl(CFGK.maps_link) ? `<a class="btn btn-primary btn-sm" href="${esc(FC.safeUrl(CFGK.maps_link))}" target="_blank" rel="noopener">${icon("pin")} Buka di Google Maps</a>` : ""}
            </div>
            <form class="form-card reveal" id="waForm" novalidate>
              <h3 class="form-section-title">Kirim pesan</h3>
              <div class="form-grid" style="margin-top:14px">
                <div class="field"><label for="wa-nama">Nama</label><input id="wa-nama" name="nama" autocomplete="name"></div>
                <div class="field"><label for="wa-pesan">Pesan</label><textarea id="wa-pesan" name="pesan" style="min-height:96px"></textarea></div>
                <a class="btn btn-primary btn-block" id="waSend" target="_blank" rel="noopener" href="${esc(FC.safeUrl(CFGK.whatsapp_link))}">${icon("phone")} Kirim lewat WhatsApp</a>
                <span class="hint">Pesan akan terbuka di WhatsApp untuk kamu kirim sendiri.</span>
              </div>
            </form>
          </div>
        </div>
      </section>`;

    /* interaksi */
    $$("[data-scroll]", app).forEach((b) => b.onclick = () => scrollToSec(b.dataset.scroll));
    $$("[data-video]", app).forEach((b) => b.onclick = () => {
      const v = O.video;
      FC.openModal(`<span class="eyebrow">Video profil</span><h2 style="margin-top:10px">${esc(v.judul)}</h2>
        <div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}?autoplay=1&rel=0" title="${esc(v.judul)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
        <p class="muted" style="font-size:.85rem;margin-top:12px">Video tidak tampil? <a class="hl" href="${esc(FC.safeUrl(v.url))}" target="_blank" rel="noopener">Tonton di YouTube</a></p>`, { wide: true, label: v.judul });
    });
    $$("[data-car]", app).forEach((b) => b.onclick = () => { const t = $("#" + b.dataset.target); if (t) t.scrollBy({ left: (b.dataset.car === "next" ? 1 : -1) * t.clientWidth * 0.8, behavior: "smooth" }); });
    $$('[data-car="prev"] svg', app).forEach((s) => s.style.transform = "rotate(180deg)");
    const waNum = String(CFGK.whatsapp_link || "").replace(/^.*wa\.me\//, "").replace(/\D/g, "");
    const updWa = () => { const f = FC.formData($("#waForm")); const txt = `Halo ${O.organisasi || "BEM"}${f.nama ? ", saya " + f.nama : ""}.${f.pesan ? "\n\n" + f.pesan : ""}`; if (waNum) $("#waSend").href = `https://wa.me/${waNum}?text=${encodeURIComponent(txt)}`; };
    $("#waForm").addEventListener("input", updWa); updWa();
    $("#waForm").onsubmit = (e) => e.preventDefault();
    renderCalendar($("#cal"), new Date());
    afterRender();

    /* jumlah info aktif di kartu layanan */
    const [info, tim] = await Promise.all([D.listInfo().catch(() => []), D.listTim().catch(() => [])]);
    const aktif = (x) => { const n = FC.daysLeft(x.deadline); return n === null || n >= 0; };
    const cnt = { lomba: info.filter((x) => x.jenis === "lomba" && aktif(x)).length, beasiswa: info.filter((x) => x.jenis === "beasiswa" && aktif(x)).length, pelatihan: info.filter((x) => x.jenis === "pelatihan" && aktif(x)).length, tim: tim.filter((t) => t.status === "buka").length };
    const lbl = { lomba: "lomba dibuka", beasiswa: "beasiswa dibuka", pelatihan: "pelatihan tersedia", tim: "tim mencari anggota" };
    $$("[data-count]", app).forEach((el) => { const k = el.dataset.count; el.textContent = k ? `${cnt[k]} ${lbl[k]}` : "Rahasia & terlacak"; });
  }


  /* =================================================================
     ABOUT — siapa kami, arah gerak, kepengurusan, pengurus inti
     ================================================================= */
  function pageAbout() {
    const O = ORG, st = O.statistik || [];
    const findP = (id) => (O.pengurusInti || []).find((p) => p.id === id) || { jabatan: id, nama: "" };
    const node = (id, cls) => { const p = findP(id); return `<div class="oc-node ${cls || ""}"><b>${esc(p.jabatan)}</b><small>${esc(p.nama)}</small></div>`; };
    const deptBtn = (d) => `<a class="oc-node dept" href="#/departemen?id=${encodeURIComponent(d.id)}"><b>${esc(d.nama)}</b></a>`;
    const dalam = (O.departemen || []).filter((d) => d.bidang === "dalam"), luar = (O.departemen || []).filter((d) => d.bidang === "luar");
    const subnav = [["siapa", "Siapa kami"], ["arah", "Arah gerak"], ["struktur", "Kepengurusan"], ["pengurus", "Pengurus inti"]];

    app.innerHTML = `
      <section class="page-hero"><div class="wrap">
        <div class="crumbs"><a href="#/">Beranda</a><span>/</span><span>About</span></div>
        <h1>Tentang <em>${esc(O.kabinet || "kami")}</em></h1>
        <p>Kenali ${esc(O.organisasi || "BEM FMIPA UM")} Kabinet ${esc(O.kabinet || "")} periode ${esc(O.periode || "")}: siapa kami, ke mana kami melangkah, dan orang-orang yang menggerakkannya.</p>
        <div class="pills" style="margin-top:26px" role="navigation" aria-label="Bagian halaman">${subnav.map(([k, l]) => `<button class="pill" data-scroll="${k}">${l}</button>`).join("")}</div>
      </div></section>

      <section class="section" style="padding-top:24px" data-sec="siapa">
        <div class="wrap about-grid">
          <div class="about-copy reveal">
            <span class="eyebrow">Siapa kami</span>
            <h2>Badan Eksekutif Mahasiswa <em class="hl">FMIPA UM</em></h2>
            <p>${esc(O.namaPanjang || "")} adalah lembaga eksekutif tertinggi mahasiswa di tingkat fakultas. Kabinet ${esc(O.kabinet || "")} hadir sebagai ruang bagi mahasiswa Matematika, Fisika, Kimia, dan Biologi untuk bertumbuh bersama.</p>
            <p>${esc(O.deskripsi || "")}</p>
            <div class="stats" style="margin-top:28px">${st.map((x) => `<div class="stat"><div><b>${esc(x.angka)}</b><span>${esc(x.label)}</span></div>${icon(x.ikon || "spark")}</div>`).join("")}</div>
          </div>
          <div class="about-photo reveal">${ph("Foto bersama fungsionaris", "group", 2, O.fotoBersama)}</div>
        </div>
      </section>

      <section class="section" style="padding-top:0" data-sec="arah">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Arah gerak</span><h2 style="margin-top:14px">Visi &amp; <em>Misi</em></h2></div>
            <p>Tiga kata yang menjadi pegangan Kabinet ${esc(O.kabinet || "")}: substantif, inklusif, dan progresif.</p>
          </div>
          <div class="vm-grid">
            <article class="vm-card visi reveal"><h3>Visi</h3><p class="quote">${esc(O.visi || "")}</p></article>
            <article class="vm-card misi reveal"><h3>Misi</h3><ol class="misi-list">${(O.misi || []).map((m) => `<li><span>${esc(m)}</span></li>`).join("")}</ol></article>
          </div>
          <div class="values-row reveal">${(O.nilai || []).map((v) => `<div class="value"><b>${esc(v.judul)}</b><small>${esc(v.teks)}</small></div>`).join("")}</div>
        </div>
      </section>

      <section class="section" style="padding-top:0" data-sec="struktur">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Kepengurusan</span><h2 style="margin-top:14px">Struktur <em>kepengurusan</em>${contoh()}</h2></div>
            <p>Klik nama departemen untuk melihat tugas dan fokus programnya.</p>
          </div>
          <div class="org-chart reveal">
            ${node("ketum", "top")}
            <div class="oc-stem"></div>
            <div class="oc-row three">
              <div class="oc-col">${node("sekum")}<div class="oc-subs">${node("sek2", "sm")}${node("sek3", "sm")}</div></div>
              <div class="oc-col mid">${node("waketum")}<span class="oc-fill"></span></div>
              <div class="oc-col">${node("bendum")}<div class="oc-subs">${node("wabendum", "sm")}</div></div>
            </div>
            <div class="oc-row two">
              <div class="oc-col">${node("kdk")}<span class="oc-tag">Bidang dalam kampus</span><div class="oc-depts">${dalam.map(deptBtn).join("")}</div></div>
              <div class="oc-col">${node("klk")}<span class="oc-tag">Bidang luar kampus</span><div class="oc-depts">${luar.map(deptBtn).join("")}</div></div>
            </div>
          </div>
          <div class="group-title reveal">Bidang Dalam Kampus</div>
          <div class="dept-grid">${dalam.map(deptCard).join("")}</div>
          <div class="group-title reveal">Bidang Luar Kampus</div>
          <div class="dept-grid">${luar.map((d, i) => deptCard(d, i + 4)).join("")}</div>
        </div>
      </section>

      <section class="section" style="padding-top:0" data-sec="pengurus">
        <div class="wrap">
          <div class="section-head split reveal">
            <div><span class="eyebrow">Pengurus inti</span><h2 style="margin-top:14px">Wajah di balik <em>${esc(O.kabinet || "kabinet")}</em>${contoh()}</h2></div>
            <p>Pengurus harian yang memimpin dan mengoordinasikan seluruh departemen.</p>
          </div>
          <div class="people-grid">
            ${(O.pengurusInti || []).map((p, i) => `<article class="person reveal ${i === 0 ? "lead" : ""}"><div class="pic">${ph("Foto pengurus", "person", i + 1, p.foto)}</div><div class="info"><b>${esc(p.nama)}</b><small>${esc(p.jabatan)}</small>${liBtn(p.linkedin, p.nama)}</div></article>`).join("")}
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="cta-band reveal">
            <div><span class="eyebrow">Bergerak bersama</span><h2 style="margin:14px 0 12px">${esc(O.tagline || "")}</h2><p>Lihat program kerja kami atau manfaatkan layanan mahasiswa di FMIPA Connect.</p></div>
            <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary btn-lg" href="#/">Ke Beranda</a><a class="btn btn-ghost btn-lg" href="#/pengaduan">Kanal Pengaduan</a></div>
          </div>
        </div>
      </section>`;

    $$("[data-scroll]", app).forEach((b) => b.onclick = () => scrollToSec(b.dataset.scroll));
  }

  const kepalaOf = (d) => ((d.anggota || []).find((a) => /^kepala/i.test(a.jabatan)) || {}).nama || "-";
  const LI_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10.5V17M8 7.2v.1M12 17v-6.5M12 13.5a2.5 2.5 0 0 1 5 0V17"/></svg>';
  const liBtn = (url, nama) => {
    const u = FC.safeUrl(url);
    if (u) return `<a class="li-btn" href="${esc(u)}" target="_blank" rel="noopener" aria-label="LinkedIn ${esc(nama)}" title="LinkedIn ${esc(nama)}">${LI_ICON}</a>`;
    return ORG.TANDAI_CONTOH ? `<span class="li-btn off" title="Link LinkedIn belum diisi" aria-label="LinkedIn ${esc(nama)} belum diisi">${LI_ICON}</span>` : "";
  };

  const deptCard = (d, i) => `
    <a class="dept-card reveal" href="#/departemen?id=${encodeURIComponent(d.id)}" aria-label="Departemen ${esc(d.nama)}, lihat halaman departemen">
      <div class="pic">${ph("Foto departemen", "group", i + 2, d.foto)}<span class="dept-title">${esc(d.nama)}</span></div>
      <div class="row-b"><div><b>${esc(d.nama)}</b><small>Kepala: ${esc(kepalaOf(d))}</small></div>${icon("arrow")}</div>
    </a>`;

  /* =================================================================
     HALAMAN DEPARTEMEN (dibuka dari About)
     ================================================================= */
  function pageDepartemen(q) {
    const O = ORG, list = O.departemen || [];
    const idx = list.findIndex((x) => x.id === q.get("id"));
    const d = list[idx];
    if (!d) { app.innerHTML = `<section class="page-hero"><div class="wrap"><h1>Departemen <em>tidak ditemukan</em></h1><p><a class="btn btn-primary" style="margin-top:20px" href="#/about">Kembali ke About</a></p></div></section>`; return; }
    const koor = (O.pengurusInti || []).find((p) => p.id === (d.bidang === "dalam" ? "kdk" : "klk"));
    const bg = FC.safeUrl(d.foto);
    document.title = `Departemen ${d.nama} · ${O.organisasi || "BEM FMIPA UM"}`;
    app.innerHTML = `
      <section class="dept-hero">
        <div class="dept-hero-bg" aria-hidden="true">${bg ? `<img src="${esc(bg)}" alt="">` : SCENE(idx + 2)}</div>
        ${bg ? "" : `<span class="hero-ph-note">Foto latar: foto bersama Departemen ${esc(d.nama)}</span>`}
        <div class="wrap dept-hero-in reveal">
          <div class="crumbs"><a href="#/">Beranda</a><span>/</span><a href="#/about">About</a><span>/</span><span>${esc(d.nama)}</span></div>
          <span class="eyebrow" style="margin-top:22px">Bidang ${d.bidang === "dalam" ? "dalam" : "luar"} kampus</span>
          <h1>Departemen <em>${esc(d.nama)}</em></h1>
          <p><b>Departemen ${esc(d.nama)}</b> ${esc(String(d.deskripsi || "").replace(/^[^:]+:\s*/, ""))}</p>
          <div class="chips" style="justify-content:center;margin-top:18px">${(d.fokus || []).map((f) => `<span class="chip solid">${esc(f)}</span>`).join("")}</div>
          <p class="dept-meta">Kepala departemen <b>${esc(kepalaOf(d))}</b>${koor ? ` · Koordinator <b>${esc(koor.nama)}</b>` : ""}${contoh()}</p>
        </div>
      </section>

      <section class="section" data-sec="proker">
        <div class="wrap">
          <div class="center-head reveal"><h2>Program <em>Kerja</em></h2><span class="bar"></span><p class="muted only-touch">Ketuk kartu untuk melihat penjelasannya.</p></div>
          <div class="proker-grid">
            ${(d.proker || []).map((p, i) => `
              <article class="proker reveal" tabindex="0" aria-label="${esc(p.nama)}">
                <div class="pk-bg" aria-hidden="true">${SCENE(i + idx + 4)}</div>
                <div class="pk-in"><h3>${esc(p.nama)}</h3><p>${esc(p.deskripsi)}</p></div>
              </article>`).join("") || '<div class="empty"><p>Program kerja belum ditambahkan.</p></div>'}
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0" data-sec="anggota">
        <div class="wrap">
          <div class="center-head reveal"><h2>Anggota <em>Departemen</em></h2><span class="bar"></span></div>
          <div class="member-car reveal">
            <button class="car-arrow prev" data-car="prev" aria-label="Sebelumnya">${icon("arrow")}</button>
            <div class="carousel-track" id="anggotaTrack" tabindex="0" aria-label="Anggota departemen ${esc(d.nama)}">
              ${(d.anggota || []).map((a, i) => `<article class="person"><div class="pic">${ph("Foto pengurus", "person", i + 1, a.foto)}</div><div class="info"><b>${esc(a.nama)}</b><small>${esc(a.jabatan)}</small>${liBtn(a.linkedin, a.nama)}</div></article>`).join("")}
            </div>
            <button class="car-arrow next" data-car="next" aria-label="Berikutnya">${icon("arrow")}</button>
          </div>
        </div>
      </section>

      <section class="section" style="padding-top:0">
        <div class="wrap">
          <div class="group-title">Departemen lainnya</div>
          <div class="pills" style="flex-wrap:wrap">${list.filter((x) => x.id !== d.id).map((x) => `<a class="pill" href="#/departemen?id=${encodeURIComponent(x.id)}">${esc(x.nama)}</a>`).join("")}</div>
          <a class="btn btn-ghost" style="margin-top:24px" href="#/about">${icon("arrow", "flip")} Kembali ke About</a>
        </div>
      </section>`;

    $$(".proker", app).forEach((el) => {
      el.addEventListener("click", () => { const was = el.classList.contains("open"); $$(".proker.open", app).forEach((x) => x.classList.remove("open")); el.classList.toggle("open", !was); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } });
    });
    const track = $("#anggotaTrack");
    $$(".car-arrow", app).forEach((b) => b.onclick = () => track.scrollBy({ left: (b.dataset.car === "next" ? 1 : -1) * track.clientWidth * 0.8, behavior: "smooth" }));
  }

  const BLN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function renderCalendar(box, ref) {
    const y = ref.getFullYear(), m = ref.getMonth();
    const ag = (ORG.agenda || []).filter((a) => a && a.tanggal);
    const first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
    const todayStr = new Date().toDateString();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const cells = Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
    const evMonth = ag.filter((a) => a.tanggal.slice(0, 7) === `${y}-${String(m + 1).padStart(2, "0")}`).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    box.innerHTML = `
      <div class="cal-head">
        <h3>${BLN[m]} <small>${y}</small></h3>
        <div class="cal-nav"><button class="btn btn-ghost btn-sm" data-m="-1" aria-label="Bulan sebelumnya">‹</button><button class="btn btn-ghost btn-sm" data-m="0">Hari ini</button><button class="btn btn-ghost btn-sm" data-m="1" aria-label="Bulan berikutnya">›</button></div>
      </div>
      <div class="cal-grid" role="grid" aria-label="Kalender ${BLN[m]} ${y}">
        ${["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => `<div class="cal-dow">${d}</div>`).join("")}
        ${cells.map((d) => { const ev = ag.filter((a) => a.tanggal === iso(d)); return `<div class="cal-cell ${d.getMonth() !== m ? "out" : ""} ${d.toDateString() === todayStr ? "today" : ""}"><span class="d">${d.getDate()}</span>${ev.map((e) => `<span class="cal-ev" title="${esc(e.judul)}">${esc(e.judul)}</span>`).join("")}</div>`; }).join("")}
      </div>
      ${evMonth.length ? `<div class="cal-list">${evMonth.map((e) => { const p = FC.dateParts(e.tanggal); return `<div class="deadline-item" style="cursor:default"><div class="date-box"><b>${p.day}</b><small>${p.mon}</small></div><div><h4>${esc(e.judul)}</h4><p>${esc(e.tempat || "")}</p></div></div>`; }).join("")}</div>` : ""}
      ${!ag.length ? `<div class="cal-empty"><b>Agenda segera diumumkan</b><span>Pantau terus kalender ini untuk jadwal kegiatan Kabinet ${esc(ORG.kabinet || "")}.</span></div>` : ""}`;
    $$("[data-m]", box).forEach((b) => b.onclick = () => { const k = +b.dataset.m; renderCalendar(box, k === 0 ? new Date() : new Date(y, m + k, 1)); });
  }

  function countUp(el, to) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || to === 0) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 900;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  const teamMini = (t) => `
    <a class="team-row" href="#/teman?lihat=${encodeURIComponent(t.id)}">
      <div class="team-row-head">
        <div style="display:flex;gap:12px;align-items:center"><span class="avatar" aria-hidden="true">${esc(FC.initials(t.owner_nama))}</span><div><b style="display:block">${esc(t.judul)}</b><small class="muted">${esc(t.owner_nama || "")} · ${esc(t.owner_departemen || "")}</small></div></div>
        ${FC.deadlineChip(t.deadline)}
      </div>
      <div class="chips">${(t.butuh_departemen || []).map((d) => `<span class="chip">${esc(d)}</span>`).join("")}${(t.butuh_peran || []).map((p) => `<span class="chip gray">${esc(p)}</span>`).join("")}</div>
    </a>`;

  /* =================================================================
     INFO LOMBA / BEASISWA / PELATIHAN
     ================================================================= */
  const INFO_COPY = {
    lomba: ["Info <em>Lomba</em>", "Kompetisi ilmiah, olimpiade, data, inovasi, dan esai. Klik kartu untuk detail, lalu cari teman tim langsung dari sini."],
    beasiswa: ["Info <em>Beasiswa</em>", "Beasiswa pemerintah, swasta, internal kampus, dan luar negeri. Perhatikan tenggat dan persyaratannya."],
    pelatihan: ["Info <em>Pelatihan</em>", "Kelas, bootcamp, sertifikasi, dan webinar untuk menambah bekal di luar perkuliahan."]
  };

  async function pageInfo(jenis, q) {
    const [title, lead] = INFO_COPY[jenis];
    const f = { kat: "Semua", cari: "", tutup: false, urut: "deadline" };
    app.innerHTML = `
      <section class="page-hero"><div class="wrap">
        <div class="crumbs"><a href="#/">Beranda</a><span>/</span><span>Info Mahasiswa</span></div>
        <h1>${title}</h1><p>${lead}</p>
      </div></section>
      <section class="section" style="padding-top:20px"><div class="wrap">
        <div class="toolbar">
          <div class="pills" role="group" aria-label="Filter kategori">${["Semua"].concat(FC.KATEGORI[jenis]).map((k) => `<button class="pill" aria-pressed="${k === "Semua"}" data-kat="${esc(k)}">${esc(k)}</button>`).join("")}</div>
        </div>
        <div class="toolbar-row" style="margin-bottom:24px">
          <label class="search"><span class="sr-only">Cari</span>${icon("search")}<input type="search" id="cari" placeholder="Cari judul atau penyelenggara…"></label>
          <label class="sr-only" for="urut">Urutkan</label>
          <select id="urut" style="width:auto;min-width:190px"><option value="deadline">Tenggat terdekat</option><option value="baru">Terbaru ditambahkan</option></select>
          <label class="toggle"><input type="checkbox" id="tutup"> Tampilkan yang sudah ditutup</label>
        </div>
        <p class="muted" id="count" style="font-size:.86rem;margin-bottom:14px" aria-live="polite"></p>
        <div id="list">${loadingGrid(6)}</div>
      </div></section>`;

    let all = [];
    try { all = await D.listInfo(jenis); } catch (e) { $("#list").innerHTML = `<div class="empty"><h3>Gagal memuat</h3><p>${esc(e.message)}</p></div>`; return; }

    const draw = () => {
      let r = all.filter((x) => (f.kat === "Semua" || x.kategori === f.kat));
      if (!f.tutup) r = r.filter((x) => { const n = FC.daysLeft(x.deadline); return n === null || n >= 0; });
      if (f.cari) { const s = f.cari.toLowerCase(); r = r.filter((x) => (x.judul + " " + (x.penyelenggara || "") + " " + (x.deskripsi || "")).toLowerCase().includes(s)); }
      r.sort(f.urut === "baru" ? (a, b) => String(b.created_at).localeCompare(String(a.created_at)) : (a, b) => {
        const da = a.deadline || "9999", db = b.deadline || "9999"; const pa = FC.daysLeft(a.deadline) < 0 ? 1 : 0, pb = FC.daysLeft(b.deadline) < 0 ? 1 : 0;
        return pa - pb || da.localeCompare(db);
      });
      $("#count").textContent = `${r.length} ${FC.jenisLabel[jenis].toLowerCase()} ditemukan`;
      $("#list").innerHTML = r.length ? `<div class="grid-cards">${r.map(infoCard).join("")}</div>` :
        `<div class="empty"><h3>Belum ada yang cocok</h3><p>Coba kategori lain atau hapus kata kunci pencarian.</p></div>`;
      $$("#list [data-info]").forEach((b) => b.onclick = () => openInfo(all.find((x) => String(x.id) === b.dataset.info)));
    };
    $$("[data-kat]").forEach((b) => b.onclick = () => { f.kat = b.dataset.kat; $$("[data-kat]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); });
    $("#cari").oninput = (e) => { f.cari = e.target.value.trim(); draw(); };
    $("#urut").onchange = (e) => { f.urut = e.target.value; draw(); };
    $("#tutup").onchange = (e) => { f.tutup = e.target.checked; draw(); };
    draw();
    if (q.get("id")) { const it = all.find((x) => String(x.id) === q.get("id")); if (it) openInfo(it); }
  }

  const cover = (x) => {
    const img = FC.safeUrl(x.poster_url);
    return img ? `<img src="${esc(img)}" alt="Poster ${esc(x.judul)}" loading="lazy">` : `${FC.coverArt(x.jenis, x.judul)}<span class="cover-icon">${icon(FC.jenisIcon[x.jenis])}</span>`;
  };

  const infoCard = (x) => `
    <button class="info-card reveal in" data-info="${x.id}" aria-label="${esc(x.judul)}, lihat detail">
      <div class="cover">${cover(x)}
        <div class="tag-top"><span class="chip solid">${esc(x.kategori || FC.jenisLabel[x.jenis])}</span>${x.tingkat ? `<span class="chip solid">${esc(x.tingkat)}</span>` : ""}${demoTag(x)}</div>
      </div>
      <div class="body">
        <h3>${esc(x.judul)}</h3>
        <p class="org">${esc(x.penyelenggara || "")}</p>
        <div class="meta"><span style="display:flex;gap:6px;align-items:center">${icon("cal")} ${FC.fmtDate(x.deadline)}</span>${FC.deadlineChip(x.deadline)}</div>
      </div>
    </button>`;

  async function openInfo(x) {
    if (!x) return;
    const link = FC.safeUrl(x.link);
    const d = FC.openModal(`
      <div class="detail-cover">${cover(x)}</div>
      <div class="chips" style="margin-bottom:12px"><span class="chip">${FC.jenisLabel[x.jenis]}</span>${x.kategori ? `<span class="chip gray">${esc(x.kategori)}</span>` : ""}${FC.deadlineChip(x.deadline)}${demoTag(x)}</div>
      <h2>${esc(x.judul)}</h2>
      <p class="lede">${esc(x.penyelenggara || "")}</p>
      <div class="detail-meta">
        <div><small>Tenggat daftar</small><b>${FC.fmtDate(x.deadline, true)}</b></div>
        ${x.tanggal_acara ? `<div><small>Pelaksanaan</small><b>${FC.fmtDate(x.tanggal_acara, true)}</b></div>` : ""}
        ${x.tingkat ? `<div><small>Tingkat</small><b>${esc(x.tingkat)}</b></div>` : ""}
        ${x.lokasi ? `<div><small>Lokasi</small><b>${esc(x.lokasi)}</b></div>` : ""}
        ${x.biaya ? `<div><small>${x.jenis === "beasiswa" ? "Benefit" : "Biaya"}</small><b>${esc(x.biaya)}</b></div>` : ""}
      </div>
      <p class="prose">${esc(x.deskripsi || "")}</p>
      <div class="modal-actions">
        ${link ? `<a class="btn btn-primary" href="${esc(link)}" target="_blank" rel="noopener">Info resmi / daftar ${icon("arrow")}</a>` : `<span class="muted" style="font-size:.85rem;align-self:center">Tautan resmi belum ditambahkan admin.</span>`}
        ${x.jenis === "lomba" ? `<a class="btn btn-outline-lime" href="#/teman?tab=buat&info=${x.id}" data-close>${icon("users")} Cari teman tim</a>` : ""}
        <button class="btn btn-ghost" data-share>${icon("link")} Salin tautan</button>
      </div>
      <p id="timCount" class="muted" style="font-size:.85rem;margin-top:14px"></p>`, { label: x.judul, wide: true });
    d.querySelector("[data-share]").onclick = () => {
      const url = location.href.split("#")[0] + `#/${x.jenis}?id=${x.id}`;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => FC.toast("Tautan disalin."), () => FC.toast(url));
    };
    if (x.jenis === "lomba") {
      const tim = (await D.listTim().catch(() => [])).filter((t) => String(t.info_id) === String(x.id) && t.status === "buka");
      const el = d.querySelector("#timCount");
      if (el && tim.length) el.innerHTML = `${tim.length} tim sedang mencari anggota untuk lomba ini. <a href="#/teman?lomba=${x.id}" data-close class="hl">Lihat timnya →</a>`;
    }
  }

  /* =================================================================
     KANAL PENGADUAN
     ================================================================= */
  const JENIS_ADUAN = {
    kekerasan: ["shield", "Laporan Kekerasan", "Kekerasan fisik, psikis, seksual, perundungan, atau diskriminasi. Bisa anonim."],
    ukt: ["wallet", "Penurunan UKT", "Ajukan pendampingan permohonan keringanan atau penurunan UKT."],
    lainnya: ["chat", "Aspirasi Lainnya", "Masalah fasilitas, layanan akademik, atau aspirasi lain untuk BEM."]
  };

  function pagePengaduan(q) {
    const S = CFG.SATGAS || {}, K = CFG.KONTAK || {};
    app.innerHTML = `
      <section class="page-hero"><div class="wrap">
        <div class="crumbs"><a href="#/">Beranda</a><span>/</span><span>Kanal Pengaduan</span></div>
        <h1>Kanal <em>Pengaduan</em></h1>
        <p>Suaramu aman di sini. Laporan hanya dapat dibaca oleh pengurus yang ditunjuk, dan kamu akan mendapat kode untuk memantau tindak lanjutnya.</p>
      </div></section>
      <section class="section" style="padding-top:20px"><div class="wrap">
        <div class="tabs" role="tablist" style="margin-bottom:28px">
          <button class="tab" role="tab" aria-selected="${!q.get("cek")}" data-t="buat">${icon("mega")} Buat laporan</button>
          <button class="tab" role="tab" aria-selected="${!!q.get("cek")}" data-t="cek">${icon("search")} Cek status</button>
        </div>
        <div id="pgBody"></div>
      </div></section>`;
    const body = $("#pgBody");

    const showBuat = (jenis) => {
      body.innerHTML = `
        <div class="choice-grid" role="group" aria-label="Pilih jenis laporan">
          ${Object.entries(JENIS_ADUAN).map(([k, [ic, t, d]]) => `<button class="choice" aria-pressed="${k === jenis}" data-j="${k}"><span class="ic">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></button>`).join("")}
        </div>
        <div id="formArea" style="margin-top:28px">${jenis ? "" : '<p class="muted" style="font-size:.9rem">Pilih salah satu jenis laporan di atas untuk mulai mengisi.</p>'}</div>`;
      $$("[data-j]", body).forEach((b) => b.onclick = () => showBuat(b.dataset.j));
      if (jenis) renderAduanForm(jenis, $("#formArea"));
    };

    const showCek = (kode) => {
      body.innerHTML = `
        <div class="about-grid" style="align-items:start">
          <form class="form-card" id="cekForm">
            <h2 class="form-section-title">Cek status laporan</h2>
            <p class="muted" style="font-size:.9rem;margin:6px 0 18px">Masukkan kode yang kamu dapat saat mengirim laporan.</p>
            <div class="field"><label for="kode">Kode laporan</label><input id="kode" name="kode" placeholder="FC-XXXXXXXX" required autocomplete="off" style="text-transform:uppercase;letter-spacing:.1em" value="${esc(kode || "")}"></div>
            <button class="btn btn-primary btn-block" style="margin-top:16px">Cek status</button>
            <div id="cekHasil" style="margin-top:22px" aria-live="polite"></div>
          </form>
          <div class="form-card">
            <h2 class="form-section-title">Bagaimana laporan ditangani?</h2>
            <div class="timeline" style="margin-top:16px">
              ${[["Diterima", "Laporan masuk dan tercatat dengan kode unik."], ["Sedang diproses", "Pengurus memverifikasi dan menghubungimu bila kamu meninggalkan kontak."], ["Ditindaklanjuti", "Kasus diteruskan ke pihak berwenang (misalnya Satgas atau fakultas) dengan persetujuanmu."], ["Selesai", "Ada keputusan atau penyelesaian. Catatan akhir terlihat di sini."]].map(([a, b]) => `<div class="tl"><i></i><div><b>${a}</b><small>${b}</small></div></div>`).join("")}
            </div>
          </div>
        </div>`;
      $("#cekForm").onsubmit = async (e) => {
        e.preventDefault(); const k = $("#kode").value.trim().toUpperCase(); const out = $("#cekHasil");
        out.innerHTML = '<p class="muted">Memeriksa…</p>';
        try {
          const r = await D.cekPengaduan(k);
          if (!r) { out.innerHTML = `<p class="error-text">Kode tidak ditemukan. Periksa kembali penulisannya.</p>`; return; }
          const order = ["diterima", "diproses", "ditindaklanjuti", "selesai"]; const idx = order.indexOf(r.status);
          out.innerHTML = `
            <div class="chips" style="margin-bottom:12px"><span class="chip">${esc(r.kode)}</span><span class="chip gray">${esc(JENIS_ADUAN[r.jenis] ? JENIS_ADUAN[r.jenis][1] : r.jenis)}</span></div>
            ${r.status === "ditolak" ? `<p><b>Status:</b> ${FC.STATUS_PENGADUAN.ditolak}</p>` : `<div class="timeline">${order.map((s, i) => `<div class="tl ${i < idx ? "done" : i === idx ? "now done" : ""}"><i></i><div><b>${FC.STATUS_PENGADUAN[s]}</b>${i === idx ? `<small>Diperbarui ${FC.fmtDateTime(r.updated_at)}</small>` : ""}</div></div>`).join("")}</div>`}
            ${r.catatan_publik ? `<div class="value" style="margin-top:8px"><small>Catatan dari pengurus</small><p style="margin-top:4px">${esc(r.catatan_publik)}</p></div>` : ""}
            <p class="muted" style="font-size:.8rem;margin-top:12px">Dikirim ${FC.fmtDateTime(r.created_at)}</p>`;
        } catch (err) { out.innerHTML = `<p class="error-text">${esc(err.message)}</p>`; }
      };
      if (kode) $("#cekForm").requestSubmit();
    };

    $$("[data-t]").forEach((b) => b.onclick = () => { $$("[data-t]").forEach((x) => x.setAttribute("aria-selected", x === b)); b.dataset.t === "cek" ? showCek() : showBuat(); });
    q.get("cek") ? showCek(q.get("kode")) : showBuat(q.get("jenis"));
  }

  function renderAduanForm(jenis, box) {
    const S = CFG.SATGAS || {};
    const p = state.profile || {};
    const deptOpts = `<option value="">Pilih departemen</option>${FC.DEPARTEMEN.map((d) => `<option ${p.departemen === d ? "selected" : ""}>${d}</option>`).join("")}`;
    const satgasLink = FC.safeUrl(S.link);
    const safety = jenis === "kekerasan" ? `
      <div class="safety" role="note" style="margin-bottom:22px">
        <b>Jika kamu dalam bahaya sekarang, hubungi bantuan darurat dulu.</b>
        <ul>
          <li>Darurat: <a href="tel:112">112</a></li>
          <li>SAPA 129 KemenPPPA: telepon <a href="tel:129">129</a> atau WhatsApp <a href="https://wa.me/628111129129" target="_blank" rel="noopener">08111-129-129</a></li>
          <li>${esc(S.nama || "Satgas PPK kampus")}: ${satgasLink ? `<a href="${esc(satgasLink)}" target="_blank" rel="noopener">${esc(S.kontak)}</a>` : esc(S.kontak || "")}</li>
        </ul>
        <span class="muted" style="font-size:.84rem">Laporan di sini akan didampingi pengurus dan, dengan persetujuanmu, diteruskan ke Satgas. Kamu boleh menulis seperlunya saja.</span>
      </div>` : "";

    const khusus = {
      kekerasan: `
        <h3 class="form-section-title span-2">Tentang kejadian</h3>
        <div class="field"><label for="peran">Kamu melapor sebagai <span class="req">*</span></label><select id="peran" name="peran" required><option value="">Pilih</option><option>Korban</option><option>Saksi</option><option>Pendamping / teman korban</option></select></div>
        <div class="field"><label for="bentuk">Bentuk kekerasan <span class="req">*</span></label><select id="bentuk" name="bentuk" required><option value="">Pilih</option><option>Kekerasan fisik</option><option>Kekerasan psikis</option><option>Perundungan</option><option>Kekerasan seksual</option><option>Diskriminasi dan intoleransi</option><option>Kebijakan yang mengandung kekerasan</option><option>Lainnya / belum yakin</option></select></div>
        <div class="field"><label for="tgl">Perkiraan tanggal kejadian</label><input type="date" id="tgl" name="tanggal_kejadian"></div>
        <div class="field"><label for="lok">Lokasi kejadian</label><input id="lok" name="lokasi" placeholder="Contoh: lab, kelas, daring, luar kampus"></div>
        <div class="field span-2"><label for="isi">Ceritakan kejadiannya <span class="req">*</span></label><textarea id="isi" name="isi" required minlength="20" placeholder="Tulis seperlunya. Kamu tidak wajib menyebut nama terlapor."></textarea></div>
        <div class="field span-2"><span class="label">Pendampingan yang dibutuhkan</span><div class="check-grid">${["Psikologis", "Hukum", "Medis", "Akademik", "Belum tahu"].map((x) => `<label class="check-pill"><input type="checkbox" name="pendampingan" value="${x}" data-multi><span>${x}</span></label>`).join("")}</div></div>`,
      ukt: `
        <h3 class="form-section-title span-2">Data UKT</h3>
        <div class="field"><label for="gol">Golongan UKT saat ini <span class="req">*</span></label><input id="gol" name="golongan" required placeholder="Contoh: Golongan 5"></div>
        <div class="field"><label for="nom">Nominal UKT saat ini</label><input id="nom" name="nominal" inputmode="numeric" placeholder="Contoh: Rp4.500.000"></div>
        <div class="field"><label for="alasan">Alasan utama <span class="req">*</span></label><select id="alasan" name="alasan" required><option value="">Pilih</option><option>Penghasilan orang tua/wali menurun</option><option>Orang tua/wali meninggal dunia</option><option>Orang tua/wali terkena PHK</option><option>Usaha keluarga bangkrut</option><option>Terdampak bencana</option><option>Tanggungan keluarga bertambah</option><option>Lainnya</option></select></div>
        <div class="field"><label for="sem">Semester saat ini</label><input id="sem" name="semester" inputmode="numeric" placeholder="Contoh: 4"></div>
        <div class="field span-2"><label for="isi">Jelaskan kondisimu <span class="req">*</span></label><textarea id="isi" name="isi" required minlength="20" placeholder="Jelaskan perubahan kondisi ekonomi keluarga dan sejak kapan."></textarea></div>
        <div class="field span-2"><label for="bukti">Tautan dokumen pendukung</label><input type="url" id="bukti" name="link_bukti" placeholder="https://drive.google.com/… (atur akses: siapa saja yang memiliki link)"><span class="hint">Misalnya surat keterangan penghasilan, SKTM, atau surat PHK. Permohonan resmi tetap mengikuti prosedur universitas; BEM membantu pendampingan dan advokasi.</span></div>`,
      lainnya: `
        <h3 class="form-section-title span-2">Isi aspirasi</h3>
        <div class="field"><label for="sub">Topik <span class="req">*</span></label><select id="sub" name="subjenis" required><option value="fasilitas">Fasilitas</option><option value="akademik">Layanan akademik</option><option value="lainnya">Lainnya</option></select></div>
        <div class="field"><label for="jdl">Judul singkat <span class="req">*</span></label><input id="jdl" name="judul" required maxlength="120" placeholder="Contoh: AC ruang kuliah rusak"></div>
        <div class="field span-2"><label for="isi">Uraian <span class="req">*</span></label><textarea id="isi" name="isi" required minlength="20"></textarea></div>
        <div class="field span-2"><label for="bukti">Tautan foto/dokumen (opsional)</label><input type="url" id="bukti" name="link_bukti" placeholder="https://…"></div>`
    }[jenis];

    box.innerHTML = `${safety}
      <form class="form-card" id="aduanForm" novalidate>
        <div class="form-grid two">
          ${jenis !== "ukt" ? `<label class="check span-2" style="padding:14px;border:1px solid var(--line);border-radius:14px"><input type="checkbox" name="anonim" id="anonim" ${jenis === "kekerasan" ? "checked" : ""}><span><b style="color:var(--text)">Kirim secara anonim</b><br>Nama dan NIM tidak disimpan. Kamu tetap bisa memantau lewat kode laporan.</span></label>` : ""}
          <div class="identity span-2 form-grid two" style="${jenis === "kekerasan" ? "display:none" : ""}">
            <h3 class="form-section-title span-2">Identitas pelapor</h3>
            <div class="field"><label for="nama">Nama lengkap ${jenis === "ukt" ? '<span class="req">*</span>' : ""}</label><input id="nama" name="nama" value="${esc(p.nama || "")}" ${jenis === "ukt" ? "required" : ""}></div>
            <div class="field"><label for="nim">NIM ${jenis === "ukt" ? '<span class="req">*</span>' : ""}</label><input id="nim" name="nim" inputmode="numeric" value="${esc(p.nim || "")}" ${jenis === "ukt" ? "required" : ""}></div>
          </div>
          <div class="field"><label for="dept">Departemen</label><select id="dept" name="departemen">${deptOpts}</select></div>
          <div class="field"><label for="akt">Angkatan</label><input id="akt" name="angkatan" inputmode="numeric" placeholder="Contoh: 2024" value="${esc(p.angkatan || "")}"></div>
          <div class="field span-2"><label for="kontak">Kontak yang aman dihubungi ${jenis === "ukt" ? '<span class="req">*</span>' : "(opsional)"}</label><input id="kontak" name="kontak" ${jenis === "ukt" ? "required" : ""} placeholder="Nomor WhatsApp atau email" value="${esc(jenis === "ukt" ? (p.whatsapp || "") : "")}"><span class="hint">${jenis === "kekerasan" ? "Isi bila kamu ingin dihubungi untuk pendampingan. Boleh dikosongkan." : "Pengurus akan menghubungimu lewat kontak ini."}</span></div>
          ${khusus}
          <label class="check span-2"><input type="checkbox" name="setuju" required><span>Saya menyatakan laporan ini dibuat dengan jujur, dan setuju data di atas dibaca oleh pengurus yang menangani laporan.</span></label>
          <p class="error-text span-2" id="aduanErr" role="alert"></p>
          <div class="span-2"><button class="btn btn-primary btn-lg">Kirim laporan ${icon("arrow")}</button></div>
        </div>
      </form>`;

    const form = $("#aduanForm", box);
    const an = $("#anonim", form);
    if (an) an.onchange = () => { $(".identity", form).style.display = an.checked ? "none" : ""; };
    form.onsubmit = async (e) => {
      e.preventDefault();
      const err = $("#aduanErr", form); err.textContent = "";
      if (!form.checkValidity()) { const bad = form.querySelector(":invalid"); err.textContent = bad && bad.name === "setuju" ? "Centang pernyataan persetujuan terlebih dahulu." : "Lengkapi kolom bertanda * (uraian minimal 20 karakter)."; bad && bad.focus(); return; }
      const v = FC.formData(form);
      const detail = {};
      ["peran", "bentuk", "tanggal_kejadian", "lokasi", "pendampingan", "golongan", "nominal", "alasan", "semester"].forEach((k) => { if (v[k] && (!Array.isArray(v[k]) || v[k].length)) detail[k] = v[k]; });
      const payload = {
        jenis: jenis === "lainnya" ? (v.subjenis || "lainnya") : jenis,
        anonim: !!v.anonim, nama: v.anonim ? null : v.nama, nim: v.anonim ? null : v.nim,
        kontak: v.kontak, departemen: v.departemen, angkatan: v.angkatan,
        judul: v.judul || (jenis === "kekerasan" ? "Laporan " + (v.bentuk || "kekerasan").toLowerCase() : jenis === "ukt" ? "Permohonan penurunan UKT" : ""),
        isi: v.isi, detail, link_bukti: v.link_bukti
      };
      await FC.busy(form.querySelector("button.btn-primary"), async () => {
        try {
          const kode = await D.kirimPengaduan(payload);
          form.reset();
          const d = FC.openModal(`
            <span class="eyebrow">Laporan terkirim</span>
            <h2 style="margin:12px 0 8px">Terima kasih sudah bersuara.</h2>
            <p class="lede">Simpan kode di bawah. Kode ini satu-satunya cara memantau laporanmu${payload.anonim ? ", karena laporan anonim tidak terhubung ke identitasmu" : ""}.</p>
            <div class="kode-box" style="margin:20px 0">${esc(kode)}</div>
            <div class="modal-actions"><button class="btn btn-primary" data-copy>${icon("copy")} Salin kode</button><a class="btn btn-ghost" href="#/pengaduan?cek=1&kode=${encodeURIComponent(kode)}" data-close>Cek status</a></div>`, { label: "Laporan terkirim" });
          d.querySelector("[data-copy]").onclick = () => (navigator.clipboard ? navigator.clipboard.writeText(kode) : Promise.reject()).then(() => FC.toast("Kode disalin."), () => FC.toast("Salin manual: " + kode));
        } catch (ex) { err.textContent = ex.message; }
      });
    };
  }

  /* =================================================================
     CARI TEMAN LOMBA
     ================================================================= */
  const SKIP_KEY = "fc_skip_tim";
  const getSkip = () => { try { return new Set(JSON.parse(sessionStorage.getItem(SKIP_KEY)) || []); } catch (e) { return new Set(); } };
  const setSkip = (s) => { try { sessionStorage.setItem(SKIP_KEY, JSON.stringify([...s])); } catch (e) {} };

  async function pageTeman(q) {
    const tab = q.get("tab") || "jelajah";
    app.innerHTML = `
      <section class="page-hero"><div class="wrap">
        <div class="crumbs"><a href="#/">Beranda</a><span>/</span><span>Cari Teman Lomba</span></div>
        <h1>Cari <em>Teman Lomba</em></h1>
        <p>Punya ide lomba tapi butuh anak departemen lain? Buat lowongan. Ingin ikut lomba tapi belum punya tim? Geser kartu ke kanan untuk mendaftar. Pendaftaranmu langsung masuk ke pembuat lowongan.</p>
      </div></section>
      <section class="section" style="padding-top:20px"><div class="wrap">
        <div class="tabs" role="tablist" aria-label="Menu teman lomba" style="margin-bottom:28px">
          <button class="tab" role="tab" data-tab="jelajah" aria-selected="${tab === "jelajah"}">${icon("cards")} Jelajahi</button>
          <button class="tab" role="tab" data-tab="buat" aria-selected="${tab === "buat"}">${icon("plus")} Buat Lowongan</button>
          <button class="tab" role="tab" data-tab="saya" aria-selected="${tab === "saya"}">Lowongan Saya <span class="count" id="cSaya">·</span></button>
          <button class="tab" role="tab" data-tab="lamaran" aria-selected="${tab === "lamaran"}">Lamaran Saya <span class="count" id="cLam">·</span></button>
        </div>
        <div id="tmBody">${loadingGrid(3)}</div>
      </div></section>`;
    $$("[data-tab]").forEach((b) => b.onclick = () => {
      const p = new URLSearchParams(); p.set("tab", b.dataset.tab);
      current = "#/teman?" + p.toString(); syncUrl(current, true);
      pageTeman(p);
    });
    const body = $("#tmBody");
    const [tim, masuk, saya] = await Promise.all([
      D.listTim().catch(() => []),
      state.user ? D.lamaranMasuk().catch(() => []) : [],
      state.user ? D.lamaranSaya().catch(() => []) : []
    ]);
    const mineTim = state.user ? tim.filter((t) => t.owner_id === state.user.id) : [];
    const pending = masuk.filter((l) => l.status === "menunggu").length;
    $("#cSaya").textContent = state.user ? (pending || mineTim.length) : "·";
    $("#cLam").textContent = state.user ? saya.length : "·";

    if (tab === "buat") return renderBuat(body, q, tim);
    if (tab === "saya") return renderSaya(body, mineTim, masuk);
    if (tab === "lamaran") return renderLamaran(body, saya, tim);
    renderJelajah(body, q, tim, saya);
  }

  function needLogin(body, msg) {
    body.innerHTML = `<div class="empty"><h3>Masuk dulu, ya</h3><p>${msg}</p><a class="btn btn-primary" style="margin-top:18px" href="#/masuk?next=${encodeURIComponent(current)}">Masuk / Daftar</a></div>`;
  }

  function renderJelajah(body, q, tim, saya) {
    const applied = new Set(saya.map((l) => l.tim_id));
    const f = { dept: "Semua", view: q.get("view") || "kartu", lomba: q.get("lomba") };
    const base = () => tim.filter((t) => t.status === "buka" && (!state.user || t.owner_id !== state.user.id))
      .filter((t) => f.dept === "Semua" || (t.butuh_departemen || []).includes(f.dept))
      .filter((t) => !f.lomba || String(t.info_id) === String(f.lomba));

    body.innerHTML = `
      <div class="toolbar">
        <div class="pills" role="group" aria-label="Departemen yang dibutuhkan">${["Semua"].concat(FC.DEPARTEMEN).map((d) => `<button class="pill" data-dept="${d}" aria-pressed="${d === "Semua"}">${d === "Semua" ? "Semua departemen" : "Butuh " + d}</button>`).join("")}</div>
        <div class="tabs" role="group" aria-label="Tampilan">
          <button class="tab" data-view="kartu" aria-selected="${f.view === "kartu"}">${icon("cards")} Kartu</button>
          <button class="tab" data-view="daftar" aria-selected="${f.view === "daftar"}">${icon("grid")} Daftar</button>
        </div>
      </div>
      ${f.lomba ? `<p class="muted" style="margin:-8px 0 20px;font-size:.88rem">Menampilkan tim untuk satu lomba tertentu. <a class="hl" href="#/teman">Tampilkan semua</a></p>` : ""}
      <div id="jlBody"></div>`;

    const draw = () => {
      const box = $("#jlBody");
      const list = base();
      if (f.view === "daftar") {
        box.innerHTML = list.length ? `<div class="grid-cards">${list.map((t) => `<div class="swipe-card" style="position:relative;min-height:400px">${cardInner(t, applied.has(t.id))}<button class="btn btn-primary btn-sm" data-apply="${t.id}" ${applied.has(t.id) ? "disabled" : ""}>${applied.has(t.id) ? "Sudah mendaftar" : "Daftar ke tim ini"}</button></div>`).join("")}</div>` : emptyTim();
        $$("[data-apply]", box).forEach((b) => b.onclick = () => applyFlow(tim.find((t) => t.id === b.dataset.apply), () => { applied.add(b.dataset.apply); draw(); }));
        return;
      }
      const skip = getSkip();
      const deck = list.filter((t) => !skip.has(t.id) && !applied.has(t.id));
      if (!deck.length) {
        box.innerHTML = list.length ? `<div class="empty"><h3>Semua kartu sudah kamu lihat</h3><p>Ulangi dari awal, atau buat lowonganmu sendiri.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px"><button class="btn btn-ghost" id="ulang">Ulangi kartu</button><a class="btn btn-primary" href="#/teman?tab=buat">Buat lowongan</a></div></div>` : emptyTim();
        const u = $("#ulang"); if (u) u.onclick = () => { setSkip(new Set()); draw(); };
        return;
      }
      const top3 = deck.slice(0, 3).reverse();
      box.innerHTML = `
        <div class="deck-wrap">
          <div class="deck" id="deck" tabindex="0" aria-label="Tumpukan kartu lowongan. Tekan panah kanan untuk mendaftar, panah kiri untuk melewati.">
            ${top3.map((t, i) => { const depth = top3.length - 1 - i; return `<article class="swipe-card" data-id="${t.id}" style="transform:translateY(${depth * 12}px) scale(${1 - depth * 0.04});opacity:${depth > 1 ? 0.6 : 1};z-index:${i}"><span class="stamp yes">DAFTAR</span><span class="stamp no">LEWATI</span>${cardInner(t)}</article>`; }).join("")}
          </div>
          <div class="deck-actions">
            <button class="round no" data-act="no" aria-label="Lewati">${icon("x")}</button>
            <button class="round info" data-act="info" aria-label="Lihat detail">${icon("info")}</button>
            <button class="round yes" data-act="yes" aria-label="Daftar ke tim ini">${icon("heart")}</button>
          </div>
          <p class="deck-hint">Geser kanan untuk mendaftar · geser kiri untuk melewati · ${deck.length} lowongan tersisa</p>
        </div>`;
      const topEl = $(".swipe-card:last-child", box);
      const topTim = deck[0];
      const fling = (dir) => {
        topEl.style.transition = "transform .35s ease, opacity .35s";
        topEl.style.transform = `translateX(${dir * 140}%) rotate(${dir * 24}deg)`; topEl.style.opacity = "0";
      };
      const back = () => { topEl.style.transition = ""; topEl.style.transform = ""; topEl.style.opacity = ""; $$(".stamp", topEl).forEach((s) => s.style.opacity = 0); };
      const no = () => { fling(-1); const s = getSkip(); s.add(topTim.id); setSkip(s); setTimeout(draw, 300); };
      const yes = () => { fling(1); setTimeout(() => applyFlow(topTim, () => { applied.add(topTim.id); draw(); }, () => back()), 250); };
      $("[data-act=no]", box).onclick = no;
      $("[data-act=yes]", box).onclick = yes;
      $("[data-act=info]", box).onclick = () => timDetail(topTim, applied.has(topTim.id), () => { applied.add(topTim.id); draw(); });
      $("#deck").onkeydown = (e) => { if (e.key === "ArrowLeft") no(); if (e.key === "ArrowRight") yes(); };
      dragify(topEl, { onYes: yes, onNo: no });
    };

    $$("[data-dept]").forEach((b) => b.onclick = () => { f.dept = b.dataset.dept; $$("[data-dept]").forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); });
    $$("[data-view]").forEach((b) => b.onclick = () => { f.view = b.dataset.view; $$("[data-view]").forEach((x) => x.setAttribute("aria-selected", x === b)); draw(); });
    draw();
    if (q.get("lihat")) { const t = tim.find((x) => x.id === q.get("lihat")); if (t) timDetail(t, applied.has(t.id), () => { applied.add(t.id); draw(); }); }
  }

  const emptyTim = () => `<div class="empty"><h3>Belum ada lowongan yang cocok</h3><p>Coba filter lain, atau buat lowongan untuk lombamu sendiri.</p><a class="btn btn-primary" style="margin-top:18px" href="#/teman?tab=buat">Buat lowongan</a></div>`;

  const cardInner = (t, applied) => {
    const left = Math.max(0, (t.slot || 1) - (t.jumlah_diterima || 0));
    return `
      <div class="who"><span class="avatar" aria-hidden="true">${esc(FC.initials(t.owner_nama))}</span><div><b>${esc(t.owner_nama || "Mahasiswa FMIPA")}</b><small>${esc(t.owner_departemen || "")}${t.owner_angkatan ? " · " + esc(t.owner_angkatan) : ""}</small></div>${applied ? '<span class="chip ok" style="margin-left:auto">Terdaftar</span>' : ""}</div>
      <h3>${esc(t.judul)}</h3>
      <p class="lomba">${icon("trophy")} <span>${esc(t.nama_lomba)}${t.tingkat ? " · " + esc(t.tingkat) : ""}</span></p>
      <p class="desc">${esc(t.deskripsi || "")}</p>
      <div class="need"><small>Butuh departemen</small><div class="chips">${(t.butuh_departemen || []).map((d) => `<span class="chip">${esc(d)}</span>`).join("") || '<span class="chip gray">Bebas</span>'}</div></div>
      <div class="need"><small>Peran</small><div class="chips">${(t.butuh_peran || []).map((p) => `<span class="chip gray">${esc(p)}</span>`).join("") || '<span class="chip gray">Bebas</span>'}</div></div>
      <div class="foot"><span style="display:flex;gap:8px;align-items:center">Sisa slot ${left}/${t.slot || 1} <span class="slot-bar">${Array.from({ length: t.slot || 1 }, (_, i) => `<i class="${i < (t.jumlah_diterima || 0) ? "" : "on"}"></i>`).join("")}</span></span>${FC.deadlineChip(t.deadline)}</div>`;
  };

  function dragify(el, { onYes, onNo }) {
    let sx = 0, sy = 0, dx = 0, active = false, id = null;
    const yes = $(".stamp.yes", el), no = $(".stamp.no", el);
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return; active = true; id = e.pointerId; sx = e.clientX; sy = e.clientY; dx = 0;
      el.setPointerCapture(id); el.classList.add("dragging");
    });
    el.addEventListener("pointermove", (e) => {
      if (!active) return; dx = e.clientX - sx; const dy = (e.clientY - sy) * 0.3;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 18}deg)`;
      yes.style.opacity = Math.max(0, Math.min(1, dx / 100)); no.style.opacity = Math.max(0, Math.min(1, -dx / 100));
    });
    const end = () => {
      if (!active) return; active = false; el.classList.remove("dragging");
      if (dx > 110) onYes(); else if (dx < -110) onNo();
      else { el.style.transform = ""; yes.style.opacity = 0; no.style.opacity = 0; }
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }

  function timDetail(t, applied, onDone) {
    const d = FC.openModal(`<div class="swipe-card" style="box-shadow:none;border:0;padding:0;background:none">${cardInner(t, applied)}</div>
      <p class="prose" style="margin-top:16px">${esc(t.deskripsi || "")}</p>
      <div class="modal-actions">${applied ? '<span class="chip ok">Kamu sudah mendaftar</span>' : (state.user && t.owner_id === state.user.id ? '<a class="btn btn-ghost" href="#/teman?tab=saya" data-close>Kelola lowongan ini</a>' : `<button class="btn btn-primary" data-apply>${icon("heart")} Daftar ke tim ini</button>`)}
      ${t.info_id ? `<a class="btn btn-ghost" href="#/lomba?id=${t.info_id}" data-close>Lihat info lomba</a>` : ""}</div>`, { label: t.judul });
    const b = d.querySelector("[data-apply]"); if (b) b.onclick = () => applyFlow(t, onDone);
  }

  function applyFlow(t, onDone, onCancel) {
    if (!state.user) {
      const d = FC.openModal(`<h2>Masuk untuk mendaftar</h2><p class="lede">Pembuat lowongan perlu tahu siapa kamu dan cara menghubungimu, jadi pendaftaran memerlukan akun.</p><div class="modal-actions"><a class="btn btn-primary" href="#/masuk?next=${encodeURIComponent("#/teman?lihat=" + t.id)}" data-close>Masuk / Daftar</a><button class="btn btn-ghost" data-close>Nanti saja</button></div>`);
      d.closest(".modal").addEventListener("click", (e) => { if (e.target.closest("[data-close]") && onCancel) onCancel(); });
      return;
    }
    const p = state.profile || {};
    if (!p.nama || !p.whatsapp || !p.departemen) {
      FC.openModal(`<h2>Lengkapi profil dulu</h2><p class="lede">Nama, departemen, dan nomor WhatsApp dibutuhkan supaya pembuat lowongan bisa menghubungimu.</p><div class="modal-actions"><a class="btn btn-primary" href="#/profil?next=${encodeURIComponent("#/teman?lihat=" + t.id)}" data-close>Lengkapi profil</a></div>`);
      if (onCancel) onCancel(); return;
    }
    let done = false;
    const d = FC.openModal(`
      <span class="eyebrow">Daftar ke tim</span>
      <h2 style="margin:12px 0 4px">${esc(t.judul)}</h2>
      <p class="lede">${esc(t.nama_lomba)} · dibuat oleh ${esc(t.owner_nama || "")}</p>
      <form id="applyForm" class="form-grid" style="margin-top:20px">
        <div class="field"><label for="ap-peran">Peran yang kamu ambil <span class="req">*</span></label><select id="ap-peran" name="peran" required><option value="">Pilih peran</option>${(t.butuh_peran && t.butuh_peran.length ? t.butuh_peran : FC.PERAN).map((r) => `<option>${esc(r)}</option>`).join("")}<option>Lainnya</option></select></div>
        <div class="field"><label for="ap-pesan">Kenapa kamu cocok? <span class="req">*</span></label><textarea id="ap-pesan" name="pesan" required minlength="15" placeholder="Ceritakan pengalaman, keahlian, atau ide yang bisa kamu bawa."></textarea></div>
        <div class="field"><label for="ap-link">Tautan portofolio / CV (opsional)</label><input id="ap-link" type="url" name="link_portofolio" placeholder="https://…"></div>
        <div class="value"><small>Data yang akan dilihat pembuat lowongan</small><p style="margin-top:4px;font-size:.9rem">${esc(p.nama)} · ${esc(p.departemen)}${p.angkatan ? " " + esc(p.angkatan) : ""} · WA ${esc(p.whatsapp)}</p></div>
        <p class="error-text" id="apErr" role="alert"></p>
        <button class="btn btn-primary btn-lg">Kirim pendaftaran</button>
      </form>`, { label: "Daftar ke tim" });
    d.closest(".modal").addEventListener("click", (e) => { if (e.target.closest("[data-close]") && !done && onCancel) onCancel(); });
    const form = d.querySelector("#applyForm");
    form.onsubmit = async (e) => {
      e.preventDefault(); const err = form.querySelector("#apErr"); err.textContent = "";
      if (!form.checkValidity()) { err.textContent = "Pilih peran dan tulis pesan minimal 15 karakter."; return; }
      const v = FC.formData(form);
      await FC.busy(form.querySelector("button"), async () => {
        try { await D.daftarTim(t.id, v); done = true; FC.closeModal(); FC.toast("Pendaftaran terkirim ke " + String(t.owner_nama || "pembuat lowongan").replace(/^Contoh:\s*/, "").replace(/\.$/, "") + "."); onDone && onDone(); const c = $("#cLam"); if (c && !isNaN(+c.textContent)) c.textContent = +c.textContent + 1; }
        catch (ex) { err.textContent = ex.message; }
      });
    };
  }

  async function renderBuat(body, q, tim) {
    if (!state.user) return needLogin(body, "Untuk membuat lowongan tim, kamu perlu akun supaya pendaftar bisa masuk ke kamu.");
    const p = state.profile || {};
    if (!p.nama || !p.departemen) { body.innerHTML = `<div class="empty"><h3>Lengkapi profil dulu</h3><p>Nama dan departemen ditampilkan di kartu lowonganmu.</p><a class="btn btn-primary" style="margin-top:18px" href="#/profil?next=${encodeURIComponent("#/teman?tab=buat")}">Lengkapi profil</a></div>`; return; }
    const edit = q.get("edit") ? tim.find((t) => t.id === q.get("edit")) : null;
    const lomba = (await D.listInfo("lomba").catch(() => [])).filter((x) => { const n = FC.daysLeft(x.deadline); return n === null || n >= 0; });
    const pre = edit || {};
    const fromInfo = q.get("info") ? lomba.find((x) => String(x.id) === q.get("info")) : null;
    if (fromInfo && !edit) Object.assign(pre, { nama_lomba: fromInfo.judul, info_id: fromInfo.id, kategori: fromInfo.kategori, tingkat: fromInfo.tingkat, deadline: fromInfo.deadline });
    const has = (arr, v) => (arr || []).includes(v);
    body.innerHTML = `
      <div class="about-grid" style="align-items:start">
        <form class="form-card" id="timForm" novalidate>
          <div class="form-grid two">
            <h2 class="form-section-title span-2">${edit ? "Ubah lowongan" : "Buat lowongan tim"}</h2>
            <div class="field span-2"><label for="t-judul">Judul lowongan <span class="req">*</span></label><input id="t-judul" name="judul" required maxlength="90" placeholder="Contoh: Cari 2 anak Kimia untuk LKTI energi terbarukan" value="${esc(pre.judul || "")}"></div>
            <div class="field span-2"><label for="t-lomba">Nama lomba <span class="req">*</span></label><input id="t-lomba" name="nama_lomba" required list="lombaList" placeholder="Ketik atau pilih dari Info Lomba" value="${esc(pre.nama_lomba || "")}"><datalist id="lombaList">${lomba.map((x) => `<option value="${esc(x.judul)}">`).join("")}</datalist><span class="hint">Memilih dari daftar akan otomatis menautkan info lombanya.</span></div>
            <div class="field"><label for="t-kat">Kategori</label><select id="t-kat" name="kategori"><option value="">Pilih</option>${FC.KATEGORI.lomba.map((k) => `<option ${pre.kategori === k ? "selected" : ""}>${k}</option>`).join("")}</select></div>
            <div class="field"><label for="t-tingkat">Tingkat</label><select id="t-tingkat" name="tingkat"><option value="">Pilih</option>${FC.TINGKAT.map((k) => `<option ${pre.tingkat === k ? "selected" : ""}>${k}</option>`).join("")}</select></div>
            <div class="field"><label for="t-dl">Tenggat cari anggota</label><input type="date" id="t-dl" name="deadline" value="${esc(pre.deadline || "")}"></div>
            <div class="field"><label for="t-slot">Jumlah anggota dicari <span class="req">*</span></label><input type="number" id="t-slot" name="slot" min="1" max="10" required value="${esc(pre.slot || 1)}"></div>
            <div class="field span-2"><span class="label">Butuh departemen</span><div class="check-grid">${FC.DEPARTEMEN.map((d) => `<label class="check-pill"><input type="checkbox" name="butuh_departemen" value="${d}" data-multi ${has(pre.butuh_departemen, d) ? "checked" : ""}><span>${d}</span></label>`).join("")}</div></div>
            <div class="field span-2"><span class="label">Peran yang dibutuhkan</span><div class="check-grid">${FC.PERAN.map((d) => `<label class="check-pill"><input type="checkbox" name="butuh_peran" value="${d}" data-multi ${has(pre.butuh_peran, d) ? "checked" : ""}><span>${d}</span></label>`).join("")}</div></div>
            <div class="field span-2"><label for="t-desk">Deskripsi <span class="req">*</span></label><textarea id="t-desk" name="deskripsi" required minlength="20" placeholder="Ide lomba, progres saat ini, kriteria anggota yang dicari, dan rencana jadwal latihan.">${esc(pre.deskripsi || "")}</textarea></div>
            <p class="error-text span-2" id="tErr" role="alert"></p>
            <div class="span-2" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary btn-lg">${edit ? "Simpan perubahan" : "Terbitkan lowongan"}</button>${edit ? '<a class="btn btn-ghost btn-lg" href="#/teman?tab=saya">Batal</a>' : ""}</div>
          </div>
        </form>
        <div class="form-card" style="position:sticky;top:calc(var(--header-h) + 20px)">
          <span class="eyebrow">Pratinjau kartu</span>
          <div class="swipe-card" id="preview" style="margin-top:16px;min-height:420px;position:relative"></div>
        </div>
      </div>`;
    const form = $("#timForm");
    const val = () => { const v = FC.formData(form); v.slot = Math.max(1, Math.min(10, parseInt(v.slot, 10) || 1)); const m = lomba.find((x) => x.judul === v.nama_lomba); v.info_id = m ? m.id : (edit && edit.nama_lomba === v.nama_lomba ? edit.info_id : null); return v; };
    const prev = () => { const v = val(); $("#preview").innerHTML = cardInner(Object.assign({ owner_nama: p.nama, owner_departemen: p.departemen, owner_angkatan: p.angkatan, jumlah_diterima: edit ? edit.jumlah_diterima : 0 }, v, { judul: v.judul || "Judul lowonganmu", nama_lomba: v.nama_lomba || "Nama lomba", deskripsi: v.deskripsi || "Deskripsi singkat tim dan ide lombamu akan tampil di sini." })); };
    form.addEventListener("input", prev); form.addEventListener("change", (e) => {
      if (e.target.name === "nama_lomba") { const m = lomba.find((x) => x.judul === e.target.value); if (m) { if (m.kategori) form.kategori.value = m.kategori; if (m.tingkat) form.tingkat.value = m.tingkat; if (m.deadline && !form.deadline.value) form.deadline.value = m.deadline; } }
      prev();
    });
    prev();
    form.onsubmit = async (e) => {
      e.preventDefault(); const err = $("#tErr"); err.textContent = "";
      if (!form.checkValidity()) { err.textContent = "Lengkapi judul, nama lomba, jumlah anggota, dan deskripsi (minimal 20 karakter)."; const b = form.querySelector(":invalid"); b && b.focus(); return; }
      const v = val(); if (edit) v.id = edit.id;
      await FC.busy(form.querySelector("button.btn-primary"), async () => {
        try { await D.saveTim(v); FC.toast(edit ? "Lowongan diperbarui." : "Lowongan terbit! Pendaftar akan muncul di Lowongan Saya."); go("#/teman?tab=saya"); }
        catch (ex) { err.textContent = ex.message; }
      });
    };
  }

  function renderSaya(body, mine, masuk) {
    if (!state.user) return needLogin(body, "Masuk untuk melihat lowongan yang kamu buat dan siapa saja yang mendaftar.");
    if (!mine.length) { body.innerHTML = `<div class="empty"><h3>Kamu belum membuat lowongan</h3><p>Buat lowongan dan biarkan teman dari departemen lain menemukanmu.</p><a class="btn btn-primary" style="margin-top:18px" href="#/teman?tab=buat">Buat lowongan</a></div>`; return; }
    const ST = { menunggu: '<span class="chip warn">Menunggu</span>', diterima: '<span class="chip ok">Diterima</span>', ditolak: '<span class="chip gray">Ditolak</span>' };
    body.innerHTML = `<div class="team-list">${mine.map((t) => {
      const ls = masuk.filter((l) => l.tim_id === t.id);
      return `<article class="team-row">
        <div class="team-row-head">
          <div><h3>${esc(t.judul)}</h3><p class="muted" style="font-size:.86rem">${esc(t.nama_lomba)} · ${t.jumlah_diterima || 0}/${t.slot} diterima · ${ls.length} pendaftar</p></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            ${t.status === "buka" ? '<span class="chip ok">Dibuka</span>' : '<span class="chip gray">Ditutup</span>'}
            <button class="btn btn-ghost btn-sm" data-toggle="${t.id}">${t.status === "buka" ? "Tutup" : "Buka lagi"}</button>
            <a class="btn btn-ghost btn-sm" href="#/teman?tab=buat&edit=${t.id}">${icon("edit")} Ubah</a>
            <button class="btn btn-danger btn-sm" data-del="${t.id}" aria-label="Hapus lowongan">${icon("trash")}</button>
          </div>
        </div>
        ${ls.length ? ls.map((l) => `
          <div class="applicant">
            <div class="applicant-head">
              <div style="display:flex;gap:10px;align-items:center"><span class="avatar" aria-hidden="true">${esc(FC.initials(l.nama))}</span><div><b>${esc(l.nama || "Mahasiswa")}</b><br><small class="muted">${esc(l.departemen || "")}${l.angkatan ? " · " + esc(l.angkatan) : ""} · ingin jadi <b style="color:var(--text)">${esc(l.peran || "-")}</b></small></div></div>
              ${ST[l.status]}
            </div>
            <p style="font-size:.9rem;color:var(--muted)">${esc(l.pesan || "")}</p>
            ${FC.safeUrl(l.link_portofolio) ? `<a class="hl" style="font-size:.86rem" href="${esc(FC.safeUrl(l.link_portofolio))}" target="_blank" rel="noopener">${icon("link", "")} Portofolio / CV</a>` : ""}
            <div class="actions">
              ${l.status !== "diterima" ? `<button class="btn btn-primary btn-sm" data-st="diterima" data-l="${l.id}">${icon("check")} Terima</button>` : ""}
              ${l.status !== "ditolak" ? `<button class="btn btn-ghost btn-sm" data-st="ditolak" data-l="${l.id}">Tolak</button>` : ""}
              ${l.status === "diterima" && waLink(l.whatsapp) ? `<a class="btn btn-outline-lime btn-sm" target="_blank" rel="noopener" href="${waLink(l.whatsapp)}?text=${encodeURIComponent("Halo " + (l.nama || "") + ", saya " + (state.profile.nama || "") + " dari FMIPA Connect. Kamu diterima di tim \"" + t.judul + "\"!")}">${icon("phone")} Hubungi via WhatsApp</a>` : ""}
            </div>
          </div>`).join("") : '<p class="muted" style="font-size:.88rem">Belum ada pendaftar. Bagikan lowonganmu ke grup angkatan.</p>'}
        <button class="btn btn-ghost btn-sm" style="justify-self:start" data-share="${t.id}">${icon("link")} Salin tautan lowongan</button>
      </article>`; }).join("")}</div>`;
    const reload = () => pageTeman(new URLSearchParams("tab=saya"));
    $$("[data-st]", body).forEach((b) => b.onclick = () => FC.busy(b, async () => { try { await D.setStatusLamaran(b.dataset.l, b.dataset.st); FC.toast(b.dataset.st === "diterima" ? "Pendaftar diterima. Hubungi lewat WhatsApp." : "Pendaftar ditolak."); reload(); } catch (e) { FC.toast(e.message, "err"); } }));
    $$("[data-toggle]", body).forEach((b) => b.onclick = () => FC.busy(b, async () => { const t = mine.find((x) => x.id === b.dataset.toggle); try { await D.saveTim({ id: t.id, status: t.status === "buka" ? "tutup" : "buka" }); reload(); } catch (e) { FC.toast(e.message, "err"); } }));
    $$("[data-del]", body).forEach((b) => b.onclick = async () => { if (await FC.confirm("Hapus lowongan?", "Lowongan dan semua data pendaftarnya akan dihapus permanen.", "Hapus")) { try { await D.deleteTim(b.dataset.del); FC.toast("Lowongan dihapus."); reload(); } catch (e) { FC.toast(e.message, "err"); } } });
    $$("[data-share]", body).forEach((b) => b.onclick = () => { const url = location.href.split("#")[0] + "#/teman?lihat=" + b.dataset.share; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => FC.toast("Tautan disalin."), () => FC.toast(url)); });
  }

  function renderLamaran(body, saya, tim) {
    if (!state.user) return needLogin(body, "Masuk untuk melihat status pendaftaranmu ke tim lain.");
    if (!saya.length) { body.innerHTML = `<div class="empty"><h3>Belum ada lamaran</h3><p>Jelajahi kartu lowongan dan geser ke kanan pada tim yang cocok.</p><a class="btn btn-primary" style="margin-top:18px" href="#/teman">Jelajahi lowongan</a></div>`; return; }
    const ST = { menunggu: ['warn', "Menunggu keputusan"], diterima: ['ok', "Diterima"], ditolak: ['gray', "Belum cocok"] };
    body.innerHTML = `<div class="team-list">${saya.map((l) => { const t = tim.find((x) => x.id === l.tim_id) || {}; const [c, s] = ST[l.status]; return `
      <article class="team-row">
        <div class="team-row-head"><div><h3>${esc(t.judul || "Lowongan dihapus")}</h3><p class="muted" style="font-size:.86rem">${esc(t.nama_lomba || "")} · oleh ${esc(t.owner_nama || "-")} · peran: ${esc(l.peran || "-")}</p></div><span class="chip ${c}">${s}</span></div>
        <p style="font-size:.9rem;color:var(--muted)">${l.status === "diterima" ? "Selamat! Pembuat lowongan akan menghubungimu lewat WhatsApp yang ada di profilmu." : l.status === "ditolak" ? "Masih banyak tim lain yang mencari anggota. Coba daftar ke tim lainnya." : "Pendaftaranmu sudah masuk ke pembuat lowongan."}</p>
        ${l.status === "menunggu" ? `<button class="btn btn-ghost btn-sm" style="justify-self:start" data-cancel="${l.id}">Batalkan pendaftaran</button>` : ""}
      </article>`; }).join("")}</div>`;
    $$("[data-cancel]", body).forEach((b) => b.onclick = async () => { if (await FC.confirm("Batalkan pendaftaran?", "Pendaftaranmu akan ditarik dari lowongan ini.", "Batalkan")) { try { await D.batalkanLamaran(b.dataset.cancel); FC.toast("Pendaftaran dibatalkan."); pageTeman(new URLSearchParams("tab=lamaran")); } catch (e) { FC.toast(e.message, "err"); } } });
  }

  /* =================================================================
     MASUK / DAFTAR & PROFIL
     ================================================================= */
  function profileFields(p) {
    p = p || {};
    return `
      <div class="field"><label for="pf-nama">Nama lengkap <span class="req">*</span></label><input id="pf-nama" name="nama" required value="${esc(p.nama || "")}" autocomplete="name"></div>
      <div class="field"><label for="pf-nim">NIM</label><input id="pf-nim" name="nim" inputmode="numeric" value="${esc(p.nim || "")}"></div>
      <div class="field"><label for="pf-dept">Departemen <span class="req">*</span></label><select id="pf-dept" name="departemen" required><option value="">Pilih</option>${FC.DEPARTEMEN.map((d) => `<option ${p.departemen === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
      <div class="field"><label for="pf-prodi">Program studi</label><input id="pf-prodi" name="prodi" placeholder="Contoh: S1 Pendidikan Kimia" value="${esc(p.prodi || "")}"></div>
      <div class="field"><label for="pf-akt">Angkatan</label><input id="pf-akt" name="angkatan" inputmode="numeric" maxlength="4" placeholder="2024" value="${esc(p.angkatan || "")}"></div>
      <div class="field"><label for="pf-wa">Nomor WhatsApp <span class="req">*</span></label><input id="pf-wa" name="whatsapp" type="tel" required placeholder="08xxxxxxxxxx" value="${esc(p.whatsapp || "")}" autocomplete="tel"><span class="hint">Hanya terlihat oleh pembuat lowongan yang kamu daftari.</span></div>`;
  }
  const cleanProfile = (v) => ({ nama: v.nama, nim: v.nim || null, departemen: v.departemen, prodi: v.prodi || null, angkatan: v.angkatan ? parseInt(v.angkatan, 10) || null : null, whatsapp: v.whatsapp, bio: v.bio || null });

  function pageMasuk(q) {
    const next = q.get("next") || "#/teman";
    if (state.user) { go(next); return; }
    let mode = q.get("mode") || "masuk";
    const dom = (CFG.EMAIL_DOMAIN_KAMPUS || "").trim();
    app.innerHTML = `
      <section class="page-hero" style="padding-bottom:10px"><div class="wrap"><div class="crumbs"><a href="#/">Beranda</a><span>/</span><span>Akun</span></div></div></section>
      <section class="section" style="padding-top:10px"><div class="wrap auth-wrap">
        <div class="auth-aside">
          <span class="eyebrow">Akun mahasiswa</span>
          <h2>Satu akun untuk <em class="hl">semua layanan</em>.</h2>
          <p class="muted">Akun dibutuhkan untuk membuat lowongan tim dan mendaftar ke tim lain. Info lomba dan kanal pengaduan tetap bisa dipakai tanpa akun.</p>
          <ul><li>Buat lowongan dan terima pendaftar</li><li>Daftar ke tim dengan sekali geser</li><li>Pantau status lamaranmu</li></ul>
          ${isDemo() ? `<div class="demo-accounts"><b style="color:var(--warn)">Mode demo.</b> Coba akun contoh: <code>nadia@demo.id</code> / <code>demo123</code>, atau admin <code>admin@demo.id</code> / <code>admin123</code>. Bisa juga daftar akun baru.</div>` : ""}
        </div>
        <div class="form-card">
          <div class="tabs" role="tablist" style="margin-bottom:22px"><button class="tab" role="tab" data-m="masuk">Masuk</button><button class="tab" role="tab" data-m="daftar">Daftar</button></div>
          <form id="authForm" novalidate></form>
        </div>
      </div></section>`;
    const form = $("#authForm");
    const draw = () => {
      $$("[data-m]").forEach((b) => b.setAttribute("aria-selected", b.dataset.m === mode));
      form.innerHTML = `<div class="form-grid ${mode === "daftar" ? "two" : ""}">
        <div class="field ${mode === "daftar" ? "span-2" : ""}"><label for="au-email">Email ${dom ? "kampus" : ""} <span class="req">*</span></label><input id="au-email" type="email" name="email" required autocomplete="email" placeholder="${dom ? "nama@students." + esc(dom) : "nama@email.com"}"></div>
        <div class="field ${mode === "daftar" ? "span-2" : ""}"><label for="au-pw">Kata sandi <span class="req">*</span></label><input id="au-pw" type="password" name="password" required minlength="6" autocomplete="${mode === "daftar" ? "new-password" : "current-password"}"><span class="hint">${mode === "daftar" ? "Minimal 6 karakter." : ""}</span></div>
        ${mode === "daftar" ? profileFields() : ""}
        <p class="error-text ${mode === "daftar" ? "span-2" : ""}" id="auErr" role="alert"></p>
        <div class="${mode === "daftar" ? "span-2" : ""}"><button class="btn btn-primary btn-block btn-lg">${mode === "daftar" ? "Buat akun" : "Masuk"}</button></div>
      </div>`;
    };
    $$("[data-m]").forEach((b) => b.onclick = () => { mode = b.dataset.m; draw(); });
    draw();
    form.onsubmit = async (e) => {
      e.preventDefault(); const err = $("#auErr"); err.textContent = "";
      if (!form.checkValidity()) { err.textContent = "Lengkapi kolom bertanda * dengan benar."; const b = form.querySelector(":invalid"); b && b.focus(); return; }
      const v = FC.formData(form);
      if (mode === "daftar" && dom && !new RegExp("@(students\\.)?" + dom.replace(/\./g, "\\.") + "$", "i").test(v.email)) { err.textContent = "Gunakan email kampus (@" + dom + " atau @students." + dom + ")."; return; }
      await FC.busy(form.querySelector("button"), async () => {
        try {
          if (mode === "masuk") { await D.signIn(v.email, v.password); }
          else {
            const r = await D.signUp(v.email, v.password, cleanProfile(v));
            if (r.needsConfirm) { form.innerHTML = `<div class="empty" style="border:0"><h3>Cek emailmu</h3><p>Kami mengirim tautan konfirmasi ke <b>${esc(v.email)}</b>. Klik tautannya, lalu masuk di sini.</p></div>`; return; }
          }
          await refreshAuth(); FC.toast("Selamat datang" + (state.profile && state.profile.nama ? ", " + state.profile.nama.replace(/^Contoh:\s*/, "") : "") + "!");
          go(next);
        } catch (ex) { err.textContent = ex.message; }
      });
    };
  }

  async function pageProfil(q) {
    if (!state.user) { go("#/masuk?next=" + encodeURIComponent("#/profil")); return; }
    const p = state.profile || {};
    app.innerHTML = `
      <section class="page-hero"><div class="wrap"><div class="crumbs"><a href="#/">Beranda</a><span>/</span><span>Profil</span></div><h1>Profil <em>saya</em></h1><p>${esc(state.user.email)}</p></div></section>
      <section class="section" style="padding-top:10px"><div class="wrap" style="max-width:760px">
        <form class="form-card" id="pfForm" novalidate><div class="form-grid two">
          ${profileFields(p)}
          <div class="field span-2"><label for="pf-bio">Bio singkat</label><textarea id="pf-bio" name="bio" style="min-height:90px" placeholder="Minat riset, pengalaman lomba, keahlian.">${esc(p.bio || "")}</textarea></div>
          <p class="error-text span-2" id="pfErr" role="alert"></p>
          <div class="span-2" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary btn-lg">Simpan profil</button><button type="button" class="btn btn-ghost btn-lg" data-logout2>${icon("out")} Keluar</button></div>
        </div></form>
      </div></section>`;
    const form = $("#pfForm");
    $("[data-logout2]").onclick = async () => { await D.signOut(); await refreshAuth(); go("#/"); };
    form.onsubmit = async (e) => {
      e.preventDefault(); const err = $("#pfErr"); err.textContent = "";
      if (!form.checkValidity()) { err.textContent = "Lengkapi nama, departemen, dan WhatsApp."; return; }
      await FC.busy(form.querySelector("button"), async () => {
        try { await D.saveProfile(cleanProfile(FC.formData(form))); await refreshAuth(); FC.toast("Profil tersimpan."); if (q.get("next")) go(q.get("next")); }
        catch (ex) { err.textContent = ex.message; }
      });
    };
  }

  /* =================================================================
     ROUTER & KERANGKA
     ================================================================= */
  async function render() {
    const { path, q } = route();
    FC.closeModal();
    closeMobile();
    setActiveNav(path);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    const titles = { "/": "", "/about": "About", "/departemen": "Departemen", "/lomba": "Info Lomba", "/beasiswa": "Info Beasiswa", "/pelatihan": "Info Pelatihan", "/pengaduan": "Kanal Pengaduan", "/teman": "Cari Teman Lomba", "/masuk": "Masuk", "/profil": "Profil" };
    document.title = path === "/" ? `${(window.FC_ORG || {}).organisasi || "BEM FMIPA UM"} · Kabinet ${(window.FC_ORG || {}).kabinet || ""}` : (titles[path] ? titles[path] + " · " : "") + "FMIPA Connect";
    try {
      if (path === "/") await pageHome();
      else if (path === "/about") pageAbout();
      else if (path === "/departemen") pageDepartemen(q);
      else if (["/lomba", "/beasiswa", "/pelatihan"].includes(path)) await pageInfo(path.slice(1), q);
      else if (path === "/pengaduan") pagePengaduan(q);
      else if (path === "/teman") await pageTeman(q);
      else if (path === "/masuk") pageMasuk(q);
      else if (path === "/profil") await pageProfil(q);
      else app.innerHTML = `<section class="page-hero"><div class="wrap"><h1>Halaman <em>tidak ditemukan</em></h1><p><a class="btn btn-primary" style="margin-top:20px" href="#/">Kembali ke beranda</a></p></div></section>`;
    } catch (e) {
      console.error(e);
      app.innerHTML = `<section class="page-hero"><div class="wrap"><h1>Terjadi <em>kendala</em></h1><p>${esc(e.message)}</p></div></section>`;
    }
    afterRender();
  }

  function closeMobile() { const m = $("#mobileNav"), b = $(".burger"); m.classList.remove("open"); b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Buka menu"); document.body.classList.remove("no-scroll"); }

  function chrome() {
    const hdr = $(".site-header"), top = $(".to-top");
    const onScroll = () => { hdr.classList.toggle("solid", scrollY > 20); top.classList.toggle("show", scrollY > 600); };
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
    top.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
    $(".burger").onclick = () => {
      const m = $("#mobileNav"), b = $(".burger"), open = !m.classList.contains("open");
      m.classList.toggle("open", open); b.setAttribute("aria-expanded", open); b.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
      document.body.classList.toggle("no-scroll", open);
    };
    document.addEventListener("click", (e) => { const dd = $("#userDd"); if (dd && !dd.contains(e.target)) dd.classList.remove("open"); });
    $$("[data-cfg]").forEach((el) => el.textContent = CFG[el.dataset.cfg] || "");
    $("#yr").textContent = new Date().getFullYear();
    const K = CFG.KONTAK || {};
    const li = (ic, txt, href) => `<li style="display:flex;gap:10px;align-items:flex-start">${icon(ic)}<span>${href ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(txt)}</a>` : esc(txt)}</span></li>`;
    const ok = (v) => v && !String(v).startsWith("[");
    $("#footerContact").innerHTML = [
      ok(K.whatsapp) ? li("phone", K.whatsapp, FC.safeUrl(K.whatsapp_link)) : "", ok(K.email) ? li("mail", K.email, "mailto:" + K.email) : "",
      ok(K.instagram) ? li("camera", K.instagram, FC.safeUrl(K.instagram_link)) : "", ok(K.alamat) ? li("pin", K.alamat, FC.safeUrl(K.maps_link)) : ""
    ].join("");
    $$("#footerContact svg").forEach((s) => { s.setAttribute("width", 18); s.setAttribute("height", 18); s.style.flexShrink = 0; s.style.marginTop = "3px"; s.style.color = "var(--lime)"; });
    if (CFG.LOGO_UM_URL) $$(".brand").forEach((b) => b.insertAdjacentHTML("afterbegin", `<img class="um-logo" src="${esc(CFG.LOGO_UM_URL)}" alt="Logo Universitas Negeri Malang">`));
  }

  function preloader(ready) {
    const el = $(".preloader"), bar = $(".pl-bar i"), num = $(".pl-num");
    let shown = false; try { shown = sessionStorage.getItem("fc_pl") === "1"; } catch (e) {}
    if (shown || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.remove(); return Promise.resolve(); }
    try { sessionStorage.setItem("fc_pl", "1"); } catch (e) {}
    return new Promise((res) => {
      let p = 0, done = false; ready.then(() => done = true);
      const t = setInterval(() => {
        p = Math.min(done ? 100 : 90, p + (done ? 9 : 4));
        bar.style.width = p + "%"; num.textContent = p + "%";
        if (p >= 100) { clearInterval(t); setTimeout(() => { el.classList.add("done"); setTimeout(() => el.remove(), 700); res(); }, 200); }
      }, 40);
    });
  }

  function demoBanner() {
    if (!isDemo()) return;
    const b = document.createElement("div"); b.className = "demo-banner";
    let hide = false; try { hide = sessionStorage.getItem("fc_hide_demo") === "1"; } catch (e) {}
    if (hide) return;
    b.innerHTML = `<span>Mode demo: data contoh, tersimpan di browser ini.</span><button type="button" data-r>Reset</button><button type="button" data-x aria-label="Sembunyikan">✕</button>`;
    b.querySelector("[data-x]").onclick = () => { b.remove(); try { sessionStorage.setItem("fc_hide_demo", "1"); } catch (e) {} };
    b.querySelector("[data-r]").onclick = async () => { if (await FC.confirm("Reset data demo?", "Semua data contoh di browser ini dikembalikan ke awal.", "Reset")) { D.reset(); try { sessionStorage.removeItem(SKIP_KEY); } catch (e) {} await refreshAuth(); render(); FC.toast("Data demo direset."); } };
    document.body.appendChild(b);
    if (FC.dataError) FC.toast("Gagal tersambung ke Supabase: " + FC.dataError + ". Memakai mode demo.", "err");
  }

  (async function start() {
    chrome();
    const ready = FC.ready.then(async (d) => { D = d; await refreshAuth(); });
    await preloader(ready);
    await ready;
    demoBanner();
    D.onAuth(async () => { await refreshAuth(); });
    const fromUrl = () => { if (/^#\//.test(location.hash) && location.hash !== current) { current = location.hash; render(); } };
    addEventListener("hashchange", fromUrl);
    addEventListener("popstate", fromUrl);
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#/"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      e.preventDefault(); go(a.getAttribute("href"));
    });
    render();
  })();
})();
