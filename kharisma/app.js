/* =====================================================================
   Kharisma — MEKANISME KHUSUS ("Tempat sains dan iman bertemu")
   File ini milik pengurus Kharisma. Ubah file di folder kharisma/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman publik khusus Kharisma:
     #/ngaji-sains  → arsip & rencana tema Ngaji Sains (filter bidang + cari)
     #/agenda       → kalender kegiatan bulanan + simpan ke Google Calendar
     #/fun-fact     → Fun Fact MIPA (konten IG) + tokoh ilmuwan Muslim
   Isi semua halaman di atas diatur di kharisma/kajian.js.
   Teks identitas dan program kerja ada di assets/js/bso-config.js.

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const K = window.KHARISMA || { ngajiSains: [], agenda: [], libur: [], funFact: [], tokoh: [] };

  // Di mode demo, kalender & arsip diisi data contoh dari kajian.js
  function sumber(ctx) {
    const c = ctx.ui.demo && typeof K.contoh === "function" ? K.contoh() : null;
    const pilih = (k) => ((K[k] || []).length ? K[k] : (c && c[k]) || []);
    const ngaji = (K.ngajiSains || []).map((x, i) => (!x.tanggal && c && c.ngajiTanggal && c.ngajiTanggal[i]
      ? Object.assign({}, x, { tanggal: c.ngajiTanggal[i], format: x.format || "Hybrid", pemateri: x.pemateri || ["Contoh: Ustadz Fulan", "Contoh: Dosen " + x.bidang] }, c.ngajiTanggal[i] < hariIni() ? { materi: "#", rekaman: "#" } : {})
      : x));
    return { ngaji, agenda: pilih("agenda"), libur: pilih("libur"), funFact: pilih("funFact"), contoh: !!c && !(K.agenda || []).length };
  }

  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hariIni = () => iso(new Date());
  const keTgl = (s) => { const [y, m, d] = String(s || "").split("-").map(Number); return y ? new Date(y, (m || 1) - 1, d || 1) : null; };
  const fmtTgl = (s) => { const d = keTgl(s); return d ? `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}` : ""; };
  const hariNama = (s) => { const d = keTgl(s); return d ? ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()] : ""; };
  const tautan = (u) => (u === "#" ? "#" : FC.safeUrl(u));

  const JENIS = {
    "ngaji-sains": { judul: "Ngaji Sains", ikon: "spark" },
    "ngaji-online": { judul: "Ngaji Online", ikon: "book" },
    "fun-fact": { judul: "Fun Fact MIPA", ikon: "camera" },
    ramadhan: { judul: "Program Ramadhan", ikon: "heart" },
    lain: { judul: "Lainnya", ikon: "cal" }
  };
  const jenis = (a) => JENIS[a.jenis] ? a.jenis : "lain";

  /* =================================================================
     NGAJI SAINS
     ================================================================= */
  let fBidang = "Semua";
  function statusKajian(k) {
    if (!k.tanggal) return ["Rencana tema", "gray"];
    return k.tanggal < hariIni() ? ["Sudah dilaksanakan", ""] : k.tanggal === hariIni() ? ["Hari ini", "ok"] : ["Akan datang", "warn"];
  }
  function kartuKajian(k) {
    const [st, c] = statusKajian(k);
    const materi = tautan(k.materi), rekaman = tautan(k.rekaman);
    const info = [k.tanggal ? `${hariNama(k.tanggal)}, ${fmtTgl(k.tanggal)}` : "", k.format, k.tempat].filter(Boolean).join(" · ");
    return `<article class="kh-kajian">
      <div class="top"><span class="chip">${E(k.bidang || "Umum")}</span><span class="chip ${c}">${E(st)}</span></div>
      <h3>${E(k.judul)}</h3>
      ${k.ayat ? `<p class="kh-ayat">${FC.icon("book")}<span>${E(k.ayat)}</span></p>` : ""}
      ${k.ringkas ? `<p>${E(k.ringkas)}</p>` : ""}
      ${(k.pemateri || []).length ? `<p class="kh-meta">${FC.icon("users")}<span>${k.pemateri.map(E).join(" & ")}</span></p>` : ""}
      ${info ? `<p class="kh-meta">${FC.icon("cal")}<span>${E(info)}</span></p>` : ""}
      ${materi || rekaman ? `<div class="kh-aksi">${materi ? `<a class="btn btn-ghost btn-sm" href="${E(materi)}" target="_blank" rel="noopener">${FC.icon("download")} Materi</a>` : ""}${rekaman ? `<a class="btn btn-ghost btn-sm" href="${E(rekaman)}" target="_blank" rel="noopener">${FC.icon("play")} Rekaman</a>` : ""}</div>` : ""}
    </article>`;
  }
  function hNgajiSains(el, ctx) {
    const S = sumber(ctx);
    // Urutan: akan datang (terdekat dulu) → sudah dilaksanakan (terbaru dulu) → rencana tema
    const kini = hariIni(), grup = (k) => (!k.tanggal ? 2 : k.tanggal >= kini ? 0 : 1);
    const semua = S.ngaji.slice().sort((a, b) => grup(a) - grup(b) || (grup(a) === 0 ? a.tanggal.localeCompare(b.tanggal) : grup(a) === 1 ? b.tanggal.localeCompare(a.tanggal) : 0));
    const URUT = ["Fisika", "Biologi", "Matematika", "Kimia"];
    const bidang = ["Semua", ...[...new Set(semua.map((k) => k.bidang || "Umum"))].sort((a, b) => (URUT.indexOf(a) + 1 || 99) - (URUT.indexOf(b) + 1 || 99))];
    if (!bidang.includes(fBidang)) fBidang = "Semua";
    el.innerHTML = ctx.ui.judulHal("Ngaji Sains", "Ngaji Sains", "Kajian sebulan sekali yang membaca ayat-ayat kauniyah bersama ilmu MIPA, dibawakan ustadz dan dosen.") + `
      <section class="bso-section"><div class="wrap">
        <ul class="kh-format" aria-label="Format kajian">
          <li>${FC.icon("clock")}<span><b>± 60 menit</b><small>Santai, ada tanya jawab</small></span></li>
          <li>${FC.icon("users")}<span><b>Ustadz + dosen MIPA</b><small>Dua sudut pandang, satu tema</small></span></li>
          <li>${FC.icon("pin")}<span><b>Gazebo, taman, atau online</b><small>Bulan awal dicoba online/hybrid</small></span></li>
          <li>${FC.icon("cal")}<span><b>Sebulan sekali</b><small>Libur saat UTS dan UAS</small></span></li>
        </ul>
        <div class="bso-toolbar" style="margin-top:30px">
          <div class="tabs" role="tablist" aria-label="Filter bidang">${bidang.map((b) => `<button class="tab" role="tab" type="button" data-b="${E(b)}" aria-selected="${b === fBidang}">${E(b)} <span class="count">${b === "Semua" ? semua.length : semua.filter((k) => (k.bidang || "Umum") === b).length}</span></button>`).join("")}</div>
          <div class="bso-search" style="margin:0;min-width:min(100%,260px)"><label class="sr-only" for="khQ">Cari tema</label><input id="khQ" type="search" placeholder="Cari tema atau ayat…" autocomplete="off"></div>
        </div>
        ${ctx.ui.demo ? `<p class="muted" style="margin:-6px 0 14px"><span class="contoh-tag">CONTOH</span> Tanggal, pemateri, dan tautan materi di mode demo hanya contoh.</p>` : ""}
        <div data-isi></div>
      </div></section>`;
    const isi = el.querySelector("[data-isi]"), q = el.querySelector("#khQ");
    const gambar = () => {
      const t = q.value.trim().toLowerCase();
      const rows = semua.filter((k) => (fBidang === "Semua" || (k.bidang || "Umum") === fBidang) && (!t || `${k.judul} ${k.ayat || ""} ${k.ringkas || ""} ${(k.pemateri || []).join(" ")}`.toLowerCase().includes(t)));
      isi.innerHTML = rows.length ? `<div class="kh-kajian-grid">${rows.map(kartuKajian).join("")}</div>`
        : `<div class="empty bso-empty-sm"><p>${semua.length ? "Tidak ada tema yang cocok." : "Tema Ngaji Sains segera diumumkan."}</p></div>`;
    };
    el.querySelectorAll("[data-b]").forEach((b) => b.onclick = () => { fBidang = b.dataset.b; el.querySelectorAll("[data-b]").forEach((x) => x.setAttribute("aria-selected", x === b)); gambar(); });
    q.addEventListener("input", gambar);
    gambar();
  }

  /* =================================================================
     AGENDA (kalender)
     ================================================================= */
  let bulanAktif = null, fJenis = "";
  function linkGCal(a) {
    const tg = a.tanggal.replace(/-/g, "");
    const jam = (j) => (j ? String(j).replace(/[.:]/g, "").padEnd(4, "0") + "00" : "");
    let dates;
    if (a.jam) {
      const mulai = jam(a.jam);
      let akhir = jam(a.selesai);
      if (!akhir) { const h = Math.min(23, parseInt(mulai.slice(0, 2), 10) + 1); akhir = pad(h) + mulai.slice(2); }
      dates = `${tg}T${mulai}/${tg}T${akhir}`;
    } else {
      const b = keTgl(a.tanggal); b.setDate(b.getDate() + 1);
      dates = `${tg}/${iso(b).replace(/-/g, "")}`;
    }
    const p = new URLSearchParams({ action: "TEMPLATE", text: a.judul + " · Kharisma", dates, ctz: "Asia/Jakarta", details: [a.isi, a.link ? "Tautan: " + a.link : ""].filter(Boolean).join("\n"), location: a.tempat || "" });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }
  function detailAgenda(a) {
    const j = JENIS[jenis(a)], link = FC.safeUrl(a.link);
    FC.openModal(`<span class="eyebrow">${E(j.judul)}</span><h2>${E(a.judul)}</h2>
      <dl class="kv"><dt>Tanggal</dt><dd>${E(hariNama(a.tanggal))}, ${E(fmtTgl(a.tanggal))}</dd>
        ${a.jam ? `<dt>Waktu</dt><dd>${E(a.jam)}${a.selesai ? "–" + E(a.selesai) : ""} WIB</dd>` : ""}
        ${a.format ? `<dt>Format</dt><dd>${E(a.format)}</dd>` : ""}${a.tempat ? `<dt>Tempat</dt><dd>${E(a.tempat)}</dd>` : ""}</dl>
      ${a.isi ? `<p class="prose" style="margin-top:12px">${E(a.isi)}</p>` : ""}
      <div class="modal-actions"><a class="btn btn-primary" href="${E(linkGCal(a))}" target="_blank" rel="noopener">${FC.icon("cal")} Simpan ke Google Calendar</a>
        ${link ? `<a class="btn btn-ghost" href="${E(link)}" target="_blank" rel="noopener">${FC.icon("link")} Buka tautan</a>` : ""}</div>`, { label: a.judul });
  }
  function hAgenda(el, ctx) {
    const S = sumber(ctx);
    const semua = S.agenda.filter((a) => keTgl(a.tanggal)).sort((a, b) => (a.tanggal + (a.jam || "")).localeCompare(b.tanggal + (b.jam || "")));
    if (!bulanAktif) {
      const now = new Date(), kini = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const adaKini = semua.some((a) => a.tanggal.startsWith(kini));
      const next = semua.find((a) => a.tanggal >= hariIni());
      const d = !adaKini && next ? keTgl(next.tanggal) : now;
      bulanAktif = new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const y = bulanAktif.getFullYear(), m = bulanAktif.getMonth(), kunci = `${y}-${pad(m + 1)}`;
    const tampil = semua.filter((a) => !fJenis || jenis(a) === fJenis);
    const diBulan = tampil.filter((a) => a.tanggal.startsWith(kunci));
    const libur = (tg) => S.libur.find((l) => tg >= l.mulai && tg <= (l.selesai || l.mulai));
    const jenisAda = Object.keys(JENIS).filter((k) => semua.some((a) => jenis(a) === k));

    const awal = (new Date(y, m, 1).getDay() + 6) % 7, jml = new Date(y, m + 1, 0).getDate();
    let sel = "";
    for (let i = 0; i < awal; i++) sel += `<div class="kh-hari kosong" aria-hidden="true"></div>`;
    for (let d = 1; d <= jml; d++) {
      const tg = `${kunci}-${pad(d)}`, ev = diBulan.filter((a) => a.tanggal === tg), lb = libur(tg);
      sel += `<div class="kh-hari${tg === hariIni() ? " hari-ini" : ""}${lb ? " libur" : ""}"${lb ? ` title="${E(lb.judul)}"` : ""}>
        <span class="tgl">${d}</span>${lb && d === Math.max(1, keTgl(lb.mulai).getMonth() === m ? keTgl(lb.mulai).getDate() : 1) ? `<span class="kh-libur-lbl">${E(lb.judul)}</span>` : ""}
        ${ev.map((a) => `<button type="button" class="kh-ev ${jenis(a)}" data-ev="${E(String(semua.indexOf(a)))}" title="${E(a.judul)}"><span class="dot" aria-hidden="true"></span><span class="t">${E(a.judul)}</span></button>`).join("")}</div>`;
    }
    const liburBulan = S.libur.filter((l) => (l.mulai || "").slice(0, 7) <= kunci && (l.selesai || l.mulai || "").slice(0, 7) >= kunci);

    el.innerHTML = ctx.ui.judulHal("Agenda", "Agenda Kharisma", "Jadwal Ngaji Sains, Ngaji Online, Fun Fact, dan Program Ramadhan. Klik kegiatan untuk menyimpannya ke Google Calendar.") + `
      <section class="bso-section"><div class="wrap">
        ${S.contoh ? `<p class="muted" style="margin-bottom:14px"><span class="contoh-tag">CONTOH</span> Agenda contoh untuk mode demo.</p>` : ""}
        <div class="bso-toolbar">
          <div class="kh-bulan"><button class="btn btn-ghost btn-sm" type="button" data-geser="-1" aria-label="Bulan sebelumnya">‹</button><h2 aria-live="polite">${BULAN[m]} ${y}</h2><button class="btn btn-ghost btn-sm" type="button" data-geser="1" aria-label="Bulan berikutnya">›</button><button class="btn btn-ghost btn-sm" type="button" data-kini>Bulan ini</button></div>
          ${jenisAda.length > 1 ? `<div class="tabs" role="tablist" aria-label="Filter kegiatan"><button class="tab" role="tab" type="button" data-j="" aria-selected="${!fJenis}">Semua</button>${jenisAda.map((k) => `<button class="tab" role="tab" type="button" data-j="${k}" aria-selected="${fJenis === k}"><span class="kh-dot ${k}" aria-hidden="true"></span>${E(JENIS[k].judul)}</button>`).join("")}</div>` : ""}
        </div>
        <div class="kh-kal" role="grid" aria-label="Kalender ${BULAN[m]} ${y}">
          ${HARI.map((h) => `<div class="kh-kal-head" role="columnheader">${h}</div>`).join("")}${sel}
        </div>
        ${liburBulan.length ? `<p class="muted kh-libur-ket"><span class="kh-libur-swatch" aria-hidden="true"></span>${liburBulan.map((l) => `${E(l.judul)}: ${E(fmtTgl(l.mulai))}${l.selesai ? " – " + E(fmtTgl(l.selesai)) : ""}`).join(" · ")}. Tidak ada kegiatan.</p>` : ""}
        <h3 class="form-section-title" style="margin-top:30px">Kegiatan ${BULAN[m]} ${y}</h3>
        ${diBulan.length ? `<div class="kh-list">${diBulan.map((a) => { const d = keTgl(a.tanggal); return `<button type="button" class="kh-list-item" data-ev="${semua.indexOf(a)}">
            <span class="kh-list-tgl"><b>${d.getDate()}</b><small>${HARI[(d.getDay() + 6) % 7]}</small></span>
            <span class="kh-list-isi"><small><span class="kh-dot ${jenis(a)}" aria-hidden="true"></span>${E(JENIS[jenis(a)].judul)}${a.jam ? " · " + E(a.jam) + " WIB" : ""}${a.format ? " · " + E(a.format) : ""}</small><b>${E(a.judul)}</b>${a.tempat ? `<small>${E(a.tempat)}</small>` : ""}</span>
            ${FC.icon("arrow")}</button>`; }).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>${semua.length ? "Tidak ada kegiatan di bulan ini." : "Kalender kegiatan Kharisma sedang disusun. Pantau terus, ya!"}</p></div>`}
      </div></section>`;
    el.querySelectorAll("[data-geser]").forEach((b) => b.onclick = () => { bulanAktif = new Date(y, m + Number(b.dataset.geser), 1); hAgenda(el, ctx); });
    el.querySelector("[data-kini]").onclick = () => { const n = new Date(); bulanAktif = new Date(n.getFullYear(), n.getMonth(), 1); hAgenda(el, ctx); };
    el.querySelectorAll("[data-j]").forEach((b) => b.onclick = () => { fJenis = b.dataset.j; hAgenda(el, ctx); });
    el.querySelectorAll("[data-ev]").forEach((b) => b.onclick = () => detailAgenda(semua[+b.dataset.ev]));
  }

  /* =================================================================
     FUN FACT MIPA
     ================================================================= */
  function hFunFact(el, ctx) {
    const S = sumber(ctx);
    const ff = S.funFact.slice().sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
    const ig = String(K.instagram || "").replace(/^@/, "");
    el.innerHTML = ctx.ui.judulHal("Fun Fact MIPA", "Fun Fact MIPA", "Fakta seputar MIPA dari sudut pandang Islam, tayang di Instagram sebulan sekali.") + `
      <section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Sudah tayang${ff.length && ctx.ui.demo && !(K.funFact || []).length ? ' <span class="contoh-tag">CONTOH</span>' : ""}</span><h2>Fun fact terbaru</h2></div>
          ${ig ? `<a class="btn btn-ghost btn-sm" href="https://instagram.com/${E(ig)}" target="_blank" rel="noopener">${FC.icon("camera")} Ikuti @${E(ig)}</a>` : ""}</div>
        ${ff.length ? `<div class="kh-ff-grid">${ff.map((f) => { const u = FC.safeUrl(f.ig); return `<article class="kh-ff">
            <span class="chip">${E(f.bidang || "MIPA")}</span><h3>${E(f.judul)}</h3>${f.isi ? `<p>${E(f.isi)}</p>` : ""}
            <div class="kh-ff-bawah">${f.tanggal ? `<small>${E(fmtTgl(f.tanggal))}</small>` : "<span></span>"}${u ? `<a class="hl" href="${E(u)}" target="_blank" rel="noopener">Lihat di Instagram</a>` : ""}</div></article>`; }).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Fun Fact MIPA pertama segera tayang di Instagram.</p></div>`}
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Tokoh ilmuwan Muslim</span><h2>Mereka yang lebih dulu memadukan sains dan iman</h2>
        <div class="kh-tokoh">${(K.tokoh || []).map((t) => `<article class="bso-card"><div class="kh-tokoh-top"><span class="bso-ava">${E(FC.initials(t.nama))}</span><div><h3>${E(t.nama)}</h3><small class="kh-label">${E(t.bidang)}${t.masa ? " · " + E(t.masa) : ""}</small></div></div><p>${E(t.isi)}</p></article>`).join("")}</div>
      </div></section>`;
  }

  FC.bsoExt = {
    publik: [
      { id: "ngaji-sains", judul: "Ngaji Sains", sub: "Arsip & rencana tema kajian", penuh: true, render: hNgajiSains },
      { id: "agenda", judul: "Agenda", sub: "Kalender kegiatan bulanan", penuh: true, render: hAgenda },
      { id: "fun-fact", judul: "Fun Fact", sub: "Fakta MIPA & ilmuwan Muslim", penuh: true, render: hFunFact }
    ],
    admin: []
  };
})();
