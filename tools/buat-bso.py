"""Buat (atau perbarui) folder halaman BSO dari bso/_template/.

Jalankan dari folder utama situs:
    python tools/buat-bso.py              → semua BSO di assets/js/bso-config.js
    python tools/buat-bso.py gsc5         → satu BSO saja

index.html dan admin.html selalu ditulis ulang dari templat.
app.js (mekanisme khusus milik BSO) TIDAK pernah ditimpa bila sudah ada.

Menambah BSO baru:
    1. Tambahkan entrinya di assets/js/bso-config.js
    2. Tambahkan barisnya di supabase/bso.sql (bagian 1), jalankan ulang di Supabase
    3. python tools/buat-bso.py <slug>
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "bso", "_template")


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
    v = versi()
    for b in semua:
        folder = os.path.join(ROOT, "bso", b["slug"])
        os.makedirs(folder, exist_ok=True)
        for nama in ("index.html", "admin.html", "app.js"):
            tujuan = os.path.join(folder, nama)
            if nama == "app.js" and os.path.exists(tujuan):
                continue
            teks = open(os.path.join(TPL, nama), encoding="utf-8").read()
            open(tujuan, "w", encoding="utf-8").write(isi(teks, b, v))
        print("bso/" + b["slug"] + "/")


if __name__ == "__main__":
    main()
