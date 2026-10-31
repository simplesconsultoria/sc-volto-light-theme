import React from 'react';
import { useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import cx from 'classnames';
import config from '@plone/volto/registry';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import {
  withSearch,
  withQueryString,
} from '@plone/volto/components/manage/Blocks/Search/hocs';
import TopSideFacets from '@plone/volto/components/manage/Blocks/Search/layout/TopSideFacets';
import ListingBody from '@kitconcept/volto-light-theme/components/Blocks/Listing/ListingBody';
import { resolveBlockTheme } from '../../../config/blockThemes';
import { normalizeBlockWidth } from '../../../helpers/blockWidth';

const compose =
  (...funcs: any[]) =>
  (x: any) =>
    funcs.reduceRight((composed, f) => f(composed), x);

const getListingBodyVariation = (data: any) => {
  const variations = config.blocks?.blocksConfig?.listing?.variations || [];
  const templateId =
    data?.listingBodyTemplate ||
    (variations.some(({ id }: any) => id === data?.variation)
      ? data?.variation
      : undefined);

  let variation = templateId
    ? variations.find(({ id }: any) => id === templateId)
    : variations.find(({ isDefault }: any) => isDefault);

  if (!variation)
    variation = variations.find(({ isDefault }: any) => isDefault) ||
      variations[0] || { id: 'default' };

  return variation;
};

const _filtered = (obj: any) =>
  Object.assign(
    {},
    ...Object.keys(obj).map((k) =>
      obj[k] !== undefined ? { [k]: obj[k] } : {},
    ),
  );

const applyDefaults = (data: any = {}, root = '', blockQuery: any = []) => {
  const sort_on = _filtered({
    sort_on: data?.query?.sort_on || data?.sort_on,
  });
  const sort_order = _filtered({
    sort_order: data?.query?.sort_order || data?.sort_order,
  });

  const filterKeys = new Set(
    (data?.query?.query || []).map((item: any) => item.i),
  );

  let query = data?.query?.query || [];
  if (root) {
    const hasPathFilter = query.some((item: any) => item.i === 'path');
    if (!hasPathFilter) {
      query = [
        ...query,
        {
          i: 'path',
          o: 'plone.app.querystring.operation.string.relativePath',
          v: '',
        },
      ];
    }
  }

  if (blockQuery.length > 0) {
    query = [
      ...query,
      ...blockQuery.filter((item: any) => !filterKeys.has(item.i)),
    ];
  }

  return {
    ...data,
    ...sort_on,
    ...sort_order,
    query,
  };
};

export const SearchBlockViewComponent: React.FC<any> = (props: any) => {
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
    : searchVariations.find((v: any) => v.id === data?.variation) ||
      searchVariations.find((v: any) => v.id === 'facetsTopSide') ||
      searchVariations.find((v: any) => v.isDefault) ||
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

  const root = useSelector((state: any) => state.breadcrumbs?.root);
  const listingBodyData = applyDefaults(searchData, root, data?.query?.query);

  const { variations } = config.blocks.blocksConfig.listing;
  const listingBodyVariation = variations.find(
    ({ id }: any) => id === selectedView,
  );

  // Block Width resolution
  const blockWidth = normalizeBlockWidth(data);
  const blockWidthClass = `has--block-width--${blockWidth}`;

  // Theme resolution
  const blockTheme = data?.theme || data?.styles?.theme || 'default';
  const theme =
    typeof blockTheme === 'object' && blockTheme !== null
      ? blockTheme.theme || 'default'
      : blockTheme || 'default';

  let customBack: string | undefined;
  let customFront: string | undefined;
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

  const borderStyles: Record<string, string> = {
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
          data={enrichedListingData}
          items={listingItems}
          listingItems={listingItems}
          isEditMode={mode === 'edit'}
          variation={listingBodyVariation}
          path={props.path}
          totalPages={totalPages}
          currentPage={currentPage}
          onPaginationChange={onPaginationChange}
          totalItems={total}
        />
      </Layout>
    </div>
  );
};

export const SearchBlockView = SearchBlockViewComponent;
export default compose(
  withSearch(),
  withQueryString,
  withBlockExtensions,
  injectIntl,
)(SearchBlockViewComponent);
