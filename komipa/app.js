/* =====================================================================
   KOMIPA — MEKANISME KHUSUS (Komite Olahraga FMIPA)
   File ini milik pengurus KOMIPA. Ubah file di folder komipa/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman publik khusus KOMIPA:
     #/rutin  → jadwal KOMIPA Rutin (cabor bergilir, libur UTS/UAS), komunitas cabor
     #/liga   → Liga MIPA: klasemen otomatis, jadwal & hasil, top skor, MVP, final
     #/atlet  → rubrik Atlet MIPA Bulan Ini + arsip
   Beranda mendapat bagian "Kenapa ikut KOMIPA" dan tombol cari teman main.
   Isi semua halaman di atas diatur di komipa/liga.js.
   Teks identitas dan program kerja ada di assets/js/bso-config.js.

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const K = window.KOMIPA || { rutin: [], libur: [], komunitas: [], atlet: [], liga: { cabor: [], pertandingan: [] } };

  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hariIni = () => iso(new Date());
  const keTgl = (s) => { const [y, m, d] = String(s || "").split("-").map(Number); return y ? new Date(y, (m || 1) - 1, d || 1) : null; };
  const fmtTgl = (s) => { const d = keTgl(s); return d ? `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}` : ""; };
  const fmtBulan = (s) => { const d = keTgl(s); return d ? `${BULAN[d.getMonth()]} ${d.getFullYear()}` : ""; };
  const hariNama = (s) => { const d = keTgl(s); return d ? HARI[d.getDay()] : ""; };
  const tanpaContoh = (s) => String(s || "").replace(/^Contoh:\s*/, "");

  // Data asli dari liga.js; di mode demo, bagian yang masih kosong diisi data contoh
  let _c = null;
  function sumber(ctx) {
    const c = ctx.ui.demo && typeof K.contoh === "function" ? (_c = _c || K.contoh()) : null;
    const L = K.liga || {};
    const pilih = (a, b) => ((a || []).length ? a : (c ? b || [] : []));
    const pt = pilih(L.pertandingan, c && c.liga.pertandingan);
    return {
      rutin: pilih(K.rutin, c && c.rutin),
      libur: pilih(K.libur, c && c.libur),
      komunitas: pilih(K.komunitas, c && c.komunitas),
      atlet: pilih(K.atlet, c && c.atlet),
      liga: Object.assign({}, L, { pertandingan: pt, final: L.final || (c && !(L.pertandingan || []).length ? c.liga.final : null) }),
      contoh: { rutin: !!c && !(K.rutin || []).length, liga: !!c && !(L.pertandingan || []).length, atlet: !!c && !(K.atlet || []).length }
    };
  }
  const tagContoh = (on, teks) => (on ? `<p class="muted km-contoh"><span class="contoh-tag">CONTOH</span> ${E(teks || "Data contoh untuk mode demo.")}</p>` : "");

  const CABOR_IKON = { futsal: "⚽", sepak: "⚽", badminton: "🏸", "bulu tangkis": "🏸", voli: "🏐", basket: "🏀", lari: "🏃", senam: "🤸", "pencak silat": "🥋", renang: "🏊" };
  const ikonCabor = (c) => { const k = String(c || "").toLowerCase(); const hit = Object.keys(CABOR_IKON).find((x) => k.includes(x)); return hit ? CABOR_IKON[hit] : "🏅"; };
  const kelasCabor = (c) => "c-" + String(c || "lain").toLowerCase().replace(/[^a-z]+/g, "-");

  function linkGCal(s) {
    const tg = s.tanggal.replace(/-/g, "");
    const jam = (j) => String(j).replace(/[.:]/g, "").padEnd(4, "0") + "00";
    const mulai = jam(s.jam || "15.30");
    const akhir = s.selesai ? jam(s.selesai) : pad(Math.min(23, parseInt(mulai.slice(0, 2), 10) + 2)) + mulai.slice(2);
    const p = new URLSearchParams({ action: "TEMPLATE", text: `${s.judul || "KOMIPA Rutin: " + s.cabor} · KOMIPA`, dates: `${tg}T${mulai}/${tg}T${akhir}`, ctz: "Asia/Jakarta",
      details: [s.pelatih ? "Pelatih: " + tanpaContoh(s.pelatih) : "", s.catatan || ""].filter(Boolean).join("\n"), location: s.tempat || "" });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }

  // Tautan ke fitur Cari Teman Lomba di situs utama, khusus kategori Olahraga
  const temanMain = (ctx) => ({ cari: `${ctx.root}#/teman?kategori=Olahraga`, buat: `${ctx.root}#/teman?tab=buat&kategori=Olahraga` });
  function blokTemanMain(ctx) {
    const t = temanMain(ctx);
    return `<div class="km-teman">
      <div><span class="eyebrow">Cari teman main</span><h2>Mau main tapi kurang orang?</h2>
        <p class="muted">Pasang ajakan main futsal, badminton, atau voli, atau cari tim untuk lomba olahraga. Fitur ini memakai Cari Teman Lomba di FMIPA Connect.</p></div>
      <div class="km-teman-aksi"><a class="btn btn-primary" href="${E(t.cari)}">${FC.icon("users")} Cari teman main</a><a class="btn btn-ghost" href="${E(t.buat)}">${FC.icon("plus")} Buat ajakan</a></div>
    </div>`;
  }

  /* =================================================================
     BERANDA: kenapa ikut KOMIPA
     ================================================================= */
  function beranda(el, ctx) {
    const S = sumber(ctx);
    const next = S.rutin.filter((s) => !s.batal && s.tanggal >= hariIni() && !S.libur.some((l) => s.tanggal >= l.mulai && s.tanggal <= (l.selesai || l.mulai))).sort((a, b) => a.tanggal.localeCompare(b.tanggal))[0];
    const untung = [
      ["heart", "Ngilangin capek, bukan nambah", "Olahraga menurunkan stres setelah laprak, praktikum, dan tugas hitungan. Anggap saja waktu refreshing."],
      ["trophy", "Gratis, dilatih pelatih betulan", "Latihan bersama mahasiswa FIK tanpa biaya. Di luar, latihan seperti ini harus bayar."],
      ["users", "Kenal semua departemen", "Main bareng anak Matematika, Fisika, Kimia, Biologi, dan anak FIK."],
      ["cal", "Kuliah tetap nomor satu", "Hanya 2 minggu sekali, sekitar 2 jam. Libur saat UTS dan UAS."]
    ];
    el.innerHTML = `
      ${next ? `<section class="bso-section"><div class="wrap">
        <a class="km-next" href="#/rutin">
          <span class="km-next-ikon" aria-hidden="true">${ikonCabor(next.cabor)}</span>
          <span><small>Latihan berikutnya${S.contoh.rutin ? ' <span class="contoh-tag">CONTOH</span>' : ""}</small><b>${E(next.cabor)} · ${E(hariNama(next.tanggal))}, ${E(fmtTgl(next.tanggal))}</b>
            <small>${E(next.jam || "")}${next.selesai ? "–" + E(next.selesai) : ""} WIB${next.tempat ? " · " + E(next.tempat) : ""}</small></span>
          ${FC.icon("arrow")}</a>
      </div></section>` : ""}
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Kenapa ikut KOMIPA</span><h2>Di organisasi lain nambah capek, di KOMIPA ngilangin capek</h2>
        <div class="km-untung">${untung.map(([i, j, t]) => `<article class="bso-card"><span class="km-ikon">${FC.icon(i)}</span><h3>${E(j)}</h3><p>${E(t)}</p></article>`).join("")}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">${blokTemanMain(ctx)}</div></section>`;
  }

  /* =================================================================
     KOMIPA RUTIN
     ================================================================= */
  let fCabor = "Semua", lihatLewat = false;
  function detailSesi(s) {
    FC.openModal(`<span class="eyebrow">KOMIPA Rutin</span><h2>${ikonCabor(s.cabor)} ${E(s.cabor)}</h2>
      <dl class="kv"><dt>Tanggal</dt><dd>${E(hariNama(s.tanggal))}, ${E(fmtTgl(s.tanggal))}</dd>
        ${s.jam ? `<dt>Waktu</dt><dd>${E(s.jam)}${s.selesai ? "–" + E(s.selesai) : ""} WIB</dd>` : ""}
        ${s.tempat ? `<dt>Tempat</dt><dd>${E(s.tempat)}</dd>` : ""}
        <dt>Pelatih</dt><dd>${s.pelatih ? E(s.pelatih) : "Latihan mandiri"}</dd></dl>
      ${s.catatan ? `<p class="prose" style="margin-top:12px">${E(s.catatan)}</p>` : ""}
      ${s.batal ? `<p class="chip warn" style="margin-top:12px">Sesi ini dibatalkan</p>` : `<div class="modal-actions"><a class="btn btn-primary" href="${E(linkGCal(s))}" target="_blank" rel="noopener">${FC.icon("cal")} Simpan ke Google Calendar</a></div>`}`, { label: s.cabor });
  }
  function hRutin(el, ctx) {
    const S = sumber(ctx);
    const semua = S.rutin.filter((s) => keTgl(s.tanggal)).sort((a, b) => (a.tanggal + (a.jam || "")).localeCompare(b.tanggal + (b.jam || "")));
    const cabor = ["Semua", ...new Set(semua.map((s) => s.cabor))];
    if (!cabor.includes(fCabor)) fCabor = "Semua";
    const kini = hariIni();
    const libur = S.libur.filter((l) => (l.selesai || l.mulai) >= kini);
    const cocok = semua.filter((s) => fCabor === "Semua" || s.cabor === fCabor);
    const nanti = cocok.filter((s) => s.tanggal >= kini), lewat = cocok.filter((s) => s.tanggal < kini).reverse();
    // Sesi yang jatuh di masa UTS/UAS otomatis ditandai libur
    const liburDi = (s) => S.libur.find((l) => s.tanggal >= l.mulai && s.tanggal <= (l.selesai || l.mulai));
    const next = semua.find((s) => s.tanggal >= kini && !s.batal && !liburDi(s));
    const wa = ctx.ui.waLink;

    const baris = (s) => { const d = keTgl(s.tanggal), lb = liburDi(s); return `<button type="button" class="km-sesi ${kelasCabor(s.cabor)}${s.batal || lb ? " batal" : ""}${s.tanggal < kini ? " lewat" : ""}" data-s="${semua.indexOf(s)}">
        <span class="km-sesi-tgl"><b>${d.getDate()}</b><small>${E(BULAN[d.getMonth()].slice(0, 3))}</small></span>
        <span class="km-sesi-ikon" aria-hidden="true">${ikonCabor(s.cabor)}</span>
        <span class="km-sesi-isi"><b>${E(s.cabor)}</b>${s.batal ? ' <span class="chip warn">Batal</span>' : lb ? ` <span class="chip warn">Libur ${E(lb.judul)}</span>` : ""}
          <small>${E(hariNama(s.tanggal))}${s.jam ? " · " + E(s.jam) + (s.selesai ? "–" + E(s.selesai) : "") + " WIB" : ""}${s.tempat ? " · " + E(s.tempat) : ""}</small>
          <small>${s.pelatih ? "Pelatih: " + E(s.pelatih) : "Latihan mandiri"}</small></span>
        ${FC.icon("arrow")}</button>`; };

    el.innerHTML = ctx.ui.judulHal("KOMIPA Rutin", "Jadwal Latihan", "Olahraga bareng 2 minggu sekali dengan cabor bergilir. Klik sesi untuk menyimpannya ke Google Calendar.") + `
      <section class="bso-section"><div class="wrap">
        <ul class="km-format" aria-label="Format latihan">
          <li>${FC.icon("cal")}<span><b>2 minggu sekali</b><small>Sesuai kalender akademik</small></span></li>
          <li>${FC.icon("clock")}<span><b>± 2 jam per sesi</b><small>Cukup untuk keringetan</small></span></li>
          <li>${FC.icon("users")}<span><b>Pelatih dari FIK</b><small>Tanpa pelatih, latihan tetap jalan</small></span></li>
          <li>${FC.icon("shield")}<span><b>Libur UTS & UAS</b><small>Kuliah tetap nomor satu</small></span></li>
        </ul>
        ${tagContoh(S.contoh.rutin, "Jadwal, tempat, dan pelatih di mode demo hanya contoh.")}
        ${next ? `<div class="km-sorot ${kelasCabor(next.cabor)}">
          <span class="km-sorot-ikon" aria-hidden="true">${ikonCabor(next.cabor)}</span>
          <div><span class="eyebrow">Sesi berikutnya</span><h2>${E(next.cabor)}</h2>
            <p>${E(hariNama(next.tanggal))}, ${E(fmtTgl(next.tanggal))}${next.jam ? " · " + E(next.jam) + (next.selesai ? "–" + E(next.selesai) : "") + " WIB" : ""}${next.tempat ? " · " + E(next.tempat) : ""}</p>
            <p class="muted">${next.pelatih ? "Pelatih: " + E(next.pelatih) : "Latihan mandiri"}${next.catatan ? " · " + E(next.catatan) : ""}</p></div>
          <a class="btn btn-primary" href="${E(linkGCal(next))}" target="_blank" rel="noopener">${FC.icon("cal")} Simpan ke kalender</a>
        </div>` : ""}
        ${libur.length ? `<div class="km-libur">${FC.icon("info")}<span>${libur.map((l) => `<b>${E(l.judul)}</b>: ${E(fmtTgl(l.mulai))}${l.selesai ? " – " + E(fmtTgl(l.selesai)) : ""}`).join(" · ")}. Tidak ada latihan.</span></div>` : ""}
        <div class="bso-toolbar" style="margin-top:28px">
          ${cabor.length > 2 ? `<div class="pills" role="group" aria-label="Filter cabor">${cabor.map((c) => `<button class="pill" type="button" data-c="${E(c)}" aria-pressed="${c === fCabor}">${c === "Semua" ? "Semua cabor" : ikonCabor(c) + " " + E(c)}</button>`).join("")}</div>` : "<span></span>"}
          ${lewat.length ? `<label class="toggle"><input type="checkbox" data-lewat ${lihatLewat ? "checked" : ""}> Tampilkan sesi yang sudah lewat</label>` : ""}
        </div>
        ${nanti.length ? `<div class="km-sesi-list">${nanti.map(baris).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>${semua.length ? "Belum ada sesi mendatang untuk cabor ini." : "Jadwal KOMIPA Rutin sedang disusun bersama pelatih dari FIK. Pantau terus, ya!"}</p></div>`}
        ${lihatLewat && lewat.length ? `<h3 class="form-section-title" style="margin-top:28px">Sudah lewat</h3><div class="km-sesi-list">${lewat.map(baris).join("")}</div>` : ""}
      </div></section>
      ${S.komunitas.length ? `<section class="bso-section"><div class="wrap">
        <span class="eyebrow">Komunitas cabor</span><h2>Mau main lebih sering?</h2>
        <p class="muted" style="max-width:640px">Tiap cabor punya komunitas dan koordinator sendiri, jadi kamu bisa main di luar jadwal rutin.</p>
        <div class="km-kom">${S.komunitas.map((k) => { const w = k.whatsapp ? wa(k.whatsapp) : ""; return `<article class="bso-card">
          <div class="km-kom-top"><span class="km-sorot-ikon sm" aria-hidden="true">${ikonCabor(k.cabor)}</span><div><h3>${E(k.nama)}</h3><small class="km-label">${E(k.cabor)}</small></div></div>
          ${k.isi ? `<p>${E(k.isi)}</p>` : ""}
          ${k.koordinator ? `<p class="km-meta">${FC.icon("user")}<span>Koordinator: ${E(k.koordinator)}</span></p>` : ""}
          ${w ? `<a class="btn btn-ghost btn-sm" style="justify-self:start" href="${E(w)}" target="_blank" rel="noopener">${FC.icon("chat")} Hubungi koordinator</a>` : ""}</article>`; }).join("")}</div>
      </div></section>` : ""}
      <section class="bso-section"><div class="wrap">${blokTemanMain(ctx)}</div></section>`;
    el.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => { fCabor = b.dataset.c; hRutin(el, ctx); });
    const tg = el.querySelector("[data-lewat]"); if (tg) tg.onchange = () => { lihatLewat = tg.checked; hRutin(el, ctx); };
    el.querySelectorAll("[data-s]").forEach((b) => b.onclick = () => { const s = semua[+b.dataset.s], lb = liburDi(s); detailSesi(lb && !s.batal ? Object.assign({}, s, { batal: true, catatan: `Libur ${lb.judul}: tidak ada latihan.` }) : s); });
  }

  /* =================================================================
     LIGA MIPA
     ================================================================= */
  const isFinal = (m) => String(m.pekan).toLowerCase() === "final";
  const sudah = (m) => Array.isArray(m.skor) && m.skor.length === 2 && m.skor.every((x) => x !== null && x !== "" && !isNaN(x));

  function klasemen(cabor, list, departemen) {
    const P = Object.assign({ menang: 3, seri: 1, kalah: 0 }, cabor.poin || {});
    const t = {};
    const tim = (n) => (t[n] = t[n] || { tim: n, main: 0, m: 0, s: 0, k: 0, masuk: 0, keluar: 0, poin: 0 });
    (departemen || []).forEach(tim);
    list.filter((m) => !isFinal(m)).forEach((m) => { tim(m.tim[0]); tim(m.tim[1]); });
    list.filter((m) => sudah(m) && !isFinal(m)).forEach((m) => {
      const [a, b] = m.tim.map(tim), [x, y] = m.skor.map(Number);
      a.main++; b.main++; a.masuk += x; a.keluar += y; b.masuk += y; b.keluar += x;
      if (x > y) { a.m++; b.k++; a.poin += P.menang; b.poin += P.kalah; }
      else if (x < y) { b.m++; a.k++; b.poin += P.menang; a.poin += P.kalah; }
      else { a.s++; b.s++; a.poin += P.seri; b.poin += P.seri; }
    });
    return Object.values(t).sort((p, q) => q.poin - p.poin || (q.masuk - q.keluar) - (p.masuk - p.keluar) || q.masuk - p.masuk || p.tim.localeCompare(q.tim));
  }
  function topSkor(list) {
    const t = {};
    list.forEach((m) => (m.pencetak || []).forEach((p) => { const k = p.nama + "|" + (p.tim || ""); t[k] = t[k] || { nama: p.nama, tim: p.tim, gol: 0 }; t[k].gol += Number(p.jumlah) || 1; }));
    return Object.values(t).sort((a, b) => b.gol - a.gol || a.nama.localeCompare(b.nama));
  }

  let fLiga = null;
  function kartuLaga(m, satuan) {
    const s = sudah(m), [x, y] = s ? m.skor.map(Number) : [];
    const kls = (i) => (s ? ((i ? y > x : x > y) ? " menang" : "") : "");
    return `<article class="km-laga${s ? " selesai" : ""}${isFinal(m) ? " final" : ""}">
      <div class="km-laga-meta"><span>${isFinal(m) ? '<span class="chip">Final</span>' : `Pekan ${E(m.pekan)}`}</span><span>${E(hariNama(m.tanggal))}, ${E(fmtTgl(m.tanggal))}${m.jam ? " · " + E(m.jam) : ""}</span></div>
      <div class="km-laga-skor">
        <span class="km-tim${kls(0)}">${E(m.tim[0])}</span>
        <span class="km-angka">${s ? `${x}<i>–</i>${y}` : "vs"}</span>
        <span class="km-tim kanan${kls(1)}">${E(m.tim[1])}</span>
      </div>
      <div class="km-laga-bawah"><small>${m.tempat ? E(m.tempat) : ""}${s && satuan ? ` · skor dalam ${E(satuan)}` : ""}</small>${m.mvp ? `<small class="km-mvp-kecil">MVP: <b>${E(m.mvp.nama)}</b></small>` : ""}</div>
    </article>`;
  }
  function hLiga(el, ctx) {
    const S = sumber(ctx), L = S.liga;
    const cabor = (L.cabor || []).length ? L.cabor : [];
    if (!cabor.find((c) => c.id === fLiga)) fLiga = (cabor[0] || {}).id;
    const c = cabor.find((x) => x.id === fLiga) || {};
    const laga = (L.pertandingan || []).filter((m) => m.cabor === c.id && Array.isArray(m.tim)).sort((a, b) => (a.tanggal + (a.jam || "")).localeCompare(b.tanggal + (b.jam || "")));
    const kl = klasemen(c, laga, L.departemen);
    const ts = c.id === "futsal" || c.satuan === "gol" ? topSkor(laga).slice(0, 5) : [];
    const mvp = laga.filter((m) => m.mvp && m.mvp.nama).slice().reverse();
    const nanti = laga.filter((m) => !sudah(m)), hasil = laga.filter(sudah).reverse();
    const adaData = laga.length > 0;
    const fin = L.final;

    el.innerHTML = ctx.ui.judulHal("Liga antar-departemen", `${L.nama || "Liga MIPA"}${L.musim ? " " + E(L.musim) : ""}`, "Futsal, voli, dan badminton antar-departemen setiap Sabtu. Setiap tim bertemu sekali, lalu final.") + `
      <section class="bso-section"><div class="wrap">
        ${tagContoh(S.contoh.liga, "Jadwal, skor, pencetak gol, dan MVP di mode demo hanya contoh.")}
        <div class="tabs km-cabor-tabs" role="tablist" aria-label="Pilih cabor">${cabor.map((x) => `<button class="tab" role="tab" type="button" data-l="${E(x.id)}" aria-selected="${x.id === c.id}"><span aria-hidden="true">${ikonCabor(x.nama)}</span> ${E(x.nama)} <small>${E(x.kategori || "")}</small></button>`).join("")}</div>
        ${!adaData ? `<div class="empty bso-empty-sm" style="margin-top:22px"><p>Jadwal ${E(L.nama || "Liga MIPA")} cabor ${E(c.nama || "")} segera diumumkan. Siapkan tim departemenmu!</p></div>` : `
        <div class="km-liga-grid">
          <div>
            <div class="bso-sec-head"><div><span class="eyebrow">${E(c.nama)} ${E(c.kategori || "")}</span><h2>Klasemen</h2></div></div>
            <div class="km-tabel-wrap"><table class="km-tabel">
              <thead><tr><th scope="col">#</th><th scope="col" class="kiri">Departemen</th><th scope="col" title="Main">M</th><th scope="col" title="Menang">Mn</th><th scope="col" title="Seri">S</th><th scope="col" title="Kalah">K</th><th scope="col" title="Selisih ${E(c.satuan || "skor")}">+/-</th><th scope="col">Poin</th></tr></thead>
              <tbody>${kl.map((r, i) => `<tr${i === 0 && r.main ? ' class="pucuk"' : ""}><td>${i + 1}</td><th scope="row" class="kiri">${E(r.tim)}</th><td>${r.main}</td><td>${r.m}</td><td>${r.s}</td><td>${r.k}</td><td>${r.masuk - r.keluar > 0 ? "+" : ""}${r.masuk - r.keluar}</td><td><b>${r.poin}</b></td></tr>`).join("")}</tbody>
            </table></div>
            <p class="muted km-ket">Menang ${(c.poin || {}).menang ?? 3} poin, seri ${(c.poin || {}).seri ?? 1}, kalah ${(c.poin || {}).kalah ?? 0}. Urutan sama poin ditentukan selisih ${E(c.satuan || "skor")}. Klasemen dihitung otomatis dari hasil pertandingan.</p>
          </div>
          <aside class="km-samping">
            ${ts.length ? `<div class="bso-card"><span class="eyebrow">Top skor</span><ol class="km-rank">${ts.map((p) => `<li><span><b>${E(p.nama)}</b><small>${E(p.tim || "")}</small></span><span class="km-gol">${p.gol} <small>gol</small></span></li>`).join("")}</ol></div>` : ""}
            ${mvp.length ? `<div class="bso-card"><span class="eyebrow">MVP per laga</span><ol class="km-rank km-rank-mvp">${mvp.slice(0, 5).map((m) => `<li><span><b>${E(m.mvp.nama)}</b><small>${E(m.mvp.tim || "")} · ${isFinal(m) ? "Final" : "Pekan " + E(m.pekan)}: ${E(m.tim[0])} vs ${E(m.tim[1])}</small></span><span aria-hidden="true">⭐</span></li>`).join("")}</ol></div>` : ""}
          </aside>
        </div>
        ${nanti.length ? `<h3 class="form-section-title" style="margin-top:34px">Jadwal berikutnya</h3><div class="km-laga-grid">${nanti.map((m) => kartuLaga(m, c.satuan)).join("")}</div>` : ""}
        ${hasil.length ? `<h3 class="form-section-title" style="margin-top:34px">Hasil pertandingan</h3><div class="km-laga-grid">${hasil.map((m) => kartuLaga(m, c.satuan)).join("")}</div>` : ""}`}
      </div></section>
      ${fin && fin.tanggal ? `<section class="bso-section"><div class="wrap"><div class="km-final">
        <span class="km-final-ikon" aria-hidden="true">🏆</span>
        <div><span class="eyebrow">Grand final${S.contoh.liga ? ' <span class="contoh-tag">CONTOH</span>' : ""}</span><h2>Final ${E(L.nama || "Liga MIPA")}</h2>
          <p>${E(hariNama(fin.tanggal))}, ${E(fmtTgl(fin.tanggal))}${fin.jam ? " · " + E(fin.jam) + " WIB" : ""}${fin.tempat ? " · " + E(fin.tempat) : ""}</p>
          ${fin.isi ? `<p class="muted">${E(fin.isi)}</p>` : ""}</div>
        <a class="btn btn-primary" href="${E(linkGCal({ judul: "Final " + (L.nama || "Liga MIPA"), tanggal: fin.tanggal, jam: fin.jam || "13.00", selesai: fin.selesai, tempat: fin.tempat, catatan: fin.isi }))}" target="_blank" rel="noopener">${FC.icon("cal")} Ingatkan aku</a>
      </div></div></section>` : ""}
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Format liga</span><h2>Tiga cabor, satu fakultas</h2>
        <div class="km-untung">${cabor.map((x) => `<article class="bso-card"><span class="km-sorot-ikon sm" aria-hidden="true">${ikonCabor(x.nama)}</span><h3>${E(x.nama)} ${E(x.kategori || "")}</h3><p>${E({ futsal: "Paling mudah menarik pemain dan penonton.", voli: "Cabor andalan mahasiswi FMIPA.", badminton: "Butuh sedikit pemain, putra dan putri main bersama." }[x.id] || "")}</p></article>`).join("")}
          <article class="bso-card"><span class="km-ikon">${FC.icon("cal")}</span><h3>Setiap Sabtu, 3–5 pekan</h3><p>Setengah kompetisi: setiap departemen bertemu sekali, lalu final. Klasemen, top skor, dan MVP diperbarui tiap pekan.</p></article>
        </div>
      </div></section>`;
    el.querySelectorAll("[data-l]").forEach((b) => b.onclick = () => { fLiga = b.dataset.l; hLiga(el, ctx); });
  }

  /* =================================================================
     ATLET MIPA BULAN INI
     ================================================================= */
  function fotoAtlet(a, cls) {
    const u = FC.imgUrl ? FC.imgUrl(a.foto) : "";
    return u ? `<img class="${cls}" src="${E(u)}" alt="${E(tanpaContoh(a.nama))}" loading="lazy">` : `<span class="${cls} km-ava" aria-hidden="true">${E(FC.initials(tanpaContoh(a.nama)))}</span>`;
  }
  function hAtlet(el, ctx) {
    const S = sumber(ctx);
    const kini = hariIni().slice(0, 7);
    const semua = S.atlet.filter((a) => a.bulan).sort((a, b) => b.bulan.localeCompare(a.bulan));
    const utama = semua.find((a) => a.bulan <= kini) || semua[semua.length - 1];
    const arsip = semua.filter((a) => a !== utama && a.bulan <= kini);
    const ig = (a) => (a.instagram ? `<a class="hl" href="https://instagram.com/${E(String(a.instagram).replace(/^@/, ""))}" target="_blank" rel="noopener">@${E(String(a.instagram).replace(/^@/, ""))}</a>` : "");
    const kig = String(K.instagram || "").replace(/^@/, "");

    el.innerHTML = ctx.ui.judulHal("Apresiasi Atlet MIPA", "Atlet MIPA Bulan Ini", "Panggung untuk mahasiswa FMIPA yang berprestasi di klub dan lomba olahraga. Kuliah jalan, prestasi juga jalan.") + `
      <section class="bso-section"><div class="wrap">
        ${tagContoh(S.contoh.atlet, "Nama, foto, dan prestasi di mode demo hanya contoh.")}
        ${utama ? `<article class="km-atlet">
          ${fotoAtlet(utama, "km-atlet-foto")}
          <div>
            <span class="eyebrow">Atlet MIPA · ${E(fmtBulan(utama.bulan))}</span>
            <h2>${E(utama.nama)}</h2>
            <div class="chips" style="margin:6px 0 14px"><span class="chip">${ikonCabor(utama.cabor)} ${E(utama.cabor || "")}</span>${utama.departemen ? `<span class="chip solid">${E(utama.departemen)}${utama.angkatan ? " " + E(utama.angkatan) : ""}</span>` : ""}${utama.klub ? `<span class="chip gray">${E(utama.klub)}</span>` : ""}</div>
            ${(utama.prestasi || []).length ? `<ul class="km-prestasi">${utama.prestasi.map((p) => `<li>${FC.icon("trophy")}<span>${E(p)}</span></li>`).join("")}</ul>` : ""}
            ${utama.cerita ? `<blockquote class="km-kutip">“${E(utama.cerita)}”</blockquote>` : ""}
            ${ig(utama)}
          </div>
        </article>` : `<div class="empty bso-empty-sm"><p>Rubrik Atlet MIPA Bulan Ini segera hadir di sini dan di Instagram BEM.</p></div>`}
        ${arsip.length ? `<h3 class="form-section-title" style="margin-top:34px">Bulan-bulan sebelumnya</h3>
          <div class="km-arsip">${arsip.map((a) => `<article class="bso-card km-arsip-item">${fotoAtlet(a, "km-arsip-foto")}<div><small class="km-label">${E(fmtBulan(a.bulan))}</small><h3>${E(a.nama)}</h3><p>${ikonCabor(a.cabor)} ${E(a.cabor || "")}${a.departemen ? " · " + E(a.departemen) : ""}</p>${(a.prestasi || [])[0] ? `<p class="km-meta">${FC.icon("trophy")}<span>${E(a.prestasi[0])}</span></p>` : ""}</div></article>`).join("")}</div>` : ""}
      </div></section>
      <section class="bso-section"><div class="wrap"><div class="km-teman">
        <div><span class="eyebrow">Punya prestasi olahraga?</span><h2>Kami ingin mengenalmu</h2>
          <p class="muted">Aktif di klub atau baru juara lomba olahraga di luar kampus? Kabari KOMIPA supaya prestasimu bisa tampil di rubrik ini${kig ? " dan di Instagram" : ""}. Kamu tidak akan dibebani tugas apa pun.</p></div>
        <div class="km-teman-aksi">${kig ? `<a class="btn btn-primary" href="https://instagram.com/${E(kig)}" target="_blank" rel="noopener">${FC.icon("camera")} DM @${E(kig)}</a>` : ""}${ctx.ui.kontakHtml() || ""}</div>
      </div></div></section>`;
  }

  FC.bsoExt = {
    beranda,
    publik: [
      { id: "rutin", judul: "Jadwal Latihan", sub: "KOMIPA Rutin tiap 2 minggu", penuh: true, render: hRutin },
      { id: "liga", judul: "Liga MIPA", sub: "Klasemen, jadwal, top skor", penuh: true, render: hLiga },
      { id: "atlet", judul: "Atlet MIPA", sub: "Atlet MIPA Bulan Ini", penuh: true, render: hAtlet }
    ],
    admin: []
  };
})();
