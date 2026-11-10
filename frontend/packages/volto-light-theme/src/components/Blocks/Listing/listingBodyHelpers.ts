import type React from 'react';

const EMPTY_ITEMS: any[] = [];

/**
 * Items to render: `listingItems` when it has entries, otherwise the `items`
 * prop (how some callers pass them), otherwise whatever `listingItems` was.
 */
export const resolveListingItems = (
  listingItems: any[] | undefined,
  items: any[] | undefined,
): any[] =>
  listingItems && listingItems.length > 0
    ? listingItems
    : items || listingItems || EMPTY_ITEMS;

/**
 * Template component for the listing. Blocks saved with a legacy `template`
 * and no `variation` use the template of the variation with that id;
 * otherwise the current variation's template, falling back to the default
 * variation's.
 */
export const resolveListingTemplate = (
  data: any,
  variation: any,
  variations: any[],
): React.ElementType | null => {
  if (data.template && !data.variation) {
    const legacyTemplateConfig = variations.find(
      (item: any) => item.id === data.template,
    );
    return legacyTemplateConfig?.template;
  }
  const defaultVariation = variations.filter(
    (item: any) => item.isDefault,
  )?.[0];
  return variation?.template ?? defaultVariation?.template ?? null;
};

/**
 * Card border custom properties set on the block (top level or under
 * `styles`), also mirrored onto the `--theme-border-*` properties.
 */
export const buildCardBorderStyle = (data: any): Record<string, any> => {
  const cardBorderWidth =
    data['--cardBorderWidth'] || data.styles?.['--cardBorderWidth'];
  const cardBorderColor =
    data['--cardBorderColor'] || data.styles?.['--cardBorderColor'];

  return {
    ...(cardBorderWidth
      ? {
          '--cardBorderWidth': cardBorderWidth,
          '--theme-border-width': cardBorderWidth,
        }
      : {}),
    ...(cardBorderColor
      ? {
          '--cardBorderColor': cardBorderColor,
          '--theme-border-color': cardBorderColor,
        }
      : {}),
  };
};

/** First and last result numbers shown in the "Result x-y of z" counter. */
export const getResultRange = (
  currentPage: number,
  batchSize: number,
  itemCount: number,
): { first: number; last: number } => ({
  first: (currentPage - 1) * batchSize + 1,
  last: (currentPage - 1) * batchSize + itemCount,
});
