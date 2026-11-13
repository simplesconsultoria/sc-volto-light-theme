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
import {
  buildEnrichedListingData,
  getCardBorder,
  getListingPagination,
  resolveSearchVariation,
} from './searchBlockData';

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

  let variation: { id: string; [key: string]: any } | undefined = templateId
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

/**
 * Listing view selected in the search block; follows the block data while
 * editing.
 */
const useSelectedView = (data: any, mode: string) => {
  const dataListingBodyVariation = getListingBodyVariation(data).id;
  const [selectedView, setSelectedView] = React.useState(
    dataListingBodyVariation,
  );

  React.useEffect(() => {
    if (mode !== 'view') {
      setSelectedView(dataListingBodyVariation);
    }
  }, [dataListingBodyVariation, mode]);

  return [selectedView, setSelectedView] as const;
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

  const validVariation = resolveSearchVariation(variation, data);
  const Layout = validVariation?.view || TopSideFacets;

  const [selectedView, setSelectedView] = useSelectedView(data, mode);

  const root = useSelector((state: any) => state.breadcrumbs?.root);
  const listingBodyData = applyDefaults(searchData, root, data?.query?.query);

  const { variations } = config.blocks.blocksConfig.listing;
  const listingBodyVariation = variations.find(
    ({ id }: any) => id === selectedView,
  );

  // Block Width resolution
  const blockWidth = normalizeBlockWidth(data);

  // Theme resolution
  const {
    style: blockThemeStyle,
    className: blockThemeClass,
    backColorGroup,
    frontColorGroup,
    theme,
  } = resolveBlockTheme(data);

  const mergedStyle = {
    ...blockThemeStyle,
    ...getCardBorder(data).borderStyles,
    ...(props.style || {}),
  };

  const enrichedListingData = buildEnrichedListingData({
    data,
    listingBodyData,
    selectedView,
    blockWidth,
    theme,
    backColorGroup,
    frontColorGroup,
  });

  const {
    totalPages,
    currentPage,
    onPaginationChange,
    listingItems,
    totalItems,
  } = getListingPagination(props, data, searchData);
  const isEditMode = mode === 'edit';

  return (
    <div
      className={cx(
        'block search',
        selectedView,
        `has--block-width--${blockWidth}`,
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
        isEditMode={isEditMode}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      >
        <ListingBody
          id={id}
          data={enrichedListingData}
          items={listingItems}
          listingItems={listingItems}
          isEditMode={isEditMode}
          variation={listingBodyVariation}
          path={props.path}
          totalPages={totalPages}
          currentPage={currentPage}
          onPaginationChange={onPaginationChange}
          totalItems={totalItems}
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
