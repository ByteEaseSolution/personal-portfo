#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# make-pdf.sh
# Build the fast, flat "Samir-Portfolio.pdf" that the website's Download button
# serves. It renders the site to a vector PDF (headless Chromium), then
# flattens every page to a single image (small file, fast to open).
# Run it after updating content (localize-photos.sh), then commit + push.
#   usage:  bash make-pdf.sh
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")"
PORT=8799
TMP="$(mktemp -d)"
trap 'kill "$SRV" 2>/dev/null || true; rm -rf "$TMP"' EXIT

python3 -m http.server "$PORT" >/dev/null 2>&1 &
SRV=$!
sleep 1

echo "1/2  rendering the site to a vector PDF…"
brave-browser --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --virtual-time-budget=12000 --run-all-compositor-stages-before-draw \
  --no-pdf-header-footer --print-to-pdf="$TMP/og.pdf" \
  "http://localhost:$PORT/index.html" >/dev/null 2>&1

echo "2/2  flattening each page to images (both open fast)…"
python3 - "$TMP/og.pdf" <<'PY'
import fitz, sys
src = fitz.open(sys.argv[1])
def flatten(dpi, q, path):
    out = fitz.open()
    for i in range(src.page_count):
        p = src[i]; r = p.rect
        pix = p.get_pixmap(dpi=dpi)
        jpg = pix.tobytes("jpeg", jpg_quality=q); pix = None
        op = out.new_page(width=r.width, height=r.height)
        op.insert_image(op.rect, stream=jpg)
    out.save(path, garbage=4, deflate=True); out.close()
    print("     wrote", path)
flatten(170, 85, "Samir-Portfolio-print.pdf")   # crisp, for printing
flatten(110, 80, "Samir-Portfolio-fast.pdf")    # small, for quick viewing
print("     pages:", src.page_count)
PY
echo "Done. Review, then: git add -A && git commit && git push"
