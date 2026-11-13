/**
 * Helper for block width normalization and resolution (Block Width System).
 */

export const VALID_BLOCK_WIDTHS = [
  'narrow',
  'default',
  'layout',
  'full',
] as const;
export type BlockWidth = (typeof VALID_BLOCK_WIDTHS)[number];

export const WIDTH_RANK: Record<BlockWidth, number> = {
  narrow: 1,
  default: 2,
  layout: 3,
  full: 4,
};

export interface ResolveBlockWidthParams {
  block?: string;
  content?: any;
  data: any;
}

/**
 * Normalizes block width value from any supported format:
 * - direct string: 'narrow' | 'default' | 'layout' | 'full' | 'unset'
 * - CSS custom property string: 'var(--narrow-container-width)', etc.
 * - object with style key: { '--block-width': '...' } or { value: '...' }
 *
 * Always returns a valid string: 'narrow' | 'default' | 'layout' | 'full'.
 *
 * @param fallback width of a block with no width stored, or an unreadable
 *   one. Defaults to `default`; blocks that rendered at `layout` before the
 *   width system (Hero, Custom Grid) pass `layout` so existing content keeps
 *   its size.
 */
export function normalizeBlockWidth(
  data: any,
  fallback: BlockWidth = 'default',
): BlockWidth {
  if (!data) return fallback;

  let raw =
    data.styles?.['blockWidth:noprefix'] ??
    data['blockWidth:noprefix'] ??
    data.styles?.['block-width:noprefix'] ??
    data['block-width:noprefix'] ??
    data.styles?.['--block-width'] ??
    data['--block-width'] ??
    data.styles?.['block-width'] ??
    data['block-width'] ??
    data.styles?.blockWidth ??
    data.blockWidth ??
    data.styles?.width ??
    data.width;

  // Extract value if wrapped in an object (e.g. from ButtonsWidget or custom radio)
  while (typeof raw === 'object' && raw !== null) {
    if (raw.name && typeof raw.name === 'string') {
      raw = raw.name;
      break;
    }
    if (raw['--block-width'] && typeof raw['--block-width'] === 'string') {
      raw = raw['--block-width'];
      break;
    }
    if (raw.style && typeof raw.style === 'object') {
      raw = raw.style['--block-width'] || raw.style.value || raw.style;
      continue;
    }
    raw = raw.value || raw.id || raw.val || (Object.values(raw)[0] as any);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim().toLowerCase();
    if (
      trimmed === 'unset' ||
      trimmed.includes('full') ||
      trimmed.includes('100%')
    ) {
      return 'full';
    }
    if (trimmed.includes('narrow')) {
      return 'narrow';
    }
    if (trimmed.includes('layout') || trimmed.includes('wide')) {
      return 'layout';
    }
    if (trimmed.includes('default') || trimmed.includes('fit')) {
      return 'default';
    }
    if (VALID_BLOCK_WIDTHS.includes(trimmed as BlockWidth)) {
      return trimmed as BlockWidth;
    }
  }

  return fallback;
}

/**
 * Resolves the effective block width for a block.
 * If the block is a floated image (align left or right):
 * - The block width is derived from the adjacent element sharing the float.
 * - Prioritizes the first subsequent adjacent block in the same theme; otherwise checks previous block.
 */
export function resolveBlockWidthForBlock({
  block,
  content,
  data,
}: ResolveBlockWidthParams): BlockWidth {
  if (!data) return 'default';

  const blockType = data['@type'];
  const align =
    data.align || data.styles?.['align:noprefix'] || data.styles?.align;
  const isAlignedImage =
    (blockType === 'image' || blockType === 'mainImageBlock') &&
    (align === 'left' || align === 'right');

  // If not a floated image, use the block's own width
  if (!isAlignedImage) {
    return normalizeBlockWidth(data);
  }

  // Attempt to resolve width from adjacent blocks in the same layout
  const items = content?.blocks_layout?.items;
  if (!items || !block || !content?.blocks) {
    return normalizeBlockWidth(data);
  }

  const currentIndex = items.indexOf(block);
  if (currentIndex === -1) {
    return normalizeBlockWidth(data);
  }

  const rawTheme = data.theme || data.styles?.theme || 'default';
  const currentTheme =
    typeof rawTheme === 'object' && rawTheme !== null
      ? rawTheme.theme || 'default'
      : rawTheme;

  // 1. Inspect subsequent blocks in the same theme group (flowing next to the float)
  for (let i = currentIndex + 1; i < items.length; i++) {
    const siblingId = items[i];
    const siblingData = content.blocks[siblingId];
    if (!siblingData) continue;

    // If subsequent block has a different theme, it sits in an isolated container
    const rawSiblingTheme =
      siblingData.theme || siblingData.styles?.theme || 'default';
    const siblingTheme =
      typeof rawSiblingTheme === 'object' && rawSiblingTheme !== null
        ? rawSiblingTheme.theme || 'default'
        : rawSiblingTheme;

    if (siblingTheme !== currentTheme) {
      break;
    }

    const siblingType = siblingData['@type'];
    // Full-bleed or separator elements terminate float adjacency
    if (
      siblingType === 'separator' ||
      siblingType === 'heroBlock' ||
      siblingType === 'customGrid'
    ) {
      break;
    }

    const siblingAlign =
      siblingData.align || siblingData.styles?.['align:noprefix'];
    if (siblingAlign === 'left' || siblingAlign === 'right') {
      break;
    }

    // The sibling element immediately beside defines the width
    return normalizeBlockWidth(siblingData);
  }

  // 2. If no subsequent sibling in same theme, check previous block
  if (currentIndex > 0) {
    const prevId = items[currentIndex - 1];
    const prevData = content.blocks[prevId];
    if (prevData) {
      const rawPrevTheme =
        prevData.theme || prevData.styles?.theme || 'default';
      const prevTheme =
        typeof rawPrevTheme === 'object' && rawPrevTheme !== null
          ? rawPrevTheme.theme || 'default'
          : rawPrevTheme;

      if (prevTheme === currentTheme) {
        return normalizeBlockWidth(prevData);
      }
    }
  }

  // Fallback to configured width or 'default'
  return normalizeBlockWidth(data);
}
