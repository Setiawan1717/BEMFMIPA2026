"""Gabungkan situs menjadi file HTML mandiri (CSS, JS, dan logo ikut di dalam file).
Jalankan dari folder fmipa-connect:  python tools/build-satu-file.py
Hasil: folder dist/ berisi index.html dan admin.html yang bisa dibuka langsung."""
import base64, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "dist")
os.makedirs(OUT, exist_ok=True)
MIME = {".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}

def read(p): return open(os.path.join(ROOT, p), encoding="utf-8").read()
def data_uri(p):
    ext = os.path.splitext(p)[1].lower()
    return f"data:{MIME[ext]};base64," + base64.b64encode(open(os.path.join(ROOT, p), "rb").read()).decode()

imgs = {f"assets/img/{f}": data_uri(f"assets/img/{f}") for f in os.listdir(os.path.join(ROOT, "assets/img")) if os.path.splitext(f)[1].lower() in MIME}
def swap_imgs(t):
    for k, v in imgs.items(): t = t.replace(k, v)
    return t

for page in ("index.html", "admin.html"):
    html = read(page)
    html = re.sub(r'<link rel="stylesheet" href="(assets/css/[^"?]+)(?:\?[^"]*)?">', lambda m: "<style>\n" + read(m.group(1)) + "\n</style>", html)
    def js(m):
        code = read(m.group(1))
        if "</script" in code.lower(): sys.exit("Ada </script di " + m.group(1))
        return "<script>\n" + code + "\n</script>"
    html = re.sub(r'<script src="(assets/js/[^"?]+)(?:\?[^"]*)?"></script>', js, html)
    html = swap_imgs(html)
    open(os.path.join(OUT, page), "w", encoding="utf-8").write(html)
    print(page, round(len(html) / 1024), "KB")
