import type { BlocksData } from '@plone/types';

/**
 * Agrupa blocos adjacentes por cor/tema de fundo.
 * Suporta tanto `block.theme` quanto `block.styles.theme`.
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
    const rawTheme = blocks[blockId]?.theme ?? blocks[blockId]?.styles?.theme;
    const currentBlockColor =
      typeof rawTheme === 'object' && rawTheme !== null
        ? rawTheme.theme || 'default'
        : rawTheme || 'default';

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
