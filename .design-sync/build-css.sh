#!/usr/bin/env bash
# Compile a standalone stylesheet for the Claude Design export.
#
# The add-on ships SCSS, not CSS: Volto's webpack compiles it and style-loader
# injects it at runtime, so the storybook build contains no .css file for the
# converter to scrape ([CSS_RUNTIME]). This produces one, from upstream VLT's
# theme plus ours, in the same order the app applies them.
#
# `addonsThemeCustomizationsVariables` is a virtual module Volto's build
# generates per project; sass cannot resolve it, so a stub satisfies the import.
set -euo pipefail

R="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$R/frontend/packages/volto-light-theme/dist/theme.css"
SASS="$R/frontend/core/packages/volto/node_modules/.bin/sass"
# Pin to the version the add-on declares — the pnpm store holds several, and a
# bare glob picks whichever sorts first (alpha.22 before alpha.31).
VLT_VERSION="$(node -p "require('$R/frontend/packages/volto-light-theme/package.json').dependencies['@kitconcept/volto-light-theme'].replace(/^[^0-9]*/,'')")"
UPSTREAM="$(ls -d "$R"/frontend/node_modules/.pnpm/@kitconcept+volto-light-theme@"$VLT_VERSION"_*/node_modules/@kitconcept/volto-light-theme | head -1)"
[ -d "$UPSTREAM" ] || { echo "upstream VLT $VLT_VERSION not found in the pnpm store" >&2; exit 1; }
OURS="$R/frontend/packages/volto-light-theme/src/theme"
STUBS="$R/.design-sync/.cache/scss-stubs"

mkdir -p "$STUBS" "$(dirname "$OUT")"
: > "$STUBS/_addonsThemeCustomizationsVariables.scss"
: > "$STUBS/_addonsThemeCustomizationsMain.scss"

ENTRY="$STUBS/ds-theme.scss"
cat > "$ENTRY" <<EOF
@import '$UPSTREAM/src/theme/main';
@import '$OURS/main';
EOF

"$SASS" --no-source-map --quiet \
  --load-path="$STUBS" \
  --load-path="$UPSTREAM/src/theme" \
  --load-path="$OURS" \
  --load-path="$R/frontend/node_modules" \
  "$ENTRY" "$OUT"

printf 'wrote %s (%s bytes)\n' "$OUT" "$(wc -c < "$OUT" | tr -d ' ')"
