-- =====================================================================
-- TEMPLAT tabel khusus satu BSO
-- Salin file ini menjadi supabase/bso/<slug>.sql (misalnya gsc5.sql),
-- ganti setiap  NAMA_SLUG  dengan slug BSO-nya, lalu jalankan di SQL Editor.
--
-- Aturan supaya data antar-BSO tidak bocor:
--   1. Nama tabel diawali slug BSO:  public.gsc5_peserta, public.fs2t_karya, ...
--      (pakai garis bawah, misalnya science_entrepreneur_tenant)
--   2. SELALU aktifkan RLS, dan tulis is_admin_bso('NAMA_SLUG') di setiap kebijakan.
--   3. Jangan pernah memakai public.is_admin() saja: itu hanya admin pusat.
-- =====================================================================

-- Contoh: daftar kegiatan yang bisa diikuti mahasiswa
create table if not exists public.NAMA_SLUG_kegiatan (
  id          bigint generated always as identity primary key,
  judul       text not null,
  tanggal     date,
  tempat      text,
  deskripsi   text,
  terbit      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.NAMA_SLUG_kegiatan enable row level security;

drop policy if exists "baca" on public.NAMA_SLUG_kegiatan;
create policy "baca" on public.NAMA_SLUG_kegiatan
  for select using (terbit or public.is_admin_bso('NAMA_SLUG'));

drop policy if exists "admin" on public.NAMA_SLUG_kegiatan;
create policy "admin" on public.NAMA_SLUG_kegiatan
  for all using (public.is_admin_bso('NAMA_SLUG')) with check (public.is_admin_bso('NAMA_SLUG'));

-- Kalau mahasiswa juga mengisi data (misalnya mendaftar kegiatan), batasi ke miliknya sendiri:
--   for insert to authenticated with check (user_id = auth.uid())
--   for select using (user_id = auth.uid() or public.is_admin_bso('NAMA_SLUG'))
