-- =====================================================================
-- Science Entrepreneur (SE): member, pesanan Unit Usaha, dan poin SE
-- Jalankan SETELAH schema.sql dan bso.sql: SQL Editor → New query → tempel → Run.
-- Aman dijalankan ulang. Tidak mengubah tabel lama.
--
-- Aturan (samakan dengan science-entrepreneur/katalog.js):
--   • Kartu member Rp15.000 → setelah admin SE menandai lunas, saldo +15.000 poin
--   • Pesanan dibayar uang → saat admin menandai lunas, member aktif dapat 10% poin
--   • 1 poin = Rp1. Poin hanya bisa dipakai untuk unit "sewa"
--   • Semua perubahan saldo HANYA lewat fungsi admin di bawah (tidak bisa diubah langsung)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. MEMBER
-- ---------------------------------------------------------------------
create table if not exists public.science_entrepreneur_member (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique default auth.uid() references public.profiles(id) on delete cascade,
  tipe         text not null check (tipe in ('ormawa','pribadi')),
  nama_ormawa  text,
  nama         text not null,             -- nama pribadi / penanggung jawab ormawa
  whatsapp     text not null,
  kode         text unique,               -- SE-0001, diberikan saat kartu lunas
  status       text not null default 'menunggu' check (status in ('menunggu','aktif','ditolak')),
  saldo        integer not null default 0 check (saldo >= 0),
  catatan      text,                      -- pesan admin untuk member
  created_at   timestamptz not null default now(),
  aktif_at     timestamptz,
  check (tipe = 'pribadi' or coalesce(trim(nama_ormawa), '') <> '')
);
create sequence if not exists public.science_entrepreneur_kode_seq;

alter table public.science_entrepreneur_member enable row level security;
drop policy if exists "se member baca" on public.science_entrepreneur_member;
create policy "se member baca" on public.science_entrepreneur_member
  for select using (user_id = auth.uid() or public.is_admin_bso('science-entrepreneur'));
drop policy if exists "se member daftar" on public.science_entrepreneur_member;
create policy "se member daftar" on public.science_entrepreneur_member
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "se member batal" on public.science_entrepreneur_member;
create policy "se member batal" on public.science_entrepreneur_member
  for delete using ((user_id = auth.uid() and status <> 'aktif') or public.is_admin_bso('science-entrepreneur'));
-- Tidak ada UPDATE langsung: status & saldo hanya lewat fungsi admin
revoke update on public.science_entrepreneur_member from authenticated, anon;

create or replace function public.science_entrepreneur_member_isi()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.status := 'menunggu'; new.saldo := 0; new.kode := null; new.catatan := null; new.aktif_at := null;
  if new.tipe = 'pribadi' then new.nama_ormawa := null; end if;
  return new;
end; $$;
drop trigger if exists science_entrepreneur_member_isi on public.science_entrepreneur_member;
create trigger science_entrepreneur_member_isi before insert on public.science_entrepreneur_member
  for each row execute function public.science_entrepreneur_member_isi();

-- ---------------------------------------------------------------------
-- 2. PESANAN UNIT USAHA
-- ---------------------------------------------------------------------
create table if not exists public.science_entrepreneur_pesanan (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  unit           text not null check (unit in ('beli','sewa','cetak')),
  produk         text not null,
  harga          integer not null check (harga >= 0),
  jumlah         integer not null default 1 check (jumlah between 1 and 10000),
  satuan         text,
  total          integer not null check (total >= 0),
  bayar          text not null default 'uang' check (bayar in ('uang','poin')),
  tanggal        date,                    -- tanggal mulai sewa / dibutuhkan
  catatan        text,
  nama           text,                    -- diisi otomatis dari profil
  whatsapp       text,
  status         text not null default 'menunggu' check (status in ('menunggu','lunas','batal')),
  poin_cashback  integer not null default 0,
  pesan_admin    text,
  created_at     timestamptz not null default now(),
  selesai_at     timestamptz,
  check (bayar = 'uang' or unit = 'sewa')  -- poin khusus barang persewaan
);

alter table public.science_entrepreneur_pesanan enable row level security;
drop policy if exists "se pesanan baca" on public.science_entrepreneur_pesanan;
create policy "se pesanan baca" on public.science_entrepreneur_pesanan
  for select using (user_id = auth.uid() or public.is_admin_bso('science-entrepreneur'));
drop policy if exists "se pesanan kirim" on public.science_entrepreneur_pesanan;
create policy "se pesanan kirim" on public.science_entrepreneur_pesanan
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "se pesanan batal" on public.science_entrepreneur_pesanan;
create policy "se pesanan batal" on public.science_entrepreneur_pesanan
  for delete using ((user_id = auth.uid() and status = 'menunggu') or public.is_admin_bso('science-entrepreneur'));
revoke update on public.science_entrepreneur_pesanan from authenticated, anon;

create or replace function public.science_entrepreneur_pesanan_isi()
returns trigger language plpgsql security definer set search_path = public as $$
declare m public.science_entrepreneur_member;
begin
  select nama, whatsapp into new.nama, new.whatsapp from public.profiles where id = new.user_id;
  new.total := new.harga * new.jumlah;
  new.status := 'menunggu'; new.poin_cashback := 0; new.pesan_admin := null; new.selesai_at := null;
  if new.bayar = 'poin' then
    select * into m from public.science_entrepreneur_member where user_id = new.user_id;
    if m.id is null or m.status <> 'aktif' then raise exception 'Bayar pakai poin khusus member SE yang aktif.'; end if;
    if m.saldo < new.total then raise exception 'Saldo poin SE tidak cukup (saldo %, butuh %).', m.saldo, new.total; end if;
  end if;
  return new;
end; $$;
drop trigger if exists science_entrepreneur_pesanan_isi on public.science_entrepreneur_pesanan;
create trigger science_entrepreneur_pesanan_isi before insert on public.science_entrepreneur_pesanan
  for each row execute function public.science_entrepreneur_pesanan_isi();

-- ---------------------------------------------------------------------
-- 3. RIWAYAT POIN (setiap tambah/kurang saldo tercatat di sini)
-- ---------------------------------------------------------------------
create table if not exists public.science_entrepreneur_poin (
  id          bigint generated always as identity primary key,
  member_id   uuid not null references public.science_entrepreneur_member(id) on delete cascade,
  jumlah      integer not null,            -- + masuk, - keluar
  keterangan  text not null,
  pesanan_id  uuid references public.science_entrepreneur_pesanan(id) on delete set null,
  oleh        uuid default auth.uid(),
  created_at  timestamptz not null default now()
);
alter table public.science_entrepreneur_poin enable row level security;
drop policy if exists "se poin baca" on public.science_entrepreneur_poin;
create policy "se poin baca" on public.science_entrepreneur_poin
  for select using (
    public.is_admin_bso('science-entrepreneur')
    or exists (select 1 from public.science_entrepreneur_member m where m.id = member_id and m.user_id = auth.uid())
  );
-- Tidak ada insert/update/delete langsung; hanya lewat fungsi di bawah.
revoke insert, update, delete on public.science_entrepreneur_poin from authenticated, anon;

-- Ubah saldo + catat riwayat (dipakai fungsi admin, tidak bisa dipanggil langsung)
create or replace function public.science_entrepreneur_ubah_poin(p_member uuid, p_jumlah integer, p_ket text, p_pesanan uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare s integer;
begin
  update public.science_entrepreneur_member set saldo = saldo + p_jumlah where id = p_member returning saldo into s;
  if s is null then raise exception 'Member tidak ditemukan.'; end if;
  insert into public.science_entrepreneur_poin (member_id, jumlah, keterangan, pesanan_id) values (p_member, p_jumlah, p_ket, p_pesanan);
  return s;
end; $$;
revoke execute on function public.science_entrepreneur_ubah_poin(uuid, integer, text, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. FUNGSI ADMIN SE (panel admin memanggil lewat supabase.rpc)
-- ---------------------------------------------------------------------

-- Kartu member lunas → aktif, beri kode, saldo +15.000 poin
create or replace function public.se_member_aktifkan(p_id uuid)
returns public.science_entrepreneur_member language plpgsql security definer set search_path = public as $$
declare m public.science_entrepreneur_member;
begin
  if not public.is_admin_bso('science-entrepreneur') then raise exception 'Hanya admin Science Entrepreneur.'; end if;
  select * into m from public.science_entrepreneur_member where id = p_id for update;
  if m.id is null then raise exception 'Member tidak ditemukan.'; end if;
  if m.status = 'aktif' then raise exception 'Member ini sudah aktif.'; end if;
  update public.science_entrepreneur_member
     set status = 'aktif', aktif_at = now(), catatan = null,
         kode = coalesce(kode, 'SE-' || lpad(nextval('public.science_entrepreneur_kode_seq')::text, 4, '0'))
   where id = p_id;
  perform public.science_entrepreneur_ubah_poin(p_id, 15000, 'Saldo awal kartu member');
  select * into m from public.science_entrepreneur_member where id = p_id;
  return m;
end; $$;

create or replace function public.se_member_tolak(p_id uuid, p_catatan text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin_bso('science-entrepreneur') then raise exception 'Hanya admin Science Entrepreneur.'; end if;
  update public.science_entrepreneur_member set status = 'ditolak', catatan = p_catatan where id = p_id and status = 'menunggu';
  if not found then raise exception 'Hanya pendaftaran yang menunggu yang bisa ditolak.'; end if;
end; $$;

-- Penyesuaian manual (koreksi, bonus, dll). p_jumlah boleh negatif.
create or replace function public.se_poin_sesuaikan(p_member uuid, p_jumlah integer, p_ket text)
returns integer language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin_bso('science-entrepreneur') then raise exception 'Hanya admin Science Entrepreneur.'; end if;
  if p_jumlah = 0 or coalesce(trim(p_ket), '') = '' then raise exception 'Isi jumlah poin dan keterangan.'; end if;
  return public.science_entrepreneur_ubah_poin(p_member, p_jumlah, 'Penyesuaian admin: ' || p_ket);
end; $$;

-- Pesanan lunas / batal. p_total: total akhir yang dibayar (kosong = total pesanan).
--   bayar uang + member aktif → poin +10% dari total
--   bayar poin               → saldo dikurangi total
create or replace function public.se_pesanan_status(p_id uuid, p_status text, p_total integer default null, p_pesan text default null)
returns public.science_entrepreneur_pesanan language plpgsql security definer set search_path = public as $$
declare p public.science_entrepreneur_pesanan; m public.science_entrepreneur_member; cb integer := 0;
begin
  if not public.is_admin_bso('science-entrepreneur') then raise exception 'Hanya admin Science Entrepreneur.'; end if;
  if p_status not in ('lunas','batal') then raise exception 'Status tidak dikenal.'; end if;
  select * into p from public.science_entrepreneur_pesanan where id = p_id for update;
  if p.id is null then raise exception 'Pesanan tidak ditemukan.'; end if;
  if p.status <> 'menunggu' then raise exception 'Pesanan ini sudah %.', p.status; end if;
  if p_total is not null and p_total < 0 then raise exception 'Total tidak valid.'; end if;

  if p_status = 'lunas' then
    p.total := coalesce(p_total, p.total);
    select * into m from public.science_entrepreneur_member where user_id = p.user_id for update;
    if p.bayar = 'poin' then
      if m.id is null or m.status <> 'aktif' then raise exception 'Pemesan bukan member aktif.'; end if;
      if m.saldo < p.total then raise exception 'Saldo poin pemesan tidak cukup (saldo %).', m.saldo; end if;
      perform public.science_entrepreneur_ubah_poin(m.id, -p.total, 'Tukar poin: ' || p.produk, p.id);
    elsif m.id is not null and m.status = 'aktif' then
      cb := floor(p.total * 0.10);
      if cb > 0 then perform public.science_entrepreneur_ubah_poin(m.id, cb, 'Cashback 10%: ' || p.produk, p.id); end if;
    end if;
  end if;

  update public.science_entrepreneur_pesanan
     set status = p_status, total = p.total, poin_cashback = cb, pesan_admin = p_pesan, selesai_at = now()
   where id = p_id returning * into p;
  return p;
end; $$;

revoke execute on function public.se_member_aktifkan(uuid) from public, anon;
revoke execute on function public.se_member_tolak(uuid, text) from public, anon;
revoke execute on function public.se_poin_sesuaikan(uuid, integer, text) from public, anon;
revoke execute on function public.se_pesanan_status(uuid, text, integer, text) from public, anon;
grant execute on function public.se_member_aktifkan(uuid) to authenticated;
grant execute on function public.se_member_tolak(uuid, text) to authenticated;
grant execute on function public.se_poin_sesuaikan(uuid, integer, text) to authenticated;
grant execute on function public.se_pesanan_status(uuid, text, integer, text) to authenticated;
