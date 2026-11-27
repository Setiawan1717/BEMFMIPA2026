"""Buat (atau perbarui) folder halaman sub divisi dari tools/bso-template/.
Hasilnya <slug>/ di folder utama, jadi alamatnya  situs.vercel.app/<slug>

Jalankan dari folder utama situs:
    python tools/buat-bso.py              → semua sub divisi di assets/js/bso-config.js
    python tools/buat-bso.py gsc5         → satu sub divisi saja

index.html dan admin.html selalu ditulis ulang dari templat.
app.js (mekanisme khusus milik sub divisi) TIDAK pernah ditimpa bila sudah ada.

Menambah sub divisi baru:
    1. Tambahkan entrinya di assets/js/bso-config.js
    2. Tambahkan barisnya di supabase/bso.sql (bagian 1), jalankan ulang di Supabase
    3. python tools/buat-bso.py <slug>

Mengganti alamat (slug) sub divisi yang sudah ada: ganti slug di bso-config.js dan di
supabase/bso.sql, ganti nama foldernya, lalu jalankan skrip ini lagi.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "tools", "bso-template")
# Nama folder yang sudah dipakai situs utama, tidak boleh jadi slug sub divisi
DILARANG = {"assets", "supabase", "tools", "dist", "api", "admin", "index"}


def daftar_bso():
    src = open(os.path.join(ROOT, "assets", "js", "bso-config.js"), encoding="utf-8").read()
    # Ambil slug, nama, departemen dari setiap entri (tanpa perlu menjalankan JavaScript)
    pola = re.compile(r'slug:\s*"([^"]+)",\s*nama:\s*"([^"]+)",\s*departemen:\s*"([^"]+)"')
    return [{"slug": s, "nama": n, "departemen": d} for s, n, d in pola.findall(src)]


def versi():
    m = re.search(r'style\.css\?v=([\w.-]+)', open(os.path.join(ROOT, "index.html"), encoding="utf-8").read())
    return m.group(1) if m else "1"


def isi(teks, b, v):
    esc = lambda s: s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
    return (teks.replace("__SLUG_TABEL__", b["slug"].replace("-", "_"))
                .replace("__SLUG__", b["slug"]).replace("__NAMA__", esc(b["nama"]))
                .replace("__DEPARTEMEN__", esc(b["departemen"])).replace("__VERSI__", v))


def main():
    semua = daftar_bso()
    pilih = sys.argv[1:]
    if pilih:
        tidak_ada = [s for s in pilih if s not in {b["slug"] for b in semua}]
        if tidak_ada:
            sys.exit("Belum ada di assets/js/bso-config.js: " + ", ".join(tidak_ada))
        semua = [b for b in semua if b["slug"] in pilih]
    bentrok = [b["slug"] for b in semua if b["slug"] in DILARANG or b["slug"].startswith((".", "_"))]
    if bentrok:
        sys.exit("Slug ini bentrok dengan folder situs utama, ganti namanya: " + ", ".join(bentrok))
    v = versi()
    for b in semua:
        folder = os.path.join(ROOT, b["slug"])
        os.makedirs(folder, exist_ok=True)
        for nama in ("index.html", "admin.html", "app.js"):
            tujuan = os.path.join(folder, nama)
            if nama == "app.js" and os.path.exists(tujuan):
                continue
            teks = open(os.path.join(TPL, nama), encoding="utf-8").read()
            open(tujuan, "w", encoding="utf-8").write(isi(teks, b, v))
        print(b["slug"] + "/")


if __name__ == "__main__":
    main()
