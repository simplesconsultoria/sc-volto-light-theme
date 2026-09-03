#!/usr/bin/env bash
# Bring the story photographs under the weight budget, in place.
#
# These images are inlined as base64 data URIs into the Claude Design preview
# bundles, so a megabyte here is roughly 1.4 MB there — per component that shows
# a photo. 150 KB at 1200x675 is comfortably transparent for the sizes anything
# actually renders at (listing cards are 400-800px wide).
#
# jpegoptim rather than `sips`, which re-encodes without optimising and barely
# moves the file, and rather than Pillow, which would need the ICC profile
# copied across by hand. Only EXIF/IPTC/comments are stripped; the sRGB profile
# is preserved.
#
# Idempotent: a file already under budget is left untouched, so re-running never
# re-encodes (and never compounds generation loss).
set -euo pipefail

BUDGET_KB=150
QUALITIES=(80 76 72 68 64 60)

cd "$(dirname "${BASH_SOURCE[0]}")"
command -v jpegoptim >/dev/null || {
  echo "jpegoptim not found — brew install jpegoptim" >&2
  exit 1
}

total_before=0
total_after=0
for f in *.jpg; do
  before=$(stat -f%z "$f")
  total_before=$((total_before + before))

  if [ $((before / 1024)) -le "$BUDGET_KB" ]; then
    printf '%-16s %4s KB  (already under budget)\n' "$f" "$((before / 1024))"
    total_after=$((total_after + before))
    continue
  fi

  for q in "${QUALITIES[@]}"; do
    cp "$f" ".$f.tmp"
    jpegoptim --max="$q" --strip-exif --strip-iptc --strip-com --quiet ".$f.tmp"
    size=$(stat -f%z ".$f.tmp")
    if [ $((size / 1024)) -le "$BUDGET_KB" ] || [ "$q" = "${QUALITIES[-1]}" ]; then
      mv ".$f.tmp" "$f"
      printf '%-16s %4s KB -> %4s KB  (q=%s)\n' "$f" "$((before / 1024))" "$((size / 1024))" "$q"
      total_after=$((total_after + size))
      break
    fi
    rm -f ".$f.tmp"
  done
done

printf '\ntotal: %s KB -> %s KB\n' "$((total_before / 1024))" "$((total_after / 1024))"
