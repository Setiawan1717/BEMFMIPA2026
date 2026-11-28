/* =====================================================================
   ASWA — MEKANISME KHUSUS ("Ruang berkarya warga MIPA")
   File ini milik pengurus ASWA. Ubah file di folder aswa/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman publik khusus ASWA:
     #/studio       → Studio ASWA: latihan bergilir per bidang + jadwal
     #/kirim-karya  → alur Upload Karya Warga MIPA + Spotlight Instagram
     #/panggung     → Open Panggung, Segmen Puncak di Character Building, alur setahun
     #/keuntungan   → keuntungan ikut ASWA + kenapa tidak berat
   Isi jadwal, link formulir, dan spotlight diatur di aswa/karya.js.
   Teks identitas dan program kerja ada di assets/js/bso-config.js.

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const A = window.ASWA || { bidang: [], studio: [], panggung: [], spotlight: [] };

  // Di mode demo, jadwal & spotlight yang masih kosong diisi data contoh dari karya.js
  function sumber(ctx) {
    const c = ctx.ui.demo && typeof A.contoh === "function" ? A.contoh() : null;
    const pilih = (k) => ((A[k] || []).length ? { list: A[k], contoh: false } : { list: (c && c[k]) || [], contoh: !!(c && (c[k] || []).length) });
    return { studio: pilih("studio"), panggung: pilih("panggung"), spotlight: pilih("spotlight") };
  }
  const tagContoh = (s) => (s.contoh ? ' <span class="contoh-tag">CONTOH</span>' : "");

  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hariIni = () => iso(new Date());
  const keTgl = (s) => { const [y, m, d] = String(s || "").split("-").map(Number); return y ? new Date(y, (m || 1) - 1, d || 1) : null; };
  const fmtTgl = (s) => { const d = keTgl(s); return d ? `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}` : ""; };
  const hariNama = (s) => { const d = keTgl(s); return d ? ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()] : ""; };
  const tautan = (u) => (u === "#" ? "#" : FC.safeUrl(u));
  const bidangDari = (id) => (A.bidang || []).find((b) => b.id === id) || { id: id || "lain", nama: id || "Umum" };

  function gcal(a, judul) {
    const tg = a.tanggal.replace(/-/g, "");
    const jam = (j) => (j ? String(j).replace(/[.:]/g, "").padEnd(4, "0") + "00" : "");
    let dates;
    if (a.jam) {
      const mulai = jam(a.jam);
      let akhir = jam(a.selesai);
      if (!akhir) { const h = Math.min(23, parseInt(mulai.slice(0, 2), 10) + 2); akhir = pad(h) + mulai.slice(2); }
      dates = `${tg}T${mulai}/${tg}T${akhir}`;
    } else {
      const b = keTgl(a.tanggal); b.setDate(b.getDate() + 1);
      dates = `${tg}/${iso(b).replace(/-/g, "")}`;
    }
    const p = new URLSearchParams({ action: "TEMPLATE", text: judul + " · ASWA", dates, ctz: "Asia/Jakarta", details: a.materi || a.isi || "", location: a.tempat || "" });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }
  const tombolGcal = (a, judul) => `<a class="btn btn-ghost btn-sm" href="${E(gcal(a, judul))}" target="_blank" rel="noopener">${FC.icon("cal")} Simpan ke Google Calendar</a>`;

  /* =================================================================
     STUDIO ASWA
     ================================================================= */
  let fBidang = "";
  let lihatLalu = false;
  function hStudio(el, ctx) {
    const S = sumber(ctx).studio;
    const kini = hariIni();
    const semua = S.list.filter((s) => s.tanggal).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const cocok = semua.filter((s) => !fBidang || s.bidang === fBidang);
    const depan = cocok.filter((s) => s.tanggal >= kini), lalu = cocok.filter((s) => s.tanggal < kini).reverse();
    const baris = (s) => {
      const b = bidangDari(s.bidang), d = keTgl(s.tanggal);
      return `<article class="as-jadwal">
        <span class="as-tgl"><b>${d.getDate()}</b><small>${BULAN[d.getMonth()].slice(0, 3)}</small></span>
        <div class="as-jadwal-isi">
          <div class="top"><span class="chip as-chip ${E(b.id)}">${E(b.nama)}</span>${s.tanggal === kini ? '<span class="chip ok">Hari ini</span>' : ""}</div>
          <b>${E(s.materi || "Latihan " + b.nama)}</b>
          <small>${E([hariNama(s.tanggal), s.jam ? s.jam + (s.selesai ? "–" + s.selesai : "") + " WIB" : "", s.tempat].filter(Boolean).join(" · "))}</small>
          ${s.pelatih ? `<small>${FC.icon("user")} ${E(s.pelatih)}</small>` : ""}
        </div>
        ${s.tanggal >= kini ? `<div class="as-jadwal-aksi">${tombolGcal(s, "Studio " + b.nama)}</div>` : ""}
      </article>`;
    };
    el.innerHTML = ctx.ui.judulHal("Studio ASWA", "Studio ASWA", "Latihan seni rutin yang bergilir per bidang. Tiap minggu ada latihan, bidangnya berganti, jadi tiap bidang cukup sebulan sekali.") + `
      <section class="bso-section"><div class="wrap">
        <ul class="as-aturan">
          <li>${FC.icon("clock")}<span><b>1–2 jam per sesi</b><small>Format santai: olah tubuh dan vokal, akting, jamming, atau sketsa.</small></span></li>
          <li>${FC.icon("check")}<span><b>Pilih bidangmu sendiri</b><small>Cukup ikut bidang yang kamu minati, tidak wajib semua.</small></span></li>
          <li>${FC.icon("cal")}<span><b>Sebulan sekali per bidang</b><small>Jadwal dikunci sejak awal periode.</small></span></li>
          <li>${FC.icon("users")}<span><b>Didampingi pelatih</b><small>Dari UKM seni UM, Seniora, atau alumni.</small></span></li>
        </ul>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Empat bidang</span><h2>Pilih bidang yang kamu suka</h2>
        <p class="muted" style="margin:-12px 0 20px">Klik salah satu bidang untuk melihat jadwalnya saja.</p>
        <div class="as-bidang">${(A.bidang || []).map((b, i) => `<button type="button" class="as-bidang-kartu ${E(b.id)}" data-b="${E(b.id)}" aria-pressed="${fBidang === b.id}">
            <span class="as-minggu">Giliran ${i + 1}</span><h3>${E(b.nama)}</h3><p>${E(b.isi)}</p>
            <span class="as-tags">${(b.kegiatan || []).map((k) => `<span>${E(k)}</span>`).join("")}</span>
            ${b.pj ? `<small class="as-pj">PJ: ${E(b.pj)}</small>` : ""}</button>`).join("")}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Jadwal latihan${tagContoh(S)}</span><h2>${fBidang ? "Studio " + E(bidangDari(fBidang).nama) : "Semua bidang"}</h2></div>
          ${fBidang ? `<button class="btn btn-ghost btn-sm" type="button" data-semua>Tampilkan semua bidang</button>` : ""}</div>
        ${!semua.length ? `<div class="empty bso-empty-sm"><p>Jadwal Studio ASWA sedang disusun dan akan diumumkan di awal periode.</p></div>`
          : `${depan.length ? `<div class="as-jadwal-list">${depan.map(baris).join("")}</div>` : `<div class="empty bso-empty-sm"><p>Belum ada jadwal berikutnya untuk bidang ini.</p></div>`}
            ${lalu.length ? `<button class="btn btn-ghost btn-sm" type="button" data-lalu style="margin-top:18px">${lihatLalu ? "Sembunyikan" : "Lihat"} latihan yang sudah lewat (${lalu.length})</button>
              ${lihatLalu ? `<div class="as-jadwal-list as-lalu">${lalu.map(baris).join("")}</div>` : ""}` : ""}`}
      </div></section>`;
    el.querySelectorAll("[data-b]").forEach((b) => b.onclick = () => { fBidang = fBidang === b.dataset.b ? "" : b.dataset.b; hStudio(el, ctx); });
    const s = el.querySelector("[data-semua]"); if (s) s.onclick = () => { fBidang = ""; hStudio(el, ctx); };
    const l = el.querySelector("[data-lalu]"); if (l) l.onclick = () => { lihatLalu = !lihatLalu; hStudio(el, ctx); };
  }

  /* =================================================================
     KIRIM KARYA + SPOTLIGHT
     ================================================================= */
  const ALUR_KARYA = [
    ["Kirim", "Upload karyamu kapan saja, cukup dari HP.", "up"],
    ["Dikurasi", "Pengurus ASWA melihat dan memilih karya yang masuk.", "search"],
    ["Tampil atau dipajang", "Karya terpilih tampil di open panggung atau dipajang.", "mega"],
    ["Segmen puncak", "Karya terbaik naik ke panggung besar di Character Building.", "trophy"]
  ];
  const JENIS_KARYA = ["Lagu", "Puisi", "Tari", "Gambar", "Desain", "Video", "Monolog", "Fotografi"];
  function hKirimKarya(el, ctx) {
    const S = sumber(ctx).spotlight;
    const form = FC.safeUrl(A.formKarya);
    const ig = String(A.instagram || "").replace(/^@/, "");
    const sp = S.list.slice().sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
    el.innerHTML = ctx.ui.judulHal("Upload Karya Warga MIPA", "Kirim Karya", "Punya lagu, puisi, tari, gambar, desain, atau video? Kirim saja. Tujuannya memberi panggung, bukan mencari juara.") + `
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Alurnya</span><h2>Dari HP-mu sampai ke panggung</h2>
        <ol class="as-alur">${ALUR_KARYA.map(([j, t, ik], i) => `<li><span class="as-alur-ikon">${FC.icon(ik)}</span><span class="as-alur-no">${i + 1}</span><b>${E(j)}</b><small>${E(t)}</small></li>`).join("")}</ol>
      </div></section>
      <section class="bso-section"><div class="wrap as-kirim">
        <div>
          <span class="eyebrow">Boleh karya apa saja</span><h2>Semua warga MIPA boleh ikut</h2>
          <div class="as-tags as-tags-lg">${JENIS_KARYA.map((j) => `<span>${E(j)}</span>`).join("")}<span>…dan lainnya</span></div>
          <ul class="as-cek">
            <li>${FC.icon("check")}<span>Tidak harus jadi anggota ASWA untuk mengirim karya dan tampil.</span></li>
            <li>${FC.icon("check")}<span>Semua yang mengirim punya kesempatan tampil.</span></li>
            <li>${FC.icon("check")}<span>Karya rupa terbaik bisa dipakai untuk merch, poster, atau feed BEM dengan nama pembuatnya dicantumkan.</span></li>
          </ul>
        </div>
        <div class="as-kirim-box">
          <span class="as-alur-ikon">${FC.icon("up")}</span>
          <h3>Siap mengirim?</h3>
          <p class="muted">Isi formulir singkat dan sertakan link atau file karyamu.</p>
          ${form ? `<a class="btn btn-primary" href="${E(form)}" target="_blank" rel="noopener">Kirim karya ${FC.icon("arrow")}</a>` : `<button class="btn btn-primary" type="button" disabled>Formulir segera dibuka</button><small class="muted">Pantau Instagram BEM FMIPA untuk info pembukaan.</small>`}
        </div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Spotlight Karya Warga MIPA${tagContoh(S)}</span><h2>Sudah tampil di Instagram</h2></div>
          ${ig ? `<a class="btn btn-ghost btn-sm" href="https://instagram.com/${E(ig)}" target="_blank" rel="noopener">${FC.icon("camera")} Ikuti @${E(ig)}</a>` : ""}</div>
        <p class="muted" style="margin:-12px 0 20px">Dua kali sebulan, ASWA menampilkan satu warga MIPA beserta karyanya.</p>
        ${sp.length ? `<div class="as-spot-grid">${sp.map((s) => { const u = tautan(s.ig); return `<article class="as-spot">
            <span class="bso-ava">${E(FC.initials(String(s.nama || "").replace(/^Contoh:\s*/, "")))}</span>
            <div><span class="chip">${E(s.jenis || "Karya")}</span><h3>${E(s.karya)}</h3><small>${E([s.nama, s.prodi].filter(Boolean).join(" · "))}</small>
            <div class="as-spot-bawah">${s.tanggal ? `<small>${E(fmtTgl(s.tanggal))}</small>` : "<span></span>"}${u ? `<a class="hl" href="${E(u)}" target="_blank" rel="noopener">Lihat di Instagram</a>` : ""}</div></div></article>`; }).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Spotlight pertama segera tayang. Kirim karyamu, siapa tahu kamu yang pertama.</p></div>`}
      </div></section>`;
  }

  /* =================================================================
     PANGGUNG: open panggung, segmen puncak, alur setahun
     ================================================================= */
  const ALUR_TAHUN = [
    ["Bulan 1–2", "Rekrutmen, Studio ASWA mulai, pembukaan upload karya, open panggung perdana"],
    ["Bulan 3–6", "Studio rutin, kurasi karya, open panggung, spotlight Instagram berjalan"],
    ["Bulan 7–10", "Studio rutin, open panggung, persiapan materi segmen puncak"],
    ["Menjelang Character Building", "Gladi akhir bersama GSC-5 dan semua bidang"],
    ["Character Building", "Segmen puncak ASWA + GSC-5, pameran karya, dan penghargaan"]
  ];
  function hPanggung(el, ctx) {
    const S = sumber(ctx).panggung;
    const kini = hariIni();
    const semua = S.list.filter((p) => p.tanggal).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const depan = semua.filter((p) => p.tanggal >= kini), lalu = semua.filter((p) => p.tanggal < kini).reverse();
    const kartu = (p) => {
      const sudah = p.tanggal < kini, v = tautan(p.video);
      return `<article class="as-panggung">
        <div class="top"><span class="chip ${sudah ? "gray" : "warn"}">${sudah ? "Sudah tampil" : p.tanggal === kini ? "Hari ini" : "Akan datang"}</span><small>${E([hariNama(p.tanggal) + ", " + fmtTgl(p.tanggal), p.jam ? p.jam + " WIB" : ""].filter(Boolean).join(" · "))}</small></div>
        <h3>${E(p.judul)}</h3>
        ${p.tempat ? `<p class="as-meta">${FC.icon("pin")}<span>${E(p.tempat)}</span></p>` : ""}
        ${p.isi ? `<p>${E(p.isi)}</p>` : ""}
        ${(p.penampil || []).length ? `<div class="as-tags">${p.penampil.map((x) => `<span>${E(x)}</span>`).join("")}</div>` : ""}
        <div class="as-aksi">${!sudah ? tombolGcal(p, p.judul) : ""}${v ? `<a class="btn btn-ghost btn-sm" href="${E(v)}" target="_blank" rel="noopener">${FC.icon("play")} Tonton</a>` : ""}</div>
      </article>`;
    };
    el.innerHTML = ctx.ui.judulHal("Panggung ASWA", "Panggung", "Dari panggung kecil di FMIPA sampai satu segmen penuh di acara besar BEM. Semua latihan dan karya punya tujuan yang jelas.") + `
      <section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Open Panggung${tagContoh(S)}</span><h2>Gladi serius, penonton sungguhan</h2></div></div>
        <p class="muted" style="margin:-12px 0 20px;max-width:680px">Panggung kecil 2–3 kali per semester untuk penampil ASWA, GSC-5, dan karya hasil upload. Gunanya membiasakan tampil di depan orang sebelum panggung besar.</p>
        ${semua.length ? `<div class="as-panggung-grid">${depan.concat(lalu).map(kartu).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Jadwal open panggung akan diumumkan bersama kalender ASWA di awal periode.</p></div>`}
      </div></section>
      <section class="bso-section"><div class="wrap">
        <div class="as-puncak">
          <div>
            <span class="eyebrow">Segmen Puncak</span><h2>Satu segmen penuh di Character Building BEM</h2>
            <p>Puncak periode tidak dibuat sebagai acara terpisah. ASWA dan GSC-5 direncanakan memegang satu segmen penuh di acara Character Building BEM, bukan sekadar satu penampilan. Tanggal pastinya mengikuti jadwal acara Character Building.</p>
            <div class="as-tags as-tags-lg"><span>Tari</span><span>Teater</span><span>Musik</span><span>Paduan suara GSC-5</span><span>Pameran karya hasil upload</span></div>
          </div>
          <div>
            <span class="eyebrow">Penghargaan</span>
            <ul class="as-award">
              <li>${FC.icon("heart")}<span><b>Penampil Favorit</b><small>Untuk penampil di segmen puncak</small></span></li>
              <li>${FC.icon("trophy")}<span><b>Karya Terbaik</b><small>Dari karya hasil upload</small></span></li>
              <li>${FC.icon("flag")}<span><b>Anggota Paling Konsisten</b><small>Rajin hadir di Studio ASWA</small></span></li>
            </ul>
          </div>
        </div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <a class="as-gsc" href="${E(ctx.root)}gsc5/#/bareng-aswa">
          <span class="as-alur-ikon">${FC.icon("mega")}</span>
          <span><small>Tampil bareng</small><b>GSC-5 ikut di setiap tahap panggung ASWA</b><small>Lihat pembagian peran ASWA dan GSC-5 di halaman GSC-5.</small></span>
          ${FC.icon("arrow")}
        </a>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Alur setahun</span><h2>Semua bermuara ke segmen puncak</h2>
        <ol class="as-tahun">${ALUR_TAHUN.map(([w, f]) => `<li><b>${E(w)}</b><span>${E(f)}</span></li>`).join("")}</ol>
      </div></section>`;
  }

  /* =================================================================
     KEUNTUNGAN
     ================================================================= */
  const UNTUNG = [
    ["Kelas seni gratis", "Belajar tari, teater, musik, dan seni rupa bersama pelatih tanpa biaya.", "Studio ASWA", "cap"],
    ["Portofolio", "Foto dan video penampilan yang bagus untuk IG pribadi, portofolio, atau daftar lomba di luar.", "Open panggung, segmen puncak", "camera"],
    ["Sorotan publik", "Ditampilkan dan di-tag di Instagram BEM.", "Spotlight, upload karya", "spark"],
    ["Sertifikat", "Sertifikat untuk penampil di segmen puncak.", "Segmen puncak", "shield"],
    ["Panggung lebih besar", "Penampil terbaik berpeluang direkomendasikan mengisi acara fakultas, universitas, atau acara luar.", "Semua tahap panggung", "mega"],
    ["Karya dipakai nyata", "Karya rupa terbaik dipakai untuk merch, poster, atau feed BEM dengan nama pembuatnya.", "Upload karya", "edit"],
    ["Penghargaan", "Penampil Favorit, Karya Terbaik, dan Anggota Paling Konsisten diumumkan di depan banyak orang.", "Segmen puncak", "trophy"],
    ["Pelepas penat", "Ruang berekspresi di sela laprak dan praktikum.", "Semua program", "heart"]
  ];
  const RINGAN = [
    ["Pilih bidang sendiri", "Cukup ikut latihan bidang yang kamu minati."],
    ["Komitmen ringan", "Latihan per bidang sebulan sekali, upload karya bisa kapan saja dari HP."],
    ["Tidak wajib jadi anggota", "Semua warga MIPA boleh upload dan tampil. Yang ingin lebih dalam baru bergabung sebagai anggota."],
    ["Satu PJ per bidang", "Tari, teater, musik, dan seni rupa masing-masing punya penanggung jawab sendiri."],
    ["Kalender dikunci dari awal", "Jadwal studio dan open panggung ditetapkan di awal periode, jadi tidak ada \"nanti kapan-kapan\"."],
    ["Target kecil tapi pasti", "Sekitar 4–6 open panggung setahun dan satu segmen puncak."]
  ];
  function hKeuntungan(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Kenapa ikut ASWA", "Keuntungan", "Les seni gratis, panggung buat tampil, dan karyamu dilihat banyak orang. Cukup sebulan sekali. Sisanya, biar karyamu yang bicara.") + `
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Yang kamu dapat</span><h2>Ikut ASWA, dapat apa?</h2>
        <div class="as-untung">${UNTUNG.map(([j, t, d, ik]) => `<article class="as-untung-kartu"><span class="as-alur-ikon">${FC.icon(ik)}</span><h3>${E(j)}</h3><p>${E(t)}</p><small>Dari: ${E(d)}</small></article>`).join("")}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Takut kegiatannya banyak?</span><h2>Dirancang supaya nggak berat</h2>
        <ul class="as-ringan">${RINGAN.map(([j, t]) => `<li>${FC.icon("check")}<span><b>${E(j)}</b><small>${E(t)}</small></span></li>`).join("")}</ul>
        <div class="as-cta-bawah">
          <a class="btn btn-primary" href="#/kirim-karya">Kirim karyamu</a>
          <a class="btn btn-ghost" href="#/studio">Lihat jadwal Studio</a>
        </div>
      </div></section>`;
  }

  FC.bsoExt = {
    publik: [
      { id: "studio", judul: "Studio", sub: "Latihan bergilir per bidang", penuh: true, render: hStudio },
      { id: "kirim-karya", judul: "Kirim Karya", sub: "Upload karya & spotlight", penuh: true, render: hKirimKarya },
      { id: "panggung", judul: "Panggung", sub: "Open panggung & segmen puncak", penuh: true, render: hPanggung },
      { id: "keuntungan", judul: "Keuntungan", sub: "Apa yang kamu dapat", penuh: true, render: hKeuntungan }
    ],
    admin: []
  };
})();
