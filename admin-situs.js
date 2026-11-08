/* =====================================================================
   FMIPA Connect — Editor Situs (Panel Admin → Situs)
   Semua isi situs diedit dari sini tanpa menyentuh kode.
   ===================================================================== */
(function () {
  const FC = window.FC;
  const { icon, esc } = FC;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const clone = (v) => JSON.parse(JSON.stringify(v));

  let D = null, draft = null, saved = null, dirty = false, current = null, box = null;
  const openSet = new Set();

  /* ---------------- util path ---------------- */
  const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, p, v) => {
    const ks = p.split("."); let a = o;
    ks.slice(0, -1).forEach((k, i) => { if (a[k] == null) a[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; a = a[k]; });
    a[ks[ks.length - 1]] = v;
  };
  const uid = (p) => (p || "x") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

  const IKON = ["spark", "cap", "shield", "users", "heart", "trophy", "book", "flag", "grid", "cal", "mega", "chat", "wallet", "pin", "mail", "phone", "camera", "link"];
  const LINK_HAL = [["", "Tanpa tombol"], ["#/lomba", "Info Lomba"], ["#/beasiswa", "Info Beasiswa"], ["#/pelatihan", "Info Pelatihan"], ["#/pengaduan", "Kanal Pengaduan"], ["#/teman", "Cari Teman Lomba"], ["#/about", "About"]];

  /* ---------------- skema per tab ---------------- */
  const S = {
    tampilan: {
      judul: "Tampilan", sub: "Logo, nama situs, warna, dan huruf. Perubahan warna dan huruf langsung terlihat di panel ini sebagai pratinjau.",
      grup: [
        { judul: "Identitas situs", f: [
          { k: "tampilan.nama_situs", t: "text", l: "Nama situs", h: "Tampil di header dan footer." },
          { k: "tampilan.subjudul", t: "text", l: "Subjudul di header" },
          { k: "tampilan.logo_situs", t: "image", l: "Logo situs", size: "logo", h: "Dipakai di header, footer, dan ikon tab browser. Disarankan PNG transparan atau SVG, bentuk persegi." },
          { k: "tampilan.logo_org", t: "image", l: "Logo kampus / organisasi", size: "logo", h: "Tampil di samping logo situs dan di lingkaran besar beranda." }
        ] },
        { judul: "Warna", custom: "warna" },
        { judul: "Huruf", f: [
          { k: "tampilan.font.judul", t: "select", l: "Huruf judul", opts: () => Object.keys(FC.FONT_JUDUL).map((x) => [x, x]) },
          { k: "tampilan.font.isi", t: "select", l: "Huruf isi teks", opts: () => Object.keys(FC.FONT_ISI).map((x) => [x, x]) }
        ], custom: "fontPreview" }
      ]
    },
    profil: {
      judul: "Profil Kabinet", sub: "Identitas kabinet, visi misi, dan angka-angka yang tampil di beranda dan halaman About.",
      grup: [
        { judul: "Identitas", f: [
          { k: "org.organisasi", t: "text", l: "Nama organisasi (singkat)", h: "Contoh: BEM FMIPA UM" },
          { k: "org.namaPanjang", t: "textarea", l: "Nama lengkap organisasi", rows: 2 },
          { k: "org.kabinet", t: "text", l: "Nama kabinet" },
          { k: "org.tagline", t: "text", l: "Tagline" },
          { k: "org.periode", t: "text", l: "Periode", h: "Contoh: 2027" },
          { k: "org.deskripsi", t: "textarea", l: "Deskripsi singkat", rows: 4 },
          { k: "org.fotoBersama", t: "image", l: "Foto bersama fungsionaris", size: "photo" },
          { k: "org.TANDAI_CONTOH", t: "check", l: "Tampilkan label \"CONTOH\" di bagian yang datanya belum asli", h: "Matikan setelah semua nama dan foto sudah diganti." }
        ] },
        { judul: "Visi & misi", f: [
          { k: "org.visi", t: "textarea", l: "Visi", rows: 3 },
          { k: "org.misi", t: "strings", l: "Misi", add: "Tambah butir misi" }
        ] },
        { judul: "Nilai kabinet", f: [{ k: "org.nilai", t: "list", add: "Tambah nilai", title: "judul", tpl: { judul: "", teks: "" }, f: [{ k: "judul", t: "text", l: "Nilai" }, { k: "teks", t: "text", l: "Penjelasan singkat" }] }] },
        { judul: "Angka statistik", f: [{ k: "org.statistik", t: "list", add: "Tambah angka", title: "label", tpl: { angka: "", label: "", ikon: "spark" }, f: [{ k: "angka", t: "text", l: "Angka", h: "Contoh: 99+" }, { k: "label", t: "text", l: "Keterangan" }, { k: "ikon", t: "select", l: "Ikon", opts: () => IKON.map((x) => [x, x]) }] }] }
      ]
    },
    beranda: {
      judul: "Beranda", sub: "Video profil, program kerja unggulan, kalender kegiatan, dan prestasi.",
      grup: [
        { judul: "Video profil", f: [
          { k: "org.video.url", t: "url", l: "Link YouTube", h: "Tempel link video YouTube, misalnya https://youtu.be/xxxx" },
          { k: "org.video.judul", t: "text", l: "Judul video" },
          { k: "org.video.teks", t: "textarea", l: "Keterangan", rows: 2 }
        ] },
        { judul: "Program kerja unggulan", f: [{ k: "org.program", t: "list", add: "Tambah program", title: "judul", tpl: { judul: "", dept: "", ikon: "spark", teks: "", link: "" }, f: [
          { k: "judul", t: "text", l: "Nama program" }, { k: "dept", t: "text", l: "Departemen pelaksana" },
          { k: "teks", t: "textarea", l: "Penjelasan", rows: 2 }, { k: "ikon", t: "select", l: "Ikon", opts: () => IKON.map((x) => [x, x]) },
          { k: "link", t: "select", l: "Tombol menuju", opts: () => LINK_HAL }] }] },
        { judul: "Kalender kegiatan", f: [{ k: "org.agenda", t: "list", add: "Tambah agenda", title: "judul", tpl: { tanggal: "", judul: "", tempat: "" }, f: [
          { k: "tanggal", t: "date", l: "Tanggal" }, { k: "judul", t: "text", l: "Nama kegiatan" }, { k: "tempat", t: "text", l: "Tempat" }] }] },
        { judul: "Prestasi mahasiswa", f: [{ k: "org.prestasi", t: "list", add: "Tambah prestasi", title: "lomba", tpl: { peringkat: "", lomba: "", nama: "", dept: "", tahun: "", foto: "" }, f: [
          { k: "peringkat", t: "text", l: "Peringkat", h: "Contoh: Juara 1" }, { k: "lomba", t: "text", l: "Nama lomba" },
          { k: "nama", t: "text", l: "Nama mahasiswa / tim" }, { k: "dept", t: "text", l: "Departemen" },
          { k: "tahun", t: "text", l: "Tahun" }, { k: "foto", t: "image", l: "Foto", size: "person" }] }] }
      ]
    },
    pengurus: {
      judul: "Pengurus Inti", sub: "Nama, jabatan, foto, dan LinkedIn pengurus inti. Posisi di bagan struktur mengikuti urutan bawaan, jadi daftar ini tidak bisa ditambah atau dihapus.",
      grup: [{ judul: "", f: [{ k: "org.pengurusInti", t: "list", fixed: true, title: "jabatan", f: [
        { k: "nama", t: "text", l: "Nama" }, { k: "jabatan", t: "text", l: "Jabatan" },
        { k: "linkedin", t: "url", l: "Link LinkedIn", h: "Contoh: https://www.linkedin.com/in/nama-kamu" },
        { k: "foto", t: "image", l: "Foto", size: "person" }] }] }]
    },
    departemen: {
      judul: "Departemen", sub: "Isi halaman tiap departemen: foto, deskripsi, program kerja, dan anggota beserta LinkedIn-nya.",
      grup: [{ judul: "", f: [{ k: "org.departemen", t: "list", add: "Tambah departemen", title: "nama", collapse: true, tpl: () => ({ id: uid("dept"), nama: "Departemen Baru", bidang: "dalam", foto: "", deskripsi: "", fokus: [], proker: [], anggota: [] }), f: [
        { k: "nama", t: "text", l: "Nama departemen" },
        { k: "bidang", t: "select", l: "Bidang", opts: () => [["dalam", "Dalam kampus"], ["luar", "Luar kampus"]] },
        { k: "foto", t: "image", l: "Foto bersama departemen", size: "photo" },
        { k: "deskripsi", t: "textarea", l: "Deskripsi", rows: 3 },
        { k: "fokus", t: "strings", l: "Fokus kerja", add: "Tambah fokus" },
        { k: "proker", t: "list", l: "Program kerja", add: "Tambah program kerja", title: "nama", tpl: { nama: "", deskripsi: "" }, f: [{ k: "nama", t: "text", l: "Nama program" }, { k: "deskripsi", t: "textarea", l: "Penjelasan", rows: 2 }] },
        { k: "anggota", t: "list", l: "Anggota", add: "Tambah anggota", title: "nama", tpl: { nama: "", jabatan: "Staff", foto: "", linkedin: "" }, f: [
          { k: "nama", t: "text", l: "Nama" }, { k: "jabatan", t: "text", l: "Jabatan", list: ["Kepala Departemen", "Wakil Kepala Departemen", "Staff"] },
          { k: "linkedin", t: "url", l: "Link LinkedIn" }, { k: "foto", t: "image", l: "Foto", size: "person" }] }
      ] }] }]
    },
    kontak: {
      judul: "Kontak", sub: "Kontak yang tampil di beranda, footer, dan halaman pengaduan.",
      grup: [
        { judul: "Kontak sekretariat", f: [
          { k: "kontak.whatsapp", t: "text", l: "Nomor WhatsApp", h: "Contoh: 0821-1474-5200. Tombol WhatsApp dibuat otomatis." },
          { k: "kontak.email", t: "text", l: "Email" },
          { k: "kontak.instagram", t: "text", l: "Akun Instagram", h: "Contoh: @bemfmipaum. Kosongkan untuk menyembunyikan." },
          { k: "kontak.instagram_link", t: "url", l: "Link Instagram" },
          { k: "kontak.alamat", t: "textarea", l: "Alamat", rows: 2 },
          { k: "kontak.maps_link", t: "url", l: "Link Google Maps" }
        ] },
        { judul: "Rujukan laporan kekerasan", f: [
          { k: "satgas.nama", t: "text", l: "Nama lembaga" },
          { k: "satgas.kontak", t: "text", l: "Kontak yang ditampilkan" },
          { k: "satgas.link", t: "url", l: "Link (opsional)" }
        ] }
      ]
    }
  };
  const TABS = [["tampilan", "edit", "Tampilan"], ["profil", "flag", "Profil Kabinet"], ["beranda", "grid", "Beranda"], ["pengurus", "user", "Pengurus Inti"], ["departemen", "users", "Departemen"], ["kontak", "phone", "Kontak"]];

  /* ---------------- render field ---------------- */
  const IMG_SIZE = { logo: [512, 0.9], photo: [1400, 0.8], person: [520, 0.8] };

  function field(fd, base) {
    const p = base ? base + "." + fd.k : fd.k;
    const v = get(draft, p);
    const id = "f-" + p.replace(/\./g, "-");
    const lab = fd.l ? `<label for="${id}">${esc(fd.l)}</label>` : "";
    const hint = fd.h ? `<span class="hint">${esc(fd.h)}</span>` : "";
    switch (fd.t) {
      case "text": case "url": case "date": {
        const dl = fd.list ? `<datalist id="${id}-dl">${fd.list.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>` : "";
        return `<div class="field">${lab}<input id="${id}" type="${fd.t === "url" ? "url" : fd.t === "date" ? "date" : "text"}" data-p="${p}" value="${esc(v || "")}" ${fd.list ? `list="${id}-dl"` : ""} ${fd.t === "url" ? 'placeholder="https://…"' : ""}>${dl}${hint}</div>`;
      }
      case "textarea": return `<div class="field span-2">${lab}<textarea id="${id}" data-p="${p}" rows="${fd.rows || 3}" style="min-height:${(fd.rows || 3) * 26 + 20}px">${esc(v || "")}</textarea>${hint}</div>`;
      case "select": return `<div class="field">${lab}<select id="${id}" data-p="${p}">${fd.opts().map(([val, l]) => `<option value="${esc(val)}" ${String(v || "") === String(val) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>${hint}</div>`;
      case "check": return `<label class="check span-2"><input type="checkbox" data-p="${p}" ${v ? "checked" : ""}><span>${esc(fd.l)}${fd.h ? `<br><small class="muted">${esc(fd.h)}</small>` : ""}</span></label>`;
      case "image": {
        const u = FC.imgUrl(v);
        return `<div class="field span-2"><span class="label">${esc(fd.l)}</span>
          <div class="img-field ${fd.size === "logo" ? "logo" : ""}">
            <div class="img-prev">${u ? `<img src="${esc(u)}" alt="">` : `<span>${icon("camera")}<small>Belum ada</small></span>`}</div>
            <div class="img-acts">
              <label class="btn btn-ghost btn-sm">${icon("download", "flip")} ${u ? "Ganti" : "Unggah"}<input type="file" accept="image/*" hidden data-img="${p}" data-size="${fd.size || "photo"}"></label>
              ${u ? `<button type="button" class="btn btn-danger btn-sm" data-imgdel="${p}">Hapus</button>` : ""}
              ${hint}
            </div>
          </div></div>`;
      }
      case "strings": {
        const arr = Array.isArray(v) ? v : [];
        return `<div class="field span-2"><span class="label">${esc(fd.l)}</span><div class="str-list">
          ${arr.map((x, i) => `<div class="str-row"><input type="text" data-p="${p}.${i}" value="${esc(x)}" aria-label="${esc(fd.l)} ${i + 1}">${rowBtns(p, i, arr.length)}</div>`).join("")}
          <button type="button" class="btn btn-ghost btn-sm" data-add="${p}" data-tpl='""'>${icon("plus")} ${esc(fd.add || "Tambah")}</button></div></div>`;
      }
      case "list": {
        const arr = Array.isArray(v) ? v : [];
        const items = arr.map((it, i) => {
          const ip = `${p}.${i}`;
          const ttl = (it && it[fd.title]) || `${fd.l || "Item"} ${i + 1}`;
          const inner = `<div class="form-grid two">${fd.f.map((sf) => field(sf, ip)).join("")}</div>`;
          const btns = fd.fixed ? "" : rowBtns(p, i, arr.length);
          if (fd.collapse) {
            return `<details class="ed-item" data-open="${ip}" ${openSet.has(ip) ? "open" : ""}><summary><b>${esc(ttl)}</b><span class="ed-sum-r">${btns}${icon("chev")}</span></summary><div class="ed-body">${inner}</div></details>`;
          }
          return `<div class="ed-item"><div class="ed-head"><b>${esc(ttl)}</b>${btns}</div><div class="ed-body">${inner}</div></div>`;
        }).join("");
        const tpl = typeof fd.tpl === "function" ? "fn" : JSON.stringify(fd.tpl || {});
        return `<div class="field span-2">${fd.l ? `<span class="label">${esc(fd.l)}</span>` : ""}<div class="ed-list">${items || '<p class="muted" style="font-size:.86rem">Belum ada data.</p>'}
          ${fd.fixed ? "" : `<button type="button" class="btn btn-ghost btn-sm" data-add="${p}" data-tpl='${esc(tpl)}' data-tplk="${esc(fd.k)}">${icon("plus")} ${esc(fd.add || "Tambah")}</button>`}</div></div>`;
      }
    }
    return "";
  }
  const rowBtns = (p, i, n) => `<span class="row-btns">
    <button type="button" class="ic-mini" data-mv="${p}" data-i="${i}" data-d="-1" ${i === 0 ? "disabled" : ""} aria-label="Naikkan">↑</button>
    <button type="button" class="ic-mini" data-mv="${p}" data-i="${i}" data-d="1" ${i === n - 1 ? "disabled" : ""} aria-label="Turunkan">↓</button>
    <button type="button" class="ic-mini del" data-rm="${p}" data-i="${i}" aria-label="Hapus">✕</button></span>`;

  function customBlock(kind) {
    if (kind === "warna") {
      const w = draft.tampilan.warna;
      const L = [["cream", "Sorotan (paling terang)"], ["lime", "Aksen (tombol & highlight)"], ["green", "Utama"], ["olive", "Pendukung"], ["forest", "Gelap (nuansa latar)"], ["bg", "Latar halaman"], ["text", "Teks"]];
      return `<div class="presets">${FC.PRESET_WARNA.map((pr, i) => `<button type="button" class="preset" data-preset="${i}" title="${esc(pr.nama)}"><span class="sw">${["cream", "lime", "green", "olive", "forest"].map((k) => `<i style="background:${pr.warna[k]}"></i>`).join("")}</span><small>${esc(pr.nama)}</small></button>`).join("")}</div>
        <div class="form-grid two" style="margin-top:16px">${L.map(([k, l]) => `<div class="field"><label for="c-${k}">${l}</label><div class="color-row"><input type="color" id="c-${k}" data-p="tampilan.warna.${k}" value="${esc(w[k] || "#000000")}"><input type="text" data-p="tampilan.warna.${k}" value="${esc(w[k] || "")}" maxlength="7" aria-label="Kode warna ${l}"></div></div>`).join("")}</div>`;
    }
    if (kind === "fontPreview") {
      return `<div class="font-prev"><span class="eyebrow">Pratinjau</span><h3>${esc(draft.org.kabinet || "Ruang Aksara")} <em class="hl">${esc(draft.org.periode || "")}</em></h3><p>${esc(draft.org.tagline || "Rombak Rutinitas, Ciptakan Kualitas.")} Ini contoh teks isi dengan huruf yang dipilih.</p><button type="button" class="btn btn-primary btn-sm">Tombol contoh</button></div>`;
    }
    return "";
  }

  /* ---------------- render tab ---------------- */
  function render(tab) {
    current = tab;
    const sc = S[tab];
    const y = window.scrollY;
    box.innerHTML = `
      <div class="adm-head"><div><span class="eyebrow">Situs</span><h1 style="margin-top:10px">${esc(sc.judul)}</h1><p class="muted" style="margin-top:8px;max-width:680px">${esc(sc.sub)}</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-ghost btn-sm" href="index.html${tab === "departemen" || tab === "pengurus" ? "#/about" : ""}" target="_blank" rel="noopener">Lihat situs ${icon("arrow")}</a></div></div>
      ${D.mode === "demo" ? '<div class="safety" style="margin-bottom:18px;font-size:.86rem"><b>Mode demo.</b><span class="muted">Perubahan tersimpan di browser ini saja. Setelah tersambung ke Supabase, perubahan langsung terlihat oleh semua pengunjung.</span></div>' : ""}
      <div class="ed-groups">${sc.grup.map((g) => `<section class="form-card ed-group">${g.judul ? `<h2 class="form-section-title">${esc(g.judul)}</h2>` : ""}
        ${g.f ? `<div class="form-grid two" style="margin-top:14px">${g.f.map((f) => field(f)).join("")}</div>` : ""}${g.custom ? customBlock(g.custom) : ""}</section>`).join("")}</div>
      <div class="ed-reset"><button type="button" class="btn btn-danger btn-sm" id="edReset">Kembalikan seluruh situs ke isi bawaan</button></div>
      <div class="save-bar ${dirty ? "show" : ""}" id="saveBar" role="region" aria-label="Simpan perubahan">
        <span>${icon("info")} Ada perubahan yang belum disimpan</span>
        <div><button type="button" class="btn btn-ghost btn-sm" id="edCancel">Batalkan</button><button type="button" class="btn btn-primary btn-sm" id="edSave">Simpan perubahan</button></div>
      </div>`;
    window.scrollTo(0, y);
    bind();
  }

  const markDirty = () => { dirty = true; const b = $("#saveBar"); if (b) b.classList.add("show"); };
  const livePreview = (p) => { if (/^tampilan\.(warna|font)/.test(p)) { FC.applyTheme(draft.tampilan.warna, draft.tampilan.font); const fp = $(".font-prev"); if (fp && /font/.test(p)) fp.outerHTML = customBlock("fontPreview"); } };

  function bind() {
    if (!box._toggleBound) {
      box.addEventListener("toggle", (e) => { const d = e.target; if (d.dataset && d.dataset.open) d.open ? openSet.add(d.dataset.open) : openSet.delete(d.dataset.open); }, true);
      box._toggleBound = true;
    }
    box.oninput = (e) => {
      const el = e.target; const p = el.dataset && el.dataset.p; if (!p) return;
      let v = el.type === "checkbox" ? el.checked : el.value;
      if (/^tampilan\.warna\./.test(p)) {
        if (!/^#[0-9a-f]{6}$/i.test(v)) return;
        $$(`[data-p="${p}"]`, box).forEach((x) => { if (x !== el) x.value = v; });
      }
      set(draft, p, v); markDirty(); livePreview(p);
      const head = el.closest(".ed-item"); // perbarui judul item
      if (head && el.closest(".ed-body") === head.querySelector(":scope > .ed-body")) { const b = head.querySelector(":scope > summary > b, :scope > .ed-head > b"); const key = p.split(".").pop(); if (b && ["nama", "judul", "lomba", "label", "jabatan"].includes(key) && v) b.textContent = v; }
    };
    box.onchange = async (e) => {
      const el = e.target;
      if (el.type === "checkbox" && el.dataset.p) { set(draft, el.dataset.p, el.checked); markDirty(); }
      if (el.dataset.img) {
        const f = el.files && el.files[0]; if (!f) return;
        const [mx, q] = IMG_SIZE[el.dataset.size] || IMG_SIZE.photo;
        const lbl = el.closest("label"); const old = lbl.innerHTML;
        lbl.classList.add("disabled"); lbl.insertAdjacentHTML("beforeend", '<span class="up-ind"> Mengunggah…</span>');
        try {
          const blob = await FC.compressImage(f, mx, q);
          const url = await D.uploadMedia(blob);
          set(draft, el.dataset.img, url); markDirty(); render(current);
          FC.toast("Foto siap. Jangan lupa klik Simpan perubahan.");
        } catch (ex) { FC.toast(ex.message, "err"); lbl.innerHTML = old; }
      }
    };
    box.onclick = async (e) => {
      const t = e.target.closest("button"); if (!t || !box.contains(t)) return;
      if (t.closest("summary")) e.preventDefault();
      const ds = t.dataset;
      if (ds.preset != null) { draft.tampilan.warna = clone(FC.PRESET_WARNA[+ds.preset].warna); markDirty(); FC.applyTheme(draft.tampilan.warna, draft.tampilan.font); render(current); return; }
      if (ds.imgdel) { set(draft, ds.imgdel, ""); markDirty(); render(current); return; }
      if (ds.add) {
        let arr = get(draft, ds.add); if (!Array.isArray(arr)) { arr = []; set(draft, ds.add, arr); }
        let item;
        if (ds.tpl === "fn") { const spec = findSpec(ds.tplk); item = spec.tpl(); } else item = JSON.parse(ds.tpl || "{}");
        arr.push(item); openSet.add(`${ds.add}.${arr.length - 1}`); markDirty(); render(current); return;
      }
      if (ds.rm) {
        const arr = get(draft, ds.rm); const it = arr[+ds.i];
        const name = it && typeof it === "object" ? (it.nama || it.judul || it.lomba || it.label || "item ini") : "butir ini";
        if (await FC.confirm("Hapus " + name + "?", "Data ini akan hilang setelah kamu menyimpan perubahan.", "Hapus")) { arr.splice(+ds.i, 1); markDirty(); render(current); }
        return;
      }
      if (ds.mv) { const arr = get(draft, ds.mv), i = +ds.i, j = i + +ds.d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; markDirty(); render(current); return; }
      if (t.id === "edSave") return save(t);
      if (t.id === "edCancel") { if (await FC.confirm("Batalkan perubahan?", "Semua perubahan sejak terakhir disimpan akan dibuang.", "Batalkan perubahan")) { draft = clone(saved); dirty = false; FC.applyTheme(draft.tampilan.warna, draft.tampilan.font); render(current); } return; }
      if (t.id === "edReset") {
        if (await FC.confirm("Kembalikan ke isi bawaan?", "Semua pengaturan situs (warna, huruf, logo, foto, teks, pengurus, departemen) dikembalikan seperti awal. Info lomba, pengaduan, dan lowongan tim tidak terpengaruh.", "Kembalikan")) {
          try { await D.resetSettings(); saved = FC.mergeSettings(FC.DEFAULTS, {}); draft = clone(saved); dirty = false; FC.applySettings(null); render(current); FC.toast("Situs dikembalikan ke isi bawaan."); } catch (ex) { FC.toast(ex.message, "err"); }
        }
      }
    };
  }

  function findSpec(k) {
    for (const tab of Object.values(S)) for (const g of tab.grup) for (const f of g.f || []) if (f.k === k || ("org." + k) === f.k) return f;
    return {};
  }

  async function save(btn) {
    // rapikan sebelum simpan
    const o = draft.org || {};
    if (o.video) o.video.youtubeId = FC.ytId(o.video.url);
    if (o.video && o.video.url && !o.video.youtubeId) { FC.toast("Link YouTube tidak dikenali. Contoh: https://youtu.be/xxxxxxxxxxx", "err"); return; }
    (o.departemen || []).forEach((d) => { if (!d.id) d.id = uid("dept"); });
    (o.misi || []).forEach((m, i, a) => { a[i] = String(m); });
    o.misi = (o.misi || []).filter((m) => m.trim());
    await FC.busy(btn, async () => {
      try {
        await D.saveSettings(draft);
        saved = clone(draft); dirty = false; FC.applySettings(saved);
        $("#saveBar") && $("#saveBar").classList.remove("show");
        FC.toast("Perubahan tersimpan dan sudah tampil di situs.");
      } catch (ex) { FC.toast(ex.message, "err"); }
    });
  }

  FC.siteEditor = {
    TABS,
    async init(data) { D = data; const st = await D.getSettings().catch(() => null); saved = FC.mergeSettings(FC.DEFAULTS, st || {}); draft = clone(saved); FC.applySettings(st); },
    show(tab, container) { box = container; render(tab); },
    isDirty: () => dirty
  };

  addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
})();
