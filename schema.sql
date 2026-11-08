-- =====================================================================
-- FMIPA Connect — skema database Supabase
-- Jalankan SELURUH file ini di Supabase: SQL Editor → New query → Run.
-- Aman dijalankan ulang (memakai IF NOT EXISTS / OR REPLACE).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. ADMIN
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  peran      text not null default 'admin',   -- contoh: 'admin', 'advokesma', 'satgas'
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins enable row level security;
drop policy if exists "admin lihat diri" on public.admins;
create policy "admin lihat diri" on public.admins
  for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 2. PROFIL MAHASISWA
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nama        text not null,
  nim         text,
  departemen  text,
  prodi       text,
  angkatan    int,
  whatsapp    text,
  bio         text,
  keahlian    text[] default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profil milik sendiri" on public.profiles;
create policy "profil milik sendiri" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "buat profil sendiri" on public.profiles;
create policy "buat profil sendiri" on public.profiles
  for insert with check (id = auth.uid());
drop policy if exists "ubah profil sendiri" on public.profiles;
create policy "ubah profil sendiri" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- 3. INFO LOMBA / BEASISWA / PELATIHAN (diisi admin)
-- ---------------------------------------------------------------------
create table if not exists public.info (
  id            bigint generated always as identity primary key,
  jenis         text not null check (jenis in ('lomba','beasiswa','pelatihan')),
  judul         text not null,
  penyelenggara text,
  kategori      text,
  tingkat       text,            -- Internasional / Nasional / Regional / Universitas
  deadline      date,
  tanggal_acara date,
  lokasi        text,            -- Daring / Luring / nama kota
  biaya         text,            -- "Gratis", "Rp50.000/tim", nilai beasiswa, dst.
  deskripsi     text,
  link          text,
  poster_url    text,
  unggulan      boolean not null default false,
  terbit        boolean not null default true,
  created_by    uuid default auth.uid(),
  created_at    timestamptz not null default now()
);
create index if not exists info_jenis_deadline on public.info (jenis, deadline);

alter table public.info enable row level security;
drop policy if exists "info terbit publik" on public.info;
create policy "info terbit publik" on public.info
  for select using (terbit or public.is_admin());
drop policy if exists "info admin tulis" on public.info;
create policy "info admin tulis" on public.info
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. KANAL PENGADUAN
--    Mahasiswa TIDAK bisa membaca tabel ini. Kirim lewat fungsi
--    kirim_pengaduan(), cek status lewat cek_pengaduan(kode).
-- ---------------------------------------------------------------------
create table if not exists public.pengaduan (
  id                 uuid primary key default gen_random_uuid(),
  kode               text unique not null,
  jenis              text not null check (jenis in ('kekerasan','ukt','fasilitas','akademik','lainnya')),
  anonim             boolean not null default false,
  nama               text,
  nim                text,
  kontak             text,
  departemen         text,
  angkatan           text,
  judul              text,
  isi                text not null,
  detail             jsonb not null default '{}'::jsonb,   -- isian khusus per jenis
  link_bukti         text,
  status             text not null default 'diterima'
                     check (status in ('diterima','diproses','ditindaklanjuti','selesai','ditolak')),
  catatan_publik     text,   -- terlihat oleh pelapor saat cek status
  catatan_internal   text,   -- hanya admin
  user_id            uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.pengaduan enable row level security;
drop policy if exists "pengaduan admin baca" on public.pengaduan;
create policy "pengaduan admin baca" on public.pengaduan
  for select using (public.is_admin());
drop policy if exists "pengaduan admin ubah" on public.pengaduan;
create policy "pengaduan admin ubah" on public.pengaduan
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "pengaduan admin hapus" on public.pengaduan;
create policy "pengaduan admin hapus" on public.pengaduan
  for delete using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;
drop trigger if exists pengaduan_updated on public.pengaduan;
create trigger pengaduan_updated before update on public.pengaduan
  for each row execute function public.set_updated_at();
drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.kirim_pengaduan(p jsonb)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_kode   text;
  v_jenis  text := p->>'jenis';
  v_anonim boolean := coalesce((p->>'anonim')::boolean, false);
begin
  if v_jenis not in ('kekerasan','ukt','fasilitas','akademik','lainnya') then
    raise exception 'Jenis pengaduan tidak dikenal';
  end if;
  if coalesce(length(trim(p->>'isi')),0) < 20 then
    raise exception 'Uraian terlalu pendek (minimal 20 karakter)';
  end if;
  if v_jenis = 'ukt' and v_anonim then
    raise exception 'Permohonan UKT tidak bisa anonim';
  end if;

  loop
    v_kode := 'FC-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,8));
    exit when not exists (select 1 from public.pengaduan where kode = v_kode);
  end loop;

  insert into public.pengaduan
    (kode, jenis, anonim, nama, nim, kontak, departemen, angkatan, judul, isi, detail, link_bukti, user_id)
  values (
    v_kode, v_jenis, v_anonim,
    case when v_anonim then null else left(p->>'nama',120) end,
    case when v_anonim then null else left(p->>'nim',30) end,
    left(p->>'kontak',120),
    left(p->>'departemen',60),
    left(p->>'angkatan',10),
    left(p->>'judul',200),
    left(p->>'isi',8000),
    coalesce(p->'detail','{}'::jsonb),
    left(p->>'link_bukti',500),
    case when v_anonim then null else auth.uid() end
  );
  return v_kode;
end;
$$;

create or replace function public.cek_pengaduan(p_kode text)
returns table (kode text, jenis text, status text, catatan_publik text, created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select kode, jenis, status, catatan_publik, created_at, updated_at
  from public.pengaduan where kode = upper(trim(p_kode)) limit 1;
$$;

grant execute on function public.kirim_pengaduan(jsonb) to anon, authenticated;
grant execute on function public.cek_pengaduan(text)   to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. CARI TEMAN LOMBA — lowongan tim
-- ---------------------------------------------------------------------
create table if not exists public.tim (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  owner_nama       text,
  owner_departemen text,
  owner_angkatan   int,
  judul            text not null,
  nama_lomba       text not null,
  info_id          bigint references public.info(id) on delete set null,
  kategori         text,
  tingkat          text,
  deadline         date,
  butuh_departemen text[] not null default '{}',
  butuh_peran      text[] not null default '{}',
  slot             int not null default 1 check (slot between 1 and 10),
  deskripsi        text,
  status           text not null default 'buka' check (status in ('buka','tutup')),
  jumlah_pelamar   int not null default 0,
  jumlah_diterima  int not null default 0,
  created_at       timestamptz not null default now()
);

alter table public.tim enable row level security;
drop policy if exists "tim publik" on public.tim;
create policy "tim publik" on public.tim for select using (true);
drop policy if exists "tim buat" on public.tim;
create policy "tim buat" on public.tim
  for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "tim ubah pemilik" on public.tim;
create policy "tim ubah pemilik" on public.tim
  for update using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
drop policy if exists "tim hapus pemilik" on public.tim;
create policy "tim hapus pemilik" on public.tim
  for delete using (owner_id = auth.uid() or public.is_admin());

-- Nama pembuat diambil dari profil (tidak bisa dipalsukan dari browser).
-- Pembaruan dari trigger penghitung lamaran (kedalaman > 1) dibiarkan lewat.
create or replace function public.tim_isi_pemilik()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and pg_trigger_depth() > 1 then
    return new;  -- pembaruan dari trigger hitung: biarkan angka baru
  end if;
  select nama, departemen, angkatan into new.owner_nama, new.owner_departemen, new.owner_angkatan
  from public.profiles where id = new.owner_id;
  if tg_op = 'INSERT' then
    new.jumlah_pelamar := 0; new.jumlah_diterima := 0;
  else
    new.jumlah_pelamar := old.jumlah_pelamar; new.jumlah_diterima := old.jumlah_diterima;
    new.owner_id := old.owner_id;
  end if;
  return new;
end; $$;
drop trigger if exists tim_isi_pemilik on public.tim;
create trigger tim_isi_pemilik before insert or update on public.tim
  for each row execute function public.tim_isi_pemilik();

-- ---------------------------------------------------------------------
-- 6. CARI TEMAN LOMBA — lamaran (masuk ke pembuat lowongan)
-- ---------------------------------------------------------------------
create table if not exists public.lamaran (
  id              uuid primary key default gen_random_uuid(),
  tim_id          uuid not null references public.tim(id) on delete cascade,
  pelamar_id      uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nama            text,
  departemen      text,
  prodi           text,
  angkatan        int,
  whatsapp        text,
  peran           text,
  pesan           text,
  link_portofolio text,
  status          text not null default 'menunggu' check (status in ('menunggu','diterima','ditolak')),
  created_at      timestamptz not null default now(),
  unique (tim_id, pelamar_id)
);

alter table public.lamaran enable row level security;
drop policy if exists "lamaran baca" on public.lamaran;
create policy "lamaran baca" on public.lamaran for select using (
  pelamar_id = auth.uid()
  or exists (select 1 from public.tim t where t.id = tim_id and t.owner_id = auth.uid())
  or public.is_admin()
);
drop policy if exists "lamaran kirim" on public.lamaran;
create policy "lamaran kirim" on public.lamaran for insert to authenticated with check (
  pelamar_id = auth.uid()
  and status = 'menunggu'
  and exists (select 1 from public.tim t where t.id = tim_id and t.status = 'buka' and t.owner_id <> auth.uid())
);
drop policy if exists "lamaran putuskan" on public.lamaran;
create policy "lamaran putuskan" on public.lamaran for update using (
  exists (select 1 from public.tim t where t.id = tim_id and t.owner_id = auth.uid())
);
drop policy if exists "lamaran batal" on public.lamaran;
create policy "lamaran batal" on public.lamaran for delete using (pelamar_id = auth.uid() or public.is_admin());

-- Pemilik lowongan hanya boleh mengubah kolom status
revoke update on public.lamaran from authenticated, anon;
grant  update (status) on public.lamaran to authenticated;

-- Data pelamar diambil dari profil
create or replace function public.lamaran_isi_pelamar()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select nama, departemen, prodi, angkatan, whatsapp
    into new.nama, new.departemen, new.prodi, new.angkatan, new.whatsapp
  from public.profiles where id = new.pelamar_id;
  return new;
end; $$;
drop trigger if exists lamaran_isi_pelamar on public.lamaran;
create trigger lamaran_isi_pelamar before insert on public.lamaran
  for each row execute function public.lamaran_isi_pelamar();

-- Hitung jumlah pelamar & diterima di tabel tim
create or replace function public.lamaran_hitung()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tim uuid := coalesce(new.tim_id, old.tim_id);
begin
  update public.tim set
    jumlah_pelamar  = (select count(*) from public.lamaran where tim_id = v_tim),
    jumlah_diterima = (select count(*) from public.lamaran where tim_id = v_tim and status = 'diterima')
  where id = v_tim;
  return null;
end; $$;
drop trigger if exists lamaran_hitung on public.lamaran;
create trigger lamaran_hitung after insert or update or delete on public.lamaran
  for each row execute function public.lamaran_hitung();


-- ---------------------------------------------------------------------
-- 7b. PENGATURAN SITUS & MEDIA (diedit dari Panel Admin → Situs)
--     Satu baris berisi seluruh isi situs: warna, font, logo, profil
--     kabinet, pengurus, departemen, agenda, kontak, dll.
-- ---------------------------------------------------------------------
create table if not exists public.pengaturan (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.pengaturan enable row level security;
drop policy if exists "pengaturan publik" on public.pengaturan;
create policy "pengaturan publik" on public.pengaturan for select using (true);
drop policy if exists "pengaturan admin" on public.pengaturan;
create policy "pengaturan admin" on public.pengaturan
  for all using (public.is_admin()) with check (public.is_admin());

-- Penyimpanan foto & logo (bucket publik "media"; hanya admin yang boleh unggah)
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;
drop policy if exists "media publik baca" on storage.objects;
create policy "media publik baca" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin unggah" on storage.objects;
create policy "media admin unggah" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin ubah" on storage.objects;
create policy "media admin ubah" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin hapus" on storage.objects;
create policy "media admin hapus" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------
-- 7. (Opsional) Batasi pendaftaran hanya email kampus
--    Hapus tanda komentar di bawah jika ingin hanya @students.um.ac.id
--    dan @um.ac.id yang bisa mendaftar.
-- ---------------------------------------------------------------------
-- create or replace function public.cek_domain_email()
-- returns trigger language plpgsql security definer as $$
-- begin
--   if new.email !~* '@(students\.)?um\.ac\.id$' then
--     raise exception 'Gunakan email kampus UM';
--   end if;
--   return new;
-- end; $$;
-- drop trigger if exists cek_domain_email on auth.users;
-- create trigger cek_domain_email before insert on auth.users
--   for each row execute function public.cek_domain_email();

-- ---------------------------------------------------------------------
-- 8. MENJADIKAN SESEORANG ADMIN
--    Setelah orang tsb mendaftar di website, jalankan (ganti email):
-- insert into public.admins (user_id, peran)
--   select id, 'admin' from auth.users where email = 'email.pengurus@students.um.ac.id';
-- ---------------------------------------------------------------------
