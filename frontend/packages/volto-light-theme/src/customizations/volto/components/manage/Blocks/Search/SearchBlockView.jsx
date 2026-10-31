import React from 'react';
import ListingBody from '@kitconcept/volto-light-theme/components/Blocks/Listing/ListingBody';
import { withBlockExtensions } from '@plone/volto/helpers/Extensions';
import config from '@plone/volto/registry';
import {
  withSearch,
  withQueryString,
} from '@plone/volto/components/manage/Blocks/Search/hocs';
import TopSideFacets from '@plone/volto/components/manage/Blocks/Search/layout/TopSideFacets';
import { useSelector } from 'react-redux';
import cx from 'classnames';

import { resolveBlockTheme } from '../../../../../../config/blockThemes';
import { normalizeBlockWidth } from '../../../../../../helpers/blockWidth';

const compose =
  (...funcs) =>
  (comp) =>
    funcs.reduceRight((wrapped, f) => f(wrapped), comp);

const isfunc = (obj) => typeof obj === 'function';

const _filtered = (obj) =>
  Object.assign(
    {},
    ...Object.keys(obj || {}).map((k) => {
      const reject = k !== 'properties' && !isfunc(obj[k]);
      return reject ? { [k]: obj[k] } : {};
    }),
  );

const blockPropsAreChanged = (prevProps, nextProps) => {
  const prev = _filtered(prevProps);
  const next = _filtered(nextProps);

  return JSON.stringify(prev) === JSON.stringify(next);
};

const getListingBodyVariation = (data) => {
  const variations = config.blocks?.blocksConfig?.listing?.variations || [];
  const templateId =
    data?.listingBodyTemplate ||
    (variations.some(({ id }) => id === data?.variation)
      ? data?.variation
      : undefined);

  let variation = templateId
    ? variations.find(({ id }) => id === templateId)
    : variations.find(({ isDefault }) => isDefault);

  if (!variation)
    variation = variations.find(({ isDefault }) => isDefault) ||
      variations[0] || { id: 'default' };

  return variation;
};

const applyDefaults = (data, root, blockQuery) => {
  const defaultQuery = [
    {
      i: 'path',
      o: 'plone.app.querystring.operation.string.absolutePath',
      v: root || '/',
    },
  ];

  const dataQuery = data?.query?.length ? data.query : [];
  const searchBySearchableText = dataQuery.filter(
    (item) => item['i'] === 'SearchableText',
  ).length;

  const sort_on = data?.sort_on
    ? { sort_on: data.sort_on }
    : searchBySearchableText === 0
      ? { sort_on: 'effective' }
      : {};
  const sort_order = data?.sort_order
    ? { sort_order: data.sort_order }
    : searchBySearchableText === 0
      ? { sort_order: 'descending' }
      : {};

  let query = blockQuery?.length ? blockQuery : [];
  if (!query.length) {
    query = dataQuery.length ? dataQuery : defaultQuery;
  } else if (dataQuery.length) {
    const filterKeys = new Set(dataQuery.map((obj) => obj.i));
    query = [
      ...dataQuery,
      ...blockQuery.filter((item) => !filterKeys.has(item.i)),
    ];
  }

  return {
    ...data,
    ...sort_on,
    ...sort_order,
    query,
  };
};

const SearchBlockView = (props) => {
  const {
    id,
    data = {},
    searchData,
    mode = 'view',
    variation,
    className,
  } = props;

  // Defensive variation resolution to prevent SSR "TypeError: cannot read properties of undefined (reading 'view')"
  const searchVariations =
    config.blocks?.blocksConfig?.search?.variations || [];
  const validVariation = variation?.view
    ? variation
    : searchVariations.find((v) => v.id === data?.variation) ||
      searchVariations.find((v) => v.id === 'facetsTopSide') ||
      searchVariations.find((v) => v.isDefault) ||
      searchVariations[0] || { id: 'facetsTopSide', view: TopSideFacets };

  const Layout = validVariation?.view || TopSideFacets;

  const dataListingBodyVariation = getListingBodyVariation(data).id;
  const [selectedView, setSelectedView] = React.useState(
    dataListingBodyVariation,
  );

  React.useEffect(() => {
    if (mode !== 'view') {
      setSelectedView(dataListingBodyVariation);
    }
  }, [dataListingBodyVariation, mode]);

  const root = useSelector((state) => state.breadcrumbs?.root);
  const listingBodyData = applyDefaults(searchData, root, data?.query?.query);

  const { variations } = config.blocks.blocksConfig.listing;
  const listingBodyVariation = variations.find(({ id }) => id === selectedView);

  // Block Width resolution
  const blockWidth = normalizeBlockWidth(data);
  const blockWidthClass = `has--block-width--${blockWidth}`;

  // Theme resolution
  const blockTheme = data?.theme || data?.styles?.theme || 'default';
  const theme =
    typeof blockTheme === 'object' && blockTheme !== null
      ? blockTheme.theme || 'default'
      : blockTheme || 'default';

  let customBack;
  let customFront;
  if (typeof theme === 'string' && theme.startsWith('custom-')) {
    const parts = theme.split('-');
    customBack = parts[1];
    customFront = parts[2];
  }

  const backColorGroup =
    customBack ||
    (typeof blockTheme === 'object' && blockTheme !== null
      ? blockTheme.backColorGroup
      : undefined) ||
    data?.backColorGroup ||
    data?.styles?.backColorGroup;

  const frontColorGroup =
    customFront ||
    (typeof blockTheme === 'object' && blockTheme !== null
      ? blockTheme.frontColorGroup
      : undefined) ||
    data?.frontColorGroup ||
    data?.styles?.frontColorGroup;

  const { style: blockThemeStyle, className: blockThemeClass } =
    resolveBlockTheme({
      theme,
      backColorGroup,
      frontColorGroup,
    });

  // Border system variables
  const cardBorderWidth =
    data?.['--cardBorderWidth'] || data?.styles?.['--cardBorderWidth'] || '';
  const cardBorderColor =
    data?.['--cardBorderColor'] || data?.styles?.['--cardBorderColor'] || '';

  const borderStyles = {
    ...(cardBorderWidth ? { '--cardBorderWidth': cardBorderWidth } : {}),
    ...(cardBorderColor ? { '--cardBorderColor': cardBorderColor } : {}),
  };

  const mergedStyle = {
    ...blockThemeStyle,
    ...borderStyles,
    ...(props.style || {}),
  };

  const enrichedListingData = {
    ...data,
    ...listingBodyData,
    variation: selectedView,
    listingBodyTemplate: selectedView,
    theme,
    backColorGroup,
    frontColorGroup,
    blockWidth,
    styles: {
      ...data?.styles,
      ...listingBodyData?.styles,
      variation: selectedView,
      listingBodyTemplate: selectedView,
      theme,
      backColorGroup,
      frontColorGroup,
      'blockWidth:noprefix': blockWidth,
      ...(cardBorderWidth ? { '--cardBorderWidth': cardBorderWidth } : {}),
      ...(cardBorderColor ? { '--cardBorderColor': cardBorderColor } : {}),
    },
    '--cardBorderWidth': cardBorderWidth,
    '--cardBorderColor': cardBorderColor,
  };

  const totalPages =
    Math.ceil(props.totalItems / (data?.b_size || searchData?.b_size || 25)) ||
    1;
  const currentPage = props.currentPage || 1;
  const onPaginationChange = props.onPaginationChange || (() => {});
  const listingItems = props.items || [];
  const total = props.totalItems || listingItems.length;

  return (
    <div
      className={cx(
        'block search',
        selectedView,
        blockWidthClass,
        blockThemeClass,
        { 'has-theme': !!data?.theme || !!data?.styles?.theme },
        className,
      )}
      style={mergedStyle}
    >
      <Layout
        {...props}
        querystring={{
          indexes: {},
          ...(props.querystring || {}),
        }}
        variation={validVariation}
        isEditMode={mode === 'edit'}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      >
        <ListingBody
          id={id}
          variation={{ ...data, ...listingBodyVariation }}
          data={enrichedListingData}
          items={listingItems}
          listingItems={listingItems}
          path={props.path}
          isEditMode={mode === 'edit'}
          totalPages={totalPages}
          currentPage={currentPage}
          onPaginationChange={onPaginationChange}
          totalItems={total}
        />
      </Layout>
    </div>
  );
};

export const SearchBlockViewComponent = compose(
  withBlockExtensions,
  (Component) => React.memo(Component, blockPropsAreChanged),
)(SearchBlockView);

export default withSearch()(withQueryString(SearchBlockViewComponent));
