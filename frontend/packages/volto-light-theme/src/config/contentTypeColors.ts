/**
 * Content-type → color mapping.
 *
 * Components (listing cards, hero blocks, etc.) can use this to tint borders
 * or accents based on the Plone `portal_type` / `@type` of an item.
 *
 * Projects override this via `config.settings.contentTypeColors`.
 */

export const defaultContentTypeColors: Record<string, string> = {
  'News Item': 'var(--news-item-color)',
  Document: 'var(--document-color)',
  Event: 'var(--event-color)',
  File: 'var(--file-color)',
  Image: 'var(--image-color)',
  // Fallback for unknown types
  default: 'var(--theme-border-color, currentColor)',
};

/**
 * Resolve the border / accent color for a given `portal_type`.
 *
 * @param type - The `@type` or `portal_type` value from the Plone item.
 * @param colorMap - Optional custom map; falls back to `defaultContentTypeColors`.
 */
export function getContentTypeColor(
  type: string | undefined,
  colorMap?: Record<string, string>,
): string {
  if (!type)
    return (colorMap ?? defaultContentTypeColors).default ?? 'currentColor';
  const map = colorMap ?? defaultContentTypeColors;
  return map[type] ?? map.default ?? 'currentColor';
}
