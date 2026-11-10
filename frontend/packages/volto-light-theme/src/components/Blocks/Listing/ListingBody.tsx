import React, { useRef, useMemo } from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import type { IntlShape } from 'react-intl';
import cx from 'classnames';
import { Pagination, Dimmer, Loader } from 'semantic-ui-react';
import Slugger from 'github-slugger';
import { renderLinkElement } from '@plone/volto-slate/editor/render';
import config from '@plone/volto/registry';
import withQuerystringResults from '@plone/volto/components/manage/Blocks/Listing/withQuerystringResults';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import { resolveBlockTheme } from '../../../config/blockThemes';
import { normalizeBlockWidth } from '../../../helpers/blockWidth';
import {
  buildCardBorderStyle,
  getResultRange,
  resolveListingItems,
  resolveListingTemplate,
} from './listingBodyHelpers';

const EMPTY_DATA = {};

const messages = defineMessages({
  PaginationNavigationFor: {
    id: 'Pagination Navigation for {headline}',
    defaultMessage: 'Pagination Navigation for {headline}',
  },
  PaginationNavigation: {
    id: 'Pagination Navigation',
    defaultMessage: 'Pagination Navigation',
  },
});

export interface HeadlineProps {
  headlineTag?: string;
  id?: string;
  data?: any;
  listingItems?: any[];
  isEditMode?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const Headline: React.FC<HeadlineProps> = ({
  headlineTag = 'h2',
  id,
  data = {},
  listingItems,
  isEditMode,
  style,
  className,
}) => {
  let attr: any = { id };
  const slug = Slugger.slug(data.headline || '');
  attr.id = slug || id;
  const LinkedHeadline: any = useMemo(
    () => renderLinkElement(headlineTag),
    [headlineTag],
  );

  const buttonLink = data.headlineButtonLink?.[0]?.['@id'] || '';

  return (
    <div className={cx('listing-headline-wrapper', className)}>
      <LinkedHeadline
        mode={!isEditMode ? 'view' : undefined}
        attributes={attr}
        className={cx('headline block-title', {
          emptyListing: !(listingItems && listingItems.length > 0),
        })}
        style={style}
      >
        {data.headline}
      </LinkedHeadline>
      {data.headlineButtonText && (
        <ConditionalLink
          condition={!isEditMode && !!buttonLink}
          to={buttonLink}
          className="ui button primary listing-headline-button"
        >
          <div className="button-content">{data.headlineButtonText} →</div>
        </ConditionalLink>
      )}
    </div>
  );
};

export interface ListingBodyProps {
  data?: any;
  isEditMode?: boolean;
  listingItems?: any[];
  totalPages: number;
  onPaginationChange: (
    e: React.MouseEvent,
    data: { activePage: number | string | undefined },
  ) => void;
  variation?: any;
  currentPage: number;
  batch_size: number;
  prevBatch?: boolean;
  nextBatch?: boolean;
  isFolderContentsListing?: boolean;
  hasLoaded?: boolean;
  id?: string;
  total?: number;
  properties?: any;
  content?: any;
  intl: IntlShape;
}

type PaginationChangeHandler = ListingBodyProps['onPaginationChange'];

interface ListingPaginationProps {
  headline?: string;
  isEditMode?: boolean;
  listingRef: React.RefObject<HTMLDivElement>;
  onPaginationChange: PaginationChangeHandler;
  currentPage: number;
  totalPages: number;
  batch_size: number;
  itemCount: number;
  prevBatch?: boolean;
  nextBatch?: boolean;
  total?: number;
  properties?: any;
  intl: IntlShape;
}

const ListingPagination: React.FC<ListingPaginationProps> = ({
  headline,
  isEditMode,
  listingRef,
  onPaginationChange,
  currentPage,
  totalPages,
  batch_size,
  itemCount,
  prevBatch,
  nextBatch,
  total,
  properties,
  intl,
}) => {
  const onPageChange = (e: React.MouseEvent, data: any) => {
    if (!isEditMode && listingRef.current) {
      listingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    onPaginationChange(e as React.MouseEvent, data);
  };
  const { first, last } = getResultRange(currentPage, batch_size, itemCount);
  // Both paginations are navigation landmarks; each needs the same name.
  const paginationLabel = headline
    ? intl.formatMessage(messages.PaginationNavigationFor, { headline })
    : intl.formatMessage(messages.PaginationNavigation);

  return (
    <div className="pagination-wrapper">
      <Pagination
        aria-label={paginationLabel}
        className="desktop-pagination"
        activePage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        firstItem={null}
        lastItem={null}
        prevItem={{
          content: (
            <FormattedMessage
              id="Previous Page"
              defaultMessage="Previous Page"
            />
          ),
          icon: false,
          'aria-disabled': !prevBatch,
          className: !prevBatch ? 'disabled' : null,
        }}
        nextItem={{
          content: (
            <FormattedMessage id="Next Page" defaultMessage="Next Page" />
          ),
          icon: false,
          'aria-disabled': !nextBatch,
          className: !nextBatch ? 'disabled' : null,
        }}
      />
      <Pagination
        aria-label={paginationLabel}
        className="mobile-pagination"
        activePage={currentPage}
        totalPages={totalPages}
        boundaryRange={1}
        siblingRange={0}
        onPageChange={onPageChange}
        firstItem={null}
        lastItem={null}
        prevItem={undefined}
        nextItem={undefined}
      />
      <div className="total">
        <FormattedMessage id="Result" defaultMessage="Result" /> {first}-{last}{' '}
        <FormattedMessage id="of" defaultMessage="of" />{' '}
        {total || properties?.items_total}
      </div>
    </div>
  );
};

interface ListingEmptyStateProps {
  data: any;
  isEditMode?: boolean;
  isFolderContentsListing?: boolean;
  hasLoaded?: boolean;
  variation?: any;
  blockWidthClass: string;
  listingRef: React.RefObject<HTMLDivElement>;
}

/** Shown when there is nothing to list (or no template to list it with). */
const ListingEmptyState: React.FC<ListingEmptyStateProps> = ({
  data,
  isEditMode,
  isFolderContentsListing,
  hasLoaded,
  variation,
  blockWidthClass,
  listingRef,
}) => {
  const NoResults = variation?.noResultsComponent
    ? variation.noResultsComponent
    : config.blocks?.blocksConfig['listing']?.noResultsComponent;

  const status = (
    <>
      {hasLoaded && NoResults && (
        <NoResults isEditMode={isEditMode} {...data} />
      )}
      <Dimmer active={!hasLoaded} inverted>
        <Loader indeterminate size="small">
          <FormattedMessage id="loading" defaultMessage="Loading" />
        </Loader>
      </Dimmer>
    </>
  );

  if (!isEditMode) {
    return <div className={cx('emptyListing', blockWidthClass)}>{status}</div>;
  }

  return (
    <div className={cx('listing message', blockWidthClass)} ref={listingRef}>
      {isFolderContentsListing && (
        <FormattedMessage
          id="No items found in this container."
          defaultMessage="No items found in this container."
        />
      )}
      {status}
    </div>
  );
};

export const ListingBody: React.FC<ListingBodyProps> = (props) => {
  const {
    data = EMPTY_DATA,
    isEditMode,
    totalPages,
    variation,
    id,
    content,
  } = props;

  const listingItems = resolveListingItems(
    props.listingItems,
    (props as any).items,
  );
  const ListingBodyTemplate = resolveListingTemplate(
    data,
    variation,
    config.blocks?.blocksConfig['listing']?.variations || [],
  );

  const galleryRef = useRef<any>(null);
  const listingRef = useRef<HTMLDivElement>(null);

  const blockWidthClass = `has--block-width--${normalizeBlockWidth(data)}`;
  const { style: blockThemeStyle, className: blockThemeClass } =
    resolveBlockTheme(data);
  const mergedListingStyle = {
    ...blockThemeStyle,
    ...buildCardBorderStyle(data),
  };

  return (
    <div
      className={cx('listing-block-container', blockThemeClass)}
      style={mergedListingStyle}
    >
      {(data.headline || data.headlineButtonText) && (
        <Headline
          headlineTag={data.headlineTag || 'h2'}
          id={id}
          listingItems={listingItems}
          data={data}
          isEditMode={isEditMode}
        />
      )}
      <SlotRenderer name="aboveListingItems" content={content} data={data} />
      {listingItems?.length > 0 && ListingBodyTemplate ? (
        <div ref={listingRef} className="listing-body">
          <ListingBodyTemplate
            items={listingItems}
            isEditMode={isEditMode}
            ref={data.variation === 'imageGallery' ? galleryRef : undefined}
            {...data}
            {...variation}
          />
          {totalPages > 1 && (
            <ListingPagination
              headline={data.headline}
              isEditMode={isEditMode}
              listingRef={listingRef}
              onPaginationChange={props.onPaginationChange}
              currentPage={props.currentPage}
              totalPages={totalPages}
              batch_size={props.batch_size}
              itemCount={listingItems.length}
              prevBatch={props.prevBatch}
              nextBatch={props.nextBatch}
              total={props.total}
              properties={props.properties}
              intl={props.intl}
            />
          )}
        </div>
      ) : (
        <ListingEmptyState
          data={data}
          isEditMode={isEditMode}
          isFolderContentsListing={props.isFolderContentsListing}
          hasLoaded={props.hasLoaded}
          variation={variation}
          blockWidthClass={blockWidthClass}
          listingRef={listingRef}
        />
      )}
    </div>
  );
};

export default injectIntl(withQuerystringResults(ListingBody));
