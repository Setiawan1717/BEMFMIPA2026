/* =====================================================================
   Science Entrepreneur — LAPISAN DATA member, pesanan, dan poin SE
   Dua mesin dengan fungsi yang sama (seperti assets/js/data.js):
   - Supabase : tabel science_entrepreneur_* (supabase/bso/science-entrepreneur.sql)
   - Demo     : localStorage browser, aturannya meniru fungsi SQL
   Pakai: const api = window.SE_DATA(ctx)
   ===================================================================== */
(function () {
  const K = () => window.SE_KATALOG || { CASHBACK: 0.1, KARTU: { harga: 15000, poinAwal: 15000 } };

  function demo(ctx) {
    const KEY = "fc_se_demo_v1";
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
    let mem = null;
    const db = () => mem || (mem = load() || { member: [], pesanan: [], poin: [], kode: 0, poinId: 1 });
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* abaikan */ } };
    const clone = (v) => JSON.parse(JSON.stringify(v));
    const wait = (v) => new Promise((r) => setTimeout(() => r(clone(v)), 100));
    const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2));
    const me = () => { if (!ctx.user) throw new Error("Silakan masuk terlebih dahulu."); return ctx.user.id; };
    const adm = () => { if (!ctx.admin) throw new Error("Hanya admin Science Entrepreneur."); };
    const now = () => new Date().toISOString();
    const ubahPoin = (m, n, ket, pesanan) => {
      if (m.saldo + n < 0) throw new Error("Saldo poin tidak boleh minus.");
      m.saldo += n;
      db().poin.unshift({ id: db().poinId++, member_id: m.id, jumlah: n, keterangan: ket, pesanan_id: pesanan || null, created_at: now() });
    };
    const memberOf = (u) => db().member.find((m) => m.user_id === u) || null;

    return {
      async memberSaya() { return wait(ctx.user ? memberOf(ctx.user.id) : null); },
      async daftarMember(v) {
        const u = me();
        if (memberOf(u)) throw new Error("Kamu sudah terdaftar sebagai member SE.");
        const m = { id: uid(), user_id: u, tipe: v.tipe, nama_ormawa: v.tipe === "ormawa" ? v.nama_ormawa : null, nama: v.nama, whatsapp: v.whatsapp,
          kode: null, status: "menunggu", saldo: 0, catatan: null, created_at: now(), aktif_at: null };
        db().member.push(m); save(); return wait(m);
      },
      async ubahMember(id, v) {
        const m = db().member.find((x) => x.id === id);
        if (!m || m.user_id !== me()) throw new Error("Tidak diizinkan.");
        if (!v.nama || !v.whatsapp || (m.tipe === "ormawa" && !v.nama_ormawa)) throw new Error("Lengkapi semua isian bertanda *.");
        Object.assign(m, { nama: v.nama, whatsapp: v.whatsapp }, m.tipe === "ormawa" ? { nama_ormawa: v.nama_ormawa } : {}); save(); return wait(m);
      },
      async batalMember(id) {
        const m = db().member.find((x) => x.id === id);
        if (!m || (m.user_id !== me() && !ctx.admin) || (m.status === "aktif" && !ctx.admin)) throw new Error("Tidak diizinkan.");
        db().member = db().member.filter((x) => x.id !== id); save(); return wait(true);
      },
      async riwayatPoin(memberId) {
        const m = db().member.find((x) => x.id === memberId);
        if (!m || (m.user_id !== (ctx.user && ctx.user.id) && !ctx.admin)) return wait([]);
        return wait(db().poin.filter((p) => p.member_id === memberId));
      },
      async pesananSaya() { return wait(ctx.user ? db().pesanan.filter((p) => p.user_id === ctx.user.id) : []); },
      async kirimPesanan(v) {
        const u = me();
        if (v.bayar === "poin" && v.unit !== "sewa") throw new Error("Poin SE hanya bisa ditukar untuk barang persewaan.");
        const total = v.harga * v.jumlah;
        if (v.bayar === "poin") {
          const m = memberOf(u);
          if (!m || m.status !== "aktif") throw new Error("Bayar pakai poin khusus member SE yang aktif.");
          if (m.saldo < total) throw new Error(`Saldo poin SE tidak cukup (saldo ${m.saldo}, butuh ${total}).`);
        }
        const p = Object.assign({ id: uid(), user_id: u, nama: (ctx.profil && ctx.profil.nama) || "", whatsapp: (ctx.profil && ctx.profil.whatsapp) || "",
          status: "menunggu", poin_cashback: 0, pesan_admin: null, created_at: now(), selesai_at: null },
          { unit: v.unit, produk: v.produk, harga: v.harga, jumlah: v.jumlah, satuan: v.satuan, total, bayar: v.bayar || "uang", tanggal: v.tanggal || null, catatan: v.catatan || null });
        db().pesanan.unshift(p); save(); return wait(p);
      },
      async batalPesanan(id) {
        const p = db().pesanan.find((x) => x.id === id);
        if (!p || ((p.user_id !== me() || p.status !== "menunggu") && !ctx.admin)) throw new Error("Tidak diizinkan.");
        db().pesanan = db().pesanan.filter((x) => x.id !== id); save(); return wait(true);
      },

      /* ---- admin ---- */
      async listMember() { adm(); return wait(db().member.slice().sort((a, b) => (b.created_at > a.created_at ? 1 : -1))); },
      async aktifkanMember(id) {
        adm(); const m = db().member.find((x) => x.id === id);
        if (!m) throw new Error("Member tidak ditemukan."); if (m.status === "aktif") throw new Error("Member ini sudah aktif.");
        m.status = "aktif"; m.aktif_at = now(); m.catatan = null;
        if (!m.kode) m.kode = "SE-" + String(++db().kode).padStart(4, "0");
        ubahPoin(m, K().KARTU.poinAwal, "Saldo awal kartu member"); save(); return wait(m);
      },
      async tolakMember(id, catatan) {
        adm(); const m = db().member.find((x) => x.id === id);
        if (!m || m.status !== "menunggu") throw new Error("Hanya pendaftaran yang menunggu yang bisa ditolak.");
        m.status = "ditolak"; m.catatan = catatan || null; save(); return wait(true);
      },
      async sesuaikanPoin(memberId, jumlah, ket) {
        adm(); if (!jumlah || !ket) throw new Error("Isi jumlah poin dan keterangan.");
        const m = db().member.find((x) => x.id === memberId); if (!m) throw new Error("Member tidak ditemukan.");
        ubahPoin(m, jumlah, "Penyesuaian admin: " + ket); save(); return wait(m.saldo);
      },
      async listPesanan() { adm(); return wait(db().pesanan); },
      async statusPesanan(id, status, total, pesan) {
        adm(); const p = db().pesanan.find((x) => x.id === id);
        if (!p) throw new Error("Pesanan tidak ditemukan."); if (p.status !== "menunggu") throw new Error("Pesanan ini sudah " + p.status + ".");
        let cb = 0;
        if (status === "lunas") {
          if (total != null && total !== "") p.total = Math.max(0, Math.round(+total));
          const m = memberOf(p.user_id);
          if (p.bayar === "poin") {
            if (!m || m.status !== "aktif") throw new Error("Pemesan bukan member aktif.");
            if (m.saldo < p.total) throw new Error(`Saldo poin pemesan tidak cukup (saldo ${m.saldo}).`);
            ubahPoin(m, -p.total, "Tukar poin: " + p.produk, p.id);
          } else if (m && m.status === "aktif") {
            cb = Math.floor(p.total * K().CASHBACK);
            if (cb > 0) ubahPoin(m, cb, "Cashback 10%: " + p.produk, p.id);
          }
        }
        Object.assign(p, { status, poin_cashback: cb, pesan_admin: pesan || null, selesai_at: now() }); save(); return wait(p);
      }
    };
  }

  function supabase(ctx) {
    const sb = ctx.D.client;
    const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
    const T = { m: "science_entrepreneur_member", p: "science_entrepreneur_pesanan", r: "science_entrepreneur_poin" };
    return {
      async memberSaya() { return ctx.user ? ok(await sb.from(T.m).select("*").eq("user_id", ctx.user.id).maybeSingle()) : null; },
      async daftarMember(v) {
        const row = { tipe: v.tipe, nama_ormawa: v.tipe === "ormawa" ? v.nama_ormawa : null, nama: v.nama, whatsapp: v.whatsapp };
        try { return ok(await sb.from(T.m).insert(row).select().single()); }
        catch (e) { if (/duplicate|unique/i.test(e.message)) throw new Error("Kamu sudah terdaftar sebagai member SE."); throw e; }
      },
      async ubahMember(id, v) {
        const row = { nama: v.nama, whatsapp: v.whatsapp }; if (v.nama_ormawa !== undefined) row.nama_ormawa = v.nama_ormawa;
        return ok(await sb.from(T.m).update(row).eq("id", id).select().single());
      },
      async batalMember(id) { ok(await sb.from(T.m).delete().eq("id", id)); },
      async riwayatPoin(memberId) { return ok(await sb.from(T.r).select("*").eq("member_id", memberId).order("id", { ascending: false }).limit(100)); },
      async pesananSaya() { return ctx.user ? ok(await sb.from(T.p).select("*").eq("user_id", ctx.user.id).order("created_at", { ascending: false })) : []; },
      async kirimPesanan(v) {
        const row = { unit: v.unit, produk: v.produk, harga: v.harga, jumlah: v.jumlah, satuan: v.satuan, total: v.harga * v.jumlah, bayar: v.bayar || "uang", tanggal: v.tanggal || null, catatan: v.catatan || null };
        return ok(await sb.from(T.p).insert(row).select().single());
      },
      async batalPesanan(id) { ok(await sb.from(T.p).delete().eq("id", id)); },
      async listMember() { return ok(await sb.from(T.m).select("*").order("created_at", { ascending: false })); },
      async aktifkanMember(id) { return ok(await sb.rpc("se_member_aktifkan", { p_id: id })); },
      async tolakMember(id, catatan) { return ok(await sb.rpc("se_member_tolak", { p_id: id, p_catatan: catatan || null })); },
      async sesuaikanPoin(memberId, jumlah, ket) { return ok(await sb.rpc("se_poin_sesuaikan", { p_member: memberId, p_jumlah: jumlah, p_ket: ket })); },
      async listPesanan() { return ok(await sb.from(T.p).select("*").order("created_at", { ascending: false }).limit(500)); },
      async statusPesanan(id, status, total, pesan) {
        return ok(await sb.rpc("se_pesanan_status", { p_id: id, p_status: status, p_total: total === "" || total == null ? null : Math.round(+total), p_pesan: pesan || null }));
      }
    };
  }

  window.SE_DATA = (ctx) => (ctx.D && ctx.D.mode === "supabase" ? supabase(ctx) : demo(ctx));
})();
