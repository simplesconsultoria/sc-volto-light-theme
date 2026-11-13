#!/usr/bin/env bash
# Prepare all build artifacts required for Claude Design / Storybook export:
#   1. SVG -> JS icon twins in `.design-sync/.cache/`
#   2. Synthetic `node_modules` overlay in `.design-sync/nm-overlay/`
#   3. Standalone compiled stylesheet + fonts in `frontend/packages/volto-light-theme/dist/`
#   4. TypeScript declarations (`dist/src/storybook/dsEntry.d.ts`) + package root `index.d.ts`
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_DIR="$ROOT/frontend/packages/volto-light-theme"

echo "==> [1/4] Generating icon JS modules..."
python3 "$ROOT/.design-sync/build-icons.py"

echo "==> [2/4] Building nm-overlay..."
python3 "$ROOT/.design-sync/build-overlay.py"

echo "==> [3/4] Compiling standalone CSS and copying fonts..."
"$ROOT/.design-sync/build-css.sh"

echo "==> [4/4] Emitting TypeScript declarations..."
cd "$PKG_DIR"
rm -f "$PKG_DIR/index.d.ts"
# Clean previously emitted `.d.ts` files so `tsconfig.json`'s `**/*.ts` include glob
# never reads prior build outputs back as input files (error TS5055).
find "$PKG_DIR/dist" -type f -name '*.d.ts' -delete 2>/dev/null || true

# `tsc` exits non-zero because Volto webpack aliases (@plone/volto/*, addons)
# raise TS2307 under standalone tsc, while `--noEmit false` still emits `.d.ts`.
set +e
TSC_OUT=$("$PKG_DIR/node_modules/.bin/tsc" \
  --emitDeclarationOnly \
  --declaration \
  --noEmit false \
  --skipLibCheck \
  --outDir ./dist \
  -p "$PKG_DIR/tsconfig.json" 2>&1)
TSC_STATUS=$?
set -e

if [ ! -f "$PKG_DIR/dist/src/storybook/dsEntry.d.ts" ]; then
  echo "ERROR: dsEntry.d.ts was not emitted (tsc exit $TSC_STATUS):" >&2
  echo "$TSC_OUT" >&2
  exit 1
fi

printf "export * from './dist/src/storybook/dsEntry';\n" > "$PKG_DIR/index.d.ts"
DTS_COUNT=$(find "$PKG_DIR/dist" -name '*.d.ts' | wc -l | tr -d ' ')
echo "    Emitted $DTS_COUNT .d.ts files (tsc exit $TSC_STATUS; index.d.ts updated)"
echo "design-sync preparation complete."
