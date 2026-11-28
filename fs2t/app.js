/* =====================================================================
   FS2T — MEKANISME KHUSUS ("Pusat riset dan publikasi mahasiswa FMIPA")
   File ini milik pengurus FS2T. Ubah file di folder fs2t/ saja,
   jangan mengubah file di assets/ (dipakai bersama semua sub divisi).

   Halaman publik khusus FS2T:
     #/alur        → Alur Riset: Belajar → Didampingi → Meneliti → Terbit
     #/kelas       → Kelas Publikasi (jadwal + topik bergilir) + Riset 101
     #/klinik      → Klinik Naskah: yang dibantu, alur, batas, daftar via WA
     #/bank-ide    → Bank Ide Riset, tersambung ke Cari Teman Lomba
     #/keuntungan  → peran pilihan, keuntungan, jenjang anggota
   Isi jadwal, arsip, bank ide, dan nomor WA diatur di fs2t/riset.js.
   Teks identitas dan program kerja ada di assets/js/bso-config.js.

   Setiap render(el, ctx) menerima:
     el   → elemen tempat menggambar isi
     ctx  → { slug, bso, info, user, profil, admin, D, root, ui, refresh() }
            ctx.ui = { judulHal, waLink, kontakHtml, data, contohTag, demo }
   ===================================================================== */
(function () {
  const FC = window.FC;
  const E = FC.esc;
  const R = window.FS2T || { kelas: [], riset101: [], bankIde: [] };

  // Di mode demo, daftar yang masih kosong diisi data contoh dari riset.js
  function sumber(ctx) {
    const c = ctx.ui.demo && typeof R.contoh === "function" ? R.contoh() : null;
    const pilih = (k) => ((R[k] || []).length ? { list: R[k], contoh: false } : { list: (c && c[k]) || [], contoh: !!(c && (c[k] || []).length) });
    return { kelas: pilih("kelas"), riset101: pilih("riset101"), bankIde: pilih("bankIde") };
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

  // Nomor WA: riset.js → kontak.whatsapp FS2T di bso-config.js
  function waPesan(ctx, teks) {
    const no = R.whatsapp || ((ctx.ui.data().kontak || {}).whatsapp) || "";
    const dasar = ctx.ui.waLink(no);
    return dasar ? dasar + "?text=" + encodeURIComponent(teks) : "";
  }

  function gcal(k) {
    const tg = k.tanggal.replace(/-/g, "");
    const jam = (j) => (j ? String(j).replace(/[.:]/g, "").padEnd(4, "0") + "00" : "");
    let dates;
    if (k.jam) {
      const mulai = jam(k.jam);
      let akhir = jam(k.selesai);
      if (!akhir) { const h = Math.min(23, parseInt(mulai.slice(0, 2), 10) + 1); akhir = pad(h) + mulai.slice(2); }
      dates = `${tg}T${mulai}/${tg}T${akhir}`;
    } else {
      const b = keTgl(k.tanggal); b.setDate(b.getDate() + 1);
      dates = `${tg}/${iso(b).replace(/-/g, "")}`;
    }
    const p = new URLSearchParams({ action: "TEMPLATE", text: "Kelas Publikasi FS2T: " + (k.topik || ""), dates, ctz: "Asia/Jakarta", details: k.pemateri ? "Pemateri: " + k.pemateri : "", location: k.tempat || "Online" });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }

  /* =================================================================
     ALUR RISET
     ================================================================= */
  const ALUR = [
    ["Belajar", "cap", "Mulai dari nol juga boleh. Ikuti Kelas Publikasi bulanan dan simak tips Riset 101 di Instagram.", [["Kelas Publikasi", "#/kelas"], ["Riset 101", "#/kelas"]]],
    ["Didampingi", "edit", "Sudah punya draf artikel, makalah lomba, atau proposal PKM? Bawa ke Klinik Naskah untuk dicek dan dicarikan jurnal tujuan.", [["Klinik Naskah", "#/klinik"]]],
    ["Meneliti", "search", "Ikut tim Riset Kolaboratif lintas prodi bersama dosen pembimbing, atau ambil topik dari Bank Ide Riset.", [["Bank Ide Riset", "#/bank-ide"]]],
    ["Terbit", "trophy", "Hasil riset diarahkan menjadi artikel jurnal atau proposal PKM, lalu dipresentasikan di FS2T Research Day.", [["Research Day", "#research-day"]]]
  ];
  const JADWAL = [
    ["Kelas Publikasi", "1x sebulan", "Online, sekitar 60 menit", "Belajar"],
    ["Riset 101", "2x sebulan", "Konten Instagram", "Belajar"],
    ["Klinik Naskah", "Dibuka 1x sebulan", "Online atau offline, sistem daftar", "Didampingi"],
    ["Riset Kolaboratif", "1 riset per semester", "Tim kecil lintas prodi + dosen pembimbing", "Meneliti"],
    ["Kunjungan & Kerja Sama", "1x per semester", "Offline", "Penghubung"],
    ["FS2T Research Day", "1x setahun", "Offline, acara puncak", "Terbit"]
  ];
  const MITRA = ["Penerbit kampus atau penerbit lokal", "Pengelola jurnal di lingkungan UM", "Komunitas menulis", "Media lokal dan kolom opini sains", "Kementerian Riset & Kajian Keilmuan BEM UM"];
  function hAlur(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Alur riset", "Dari ide sampai terbit", "Kegiatan FS2T tidak berdiri sendiri-sendiri. Semuanya dirangkai jadi satu alur, supaya ide riset dan tulisanmu sampai ke hasil akhir: karya yang terbit.") + `
      <section class="bso-section"><div class="wrap">
        <ol class="ft-alur">${ALUR.map(([j, ik, t, l], i) => `<li>
          <span class="ft-ikon">${FC.icon(ik)}</span><span class="ft-no">${pad(i + 1)}</span>
          <h3>${E(j)}</h3><p>${E(t)}</p>
          <span class="ft-link">${l.map(([n, h]) => `<a class="hl" href="${E(h)}">${E(n)}</a>`).join("")}</span>
        </li>`).join("")}</ol>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Enam program</span><h2>Jadwal ringkas</h2>
        <div class="ft-tabel-wrap"><table class="ft-tabel">
          <thead><tr><th>Program</th><th>Frekuensi</th><th>Format</th><th>Tahap</th></tr></thead>
          <tbody>${JADWAL.map(([p, f, fm, t]) => `<tr><td><b>${E(p)}</b></td><td>${E(f)}</td><td>${E(fm)}</td><td><span class="chip">${E(t)}</span></td></tr>`).join("")}</tbody>
        </table></div>
      </div></section>
      <section class="bso-section"><div class="wrap ft-dua">
        <div class="ft-kotak">
          <span class="ft-ikon">${FC.icon("link")}</span>
          <span class="eyebrow">Kunjungan & Kerja Sama</span><h3>Setiap kunjungan pulang membawa hasil</h3>
          <p class="muted">Kunjungan kerja tetap jalan sekali per semester, tetapi selalu membawa pulang satu hasil konkret: narasumber, rencana kolaborasi, atau kesepakatan kerja sama.</p>
          <small class="ft-label">Mitra yang dibidik</small>
          <div class="ft-tags">${MITRA.map((m) => `<span>${E(m)}</span>`).join("")}</div>
        </div>
        <div class="ft-kotak ft-puncak" id="research-day">
          <span class="ft-ikon">${FC.icon("trophy")}</span>
          <span class="eyebrow">Acara puncak</span><h3>FS2T Research Day</h3>
          <p class="muted">Sekali setahun, tim Riset Kolaboratif mempresentasikan hasilnya. Ada pameran poster ilmiah dan pemateri tamu.</p>
          <ul class="ft-cek">
            <li>${FC.icon("check")}<span>Presentasi hasil Riset Kolaboratif</span></li>
            <li>${FC.icon("check")}<span>Pameran poster ilmiah</span></li>
            <li>${FC.icon("check")}<span>Pemateri tamu</span></li>
            <li>${FC.icon("book")}<span>Direncanakan menjadi tempat peluncuran <b>Antologi Karya Ilmiah FMIPA</b>, kumpulan tulisan dari Kelas Publikasi dan Klinik Naskah selama setahun</span></li>
          </ul>
        </div>
      </div></section>`;
    const rd = el.querySelector('a[href="#research-day"]');
    if (rd) rd.onclick = (e) => { e.preventDefault(); el.querySelector("#research-day").scrollIntoView({ behavior: "smooth", block: "start" }); };
  }

  /* =================================================================
     KELAS PUBLIKASI + RISET 101
     ================================================================= */
  const TOPIK = [
    ["Memilih jurnal", "SINTA, Scopus, dan DOAJ"],
    ["Jurnal predator", "Cara mengenali dan menghindarinya"],
    ["Alur submit", "Dari submit, review, sampai revisi"],
    ["Manajemen referensi", "Mendeley atau Zotero"],
    ["Etika AI", "Memakai AI dalam penulisan ilmiah"],
    ["Sains populer", "Menulis artikel populer dan opini sains"]
  ];
  let lihatLalu = false;
  function hKelas(el, ctx) {
    const S = sumber(ctx);
    const kini = hariIni();
    const semua = S.kelas.list.filter((k) => k.tanggal).slice().sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const depan = semua.filter((k) => k.tanggal >= kini), lalu = semua.filter((k) => k.tanggal < kini).reverse();
    const baris = (k) => {
      const d = keTgl(k.tanggal), l = tautan(k.link), akan = k.tanggal >= kini;
      return `<article class="ft-jadwal">
        <span class="ft-tgl"><b>${d.getDate()}</b><small>${BULAN[d.getMonth()].slice(0, 3)}</small></span>
        <div class="ft-jadwal-isi">
          ${k.tanggal === kini ? '<span class="chip ok">Hari ini</span>' : ""}
          <b>${E(k.topik || "Kelas Publikasi")}</b>
          <small>${E([hariNama(k.tanggal), k.jam ? k.jam + (k.selesai ? "–" + k.selesai : "") + " WIB" : "", k.tempat].filter(Boolean).join(" · "))}</small>
          ${k.pemateri ? `<small>${FC.icon("user")} ${E(k.pemateri)}</small>` : ""}
        </div>
        ${akan ? `<div class="ft-aksi">${l ? `<a class="btn btn-primary btn-sm" href="${E(l)}" target="_blank" rel="noopener">Ikut kelas</a>` : ""}<a class="btn btn-ghost btn-sm" href="${E(gcal(k))}" target="_blank" rel="noopener">${FC.icon("cal")} Simpan</a></div>` : ""}
      </article>`;
    };
    const ig = String(R.instagram || "").replace(/^@/, "");
    const r101 = S.riset101.list.slice().sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));
    el.innerHTML = ctx.ui.judulHal("Belajar", "Kelas Publikasi", "Kelas online sekitar 60 menit, sebulan sekali, tentang cara menulis dan menerbitkan artikel ilmiah. Pematerinya dosen, pengelola jurnal, atau kakak tingkat yang sudah pernah publikasi.") + `
      <section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Jadwal kelas${tagContoh(S.kelas)}</span><h2>Kelas berikutnya</h2></div></div>
        ${!semua.length ? `<div class="empty bso-empty-sm"><p>Jadwal Kelas Publikasi sedang disusun dan akan diumumkan di awal periode.</p></div>`
          : `${depan.length ? `<div class="ft-jadwal-list">${depan.map(baris).join("")}</div>` : `<div class="empty bso-empty-sm"><p>Belum ada kelas berikutnya. Pantau Instagram FS2T untuk jadwal bulan depan.</p></div>`}
            ${lalu.length ? `<button class="btn btn-ghost btn-sm" type="button" data-lalu style="margin-top:18px">${lihatLalu ? "Sembunyikan" : "Lihat"} kelas yang sudah lewat (${lalu.length})</button>
              ${lihatLalu ? `<div class="ft-jadwal-list ft-lalu">${lalu.map(baris).join("")}</div>` : ""}` : ""}`}
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Topik bergilir</span><h2>Yang dibahas sepanjang periode</h2>
        <div class="ft-topik">${TOPIK.map(([j, t], i) => `<article><span class="ft-no">${pad(i + 1)}</span><b>${E(j)}</b><small>${E(t)}</small></article>`).join("")}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <div class="bso-sec-head"><div><span class="eyebrow">Riset 101${tagContoh(S.riset101)}</span><h2>Tips riset, cukup dari HP</h2></div>
          ${ig ? `<a class="btn btn-ghost btn-sm" href="https://instagram.com/${E(ig)}" target="_blank" rel="noopener">${FC.icon("camera")} Ikuti @${E(ig)}</a>` : ""}</div>
        <p class="muted" style="margin:-12px 0 20px;max-width:680px">Dua kali sebulan, materi Kelas Publikasi diringkas jadi carousel Instagram yang ringan.</p>
        ${r101.length ? `<div class="ft-r101">${r101.map((r) => { const u = tautan(r.ig); return `<article>
            <span class="ft-ikon">${FC.icon("spark")}</span><h3>${E(r.judul)}</h3>
            <div class="ft-r101-bawah">${r.tanggal ? `<small>${E(fmtTgl(r.tanggal))}</small>` : "<span></span>"}${u ? `<a class="hl" href="${E(u)}" target="_blank" rel="noopener">Lihat</a>` : ""}</div></article>`; }).join("")}</div>`
          : `<div class="empty bso-empty-sm"><p>Konten Riset 101 pertama segera tayang di Instagram.</p></div>`}
      </div></section>`;
    const l = el.querySelector("[data-lalu]"); if (l) l.onclick = () => { lihatLalu = !lihatLalu; hKelas(el, ctx); };
  }

  /* =================================================================
     KLINIK NASKAH
     ================================================================= */
  const JENIS = ["Artikel jurnal", "Makalah lomba", "Proposal PKM", "Artikel populer atau opini sains"];
  const BANTU = [
    ["Cek format dan struktur", "Susunan bagian, gaya selingkung, dan kelengkapan naskah.", "check"],
    ["Cek sitasi", "Kerapian kutipan dan daftar pustaka.", "book"],
    ["Cari jurnal tujuan", "Jurnal yang sesuai topikmu, termasuk jurnal tanpa biaya publikasi (APC).", "search"],
    ["Dampingi submit dan revisi", "Menemani proses submit sampai menanggapi hasil review.", "up"]
  ];
  const ALUR_KLINIK = ["Daftar saat Klinik dibuka", "Kirim draf naskahmu", "Naskah dicek bersama", "Pilih jurnal tujuan", "Submit dan revisi"];
  let jenisPilih = JENIS[0];
  function hKlinik(el, ctx) {
    const wa = waPesan(ctx, `Halo FS2T, saya ingin mendaftar Klinik Naskah.\nNama: \nProdi: \nJenis naskah: ${jenisPilih}\nJudul/topik: `);
    const buka = !!R.klinikBuka || ctx.ui.demo;
    el.innerHTML = ctx.ui.judulHal("Didampingi", "Klinik Naskah", "Punya draf artikel, makalah lomba, atau proposal PKM? Daftar di Klinik Naskah. Tim FS2T membantu sampai naskahmu siap dikirim.") + `
      <section class="bso-section"><div class="wrap">
        <div class="ft-batas">
          ${FC.icon("shield")}
          <div><b>FS2T mendampingi, bukan menuliskan naskah.</b>
          <small>Naskah tetap tulisanmu sendiri. Kami membantu mengecek, memberi masukan, dan menunjukkan jalannya.</small></div>
        </div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Yang dibantu</span><h2>Apa saja yang bisa dibawa ke Klinik</h2>
        <div class="ft-bantu">${BANTU.map(([j, t, ik]) => `<article><span class="ft-ikon">${FC.icon(ik)}</span><h3>${E(j)}</h3><p>${E(t)}</p></article>`).join("")}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Alurnya</span><h2>Dari draf sampai submit</h2>
        <ol class="ft-langkah">${ALUR_KLINIK.map((t, i) => `<li><span>${i + 1}</span>${E(t)}</li>`).join("")}</ol>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <div class="ft-daftar">
          <div>
            <span class="eyebrow">Daftar Klinik Naskah</span><h2>Naskah apa yang ingin kamu bawa?</h2>
            <p class="muted">Klinik dibuka sebulan sekali dengan sistem daftar. Pilih jenis naskahmu, lalu kirim pesan ke narahubung FS2T.</p>
            <div class="ft-pilih" role="radiogroup" aria-label="Jenis naskah">${JENIS.map((j) => `<button type="button" role="radio" aria-checked="${j === jenisPilih}" data-j="${E(j)}">${E(j)}</button>`).join("")}</div>
          </div>
          <div class="ft-daftar-aksi">
            ${!buka ? `<button class="btn btn-primary" type="button" disabled>Klinik bulan ini belum dibuka</button><small class="muted">Pantau Instagram BEM FMIPA untuk info pembukaan.</small>`
              : wa ? `<a class="btn btn-primary" href="${E(wa)}" target="_blank" rel="noopener">${FC.icon("chat")} Daftar lewat WhatsApp</a><small class="muted">Pesanmu sudah terisi jenis naskah. Lengkapi nama, prodi, dan judul.</small>`
              : `<button class="btn btn-primary" type="button" disabled>Narahubung segera diumumkan</button><small class="muted">Nomor narahubung Klinik Naskah belum tersedia.</small>`}
          </div>
        </div>
      </div></section>`;
    el.querySelectorAll("[data-j]").forEach((b) => b.onclick = () => { jenisPilih = b.dataset.j; hKlinik(el, ctx); });
  }

  /* =================================================================
     BANK IDE RISET
     ================================================================= */
  let fProdi = "", fStatus = "terbuka", cari = "";
  function hBankIde(el, ctx) {
    const S = sumber(ctx).bankIde;
    const prodiList = [...new Set(S.list.map((i) => i.prodi).filter(Boolean))].sort();
    const q = cari.trim().toLowerCase();
    const cocok = S.list.filter((i) => (!fProdi || i.prodi === fProdi) && (!fStatus || (i.status || "terbuka") === fStatus) && (!q || [i.judul, i.isi, i.prodi].join(" ").toLowerCase().includes(q)));
    const teman = ctx.root + "#/teman";
    const usul = waPesan(ctx, "Halo FS2T, saya ingin mengusulkan ide riset untuk Bank Ide Riset.\nNama: \nProdi: \nJudul ide: \nRingkasan: ");
    const kartu = (i) => {
      const ambil = (i.status || "terbuka") === "diambil";
      return `<article class="ft-ide">
        <div class="top"><span class="chip">${E(i.prodi || "Lintas prodi")}</span><span class="chip ${ambil ? "gray" : "ok"}">${ambil ? "Sudah diambil" : "Terbuka"}</span></div>
        <h3>${E(i.judul)}</h3>
        ${i.isi ? `<p>${E(i.isi)}</p>` : ""}
        <small>Usulan ${i.dari === "dosen" ? "dosen" : "mahasiswa"}${i.pengusul ? " · " + E(i.pengusul) : ""}</small>
        ${!ambil ? `<a class="btn btn-ghost btn-sm" href="${E(teman)}">${FC.icon("users")} Cari tim</a>` : ""}
      </article>`;
    };
    el.innerHTML = ctx.ui.judulHal("Meneliti", "Bank Ide Riset", "Daftar topik riset dari dosen dan mahasiswa yang bisa diambil siapa saja. Sudah menemukan topik yang menarik? Cari teman setimnya di Cari Teman Lomba FMIPA Connect.") + `
      <section class="bso-section"><div class="wrap">
        <div class="ft-filter">
          <input type="search" class="input" placeholder="Cari topik…" value="${E(cari)}" data-cari aria-label="Cari topik">
          <select class="input" data-prodi aria-label="Saring prodi"><option value="">Semua prodi</option>${prodiList.map((p) => `<option ${p === fProdi ? "selected" : ""}>${E(p)}</option>`).join("")}</select>
          <div class="ft-seg" role="group" aria-label="Status">${[["terbuka", "Terbuka"], ["diambil", "Sudah diambil"], ["", "Semua"]].map(([v, t]) => `<button type="button" data-s="${v}" aria-pressed="${fStatus === v}">${t}</button>`).join("")}</div>
        </div>
        <div class="bso-sec-head" style="margin-top:22px"><div><span class="eyebrow">${cocok.length} topik${tagContoh(S)}</span></div></div>
        ${!S.list.length ? `<div class="empty bso-empty-sm"><p>Bank Ide Riset sedang dikumpulkan dari dosen dan mahasiswa. Punya ide? Usulkan di bawah.</p></div>`
          : cocok.length ? `<div class="ft-ide-grid">${cocok.map(kartu).join("")}</div>` : `<div class="empty bso-empty-sm"><p>Tidak ada topik yang cocok dengan saringan ini.</p></div>`}
      </div></section>
      <section class="bso-section"><div class="wrap ft-dua">
        <a class="ft-sambung" href="${E(teman)}">
          <span class="ft-ikon">${FC.icon("users")}</span>
          <span><small>Tersambung ke FMIPA Connect</small><b>Cari Teman Lomba</b><small>Buat lowongan tim untuk topik pilihanmu, atau gabung ke tim yang sudah ada.</small></span>
          ${FC.icon("arrow")}
        </a>
        <div class="ft-kotak">
          <span class="eyebrow">Punya ide riset?</span><h3>Usulkan ke Bank Ide</h3>
          <p class="muted">Dosen dan mahasiswa boleh mengusulkan topik. Ide yang masuk akan ditambahkan ke daftar setelah dicek pengurus FS2T.</p>
          ${usul ? `<a class="btn btn-primary btn-sm" href="${E(usul)}" target="_blank" rel="noopener">${FC.icon("chat")} Usulkan lewat WhatsApp</a>` : `<small class="muted">Narahubung FS2T segera diumumkan.</small>`}
        </div>
      </div></section>`;
    const ci = el.querySelector("[data-cari]");
    ci.oninput = () => { cari = ci.value; const pos = ci.selectionStart; hBankIde(el, ctx); const n = el.querySelector("[data-cari]"); n.focus(); n.setSelectionRange(pos, pos); };
    el.querySelector("[data-prodi]").onchange = (e) => { fProdi = e.target.value; hBankIde(el, ctx); };
    el.querySelectorAll("[data-s]").forEach((b) => b.onclick = () => { fStatus = b.dataset.s; hBankIde(el, ctx); });
  }

  /* =================================================================
     KEUNTUNGAN
     ================================================================= */
  const PERAN = [
    ["Host Kelas", "Kelas Publikasi", "Sekitar 3 jam sebulan", "Public speaking dan moderator", "mega"],
    ["Kreator Konten", "Riset 101", "Sekitar 3–4 jam sebulan, bisa dari HP", "Desain, copywriting, kelola IG", "camera"],
    ["Pendamping Naskah", "Klinik Naskah", "Sesuai jumlah pendaftar, bisa dibagi", "Menulis ilmiah dan mencari jurnal", "edit"],
    ["Peneliti", "Riset Kolaboratif", "Lebih padat, khusus yang berminat", "Metodologi riset dan analisis data", "search"],
    ["Penghubung", "Kunjungan & Kerja Sama", "Sekitar 2 kali per semester", "Lobi dan komunikasi dengan mitra", "link"]
  ];
  const UNTUNG = [
    ["Nama di karya ilmiah", "Tim Riset Kolaboratif diarahkan tercantum sebagai penulis di artikel jurnal dan proposal PKM. Tulisanmu juga berpeluang masuk antologi karya ilmiah FMIPA.", "book"],
    ["Bekal beasiswa dan S2", "Karya yang terbit bisa dipakai untuk daftar beasiswa, lomba karya tulis, PKM, dan S2.", "cap"],
    ["Skripsi lebih ringan", "Sudah terbiasa mencari literatur, memakai Mendeley atau Zotero, dan menulis dengan format ilmiah.", "check"],
    ["Bukti untuk CV", "Sertifikat kepanitiaan, sertifikat pendamping naskah, dan daftar karya terbit.", "shield"],
    ["Relasi", "Kenal langsung dengan dosen pembimbing, pengelola jurnal, penerbit, dan komunitas menulis.", "users"],
    ["Pengakuan", "Nama PIC dan pendamping dicantumkan di setiap konten dan poster, plus apresiasi Anggota Terbaik.", "spark"]
  ];
  const JENJANG = [
    ["Pemula", "Baru bergabung, mulai dari Kelas Publikasi dan satu peran pilihan."],
    ["Peneliti Muda", "Sudah ikut riset atau naskahnya terbit."],
    ["Mentor", "Dipercaya menjaga Klinik Naskah dan membimbing anggota baru."]
  ];
  const RINGAN = [
    ["Satu orang, satu peran", "Tidak semua harus meneliti. Pilih satu peran sesuai minat."],
    ["Satu persiapan, dua hasil", "Materi Kelas Publikasi langsung jadi bahan Riset 101."],
    ["Template sejak awal", "Template konten, poster, dan checklist Klinik Naskah sudah disiapkan."],
    ["Pemateri dari luar", "Host cukup mengundang dan memandu, tidak perlu menguasai materi."],
    ["Libur saat UTS dan UAS", "Diumumkan sejak awal periode."],
    ["Boleh izin, asal bilang", "Sedang padat? Tukar giliran atau minta di-backup, asal memberi tahu jauh hari."]
  ];
  function hKeuntungan(el, ctx) {
    el.innerHTML = ctx.ui.judulHal("Kenapa ikut FS2T", "Keuntungan", "Hasil FS2T berupa karya, jadi keuntungannya bisa dibuktikan. Tiap anggota cukup memegang satu peran, kira-kira 3–5 jam sebulan.") + `
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Pilih satu peran</span><h2>Riset itu pilihan, bukan kewajiban</h2>
        <div class="ft-peran">${PERAN.map(([j, p, w, s, ik]) => `<article><span class="ft-ikon">${FC.icon(ik)}</span><h3>${E(j)}</h3>
          <small class="ft-label">Pegang: ${E(p)}</small>
          <p>${FC.icon("clock")} ${E(w)}</p><p>${FC.icon("spark")} ${E(s)}</p></article>`).join("")}</div>
        <p class="muted" style="margin-top:16px">FS2T Research Day dikerjakan bersama-sama sebagai satu kepanitiaan di akhir periode.</p>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Yang kamu dapat</span><h2>Ikut FS2T, dapat apa?</h2>
        <div class="ft-bantu ft-tiga">${UNTUNG.map(([j, t, ik]) => `<article><span class="ft-ikon">${FC.icon(ik)}</span><h3>${E(j)}</h3><p>${E(t)}</p></article>`).join("")}</div>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Jenjang anggota</span><h2>Kemajuanmu terlihat</h2>
        <ol class="ft-jenjang">${JENJANG.map(([j, t]) => `<li><b>${E(j)}</b><small>${E(t)}</small></li>`).join("")}</ol>
      </div></section>
      <section class="bso-section"><div class="wrap">
        <span class="eyebrow">Takut nggak bisa bagi waktu?</span><h2>Dirancang supaya ringan</h2>
        <ul class="ft-ringan ft-tiga">${RINGAN.map(([j, t]) => `<li>${FC.icon("check")}<span><b>${E(j)}</b><small>${E(t)}</small></span></li>`).join("")}</ul>
        <div class="ft-cta">
          <a class="btn btn-primary" href="#/alur">Lihat alur riset</a>
          <a class="btn btn-ghost" href="#/kelas">Jadwal Kelas Publikasi</a>
        </div>
      </div></section>`;
  }

  FC.bsoExt = {
    publik: [
      { id: "alur", judul: "Alur Riset", sub: "Belajar sampai terbit", penuh: true, render: hAlur },
      { id: "kelas", judul: "Kelas Publikasi", sub: "Jadwal kelas & Riset 101", penuh: true, render: hKelas },
      { id: "klinik", judul: "Klinik Naskah", sub: "Pendampingan naskah", penuh: true, render: hKlinik },
      { id: "bank-ide", judul: "Bank Ide Riset", sub: "Topik riset & cari tim", penuh: true, render: hBankIde },
      { id: "keuntungan", judul: "Keuntungan", sub: "Peran & apa yang kamu dapat", penuh: true, render: hKeuntungan }
    ],
    admin: []
  };
})();
