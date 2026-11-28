/* =====================================================================
   GSC-5 — MEKANISME KHUSUS ("Nyanyi tanpa ribet")
   File ini milik pengurus GSC-5. Ubah file di folder gsc5/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman publik khusus GSC-5:
     #/panggung     → jadwal tampil di acara fakultas + latihan menjelang tampil
     #/ikut-nyanyi  → anggota inti & lepas, keuntungan, pilih acara → pesan WhatsApp
     #/bareng-aswa  → pembagian fokus & kolaborasi dengan ASWA
   Isi jadwal diatur di gsc5/panggung.js. Teks identitas, program kerja,
   dan nomor WhatsApp narahubung (kontak.whatsapp) ada di assets/js/bso-config.js.

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const G = window.GSC5 || { tampil: [] };

  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const BLN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hariIni = () => iso(new Date());
  const keTgl = (s) => { const [y, m, d] = String(s || "").split("-").map(Number); return y ? new Date(y, (m || 1) - 1, d || 1) : null; };
  const fmtTgl = (s) => { const d = keTgl(s); return d ? `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}` : ""; };
  const hariNama = (s) => { const d = keTgl(s); return d ? ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][d.getDay()] : ""; };
  const tautan = (u) => (u === "#" ? "#" : FC.safeUrl(u));

  const JENIS = {
    pkkmb: "PKKMB", pelantikan: "Pelantikan", yudisium: "Yudisium", dies: "Dies Natalis",
    bem: "Acara BEM", aswa: "Bareng ASWA", lain: "Acara lain"
  };

  // Di mode demo (belum tersambung database) jadwal kosong diisi contoh dari panggung.js
  function sumber(ctx) {
    const asli = (G.tampil || []).filter((a) => keTgl(a.tanggal));
    const contoh = !asli.length && ctx.ui.demo && typeof G.contoh === "function";
    const list = (contoh ? G.contoh() : asli).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    return { list, contoh };
  }
  const akanDatang = (a) => a.tanggal >= hariIni();

  function linkGCal(judul, tanggal, jam, tempat, isi) {
    const tg = tanggal.replace(/-/g, "");
    let dates;
    if (jam) {
      const m = String(jam).replace(/[.:]/g, "").padEnd(4, "0");
      const h = Math.min(23, parseInt(m.slice(0, 2), 10) + 2);
      dates = `${tg}T${m}00/${tg}T${pad(h)}${m.slice(2)}00`;
    } else {
      const b = keTgl(tanggal); b.setDate(b.getDate() + 1);
      dates = `${tg}/${iso(b).replace(/-/g, "")}`;
    }
    const p = new URLSearchParams({ action: "TEMPLATE", text: judul, dates, ctz: "Asia/Jakarta", details: isi || "", location: tempat || "" });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }

  let pilihAwal = null; // acara yang dipilih dari halaman Panggung → dicentang di Ikut Nyanyi

  /* =================================================================
     PANGGUNG (jadwal tampil)
     ================================================================= */
  let fWaktu = "akan";
  function kartuTampil(a, i) {
    const d = keTgl(a.tanggal), lewat = !akanDatang(a), video = tautan(a.video);
    const latihan = (a.latihan || []).filter((l) => keTgl(l.tanggal));
    return `<article class="gs-tampil${lewat ? " lewat" : ""}">
      <div class="gs-tgl" aria-hidden="true"><b>${d.getDate()}</b><small>${BLN[d.getMonth()]} ${d.getFullYear()}</small></div>
      <div class="gs-isi">
        <div class="top"><span class="chip">${E(JENIS[a.jenis] || JENIS.lain)}</span>${lewat ? `<span class="chip gray">Sudah tampil</span>` : a.buka ? `<span class="chip ok">Masih bisa ikut</span>` : `<span class="chip warn">Akan datang</span>`}</div>
        <h3>${E(a.acara)}</h3>
        <p class="gs-meta">${FC.icon("cal")}<span>${E(hariNama(a.tanggal))}, ${E(fmtTgl(a.tanggal))}${a.jam ? " · " + E(a.jam) + " WIB" : ""}</span></p>
        ${a.tempat ? `<p class="gs-meta">${FC.icon("pin")}<span>${E(a.tempat)}</span></p>` : ""}
        ${(a.lagu || []).length ? `<p class="gs-meta">${FC.icon("mega")}<span>${a.lagu.map(E).join(" · ")}</span></p>` : ""}
        ${a.catatan ? `<p class="gs-catatan">${E(a.catatan)}</p>` : ""}
        ${!lewat && latihan.length ? `<div class="gs-latihan"><span class="gs-label">Latihan menjelang tampil</span><ol>${latihan.map((l) => `<li><b>${E(hariNama(l.tanggal))}, ${E(fmtTgl(l.tanggal))}</b><span>${[l.jam ? l.jam + " WIB" : "", l.tempat].filter(Boolean).map(E).join(" · ")}</span></li>`).join("")}</ol></div>` : ""}
        <div class="gs-aksi">
          ${lewat
            ? (video ? `<a class="btn btn-ghost btn-sm" href="${E(video)}" target="_blank" rel="noopener">${FC.icon("play")} Tonton penampilan</a>` : "")
            : `${a.buka ? `<a class="btn btn-primary btn-sm" href="#/ikut-nyanyi" data-ikut="${i}">${FC.icon("plus")} Ikut tampil</a>` : ""}
               <a class="btn btn-ghost btn-sm" href="${E(linkGCal(a.acara + " · GSC-5", a.tanggal, a.jam, a.tempat, (a.lagu || []).length ? "Lagu: " + a.lagu.join(", ") : ""))}" target="_blank" rel="noopener">${FC.icon("cal")} Simpan ke Google Calendar</a>`}
        </div>
      </div>
    </article>`;
  }
  function hPanggung(el, ctx) {
    const S = sumber(ctx);
    const akan = S.list.filter(akanDatang);
    const lewat = S.list.filter((a) => !akanDatang(a)).reverse();
    const n = { akan: akan.length, lewat: lewat.length };
    el.innerHTML = ctx.ui.judulHal("Panggung", "Jadwal tampil GSC-5", "Kami mengisi suara di acara-acara resmi FMIPA. Panggungnya sudah ada, kamu tinggal ikut latihan 2–3 kali lalu tampil.") + `
      <section class="bso-section"><div class="wrap">
        <ul class="gs-panggung" aria-label="Acara yang biasa kami isi">
          ${["PKKMB", "Pelantikan", "Yudisium", "Dies Natalis", "Acara BEM", "Panggung ASWA"].map((x) => `<li>${FC.icon("mega")}<span>${E(x)}</span></li>`).join("")}
        </ul>
        <div class="bso-toolbar" style="margin-top:28px">
          <div class="tabs" role="tablist" aria-label="Filter jadwal">
            <button class="tab" role="tab" type="button" data-w="akan" aria-selected="${fWaktu === "akan"}">Akan datang <span class="count">${n.akan}</span></button>
            <button class="tab" role="tab" type="button" data-w="lewat" aria-selected="${fWaktu === "lewat"}">Sudah tampil <span class="count">${n.lewat}</span></button>
          </div>
          <a class="btn btn-ghost btn-sm" href="#/ikut-nyanyi">${FC.icon("users")} Cara ikut tampil</a>
        </div>
        ${S.contoh ? `<p class="muted" style="margin:-6px 0 14px"><span class="contoh-tag">CONTOH</span> Jadwal di mode demo hanya contoh.</p>` : ""}
        <div data-isi></div>
      </div></section>`;
    const isi = el.querySelector("[data-isi]");
    const gambar = () => {
      const rows = fWaktu === "akan" ? akan : lewat;
      isi.innerHTML = rows.length ? `<div class="gs-tampil-list">${rows.map((a) => kartuTampil(a, S.list.indexOf(a))).join("")}</div>`
        : `<div class="empty bso-empty-sm"><p>${fWaktu === "akan" ? "Jadwal tampil berikutnya segera diumumkan. Pantau terus, ya!" : "Belum ada penampilan yang tercatat."}</p></div>`;
      isi.querySelectorAll("[data-ikut]").forEach((b) => b.onclick = () => { pilihAwal = S.list[+b.dataset.ikut].acara; });
    };
    el.querySelectorAll("[data-w]").forEach((b) => b.onclick = () => { fWaktu = b.dataset.w; el.querySelectorAll("[data-w]").forEach((x) => x.setAttribute("aria-selected", x === b)); gambar(); });
    gambar();
  }

  /* =================================================================
     IKUT NYANYI (keanggotaan fleksibel)
     ================================================================= */
  const KEUNTUNGAN = [
    { ikon: "mega", judul: "Latihan vokal bareng pelatih", isi: "Direncanakan bersama UKM paduan suara UM, jadi kamu belajar teknik vokal tanpa bayar kursus.", rencana: true },
    { ikon: "camera", judul: "Video penampilanmu", isi: "Tiap penampilan didokumentasikan dan bisa kamu posting di media sosialmu." },
    { ikon: "heart", judul: "Konsumsi saat latihan", isi: "Disediakan di tiap latihan menjelang tampil." },
    { ikon: "flag", judul: "Panggung besar", isi: "Tampil di depan dosen dan ratusan mahasiswa di PKKMB, yudisium, dan dies natalis." },
    { ikon: "trophy", judul: "Sertifikat penampilan", isi: "Bukti kegiatan untuk CV dan pendaftaran beasiswa." },
    { ikon: "users", judul: "Relasi lintas jurusan", isi: "Kenalan dengan penyanyi dari jurusan lain, dan nantinya dengan anggota UKM paduan suara UM." },
    { ikon: "spark", judul: "Peluang lomba di luar", isi: "Membawa nama FMIPA di lomba paduan suara, dan prestasinya masuk portofoliomu." }
  ];
  const SUARA = ["Sopran", "Alto", "Tenor", "Bass", "Belum tahu"];

  function hIkutNyanyi(el, ctx) {
    const S = sumber(ctx);
    const opsi = S.list.filter((a) => akanDatang(a) && a.buka);
    const k = (ctx.ui.data().kontak || {});
    const wa = ctx.ui.waLink(k.whatsapp);
    const p = ctx.profil || {};
    const pilihan = new Set(pilihAwal && opsi.some((a) => a.acara === pilihAwal) ? [pilihAwal] : []);
    pilihAwal = null;

    el.innerHTML = ctx.ui.judulHal("Ikut nyanyi", "Nyanyi tanpa ribet", "Tidak perlu latihan tiap minggu dan tidak ada audisi. Pilih acara yang jadwalnya cocok, ikut latihan 2–3 kali, lalu tampil.") + `
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Pilih komitmenmu</span><h2>Dua cara bergabung</h2>
        <div class="gs-jenis">
          <article class="bso-card gs-jenis-kartu">
            <div class="gs-jenis-top"><h3>Anggota lepas</h3><span class="chip ok">Terbuka untuk semua</span></div>
            <p>Ikut latihan dan tampil hanya di acara yang kamu pilih. Jumlahnya tidak dibatasi.</p>
            <ul class="gs-cek">
              <li>${FC.icon("check")}<span>Tanpa audisi</span></li>
              <li>${FC.icon("check")}<span>Pilih acara sendiri, tidak wajib ikut semua</span></li>
              <li>${FC.icon("check")}<span>Latihan cukup 2–3 kali menjelang tampil</span></li>
            </ul>
          </article>
          <article class="bso-card gs-jenis-kartu">
            <div class="gs-jenis-top"><h3>Anggota inti</h3><span class="chip">5–8 orang</span></div>
            <p>Mengurus jadwal tampil, koordinasi dengan ASWA dan UKM paduan suara, serta komunikasi ke anggota lepas.</p>
            <ul class="gs-cek">
              <li>${FC.icon("check")}<span>Aktif rutin sepanjang periode</span></li>
              <li>${FC.icon("check")}<span>Belajar mengelola tim dan acara</span></li>
              <li>${FC.icon("check")}<span>Tertarik? Sebutkan di pesanmu di bawah</span></li>
            </ul>
          </article>
        </div>
      </div></section>

      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Yang kamu dapat</span><h2>Keuntungan ikut GSC-5</h2>
        <div class="gs-untung">${KEUNTUNGAN.map((u) => `<article class="gs-untung-item"><span class="gs-ikon">${FC.icon(u.ikon)}</span><div><h3>${E(u.judul)}${u.rencana ? ' <span class="chip gray">Direncanakan</span>' : ""}</h3><p>${E(u.isi)}</p></div></article>`).join("")}</div>
      </div></section>

      <section class="bso-section" id="pilih"><div class="wrap gs-pilih">
        <div>
          <span class="eyebrow">Pilih acaramu</span><h2>Mau tampil di acara mana?</h2>
          <p class="muted">Centang acara yang jadwalnya cocok, isi namamu, lalu kirim pesannya ke narahubung GSC-5. Kamu akan dimasukkan ke grup latihan acara itu.</p>
          ${S.contoh ? `<p class="muted" style="margin-top:8px"><span class="contoh-tag">CONTOH</span> Daftar acara di mode demo hanya contoh.</p>` : ""}
          <form class="gs-form" data-form>
            <fieldset class="gs-opsi"><legend class="gs-label">Acara yang masih bisa diikuti</legend>
              ${opsi.length ? opsi.map((a, i) => `<label class="gs-opsi-item"><input type="checkbox" name="acara" value="${i}" ${pilihan.has(a.acara) ? "checked" : ""}>
                <span><b>${E(a.acara)}</b><small>${E(hariNama(a.tanggal))}, ${E(fmtTgl(a.tanggal))}${(a.latihan || []).length ? ` · ${a.latihan.length}× latihan` : ""}</small></span></label>`).join("")
                : `<p class="muted">Belum ada acara yang dibuka. Kamu tetap bisa mengirim pesan supaya dikabari saat jadwal berikutnya keluar.</p>`}
            </fieldset>
            <div class="field"><label for="gsNama">Nama</label><input id="gsNama" name="nama" type="text" autocomplete="name" value="${E(p.nama || "")}" required></div>
            <div class="field"><label for="gsProdi">Prodi dan angkatan <span class="muted">(opsional)</span></label><input id="gsProdi" name="prodi" type="text" value="${E([p.prodi, p.angkatan].filter(Boolean).join(" ")) }" placeholder="Contoh: Kimia 2026"></div>
            <div class="field"><label for="gsSuara">Jenis suara</label><select id="gsSuara" name="suara">${SUARA.map((s) => `<option${s === "Belum tahu" ? " selected" : ""}>${E(s)}</option>`).join("")}</select><span class="hint">Belum tahu juga tidak apa-apa, nanti dicek saat latihan pertama.</span></div>
            <label class="check"><input type="checkbox" name="inti"> Saya juga tertarik jadi anggota inti</label>
          </form>
        </div>
        <aside class="gs-pesan">
          <span class="gs-label">Pratinjau pesan</span>
          <pre data-pesan></pre>
          <div class="gs-aksi">
            ${wa ? `<a class="btn btn-primary" data-wa target="_blank" rel="noopener" href="${E(wa)}">${FC.icon("chat")} Kirim ke WhatsApp${k.narahubung ? " " + E(k.narahubung) : ""}</a>` : ""}
            <button class="btn btn-ghost" type="button" data-salin>${FC.icon("copy")} Salin pesan</button>
          </div>
          ${wa ? "" : `<p class="muted gs-kecil">Nomor narahubung GSC-5 segera diumumkan. Sementara ini, salin pesannya dan kirim ke pengurus GSC-5 yang kamu kenal.</p>`}
        </aside>
      </div></section>`;

    const form = el.querySelector("[data-form]"), pre = el.querySelector("[data-pesan]"), aWa = el.querySelector("[data-wa]");
    const susun = () => {
      const f = new FormData(form);
      const acara = f.getAll("acara").map((i) => opsi[+i]);
      const nama = String(f.get("nama") || "").trim();
      const prodi = String(f.get("prodi") || "").trim();
      const baris = [`Halo kak, saya ${nama || "(nama)"}${prodi ? ` dari ${prodi}` : ""}. Saya mau ikut nyanyi bareng GSC-5.`, ""];
      if (acara.length) { baris.push("Acara yang ingin saya ikuti:"); acara.forEach((a) => baris.push(`- ${a.acara} (${fmtTgl(a.tanggal)})`)); }
      else baris.push("Tolong kabari saya kalau ada jadwal tampil berikutnya, ya.");
      baris.push("", `Jenis suara: ${f.get("suara")}`);
      if (f.get("inti")) baris.push("Saya juga tertarik jadi anggota inti.");
      baris.push("", "Terima kasih!");
      const teks = baris.join("\n");
      pre.textContent = teks;
      if (aWa) aWa.href = wa + "?text=" + encodeURIComponent(teks);
      return teks;
    };
    form.addEventListener("input", susun);
    form.addEventListener("change", susun);
    form.addEventListener("submit", (e) => e.preventDefault());
    if (aWa) aWa.addEventListener("click", (e) => { if (!String(new FormData(form).get("nama") || "").trim()) { e.preventDefault(); FC.toast("Isi namamu dulu, ya.", "err"); form.nama.focus(); } });
    el.querySelector("[data-salin]").onclick = async () => {
      const teks = susun();
      try { await navigator.clipboard.writeText(teks); FC.toast("Pesan disalin."); }
      catch (e) { const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); FC.toast("Pesan sudah ditandai, tekan Ctrl+C untuk menyalin."); }
    };
    susun();
    if (pilihan.size) setTimeout(() => el.querySelector("#pilih").scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  /* =================================================================
     BARENG ASWA
     ================================================================= */
  function hBarengAswa(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Bareng ASWA", "GSC-5 × ASWA", "GSC-5 adalah lengan vokal ASWA (Arek Seni Warga MIPA). Kami berdiri sendiri, tetapi kerjanya menempel: jadwal disusun bersama dan panggung besar dipegang berdua.") + `
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Pembagian fokus</span><h2>Siapa mengurus apa</h2>
        <div class="gs-duo">
          <article class="bso-card gs-duo-kartu"><span class="gs-label">GSC-5</span><h3>Vokal dan paduan suara</h3><p>Mengisi suara di acara fakultas, latihan menjelang tampil, dan lomba paduan suara antarjurusan.</p></article>
          <span class="gs-duo-x" aria-hidden="true">×</span>
          <article class="bso-card gs-duo-kartu"><span class="gs-label">ASWA</span><h3>Bidang seni lainnya</h3><p>Teater, musik, seni rupa, dan tari: dari Studio ASWA sampai Open Panggung.</p></article>
        </div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Bentuk kolaborasi</span><h2>Kerja bareng sepanjang periode</h2>
        <div class="bso-fokus">
          <article class="bso-card"><span class="bso-num">01</span><h3>Jadwal disusun bersama</h3><p>Kegiatan GSC-5 dan ASWA dijadwalkan bareng supaya tidak bentrok dan anggota bisa ikut keduanya.</p></article>
          <article class="bso-card"><span class="bso-num">02</span><h3>Ikut tampil di Open Panggung</h3><p>GSC-5 ikut mengisi Open Panggung ASWA, panggung latihan yang digelar beberapa kali tiap semester.</p></article>
          <article class="bso-card"><span class="bso-num">03</span><h3>Segmen puncak berdua</h3><p>Direncanakan tampil bersama di segmen puncak pada acara Character Building BEM, termasuk sesi lomba paduan suara antarjurusan. Jadwalnya mengikuti acara tersebut.</p></article>
        </div>
        <div class="gs-aksi" style="margin-top:26px">
          <a class="btn btn-primary" href="${E(ctx.root || "../")}aswa/#/panggung">${FC.icon("arrow")} Lihat panggung ASWA</a>
          <a class="btn btn-ghost" href="#/panggung">Jadwal tampil GSC-5</a>
        </div>
      </div></section>`;
  }

  FC.bsoExt = {
    publik: [
      { id: "panggung", judul: "Panggung", sub: "Jadwal tampil & latihan", penuh: true, render: hPanggung },
      { id: "ikut-nyanyi", judul: "Ikut Nyanyi", sub: "Tanpa audisi, pilih acaramu", penuh: true, render: hIkutNyanyi },
      { id: "bareng-aswa", judul: "Bareng ASWA", sub: "Lengan vokal ASWA", penuh: true, render: hBarengAswa }
    ],
    admin: []
  };
})();
