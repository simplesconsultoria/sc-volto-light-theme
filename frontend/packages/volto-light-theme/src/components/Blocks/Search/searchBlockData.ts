import config from '@plone/volto/registry';
import TopSideFacets from '@plone/volto/components/manage/Blocks/Search/layout/TopSideFacets';

/**
 * Search block variation to render. Defensive resolution prevents the SSR
 * "TypeError: cannot read properties of undefined (reading 'view')" when the
 * variation passed by `withBlockExtensions` has no `view`.
 */
export function resolveSearchVariation(variation: any, data: any) {
  if (variation?.view) return variation;
  const searchVariations =
    config.blocks?.blocksConfig?.search?.variations || [];
  return (
    searchVariations.find((v: any) => v.id === data?.variation) ||
    searchVariations.find((v: any) => v.id === 'facetsTopSide') ||
    searchVariations.find((v: any) => v.isDefault) ||
    searchVariations[0] || { id: 'facetsTopSide', view: TopSideFacets }
  );
}

/**
 * Card border custom properties (`--cardBorderWidth`, `--cardBorderColor`)
 * read from the block data or its styles, with the subset that is set.
 */
export function getCardBorder(data: any) {
  const cardBorderWidth =
    data?.['--cardBorderWidth'] || data?.styles?.['--cardBorderWidth'] || '';
  const cardBorderColor =
    data?.['--cardBorderColor'] || data?.styles?.['--cardBorderColor'] || '';
  const borderStyles: Record<string, string> = {
    ...(cardBorderWidth ? { '--cardBorderWidth': cardBorderWidth } : {}),
    ...(cardBorderColor ? { '--cardBorderColor': cardBorderColor } : {}),
  };
  return { cardBorderWidth, cardBorderColor, borderStyles };
}

type EnrichOptions = {
  data: any;
  listingBodyData: any;
  selectedView: string;
  blockWidth: string;
  theme: any;
  backColorGroup: any;
  frontColorGroup: any;
};

/**
 * Data handed to the listing body: the block data merged with the search
 * query defaults, the selected listing view, the resolved theme, block width
 * and card border, both at top level and in `styles`.
 */
export function buildEnrichedListingData({
  data,
  listingBodyData,
  selectedView,
  blockWidth,
  theme,
  backColorGroup,
  frontColorGroup,
}: EnrichOptions) {
  const { cardBorderWidth, cardBorderColor, borderStyles } =
    getCardBorder(data);
  return {
    ...data,
    ...listingBodyData,
    variation: selectedView,
    listingBodyTemplate: selectedView,
    theme: theme,
    backColorGroup: backColorGroup,
    frontColorGroup: frontColorGroup,
    blockWidth: blockWidth,
    styles: {
      ...data?.styles,
      ...listingBodyData?.styles,
      variation: selectedView,
      listingBodyTemplate: selectedView,
      theme: theme,
      backColorGroup: backColorGroup,
      frontColorGroup: frontColorGroup,
      'blockWidth:noprefix': blockWidth,
      ...borderStyles,
    },
    '--cardBorderWidth': cardBorderWidth,
    '--cardBorderColor': cardBorderColor,
  };
}

/** Pagination props for the listing body, from the search results. */
export function getListingPagination(props: any, data: any, searchData: any) {
  const totalPages =
    Math.ceil(props.totalItems / (data?.b_size || searchData?.b_size || 25)) ||
    1;
  const listingItems = props.items || [];
  return {
    totalPages,
    currentPage: props.currentPage || 1,
    onPaginationChange: props.onPaginationChange || (() => {}),
    listingItems,
    totalItems: props.totalItems || listingItems.length,
  };
}
