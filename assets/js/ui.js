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
    lomba: ["#417101", "#A2D21E", "trophy"],
    beasiswa: ["#2F5A05", "#DFF75B", "cap"],
    pelatihan: ["#55800A", "#F6FDAD", "book"]
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
      <defs><linearGradient id="${gid}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0E1A07"/><stop offset=".55" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <rect width="400" height="225" fill="url(#${gid})"/>
      <path d="M${300 + r(3) * 60} -20 C 240 60, 250 160, 330 250" stroke="rgba(246,253,173,.25)" stroke-width="1.5" fill="none"/>
      <g stroke="rgba(246,253,173,.28)" stroke-width="1">${lines}</g><g fill="rgba(246,253,173,.6)">${dots}</g>
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
