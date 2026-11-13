/**
 * OVERRIDE grouping.ts
 * REASON: Group by the theme a block resolves to, not by its raw value:
 * read `styles.theme` and object-form themes as well as `block.theme`, and
 * resolve legacy names (`brand` -> `alternative`, `grey` -> its alias), so
 * blocks that look the same share one `blocks-group-wrapper` band.
 * Load-bearing: upstream `RenderBlocksV2` imports this module.
 * FILE: @kitconcept/volto-light-theme/src/helpers/grouping.ts
 * FILE VERSION: 8.1.4
 */
import type { BlocksData } from '@plone/types';
import { resolveThemeAlias } from '@simplesconsultoria/volto-light-theme/config/blockThemes';

/** The theme name a saved value stands for today. */
const canonicalTheme = (name: string): string => {
  const resolved = String(resolveThemeAlias(name));
  return resolved === 'brand' ? 'alternative' : resolved;
};

/**
 * Groups adjacent blocks by background theme/color.
 * Supports both `block.theme` and `block.styles.theme`.
 */
export function groupByBGColor(
  blocks: BlocksData['blocks'],
  blocks_layout: BlocksData['blocks_layout'],
) {
  const result: Array<Array<string>> = [];
  let currentArr: Array<string> = [];
  let currentBGColor: string;

  // Guard in case the block layout is empty or corrupted for some reason
  if (
    !blocks_layout?.items?.length ||
    !blocks ||
    Object.keys(blocks).length === 0
  ) {
    return [];
  }

  blocks_layout.items.forEach((blockId) => {
    const rawTheme =
      blocks[blockId]?.theme ??
      blocks[blockId]?.styles?.theme ??
      blocks[blockId]?.backgroundColor;
    const currentBlockColor = canonicalTheme(
      typeof rawTheme === 'object' && rawTheme !== null
        ? rawTheme.theme || 'default'
        : rawTheme || 'default',
    );

    if (currentBlockColor !== currentBGColor) {
      currentBGColor = currentBlockColor;
      // write it only if the array has some block inside
      if (currentArr.length > 0) {
        result.push(currentArr);
        currentArr = [];
      }
    }

    currentArr.push(blockId);
  });
  result.push(currentArr);
  return result;
}

export default groupByBGColor;
