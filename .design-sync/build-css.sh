#!/usr/bin/env bash
# Compile the standalone stylesheet for Claude Design (`dist/theme.css`).
#
# Combines three upstream layers in Volto's real cascade order:
#   1. Essential Semantic UI grid/table/accordion/form/menu rules + Volto Slate /
#      Accordion / Heading LESS rules (via Node `less` API resolving `~...` and
#      VLT's `theme.config`).
#   2. Base addon CSS imported from addon JS entry points (`@plone/components`,
#      button, separator, slider, event-calendar).
#   3. Addon SCSS + upstream `@kitconcept/volto-light-theme` + our theme (`src/theme`),
#      with real `addonsThemeCustomizationsVariables` and `addonsThemeCustomizationsMain`
#      imports matching Volto's build-time loaders.
set -euo pipefail

R="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_REAL="$R/frontend/packages/volto-light-theme"
OUT="$PKG_REAL/dist/theme.css"
SASS="$R/frontend/core/packages/volto/node_modules/.bin/sass"
VOLTO="$R/frontend/core/packages/volto"
SLATE="$R/frontend/core/packages/volto-slate"
STUBS="$R/.design-sync/.cache/scss-stubs"

resolve_pkg() {
  local name="$1"
  if [ -e "$PKG_REAL/node_modules/$name" ]; then
    node -p "require('fs').realpathSync('$PKG_REAL/node_modules/$name')"
  elif [ -e "$R/frontend/node_modules/$name" ]; then
    node -p "require('fs').realpathSync('$R/frontend/node_modules/$name')"
  elif [ -e "$VOLTO/node_modules/$name" ]; then
    node -p "require('fs').realpathSync('$VOLTO/node_modules/$name')"
  else
    echo ""
  fi
}

VLT="$(resolve_pkg '@kitconcept/volto-light-theme')"
SEMANTIC="$(resolve_pkg 'semantic-ui-less')"
ACCORDION="$(resolve_pkg '@eeacms/volto-accordion-block')"
BANNER="$(resolve_pkg '@kitconcept/volto-banner-block')"
BUTTON="$(resolve_pkg '@kitconcept/volto-button-block')"
CALENDAR="$(resolve_pkg '@kitconcept/volto-calendar-block')"
CAROUSEL="$(resolve_pkg '@kitconcept/volto-carousel-block')"
HEADING="$(resolve_pkg '@kitconcept/volto-heading-block')"
HIGHLIGHT="$(resolve_pkg '@kitconcept/volto-highlight-block')"
LOGOS="$(resolve_pkg '@kitconcept/volto-logos-block')"
SEPARATOR="$(resolve_pkg '@kitconcept/volto-separator-block')"
SLIDER="$(resolve_pkg '@kitconcept/volto-slider-block')"
SOCIAL_MEDIA="$(resolve_pkg '@plonegovbr/volto-social-media')"
PLONE_COMPONENTS="$(resolve_pkg '@plone/components')"
LESS_MOD="$(node -e "console.log(require.resolve('less', {paths: ['$VOLTO/node_modules', '$R/frontend/node_modules']}))")"

[ -d "$VLT" ] || { echo "upstream VLT not found in node_modules" >&2; exit 1; }
[ -d "$SEMANTIC" ] || { echo "semantic-ui-less not found in node_modules" >&2; exit 1; }

mkdir -p "$STUBS" "$(dirname "$OUT")"

# Step 1: Compile essential Semantic UI + Volto LESS (grid, table, menu, accordion, slate, heading).
LESS_OUT="$STUBS/ds-less.css"
node - <<JS
const fs = require('fs');
const path = require('path');
const less = require('$LESS_MOD');

const volto = '$VOLTO';
const sem = '$SEMANTIC';
const vlt = '$VLT';
const slate = '$SLATE';
const acc = '$ACCORDION';
const heading = '$HEADING';
const tcfg = path.join(vlt, 'src/theme/theme.config');

const resolverPlugin = {
  install(_less, pluginManager) {
    const fm = new less.FileManager();
    fm.supports = (filename) =>
      filename.startsWith('~') ||
      filename.endsWith('theme.config') ||
      filename.startsWith('@kitconcept/volto-light-theme/');
    fm.loadFile = function (filename, currentDirectory, options, environment, callback) {
      let resolved = filename;
      if (resolved.endsWith('theme.config')) {
        resolved = tcfg;
      } else if (resolved.startsWith('~volto-themes/')) {
        resolved = path.join(volto, 'theme/themes', resolved.slice('~volto-themes/'.length));
      } else if (resolved.startsWith('~@root/')) {
        resolved = path.join(volto, 'src', resolved.slice('~@root/'.length));
      } else if (resolved.startsWith('~@plone/volto/')) {
        resolved = path.join(volto, 'src', resolved.slice('~@plone/volto/'.length));
      } else if (resolved.startsWith('~semantic-ui-less/')) {
        resolved = path.join(sem, resolved.slice('~semantic-ui-less/'.length));
      } else if (resolved.startsWith('@kitconcept/volto-light-theme/')) {
        resolved = path.join(vlt, 'src', resolved.slice('@kitconcept/volto-light-theme/'.length));
      }
      return less.FileManager.prototype.loadFile.call(
        this,
        resolved,
        currentDirectory,
        options,
        environment,
        callback,
      );
    };
    pluginManager.addFileManager(fm);
  },
};

const src = [
  '@import "~semantic-ui-less/definitions/collections/grid.less";',
  '@import "~semantic-ui-less/definitions/collections/table.less";',
  '@import "~semantic-ui-less/definitions/collections/menu.less";',
  '@import "~semantic-ui-less/definitions/collections/form.less";',
  '@import "~semantic-ui-less/definitions/modules/accordion.less";',
  '@import "~semantic-ui-less/definitions/modules/checkbox.less";',
  '@import "~semantic-ui-less/definitions/modules/dropdown.less";',
  '@import "~semantic-ui-less/definitions/elements/button.less";',
  '@import "~semantic-ui-less/definitions/elements/container.less";',
  '@import "~semantic-ui-less/definitions/elements/divider.less";',
  '@import "~semantic-ui-less/definitions/elements/input.less";',
  '@import "~semantic-ui-less/definitions/elements/segment.less";',
  \`@import "\${path.join(slate, 'src/editor/less/slate.less')}";\`,
  \`@import "\${path.join(slate, 'src/editor/plugins/Table/less/public.less')}";\`,
  acc ? \`@import "\${path.join(acc, 'src/components/manage/Blocks/Accordion/editor.less')}";\` : '',
  heading ? \`@import "\${path.join(heading, 'src/theme/main.less')}";\` : '',
].filter(Boolean).join('\n');

less.render(src, {
  filename: path.join(sem, 'semantic.less'),
  plugins: [resolverPlugin],
}).then((out) => {
  fs.writeFileSync('$LESS_OUT', out.css, 'utf8');
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
JS

# Step 2: Populate virtual addon theme entry points in real load order.
cat > "$STUBS/_addonsThemeCustomizationsVariables.scss" <<EOF
@import '$SLIDER/src/theme/variables';
@import '$SOCIAL_MEDIA/src/theme/variables';
@import '$PKG_REAL/src/theme/variables';
EOF

cat > "$STUBS/_addonsThemeCustomizationsMain.scss" <<EOF
@import '$CALENDAR/src/theme/main';
@import '$CAROUSEL/src/theme/main';
@import '$LOGOS/src/theme/main';
@import '$SLIDER/src/theme/main';
@import '$SOCIAL_MEDIA/src/theme/main';
@import '$PKG_REAL/src/theme/main';
EOF

# Step 3: Compile JS-imported addon SCSS + VLT + SC-VLT SCSS.
ENTRY="$STUBS/ds-theme.scss"
cat > "$ENTRY" <<EOF
@import '$BANNER/src/theme/main';
@import '$HIGHLIGHT/src/theme/highlight';
@import '$VLT/src/theme/main';
EOF

SASS_OUT="$STUBS/ds-sass.css"
"$SASS" --no-source-map --quiet \
  --load-path="$STUBS" \
  --load-path="$VLT/src/theme" \
  --load-path="$PKG_REAL/src/theme" \
  --load-path="$R/frontend/node_modules" \
  "$ENTRY" "$SASS_OUT"

# Step 4: Concatenate base CSS (LESS -> addon plain CSS -> compiled SCSS) in cascade order.
{
  cat "$LESS_OUT"
  for css_file in \
    "$PLONE_COMPONENTS/dist/basic.css" \
    "$BUTTON/src/theme/button-base.css" \
    "$SEPARATOR/src/theme/separator-base.css" \
    "$SLIDER/src/theme/slider-base.css" \
    "$CALENDAR/src/theme/event-calendar-base.css"
  do
    if [ -f "$css_file" ]; then
      printf '\n/* %s */\n' "${css_file#$R/}"
      cat "$css_file"
    fi
  done
  printf '\n/* Compiled SCSS bundle */\n'
  cat "$SASS_OUT"
} > "$OUT"

if [ -d "$VLT/src/theme/fonts" ]; then
  rm -rf "$PKG_REAL/dist/fonts"
  cp -R "$VLT/src/theme/fonts" "$PKG_REAL/dist/fonts"
fi

printf 'wrote %s (%s bytes)\n' "$OUT" "$(wc -c < "$OUT" | tr -d ' ')"
