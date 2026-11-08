/* =====================================================================
   FMIPA Connect — lapisan data
   FC.data punya dua mesin dengan fungsi yang sama:
   - Supabase  : dipakai bila SUPABASE_URL di config.js terisi
   - Demo      : data contoh di localStorage browser (untuk pratinjau)
   ===================================================================== */
(function () {
  const CFG = window.FC_CONFIG || {};
  const FC = (window.FC = window.FC || {});

  /* ---------- konstanta yang dipakai bersama ---------- */
  FC.DEPARTEMEN = ["Matematika", "Fisika", "Kimia", "Biologi"];
  FC.KATEGORI = {
    lomba: ["Karya Tulis Ilmiah", "Olimpiade Sains", "Data & Teknologi", "Inovasi & Bisnis", "Esai & Debat", "Lainnya"],
    beasiswa: ["Pemerintah", "Swasta / Yayasan", "Internal Kampus", "Luar Negeri"],
    pelatihan: ["Soft Skill", "Keterampilan Teknis", "Sertifikasi", "Bootcamp", "Webinar"]
  };
  FC.TINGKAT = ["Internasional", "Nasional", "Regional", "Universitas"];
  FC.PERAN = ["Ketua Tim", "Penulis / Peneliti", "Analis Data", "Programmer", "Desainer", "Presenter", "Eksperimen Lab"];
  FC.STATUS_PENGADUAN = {
    diterima: "Diterima",
    diproses: "Sedang diproses",
    ditindaklanjuti: "Ditindaklanjuti",
    selesai: "Selesai",
    ditolak: "Tidak dapat diproses"
  };

  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const plus = (n) => { const d = today(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now());

  /* =================================================================
     MESIN DEMO
     ================================================================= */
  function createDemo() {
    const KEY = "fc_demo_v1";
    const store = {
      load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } },
      save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* penyimpanan penuh/terblokir */ } }
    };
    let mem = null; // cadangan bila localStorage tidak bisa dipakai

    function seed() {
      const u1 = "demo-u1", u2 = "demo-u2", u3 = "demo-u3", adm = "demo-admin";
      const info = [
        { jenis: "lomba", judul: "Lomba Karya Tulis Ilmiah Nasional Sains Terapan", penyelenggara: "Contoh: HIMA Kimia Universitas X", kategori: "Karya Tulis Ilmiah", tingkat: "Nasional", deadline: plus(12), tanggal_acara: plus(40), lokasi: "Daring (final luring)", biaya: "Rp75.000 / tim", deskripsi: "Tema: inovasi sains untuk pembangunan berkelanjutan. Tim 2–3 mahasiswa aktif S1/D4. Abstrak maksimal 300 kata, full paper bagi peserta yang lolos seleksi abstrak.\n\nIni data contoh. Ganti lewat panel admin.", link: "", unggulan: true },
        { jenis: "lomba", judul: "Olimpiade Matematika & IPA Mahasiswa", penyelenggara: "Contoh: Penyelenggara Olimpiade", kategori: "Olimpiade Sains", tingkat: "Nasional", deadline: plus(25), tanggal_acara: plus(55), lokasi: "Daring", biaya: "Gratis", deskripsi: "Seleksi bertahap tingkat perguruan tinggi, wilayah, lalu nasional. Bidang: Matematika, Fisika, Kimia, Biologi.\n\nIni data contoh.", link: "", unggulan: true },
        { jenis: "lomba", judul: "Datathon: Analisis Data Iklim Kota", penyelenggara: "Contoh: Komunitas Data Science", kategori: "Data & Teknologi", tingkat: "Nasional", deadline: plus(6), tanggal_acara: plus(20), lokasi: "Daring", biaya: "Rp50.000 / tim", deskripsi: "Tim 3 orang menganalisis data cuaca dan kualitas udara, lalu mempresentasikan rekomendasi kebijakan.\n\nIni data contoh.", link: "" },
        { jenis: "lomba", judul: "Kompetisi Esai Sains Populer", penyelenggara: "Contoh: Media Sains Kampus", kategori: "Esai & Debat", tingkat: "Universitas", deadline: plus(18), tanggal_acara: plus(30), lokasi: "Daring", biaya: "Gratis", deskripsi: "Esai individu 1.200–1.500 kata yang menjelaskan konsep sains untuk pembaca awam.\n\nIni data contoh.", link: "" },
        { jenis: "lomba", judul: "Inovasi Teknologi Tepat Guna Pedesaan", penyelenggara: "Contoh: Kementerian / Lembaga", kategori: "Inovasi & Bisnis", tingkat: "Nasional", deadline: plus(34), tanggal_acara: plus(70), lokasi: "Luring, Jakarta", biaya: "Gratis", deskripsi: "Proposal inovasi berbasis riset untuk masalah nyata di desa. Tim 3–5 orang, lintas departemen dianjurkan.\n\nIni data contoh.", link: "" },
        { jenis: "lomba", judul: "International Biology Case Competition", penyelenggara: "Contoh: Universitas Luar Negeri", kategori: "Karya Tulis Ilmiah", tingkat: "Internasional", deadline: plus(-3), tanggal_acara: plus(15), lokasi: "Daring", biaya: "USD 15 / tim", deskripsi: "Pendaftaran sudah ditutup (contoh info yang lewat tenggat).", link: "" },
        { jenis: "beasiswa", judul: "Beasiswa Prestasi Mahasiswa Sains", penyelenggara: "Contoh: Yayasan Pendidikan", kategori: "Swasta / Yayasan", tingkat: "Nasional", deadline: plus(15), lokasi: "Daring", biaya: "Biaya hidup per bulan + pelatihan", deskripsi: "Syarat: mahasiswa aktif semester 3–6, IPK minimal 3,25, aktif berorganisasi. Berkas: transkrip, esai motivasi, surat rekomendasi.\n\nIni data contoh.", link: "", unggulan: true },
        { jenis: "beasiswa", judul: "Bantuan Biaya Pendidikan Semester Genap", penyelenggara: "Contoh: Pemerintah Daerah", kategori: "Pemerintah", tingkat: "Regional", deadline: plus(9), lokasi: "Daring", biaya: "Bantuan UKT", deskripsi: "Untuk mahasiswa dari keluarga kurang mampu yang berdomisili di wilayah penyelenggara.\n\nIni data contoh.", link: "" },
        { jenis: "beasiswa", judul: "Beasiswa Riset Tugas Akhir", penyelenggara: "Contoh: Internal Kampus", kategori: "Internal Kampus", tingkat: "Universitas", deadline: plus(28), lokasi: "Kampus", biaya: "Dana penelitian", deskripsi: "Untuk mahasiswa tingkat akhir yang sedang menyusun skripsi berbasis eksperimen.\n\nIni data contoh.", link: "" },
        { jenis: "beasiswa", judul: "Pertukaran Pelajar Satu Semester", penyelenggara: "Contoh: Program Luar Negeri", kategori: "Luar Negeri", tingkat: "Internasional", deadline: plus(45), lokasi: "Luar negeri", biaya: "Biaya kuliah + hidup", deskripsi: "Syarat bahasa Inggris (contoh: IELTS 6.0). Disarankan mulai menyiapkan berkas dari sekarang.\n\nIni data contoh.", link: "" },
        { jenis: "pelatihan", judul: "Kelas Menulis Artikel Ilmiah untuk Pemula", penyelenggara: "Contoh: BEM FMIPA", kategori: "Keterampilan Teknis", tingkat: "Universitas", deadline: plus(4), tanggal_acara: plus(7), lokasi: "Luring, Aula FMIPA", biaya: "Gratis", deskripsi: "Struktur IMRaD, mencari referensi, dan menghindari plagiarisme. Bawa laptop.\n\nIni data contoh.", link: "", unggulan: true },
        { jenis: "pelatihan", judul: "Bootcamp Python untuk Analisis Data", penyelenggara: "Contoh: Komunitas Data", kategori: "Bootcamp", tingkat: "Nasional", deadline: plus(10), tanggal_acara: plus(14), lokasi: "Daring", biaya: "Gratis (kuota terbatas)", deskripsi: "4 pertemuan: dasar Python, pandas, visualisasi, dan mini-project.\n\nIni data contoh.", link: "" },
        { jenis: "pelatihan", judul: "Public Speaking untuk Presentasi Lomba", penyelenggara: "Contoh: BEM FMIPA", kategori: "Soft Skill", tingkat: "Universitas", deadline: plus(13), tanggal_acara: plus(16), lokasi: "Luring", biaya: "Gratis", deskripsi: "Latihan pitching 5 menit dengan umpan balik langsung.\n\nIni data contoh.", link: "" },
        { jenis: "pelatihan", judul: "Webinar Keselamatan Kerja di Laboratorium", penyelenggara: "Contoh: Laboratorium Kimia", kategori: "Webinar", tingkat: "Universitas", deadline: plus(20), tanggal_acara: plus(21), lokasi: "Daring", biaya: "Gratis, bersertifikat", deskripsi: "Pengenalan MSDS, APD, dan penanganan tumpahan bahan kimia.\n\nIni data contoh.", link: "" }
      ].map((x, i) => Object.assign({ id: i + 1, terbit: true, unggulan: false, created_at: new Date(Date.now() - i * 36e5).toISOString() }, x));

      const profiles = {
        [u1]: { id: u1, nama: "Contoh: Nadia P.", nim: "2403xxxx", departemen: "Kimia", prodi: "S1 Kimia", angkatan: 2024, whatsapp: "08xx-xxxx-xxxx", bio: "Suka riset bahan alam.", keahlian: ["Eksperimen Lab", "Penulis / Peneliti"] },
        [u2]: { id: u2, nama: "Contoh: Rafi A.", nim: "2303xxxx", departemen: "Matematika", prodi: "S1 Matematika", angkatan: 2023, whatsapp: "08xx-xxxx-xxxx", bio: "Statistika & Python.", keahlian: ["Analis Data", "Programmer"] },
        [u3]: { id: u3, nama: "Contoh: Sekar W.", nim: "2203xxxx", departemen: "Biologi", prodi: "S1 Biologi", angkatan: 2022, whatsapp: "08xx-xxxx-xxxx", bio: "Ekologi & desain poster ilmiah.", keahlian: ["Desainer", "Presenter"] },
        [adm]: { id: adm, nama: "Admin Demo", departemen: "Fisika", angkatan: 2023 }
      };
      const mkTim = (o, p) => Object.assign({ id: uid(), status: "buka", jumlah_pelamar: 0, jumlah_diterima: 0, created_at: new Date().toISOString(), owner_id: o, owner_nama: profiles[o].nama, owner_departemen: profiles[o].departemen, owner_angkatan: profiles[o].angkatan }, p);
      const tim = [
        mkTim(u1, { judul: "Butuh analis data untuk LKTI bahan alam", nama_lomba: "Lomba Karya Tulis Ilmiah Nasional Sains Terapan", info_id: 1, kategori: "Karya Tulis Ilmiah", tingkat: "Nasional", deadline: plus(12), butuh_departemen: ["Matematika", "Biologi"], butuh_peran: ["Analis Data", "Penulis / Peneliti"], slot: 2, deskripsi: "Ide sudah ada: uji antibakteri ekstrak daun. Butuh teman yang paham statistik dan satu orang Biologi untuk uji mikroba." }),
        mkTim(u2, { judul: "Cari desainer + presenter untuk Datathon", nama_lomba: "Datathon: Analisis Data Iklim Kota", info_id: 3, kategori: "Data & Teknologi", tingkat: "Nasional", deadline: plus(6), butuh_departemen: ["Fisika", "Biologi"], butuh_peran: ["Desainer", "Presenter"], slot: 2, deskripsi: "Bagian coding sudah saya pegang. Butuh yang bisa bikin visual menarik dan percaya diri presentasi." }),
        mkTim(u3, { judul: "Tim inovasi desa: butuh anak Fisika & Kimia", nama_lomba: "Inovasi Teknologi Tepat Guna Pedesaan", info_id: 5, kategori: "Inovasi & Bisnis", tingkat: "Nasional", deadline: plus(34), butuh_departemen: ["Fisika", "Kimia"], butuh_peran: ["Eksperimen Lab", "Programmer"], slot: 3, deskripsi: "Rencana alat pengering hasil panen bertenaga surya dengan sensor kelembapan." }),
        mkTim(u2, { judul: "Partner belajar Olimpiade bidang Fisika", nama_lomba: "Olimpiade Matematika & IPA Mahasiswa", info_id: 2, kategori: "Olimpiade Sains", tingkat: "Nasional", deadline: plus(25), butuh_departemen: ["Fisika"], butuh_peran: ["Ketua Tim"], slot: 1, deskripsi: "Bukan lomba tim, tapi cari teman belajar rutin 2x seminggu sampai seleksi." })
      ];
      return {
        info, profiles, tim, lamaran: [], pengaduan: [],
        accounts: [
          { email: "admin@demo.id", password: "admin123", id: adm, admin: true },
          { email: "nadia@demo.id", password: "demo123", id: u1 },
          { email: "rafi@demo.id", password: "demo123", id: u2 },
          { email: "sekar@demo.id", password: "demo123", id: u3 }
        ],
        session: null,
        nextInfoId: info.length + 1
      };
    }

    function db() {
      if (mem) return mem;
      let d = store.load();
      if (!d) { d = seed(); store.save(d); }
      mem = d;
      return d;
    }
    const commit = () => { store.save(mem); emit(); };
    const listeners = new Set();
    const emit = () => listeners.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    const wait = (v) => new Promise((r) => setTimeout(() => r(v), 120));
    const clone = (v) => JSON.parse(JSON.stringify(v));
    const me = () => db().session;
    const need = () => { if (!me()) throw new Error("Silakan masuk terlebih dahulu."); return me(); };
    const isAdm = () => !!(me() && db().accounts.find((a) => a.id === me() && a.admin));

    const kodeBaru = () => "FC-" + Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, "0");

    const SITE_KEY = "fc_site_v1";
    return {
      mode: "demo",
      reset() { mem = seed(); commit(); try { localStorage.removeItem(SITE_KEY); } catch (e) {} },

      /* --- pengaturan situs & media --- */
      async getSettings() { try { return JSON.parse(localStorage.getItem(SITE_KEY)) || null; } catch (e) { return null; } },
      async saveSettings(data) {
        if (!isAdm()) throw new Error("Hanya admin.");
        try { localStorage.setItem(SITE_KEY, JSON.stringify(data)); }
        catch (e) { throw new Error("Penyimpanan demo di browser ini penuh. Kurangi jumlah atau ukuran foto (di versi Supabase tidak ada batas ini)."); }
        return wait(true);
      },
      async resetSettings() { if (!isAdm()) throw new Error("Hanya admin."); try { localStorage.removeItem(SITE_KEY); } catch (e) {} },
      async uploadMedia(blob) {
        if (!isAdm()) throw new Error("Hanya admin.");
        return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error("Gagal membaca file.")); r.readAsDataURL(blob); });
      },
      onAuth(cb) { listeners.add(cb); return () => listeners.delete(cb); },

      /* --- akun --- */
      async user() { const id = me(); if (!id) return null; const a = db().accounts.find((x) => x.id === id); return a ? { id, email: a.email } : null; },
      async isAdmin() { return wait(isAdm()); },
      async signIn(email, password) {
        const a = db().accounts.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
        if (!a || a.password !== password) throw new Error("Email atau kata sandi salah.");
        db().session = a.id; commit(); return wait({ id: a.id });
      },
      async signUp(email, password, profil) {
        email = String(email).trim().toLowerCase();
        if (db().accounts.find((x) => x.email === email)) throw new Error("Email ini sudah terdaftar. Silakan masuk.");
        const id = uid();
        db().accounts.push({ email, password, id });
        db().profiles[id] = Object.assign({ id, keahlian: [] }, profil);
        db().session = id; commit();
        return wait({ id, needsConfirm: false });
      },
      async signOut() { db().session = null; commit(); },
      async myProfile() { const id = me(); return wait(id ? clone(db().profiles[id] || null) : null); },
      async saveProfile(p) {
        const id = need();
        db().profiles[id] = Object.assign({}, db().profiles[id], p, { id });
        db().tim.forEach((t) => { if (t.owner_id === id) { t.owner_nama = p.nama; t.owner_departemen = p.departemen; t.owner_angkatan = p.angkatan; } });
        commit(); return wait(clone(db().profiles[id]));
      },

      /* --- info --- */
      async listInfo(jenis) {
        let r = db().info.filter((x) => (isAdm() || x.terbit) && (!jenis || x.jenis === jenis));
        return wait(clone(r));
      },
      async getInfo(id) { return wait(clone(db().info.find((x) => String(x.id) === String(id)) || null)); },
      async saveInfo(item) {
        if (!isAdm()) throw new Error("Hanya admin.");
        const d = db();
        if (item.id) { const i = d.info.findIndex((x) => x.id === item.id); d.info[i] = Object.assign({}, d.info[i], item); }
        else { item = Object.assign({ terbit: true, unggulan: false, created_at: new Date().toISOString() }, item, { id: d.nextInfoId++ }); d.info.unshift(item); }
        commit(); return wait(clone(item));
      },
      async deleteInfo(id) { if (!isAdm()) throw new Error("Hanya admin."); db().info = db().info.filter((x) => x.id !== id); commit(); },

      /* --- pengaduan --- */
      async kirimPengaduan(p) {
        if (!p.isi || p.isi.trim().length < 20) throw new Error("Uraian terlalu pendek (minimal 20 karakter).");
        if (p.jenis === "ukt" && p.anonim) throw new Error("Permohonan UKT tidak bisa anonim.");
        const kode = kodeBaru();
        const row = Object.assign({}, p, { id: uid(), kode, status: "diterima", catatan_publik: "", catatan_internal: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        if (p.anonim) { row.nama = null; row.nim = null; }
        db().pengaduan.unshift(row); commit();
        return wait(kode);
      },
      async cekPengaduan(kode) {
        const r = db().pengaduan.find((x) => x.kode === String(kode).trim().toUpperCase());
        if (!r) return wait(null);
        const { jenis, status, catatan_publik, created_at, updated_at } = r;
        return wait({ kode: r.kode, jenis, status, catatan_publik, created_at, updated_at });
      },
      async listPengaduan() { if (!isAdm()) throw new Error("Hanya admin."); return wait(clone(db().pengaduan)); },
      async updatePengaduan(id, patch) {
        if (!isAdm()) throw new Error("Hanya admin.");
        const r = db().pengaduan.find((x) => x.id === id);
        Object.assign(r, patch, { updated_at: new Date().toISOString() }); commit(); return wait(clone(r));
      },
      async deletePengaduan(id) { if (!isAdm()) throw new Error("Hanya admin."); db().pengaduan = db().pengaduan.filter((x) => x.id !== id); commit(); },

      /* --- tim --- */
      async listTim() { return wait(clone(db().tim)); },
      async getTim(id) { return wait(clone(db().tim.find((x) => x.id === id) || null)); },
      async saveTim(t) {
        const id = need(); const d = db(); const p = d.profiles[id] || {};
        if (t.id) {
          const r = d.tim.find((x) => x.id === t.id);
          if (r.owner_id !== id && !isAdm()) throw new Error("Bukan lowongan milikmu.");
          ["judul", "nama_lomba", "info_id", "kategori", "tingkat", "deadline", "butuh_departemen", "butuh_peran", "slot", "deskripsi", "status"].forEach((k) => { if (k in t) r[k] = t[k]; });
          commit(); return wait(clone(r));
        }
        const row = Object.assign({}, t, { id: uid(), owner_id: id, owner_nama: p.nama, owner_departemen: p.departemen, owner_angkatan: p.angkatan, status: "buka", jumlah_pelamar: 0, jumlah_diterima: 0, created_at: new Date().toISOString() });
        d.tim.unshift(row); commit(); return wait(clone(row));
      },
      async deleteTim(id) {
        const u = need(); const r = db().tim.find((x) => x.id === id);
        if (!r || (r.owner_id !== u && !isAdm())) throw new Error("Tidak diizinkan.");
        db().tim = db().tim.filter((x) => x.id !== id); db().lamaran = db().lamaran.filter((l) => l.tim_id !== id); commit();
      },

      /* --- lamaran --- */
      async daftarTim(timId, p) {
        const u = need(); const d = db(); const t = d.tim.find((x) => x.id === timId);
        if (!t || t.status !== "buka") throw new Error("Lowongan sudah ditutup.");
        if (t.owner_id === u) throw new Error("Ini lowongan milikmu sendiri.");
        if (d.lamaran.find((l) => l.tim_id === timId && l.pelamar_id === u)) throw new Error("Kamu sudah mendaftar ke lowongan ini.");
        const pr = d.profiles[u] || {};
        const row = { id: uid(), tim_id: timId, pelamar_id: u, nama: pr.nama, departemen: pr.departemen, prodi: pr.prodi, angkatan: pr.angkatan, whatsapp: pr.whatsapp, peran: p.peran, pesan: p.pesan, link_portofolio: p.link_portofolio, status: "menunggu", created_at: new Date().toISOString() };
        d.lamaran.unshift(row); t.jumlah_pelamar++; commit(); return wait(clone(row));
      },
      async lamaranMasuk() {
        const u = need(); const d = db(); const mine = new Set(d.tim.filter((t) => t.owner_id === u).map((t) => t.id));
        return wait(clone(d.lamaran.filter((l) => mine.has(l.tim_id))));
      },
      async lamaranSaya() { const u = need(); return wait(clone(db().lamaran.filter((l) => l.pelamar_id === u))); },
      async setStatusLamaran(id, status) {
        const u = need(); const d = db(); const l = d.lamaran.find((x) => x.id === id); const t = d.tim.find((x) => x.id === l.tim_id);
        if (t.owner_id !== u) throw new Error("Tidak diizinkan.");
        l.status = status; t.jumlah_diterima = d.lamaran.filter((x) => x.tim_id === t.id && x.status === "diterima").length; commit(); return wait(clone(l));
      },
      async batalkanLamaran(id) {
        const u = need(); const d = db(); const l = d.lamaran.find((x) => x.id === id);
        if (!l || l.pelamar_id !== u) throw new Error("Tidak diizinkan.");
        d.lamaran = d.lamaran.filter((x) => x.id !== id);
        const t = d.tim.find((x) => x.id === l.tim_id); if (t) { t.jumlah_pelamar = Math.max(0, t.jumlah_pelamar - 1); t.jumlah_diterima = d.lamaran.filter((x) => x.tim_id === t.id && x.status === "diterima").length; }
        commit();
      },
      demoAccounts() { return db().accounts.map((a) => ({ email: a.email, password: a.password, admin: !!a.admin })); }
    };
  }

  /* =================================================================
     MESIN SUPABASE
     ================================================================= */
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Gagal memuat " + src)); document.head.appendChild(s); });
  }

  async function createSupabase() {
    if (!window.supabase) await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
    const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const ok = ({ data, error }) => { if (error) throw new Error(terjemah(error.message)); return data; };
    const uidNow = async () => { const { data } = await sb.auth.getUser(); return data.user ? data.user.id : null; };
    const need = async () => { const id = await uidNow(); if (!id) throw new Error("Silakan masuk terlebih dahulu."); return id; };
    let adminCache = null;
    sb.auth.onAuthStateChange(() => { adminCache = null; });

    return {
      mode: "supabase",
      client: sb,

      async getSettings() { const r = await sb.from("pengaturan").select("data").eq("id", "situs").maybeSingle(); return r.error || !r.data ? null : r.data.data; },
      async saveSettings(data) { ok(await sb.from("pengaturan").upsert({ id: "situs", data, updated_at: new Date().toISOString() })); return true; },
      async resetSettings() { ok(await sb.from("pengaturan").delete().eq("id", "situs")); },
      async uploadMedia(blob) {
        const ext = (blob.type.split("/")[1] || "webp").replace("svg+xml", "svg");
        const path = `situs/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        ok(await sb.storage.from("media").upload(path, blob, { contentType: blob.type, upsert: false, cacheControl: "31536000" }));
        return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
      },
      onAuth(cb) { const { data } = sb.auth.onAuthStateChange(() => cb()); return () => data.subscription.unsubscribe(); },

      async user() { const { data } = await sb.auth.getUser(); return data.user ? { id: data.user.id, email: data.user.email } : null; },
      async isAdmin() {
        if (adminCache !== null) return adminCache;
        const id = await uidNow(); if (!id) return false;
        const { data } = await sb.from("admins").select("user_id").eq("user_id", id).maybeSingle();
        adminCache = !!data; return adminCache;
      },
      async signIn(email, password) { return ok(await sb.auth.signInWithPassword({ email, password })).user; },
      async signUp(email, password, profil) {
        const data = ok(await sb.auth.signUp({ email, password, options: { data: { nama: profil.nama }, emailRedirectTo: location.href.split("#")[0] } }));
        if (data.session) { ok(await sb.from("profiles").upsert(Object.assign({ id: data.user.id }, profil))); return { id: data.user.id, needsConfirm: false }; }
        try { localStorage.setItem("fc_pending_profile", JSON.stringify(profil)); } catch (e) {}
        return { id: data.user && data.user.id, needsConfirm: true };
      },
      async signOut() { await sb.auth.signOut(); },
      async myProfile() {
        const id = await uidNow(); if (!id) return null;
        let p = ok(await sb.from("profiles").select("*").eq("id", id).maybeSingle());
        if (!p) { // profil tertunda dari pendaftaran yang perlu konfirmasi email
          let pend = null; try { pend = JSON.parse(localStorage.getItem("fc_pending_profile")); } catch (e) {}
          if (pend) { p = ok(await sb.from("profiles").upsert(Object.assign({ id }, pend)).select().single()); try { localStorage.removeItem("fc_pending_profile"); } catch (e) {} }
        }
        return p;
      },
      async saveProfile(p) { const id = await need(); return ok(await sb.from("profiles").upsert(Object.assign({}, p, { id })).select().single()); },

      async listInfo(jenis) { let q = sb.from("info").select("*").order("deadline", { ascending: true, nullsFirst: false }); if (jenis) q = q.eq("jenis", jenis); return ok(await q); },
      async getInfo(id) { return ok(await sb.from("info").select("*").eq("id", id).maybeSingle()); },
      async saveInfo(item) {
        const row = Object.assign({}, item); const id = row.id; delete row.id; delete row.created_at; delete row.created_by;
        if (id) return ok(await sb.from("info").update(row).eq("id", id).select().single());
        return ok(await sb.from("info").insert(row).select().single());
      },
      async deleteInfo(id) { ok(await sb.from("info").delete().eq("id", id)); },

      async kirimPengaduan(p) { return ok(await sb.rpc("kirim_pengaduan", { p })); },
      async cekPengaduan(kode) { const r = ok(await sb.rpc("cek_pengaduan", { p_kode: kode })); return r && r[0] ? r[0] : null; },
      async listPengaduan() { return ok(await sb.from("pengaduan").select("*").order("created_at", { ascending: false })); },
      async updatePengaduan(id, patch) { return ok(await sb.from("pengaduan").update(patch).eq("id", id).select().single()); },
      async deletePengaduan(id) { ok(await sb.from("pengaduan").delete().eq("id", id)); },

      async listTim() { return ok(await sb.from("tim").select("*").order("created_at", { ascending: false })); },
      async getTim(id) { return ok(await sb.from("tim").select("*").eq("id", id).maybeSingle()); },
      async saveTim(t) {
        await need();
        const row = {}; ["judul", "nama_lomba", "info_id", "kategori", "tingkat", "deadline", "butuh_departemen", "butuh_peran", "slot", "deskripsi", "status"].forEach((k) => { if (k in t) row[k] = t[k] === "" ? null : t[k]; });
        if (t.id) return ok(await sb.from("tim").update(row).eq("id", t.id).select().single());
        return ok(await sb.from("tim").insert(row).select().single());
      },
      async deleteTim(id) { ok(await sb.from("tim").delete().eq("id", id)); },

      async daftarTim(timId, p) {
        await need();
        const r = await sb.from("lamaran").insert({ tim_id: timId, peran: p.peran, pesan: p.pesan, link_portofolio: p.link_portofolio }).select().single();
        if (r.error && /duplicate|unique/i.test(r.error.message)) throw new Error("Kamu sudah mendaftar ke lowongan ini.");
        return ok(r);
      },
      async lamaranMasuk() {
        const id = await need();
        const tims = ok(await sb.from("tim").select("id").eq("owner_id", id)).map((t) => t.id);
        if (!tims.length) return [];
        return ok(await sb.from("lamaran").select("*").in("tim_id", tims).order("created_at", { ascending: false }));
      },
      async lamaranSaya() { const id = await need(); return ok(await sb.from("lamaran").select("*").eq("pelamar_id", id).order("created_at", { ascending: false })); },
      async setStatusLamaran(id, status) { return ok(await sb.from("lamaran").update({ status }).eq("id", id).select().single()); },
      async batalkanLamaran(id) { ok(await sb.from("lamaran").delete().eq("id", id)); }
    };
  }

  function terjemah(m) {
    const map = [
      [/Invalid login credentials/i, "Email atau kata sandi salah."],
      [/Email not confirmed/i, "Email belum dikonfirmasi. Cek kotak masuk emailmu."],
      [/User already registered/i, "Email ini sudah terdaftar. Silakan masuk."],
      [/Password should be at least/i, "Kata sandi minimal 6 karakter."],
      [/row-level security|permission denied/i, "Kamu tidak punya izin untuk tindakan ini."],
      [/Failed to fetch|NetworkError/i, "Tidak bisa terhubung ke server. Periksa koneksi internet."]
    ];
    for (const [re, t] of map) if (re.test(m)) return t;
    return m;
  }

  /* ---------- inisialisasi ---------- */
  FC.ready = (async () => {
    if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
      try { FC.data = await createSupabase(); return FC.data; }
      catch (e) { console.error(e); FC.dataError = e.message; }
    }
    FC.data = createDemo();
    return FC.data;
  })();

  FC.util = { plus, today, uid };
})();
