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

echo "     -> Samir-Portfolio-print.pdf (original, print quality)"
cp "$TMP/og.pdf" Samir-Portfolio-print.pdf

echo "2/2  flattening each page to an image (fast version)…"
python3 - "$TMP/og.pdf" "Samir-Portfolio-fast.pdf" <<'PY'
import fitz, sys
src = fitz.open(sys.argv[1])
out = fitz.open()
for i in range(src.page_count):
    p = src[i]; r = p.rect
    pix = p.get_pixmap(dpi=110)
    jpg = pix.tobytes("jpeg", jpg_quality=80); pix = None
    op = out.new_page(width=r.width, height=r.height)
    op.insert_image(op.rect, stream=jpg)
out.save(sys.argv[2], garbage=4, deflate=True)
print("     wrote Samir-Portfolio-fast.pdf —", out.page_count, "pages")
PY
echo "Done. Review, then: git add -A && git commit && git push"
