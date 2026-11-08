/* FMIPA Connect — alat bantu tampilan (dipakai halaman utama & admin) */
(function () {
  const FC = (window.FC = window.FC || {});

  const P = {
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/><path d="M9 7h6"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3Z"/><path d="M9 12l2 2 4-4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.4 3.4-5.5 6.5-5.5s5.7 2.1 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.3.2 4 1.9 4.5 4.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mega: '<path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    camera: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
    out: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    heart: '<path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.3 4 4 7.3 4c2 0 3.5 1.1 4.7 2.7C13.2 5.1 14.7 4 16.7 4 20 4 22.4 7.3 21.2 10.7 19.5 15.4 12 20 12 20Z"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/><path d="M6 6l9-3 1 3"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
    grid: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
    cards: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M2 7v10M22 7v10"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M13 7l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    play: '<path d="M8 5l11 7-11 7V5Z" fill="currentColor"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };
  FC.icon = (name, cls) => `<svg class="${cls || ""}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;

  const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  FC.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ESC[c]);
  FC.safeUrl = (u) => { if (!u || typeof u !== "string" || !u.trim()) return ""; try { const x = new URL(u, location.href); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };

  const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const BULAN_P = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const parse = (d) => { if (!d) return null; const x = new Date(String(d).length <= 10 ? d + "T00:00:00" : d); return isNaN(x) ? null : x; };
  FC.fmtDate = (d, long) => { const x = parse(d); if (!x) return "-"; return `${x.getDate()} ${(long ? BULAN_P : BULAN)[x.getMonth()]} ${x.getFullYear()}`; };
  FC.fmtDateTime = (d) => { const x = parse(d); if (!x) return "-"; return `${FC.fmtDate(d)}, ${String(x.getHours()).padStart(2, "0")}.${String(x.getMinutes()).padStart(2, "0")}`; };
  FC.dateParts = (d) => { const x = parse(d); return x ? { day: x.getDate(), mon: BULAN[x.getMonth()] } : { day: "–", mon: "" }; };
  FC.daysLeft = (d) => { const x = parse(d); if (!x) return null; const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((x - t) / 864e5); };
  FC.deadlineChip = (d) => {
    const n = FC.daysLeft(d);
    if (n === null) return '<span class="chip gray">Tanpa tenggat</span>';
    if (n < 0) return '<span class="chip gray">Ditutup</span>';
    if (n === 0) return '<span class="chip danger">Hari terakhir</span>';
    if (n <= 7) return `<span class="chip warn">${n} hari lagi</span>`;
    return `<span class="chip">${n} hari lagi</span>`;
  };
  FC.initials = (n) => String(n || "?").replace(/^Contoh:\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

  /* sampul kartu: pola daun/jaringan, warna per jenis */
  const COVER = {
    lomba: ["var(--forest)", "var(--green)", "trophy"],
    beasiswa: ["var(--tint)", "var(--lime)", "cap"],
    pelatihan: ["var(--olive)", "var(--cream)", "book"]
  };
  FC.coverArt = (jenis, seed) => {
    const [a, b] = COVER[jenis] || COVER.lomba;
    const s = Array.from(String(seed || jenis)).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
    const r = (i) => ((s >> (i * 3)) & 63) / 63;
    const nodes = Array.from({ length: 7 }, (_, i) => [20 + r(i) * 360, 20 + r(i + 7) * 185]);
    const lines = nodes.map((n, i) => { const m = nodes[(i + 2) % nodes.length]; return `<line x1="${n[0]}" y1="${n[1]}" x2="${m[0]}" y2="${m[1]}"/>`; }).join("");
    const dots = nodes.map((n) => `<circle cx="${n[0]}" cy="${n[1]}" r="3"/>`).join("");
    const gid = "g" + s.toString(36);
    return `<svg class="cover-art" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${gid}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" style="stop-color:var(--bg-2)"/><stop offset=".55" style="stop-color:${a}"/><stop offset="1" style="stop-color:${b}"/></linearGradient></defs>
      <rect width="400" height="225" fill="url(#${gid})"/>
      <path d="M${300 + r(3) * 60} -20 C 240 60, 250 160, 330 250" style="stroke:var(--cream)" stroke-opacity=".25" stroke-width="1.5" fill="none"/>
      <g style="stroke:var(--cream)" stroke-opacity=".28" stroke-width="1">${lines}</g><g style="fill:var(--cream)" fill-opacity=".6">${dots}</g>
    </svg>`;
  };
  FC.jenisLabel = { lomba: "Lomba", beasiswa: "Beasiswa", pelatihan: "Pelatihan" };
  FC.jenisIcon = { lomba: "trophy", beasiswa: "cap", pelatihan: "book" };

  /* toast */
  FC.toast = (msg, type) => {
    let box = document.querySelector(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role", "status"); box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const t = document.createElement("div"); t.className = "toast " + (type || "ok"); t.textContent = msg; box.appendChild(t);
    setTimeout(() => { t.style.transition = ".3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 3600);
  };

  /* modal */
  let lastFocus = null;
  FC.closeModal = () => {
    const m = document.querySelector(".modal"); if (!m) return;
    m.remove(); document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  FC.openModal = (html, opts) => {
    FC.closeModal();
    lastFocus = document.activeElement;
    const m = document.createElement("div");
    m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
    if (opts && opts.label) m.setAttribute("aria-label", opts.label);
    m.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal-dialog ${(opts && opts.wide) ? "wide" : ""}"><button class="modal-close" data-close aria-label="Tutup">${FC.icon("x")}</button>${html}</div>`;
    document.body.appendChild(m); document.body.classList.add("no-scroll");
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) FC.closeModal(); });
    const first = m.querySelector("input:not([type=checkbox]), select, textarea") || m.querySelector(".modal-close");
    setTimeout(() => first && first.focus({ preventScroll: true }), 30);
    return m.querySelector(".modal-dialog");
  };
  document.addEventListener("keydown", (e) => {
    const m = document.querySelector(".modal"); if (!m) return;
    if (e.key === "Escape") FC.closeModal();
    if (e.key === "Tab") {
      const f = [...m.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((x) => x.offsetParent !== null);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  FC.confirm = (title, text, okLabel) => new Promise((res) => {
    const d = FC.openModal(`<h2>${FC.esc(title)}</h2><p class="lede">${FC.esc(text)}</p><div class="modal-actions"><button class="btn btn-primary" data-ok>${FC.esc(okLabel || "Ya, lanjutkan")}</button><button class="btn btn-ghost" data-close>Batal</button></div>`);
    d.querySelector("[data-ok]").onclick = () => { FC.closeModal(); res(true); };
    d.closest(".modal").addEventListener("click", (e) => { if (e.target.closest("[data-close]")) res(false); });
  });

  /* ambil nilai form → objek */
  FC.formData = (form) => {
    const o = {};
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      if (!el.name) return;
      if (el.type === "checkbox") {
        if (el.dataset.multi !== undefined) { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); }
        else o[el.name] = el.checked;
      } else if (el.type === "radio") { if (el.checked) o[el.name] = el.value; }
      else o[el.name] = el.value.trim();
    });
    return o;
  };

  FC.busy = async (btn, fn) => {
    const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = "Memproses…";
    try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = label; }
  };
})();

/* =====================================================================
   PENGATURAN SITUS (diedit dari Panel Admin → Situs)
   Nilai bawaan diambil dari org.js dan config.js; nilai yang disimpan
   admin menimpa bawaan.
   ===================================================================== */
(function () {
  const FC = window.FC;
  const clone = (v) => JSON.parse(JSON.stringify(v == null ? null : v));
  const CFG = window.FC_CONFIG || {};
  const K = CFG.KONTAK || {};

  FC.imgUrl = (u) => {
    if (!u || typeof u !== "string") return "";
    if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(u)) return u;
    return FC.safeUrl(u);
  };

  FC.ytId = (u) => {
    const s = String(u || "").trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : "";
  };

  FC.WARNA_BAWAAN = { cream: "#F6FDAD", lime: "#DFF75B", green: "#A2D21E", olive: "#83A904", forest: "#417101", bg: "#0A1105", text: "#EEF3DC" };
  FC.PRESET_WARNA = [
    { nama: "Daun (bawaan)", warna: FC.WARNA_BAWAAN },
    { nama: "Biru UM", warna: { cream: "#FFF6A8", lime: "#FFE14D", green: "#4F7BD8", olive: "#3557A8", forest: "#22397A", bg: "#070C1C", text: "#E8EDFA" } },
    { nama: "Emas Klasik", warna: { cream: "#FFF1CC", lime: "#F2C14E", green: "#C9962B", olive: "#9A6F17", forest: "#5C420C", bg: "#0F0B05", text: "#F4EEDF" } },
    { nama: "Marun", warna: { cream: "#FFE3D6", lime: "#FF9E7A", green: "#C4473A", olive: "#952F28", forest: "#5E1A17", bg: "#120707", text: "#F6E9E6" } },
    { nama: "Toska", warna: { cream: "#D9FFF5", lime: "#5EF2CF", green: "#1FB89A", olive: "#14876F", forest: "#0B5546", bg: "#04110E", text: "#E2F5F0" } },
    { nama: "Ungu Malam", warna: { cream: "#F1E6FF", lime: "#C9A6FF", green: "#8B5CF6", olive: "#6D3FD1", forest: "#3F1F85", bg: "#0B0716", text: "#ECE7F7" } }
  ];
  FC.FONT_JUDUL = {
    "Fraunces": ["ital,opsz,wght@0,9..144,400..700;1,9..144,400..600", "serif"],
    "Playfair Display": ["ital,wght@0,400..700;1,400..700", "serif"],
    "DM Serif Display": ["ital@0;1", "serif"],
    "Cormorant Garamond": ["ital,wght@0,400..700;1,400..700", "serif"],
    "Lora": ["ital,wght@0,400..700;1,400..700", "serif"],
    "Poppins": ["ital,wght@0,400;0,500;0,600;0,700;1,400;1,500", "sans-serif"],
    "Montserrat": ["ital,wght@0,400..700;1,400..700", "sans-serif"],
    "Space Grotesk": ["wght@400..700", "sans-serif"]
  };
  FC.FONT_ISI = {
    "Plus Jakarta Sans": ["wght@400..800", "sans-serif"],
    "Inter": ["wght@400..700", "sans-serif"],
    "Poppins": ["wght@400;500;600;700", "sans-serif"],
    "DM Sans": ["wght@400..700", "sans-serif"],
    "Nunito": ["wght@400..800", "sans-serif"],
    "Manrope": ["wght@400..800", "sans-serif"],
    "Lato": ["wght@400;700", "sans-serif"],
    "Source Sans 3": ["wght@400..700", "sans-serif"]
  };

  FC.DEFAULTS = {
    versi: 1,
    tampilan: {
      nama_situs: CFG.NAMA_SITUS || "FMIPA Connect",
      subjudul: "BEM FMIPA · Universitas Negeri Malang",
      logo_situs: "assets/img/logo.svg",
      logo_org: CFG.LOGO_UM_URL || "",
      warna: clone(FC.WARNA_BAWAAN),
      font: { judul: "Fraunces", isi: "Plus Jakarta Sans" }
    },
    kontak: { whatsapp: K.whatsapp || "", email: K.email || "", instagram: K.instagram || "", instagram_link: K.instagram_link || "", alamat: K.alamat || "", maps_link: K.maps_link || "" },
    satgas: clone(CFG.SATGAS || { nama: "", kontak: "", link: "" }),
    org: clone(window.FC_ORG || {})
  };

  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  FC.mergeSettings = function merge(base, over) {
    if (!isObj(over)) return clone(base);
    const out = clone(base) || {};
    Object.keys(over).forEach((k) => { out[k] = isObj(over[k]) && isObj(out[k]) ? merge(out[k], over[k]) : clone(over[k]); });
    return out;
  };

  const hexRgb = (h) => { const m = String(h).replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i); return m ? m.slice(1).map((x) => parseInt(x, 16)) : null; };
  const lum = (h) => { const c = hexRgb(h); if (!c) return 1; const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };

  FC.applyTheme = function (warna, font) {
    const r = document.documentElement.style, w = Object.assign({}, FC.WARNA_BAWAAN, warna || {});
    ["cream", "lime", "green", "olive", "forest", "bg", "text"].forEach((k) => { if (hexRgb(w[k])) r.setProperty("--" + k, w[k]); });
    r.setProperty("--ink", lum(w.lime) > 0.4 ? "color-mix(in srgb, var(--forest) 28%, #000)" : "#FFFFFF");
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", w.bg);
    const f = Object.assign({ judul: "Fraunces", isi: "Plus Jakarta Sans" }, font || {});
    const J = FC.FONT_JUDUL[f.judul] || FC.FONT_JUDUL.Fraunces, I = FC.FONT_ISI[f.isi] || FC.FONT_ISI["Plus Jakarta Sans"];
    const fam = (n, spec) => "family=" + encodeURIComponent(n).replace(/%20/g, "+") + ":" + spec;
    const href = "https://fonts.googleapis.com/css2?" + fam(f.judul, J[0]) + (f.isi !== f.judul ? "&" + fam(f.isi, I[0]) : "") + "&display=swap";
    let link = document.getElementById("fc-font");
    if (!(f.judul === "Fraunces" && f.isi === "Plus Jakarta Sans")) {
      if (!link) { link = document.createElement("link"); link.id = "fc-font"; link.rel = "stylesheet"; document.head.appendChild(link); }
      if (link.href !== href) link.href = href;
    }
    r.setProperty("--serif", `"${f.judul}", ${J[1] === "serif" ? "Georgia, serif" : "system-ui, sans-serif"}`);
    r.setProperty("--sans", `"${f.isi}", system-ui, -apple-system, "Segoe UI", sans-serif`);
  };

  const waLink = (n) => { const d = String(n || "").replace(/\D/g, ""); return d ? "https://wa.me/" + (d.startsWith("0") ? "62" + d.slice(1) : d) : ""; };

  FC.applySettings = function (saved) {
    const st = FC.mergeSettings(FC.DEFAULTS, saved || {});
    FC.settings = st;
    window.FC_ORG = st.org;
    const o = st.org || {}, t = st.tampilan || {};
    if (o.video) o.video.youtubeId = FC.ytId(o.video.url || o.video.youtubeId);
    CFG.NAMA_SITUS = t.nama_situs;
    CFG.SUBJUDUL_SITUS = t.subjudul;
    CFG.LOGO_SITUS = t.logo_situs;
    CFG.LOGO_UM_URL = t.logo_org;
    CFG.PENGELOLA = [o.organisasi, o.kabinet ? "Kabinet " + o.kabinet : ""].filter(Boolean).join(" ");
    CFG.KONTAK = Object.assign({}, st.kontak, { whatsapp_link: waLink(st.kontak.whatsapp) });
    CFG.SATGAS = st.satgas;
    FC.applyTheme(t.warna, t.font);
    const fav = document.querySelector('link[rel="icon"]'); const lg = FC.imgUrl(t.logo_situs);
    if (fav && lg) { fav.href = lg; fav.removeAttribute("type"); }
    const pl = document.querySelector(".preloader");
    if (pl) {
      const q = (s) => pl.querySelector(s);
      if (q(".pl-title")) q(".pl-title").innerHTML = `${FC.esc((o.organisasi || "").replace(/\s+UM$/, ""))}<em>${FC.esc(o.kabinet || "")}</em>`;
      if (q(".pl-year")) q(".pl-year").textContent = o.periode || "";
      if (q(".pl-sub")) q(".pl-sub").textContent = o.tagline ? "— " + String(o.tagline).replace(/[.,]+\s*/g, " · ").replace(/[\s·]+$/, "").toUpperCase() + " —" : "";
    }
    return st;
  };

  /* kompres gambar di browser sebelum diunggah */
  FC.compressImage = function (file, max, quality) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type)) return rej(new Error("File harus berupa gambar."));
      if (file.type === "image/svg+xml") return file.size > 400000 ? rej(new Error("File SVG terlalu besar.")) : res(file);
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob((b) => b ? res(b) : rej(new Error("Gagal memproses gambar.")), "image/webp", quality || 0.82);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Gambar tidak bisa dibaca.")); };
      img.src = url;
    });
  };
})();
