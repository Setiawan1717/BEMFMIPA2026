-- =====================================================================
-- FMIPA Connect — Badan Semi Otonom (BSO)
-- Jalankan SETELAH schema.sql: SQL Editor → New query → tempel → Run.
-- Aman dijalankan ulang.
--
-- Hak akses bertingkat:
--   1. Admin pusat       : baris di public.admins (yang sudah ada)  → semua BSO
--   2. Admin departemen  : bso_admins.departemen_bem = 'Seniora'    → semua BSO Seniora
--   3. Admin BSO         : bso_admins.bso = 'gsc5'                  → hanya GSC-5
--
-- Admin departemen & admin BSO TIDAK masuk tabel public.admins, jadi
-- mereka tidak bisa membuka Kanal Pengaduan, Info, atau Edit situs utama.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DAFTAR BSO
--    Kolom `departemen_bem` = departemen BEM yang menaungi (Hubeks, Kesma,
--    Seniora, Riskel), BUKAN departemen kuliah (Matematika, dst.).
-- ---------------------------------------------------------------------
create table if not exists public.bso (
  slug              text primary key check (slug ~ '^[a-z0-9-]+$'),
  nama              text not null,
  departemen_bem    text not null,
  deskripsi         text,
  pendaftaran_buka  boolean not null default false,
  pendaftaran_info  text,               -- contoh: "Dibuka 1–14 Maret, wawancara 20 Maret"
  updated_at        timestamptz not null default now()
);

insert into public.bso (slug, nama, departemen_bem) values
  ('science-entrepreneur', 'Science Entrepreneur', 'Hubeks'),
  ('kharisma',             'Kharisma',             'Kesma'),
  ('komipa',               'KOMIPA',               'Seniora'),
  ('gsc5',                 'GSC-5',                'Seniora'),
  ('aswa',                 'Aswa',                 'Seniora'),
  ('fs2t',                 'FS2T',                 'Riskel')
on conflict (slug) do update set nama = excluded.nama, departemen_bem = excluded.departemen_bem;

-- ---------------------------------------------------------------------
-- 2. ADMIN BSO / DEPARTEMEN
--    Satu baris = satu hak. Isi SALAH SATU: bso ATAU departemen_bem.
-- ---------------------------------------------------------------------
create table if not exists public.bso_admins (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  bso             text references public.bso(slug) on delete cascade,
  departemen_bem  text,
  created_at      timestamptz not null default now(),
  check ((bso is null) <> (departemen_bem is null)),
  unique nulls not distinct (user_id, bso, departemen_bem)
);

-- Boleh mengelola BSO ini? (admin pusat, admin departemennya, atau admin BSO itu)
create or replace function public.is_admin_bso(p_bso text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.bso_admins a
    join public.bso b on b.slug = p_bso
    where a.user_id = auth.uid()
      and (a.bso = b.slug or a.departemen_bem = b.departemen_bem)
  );
$$;

-- Daftar BSO yang boleh dikelola akun yang sedang masuk
create or replace function public.bso_akses_saya()
returns setof text
language sql stable security definer set search_path = public
as $$
  select slug from public.bso where public.is_admin_bso(slug);
$$;
grant execute on function public.is_admin_bso(text) to anon, authenticated;
grant execute on function public.bso_akses_saya()   to authenticated;

alter table public.bso_admins enable row level security;
drop policy if exists "bso_admins lihat" on public.bso_admins;
create policy "bso_admins lihat" on public.bso_admins
  for select using (user_id = auth.uid() or public.is_admin());
-- Hanya admin pusat yang boleh menambah/mencabut admin BSO
drop policy if exists "bso_admins pusat" on public.bso_admins;
create policy "bso_admins pusat" on public.bso_admins
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.bso enable row level security;
drop policy if exists "bso publik" on public.bso;
create policy "bso publik" on public.bso for select using (true);
drop policy if exists "bso admin ubah" on public.bso;
create policy "bso admin ubah" on public.bso
  for update using (public.is_admin_bso(slug)) with check (public.is_admin_bso(slug));
drop policy if exists "bso pusat kelola" on public.bso;
create policy "bso pusat kelola" on public.bso
  for all using (public.is_admin()) with check (public.is_admin());
-- Admin BSO hanya boleh mengubah kolom ini (bukan nama/departemen/slug)
revoke update on public.bso from authenticated, anon;
grant  update (deskripsi, pendaftaran_buka, pendaftaran_info, updated_at) on public.bso to authenticated;

-- ---------------------------------------------------------------------
-- 3. PENGUMUMAN BSO (mekanisme bersama)
-- ---------------------------------------------------------------------
create table if not exists public.bso_pengumuman (
  id          bigint generated always as identity primary key,
  bso         text not null references public.bso(slug) on delete cascade,
  judul       text not null,
  isi         text,
  link        text,
  gambar_url  text,
  terbit      boolean not null default true,
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now()
);
create index if not exists bso_pengumuman_bso on public.bso_pengumuman (bso, created_at desc);

alter table public.bso_pengumuman enable row level security;
drop policy if exists "pengumuman baca" on public.bso_pengumuman;
create policy "pengumuman baca" on public.bso_pengumuman
  for select using (terbit or public.is_admin_bso(bso));
drop policy if exists "pengumuman admin" on public.bso_pengumuman;
create policy "pengumuman admin" on public.bso_pengumuman
  for all using (public.is_admin_bso(bso)) with check (public.is_admin_bso(bso));

-- ---------------------------------------------------------------------
-- 4. PENDAFTARAN ANGGOTA BSO (mekanisme bersama)
--    Pertanyaan formulir diatur di assets/js/bso-config.js,
--    jawabannya disimpan di kolom `jawaban` (jsonb).
-- ---------------------------------------------------------------------
create table if not exists public.bso_pendaftaran (
  id          uuid primary key default gen_random_uuid(),
  bso         text not null references public.bso(slug) on delete cascade,
  user_id     uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nama        text,       -- diisi otomatis dari profil
  nim         text,
  departemen  text,
  prodi       text,
  angkatan    int,
  whatsapp    text,
  jawaban     jsonb not null default '{}'::jsonb,
  status      text not null default 'menunggu' check (status in ('menunggu','diterima','ditolak')),
  catatan     text,       -- pesan admin untuk pendaftar
  created_at  timestamptz not null default now(),
  unique (bso, user_id)
);

alter table public.bso_pendaftaran enable row level security;
drop policy if exists "pendaftaran baca" on public.bso_pendaftaran;
create policy "pendaftaran baca" on public.bso_pendaftaran
  for select using (user_id = auth.uid() or public.is_admin_bso(bso));
drop policy if exists "pendaftaran kirim" on public.bso_pendaftaran;
create policy "pendaftaran kirim" on public.bso_pendaftaran
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.bso b where b.slug = bso_pendaftaran.bso and b.pendaftaran_buka)
  );
drop policy if exists "pendaftaran admin ubah" on public.bso_pendaftaran;
create policy "pendaftaran admin ubah" on public.bso_pendaftaran
  for update using (public.is_admin_bso(bso)) with check (public.is_admin_bso(bso));
drop policy if exists "pendaftaran hapus" on public.bso_pendaftaran;
create policy "pendaftaran hapus" on public.bso_pendaftaran
  for delete using (user_id = auth.uid() or public.is_admin_bso(bso));

-- Admin hanya boleh mengubah status & catatan
revoke update on public.bso_pendaftaran from authenticated, anon;
grant  update (status, catatan) on public.bso_pendaftaran to authenticated;

-- Data diri diambil dari profil; status selalu mulai dari 'menunggu'
create or replace function public.bso_pendaftaran_isi()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select nama, nim, departemen, prodi, angkatan, whatsapp
    into new.nama, new.nim, new.departemen, new.prodi, new.angkatan, new.whatsapp
  from public.profiles where id = new.user_id;
  new.status := 'menunggu';
  new.catatan := null;
  return new;
end; $$;
drop trigger if exists bso_pendaftaran_isi on public.bso_pendaftaran;
create trigger bso_pendaftaran_isi before insert on public.bso_pendaftaran
  for each row execute function public.bso_pendaftaran_isi();

-- ---------------------------------------------------------------------
-- 5. MENAMBAH ADMIN (jalankan oleh admin pusat, ganti emailnya)
--    Orangnya harus sudah mendaftar akun di situs lebih dulu.
--
-- Admin satu BSO (contoh: ketua GSC-5):
-- insert into public.bso_admins (user_id, bso)
--   select id, 'gsc5' from auth.users where email = 'ketua.gsc5@students.um.ac.id';
--
-- Admin departemen (contoh: Kadep Seniora → KOMIPA, GSC-5, Aswa):
-- insert into public.bso_admins (user_id, departemen_bem)
--   select id, 'Seniora' from auth.users where email = 'kadep.seniora@students.um.ac.id';
--
-- Mencabut akses:
-- delete from public.bso_admins
--   where user_id = (select id from auth.users where email = '...');
-- ---------------------------------------------------------------------
