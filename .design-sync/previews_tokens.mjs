// Export the theme token data used by the design previews as JSON on stdout.
//
// The values come from the same TypeScript modules the add-on ships, loaded
// directly by Node's built-in type stripping (Node >= 22.6). Two imports that
// only exist inside Volto (the registry and react-intl) are replaced by stubs
// through a resolve hook, because neither is read by the functions used here.
//
// Usage: node .design-sync/previews_tokens.mjs   (run from any directory)

import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HOOKS = `
export async function resolve(specifier, context, next) {
  if (specifier === '@plone/volto/registry') {
    return { url: 'data:text/javascript,export default { blocks: {} };', shortCircuit: true };
  }
  if (specifier === 'react-intl') {
    return { url: 'data:text/javascript,export function defineMessages(m) { return m; };', shortCircuit: true };
  }
  return next(specifier, context);
}
`;

register(`data:text/javascript,${encodeURIComponent(HOOKS)}`, import.meta.url);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'frontend/packages/volto-light-theme/src');

const blockThemes = await import(pathToFileURL(path.join(SRC, 'config/blockThemes.ts')).href);
const themeStyles = await import(pathToFileURL(path.join(SRC, 'helpers/themeStyles.ts')).href);
const blockWidth = await import(pathToFileURL(path.join(SRC, 'helpers/blockWidth.ts')).href);

const {
  BASE_COLOR_GROUP_IDS,
  CSS_PATTERN_PRESETS,
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
  createThemeDefinition,
} = blockThemes;
const { blockThemeCustomProperties, colorGroupCustomProperties } = themeStyles;
const { VALID_BLOCK_WIDTHS } = blockWidth;

// The `--theme-*` mapping a block theme carries (`createThemeDefinition`), for
// the two shipped themes, keyed by theme id.
const themeMappings = Object.fromEntries(
  Object.values(DEFAULT_BLOCK_THEMES).map((bt) => [
    bt.id,
    createThemeDefinition(bt.id, bt.name).style,
  ]),
);

// Each base colour group, as a ColorGroup record and as the custom properties
// `colorGroupCustomProperties` writes for it.
const colorGroupProps = Object.fromEntries(
  BASE_COLOR_GROUP_IDS.map((id) => [id, colorGroupCustomProperties(DEFAULT_COLOR_GROUPS[id])]),
);

// The two shipped block themes, as the `--block-theme-*` mapping they produce.
const blockThemeProps = Object.fromEntries(
  Object.values(DEFAULT_BLOCK_THEMES).map((bt) => [bt.id, blockThemeCustomProperties(bt)]),
);

// Every back/front pair of base colour groups, in the `custom-{back}-{front}`
// naming the block theme selector uses.
const customPairs = [];
for (const back of BASE_COLOR_GROUP_IDS) {
  for (const front of BASE_COLOR_GROUP_IDS) {
    const bt = {
      id: `custom-${back}-${front}`,
      name: `${back} / ${front}`,
      back_color_group: back,
      front_color_group: front,
    };
    customPairs.push({
      id: bt.id,
      back,
      front,
      properties: blockThemeCustomProperties(bt),
    });
  }
}

process.stdout.write(
  JSON.stringify(
    {
      baseColorGroupIds: BASE_COLOR_GROUP_IDS,
      colorGroups: DEFAULT_COLOR_GROUPS,
      blockThemes: DEFAULT_BLOCK_THEMES,
      colorGroupProps,
      blockThemeProps,
      customPairs,
      patternPresets: CSS_PATTERN_PRESETS,
      themeMappings,
      blockWidths: VALID_BLOCK_WIDTHS,
    },
    null,
    2,
  ),
);
