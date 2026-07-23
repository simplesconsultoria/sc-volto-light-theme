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

const EMPTY_DATA = {};
const EMPTY_ITEMS: any[] = [];

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
}

const Headline: React.FC<HeadlineProps> = ({
  headlineTag = 'h2',
  id,
  data = {},
  listingItems,
  isEditMode,
  style,
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
    <div className="listing-headline-wrapper">
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

export const ListingBody: React.FC<ListingBodyProps> = (props) => {
  const {
    data = EMPTY_DATA,
    isEditMode,
    listingItems = EMPTY_ITEMS,
    totalPages,
    onPaginationChange,
    variation,
    currentPage,
    batch_size,
    prevBatch,
    nextBatch,
    isFolderContentsListing,
    hasLoaded,
    id,
    total,
    properties,
    content,
    intl,
  } = props;

  let ListingBodyTemplate: React.ElementType | null = null;
  // Legacy support if template is present
  const variations = config.blocks?.blocksConfig['listing']?.variations || [];
  const defaultVariation = variations.filter(
    (item: any) => item.isDefault,
  )?.[0];

  if (data.template && !data.variation) {
    const legacyTemplateConfig = variations.find(
      (item: any) => item.id === data.template,
    );
    ListingBodyTemplate = legacyTemplateConfig?.template;
  } else {
    ListingBodyTemplate =
      variation?.template ?? defaultVariation?.template ?? null;
  }

  const galleryRef = useRef<any>(null);
  const listingRef = useRef<HTMLDivElement>(null);

  const NoResults = variation?.noResultsComponent
    ? variation.noResultsComponent
    : config.blocks?.blocksConfig['listing']?.noResultsComponent;

  const HeadlineTag = data.headlineTag || 'h2';

  return (
    <>
      {(data.headline || data.headlineButtonText) && (
        <Headline
          headlineTag={HeadlineTag}
          id={id}
          listingItems={listingItems}
          data={data}
          isEditMode={isEditMode}
        />
      )}
      <SlotRenderer name="aboveListingItems" content={content} data={data} />
      {listingItems?.length > 0 && ListingBodyTemplate ? (
        <div ref={listingRef}>
          <ListingBodyTemplate
            items={listingItems}
            isEditMode={isEditMode}
            ref={data.variation === 'imageGallery' ? galleryRef : undefined}
            {...data}
            {...variation}
          />
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <Pagination
                aria-label={
                  data.headline
                    ? intl.formatMessage(messages.PaginationNavigationFor, {
                        headline: data.headline,
                      })
                    : intl.formatMessage(messages.PaginationNavigation)
                }
                className="desktop-pagination"
                activePage={currentPage}
                totalPages={totalPages}
                onPageChange={(e, data) => {
                  if (!isEditMode && listingRef.current) {
                    listingRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                  onPaginationChange(e as React.MouseEvent, data);
                }}
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
                    <FormattedMessage
                      id="Next Page"
                      defaultMessage="Next Page"
                    />
                  ),
                  icon: false,
                  'aria-disabled': !nextBatch,
                  className: !nextBatch ? 'disabled' : null,
                }}
              />
              <Pagination
                className="mobile-pagination"
                activePage={currentPage}
                totalPages={totalPages}
                boundaryRange={1}
                siblingRange={0}
                onPageChange={(e, data) => {
                  if (!isEditMode && listingRef.current) {
                    listingRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                  onPaginationChange(e as React.MouseEvent, data);
                }}
                firstItem={null}
                lastItem={null}
                prevItem={undefined}
                nextItem={undefined}
              />
              <div className="total">
                <FormattedMessage id="Result" defaultMessage="Result" />{' '}
                {(currentPage - 1) * batch_size + 1}-
                {(currentPage - 1) * batch_size + listingItems.length}{' '}
                <FormattedMessage id="of" defaultMessage="of" />{' '}
                {total || properties?.items_total}
              </div>
            </div>
          )}
        </div>
      ) : isEditMode ? (
        <div className="listing message" ref={listingRef}>
          {isFolderContentsListing && (
            <FormattedMessage
              id="No items found in this container."
              defaultMessage="No items found in this container."
            />
          )}
          {hasLoaded && NoResults && (
            <NoResults isEditMode={isEditMode} {...data} />
          )}
          <Dimmer active={!hasLoaded} inverted>
            <Loader indeterminate size="small">
              <FormattedMessage id="loading" defaultMessage="Loading" />
            </Loader>
          </Dimmer>
        </div>
      ) : (
        <div className="emptyListing">
          {hasLoaded && NoResults && (
            <NoResults isEditMode={isEditMode} {...data} />
          )}
          <Dimmer active={!hasLoaded} inverted>
            <Loader indeterminate size="small">
              <FormattedMessage id="loading" defaultMessage="Loading" />
            </Loader>
          </Dimmer>
        </div>
      )}
    </>
  );
};

export default injectIntl(withQuerystringResults(ListingBody));
