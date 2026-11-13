import { getContent } from '@plone/volto/actions/content/content';
import { getQueryStringResults } from '@plone/volto/actions/querystringsearch/querystringsearch';
import {
  computeTotalPages,
  computeVisibleTotal,
} from '../../../helpers/pagination';

const copyFields = ['limit', 'query', 'sort_on', 'sort_order', 'depth'];

/**
 * The search query sent to the backend: full objects or all metadata
 * (depending on the variation), the batch size and offset, plus the query
 * fields the block actually defines.
 */
export function buildAdaptedQuery(querystring, variation, b_size) {
  return Object.assign(
    variation?.fullobjects ? { fullobjects: 1 } : { metadata_fields: '_all' },
    {
      b_size: b_size,
      offset: querystring?.offset || 0,
    },
    ...copyFields.map((name) =>
      Object.keys(querystring).includes(name)
        ? { [name]: querystring[name] }
        : {},
    ),
  );
}

/** Whether the block is an image gallery, legacy `template` included. */
export function isImageGalleryListing(data) {
  return (
    (!data.variation && data.template === 'imageGallery') ||
    data.variation === 'imageGallery'
  );
}

/**
 * Items, loading state and pagination for the listing, read from the query
 * results (when the block has a query) or from the folderish context.
 */
export function resolveListingResults({
  content,
  subrequest,
  hasQuery,
  b_size,
  offset,
}) {
  const folderItems = content?.is_folderish ? content.items : [];
  const hasLoaded = hasQuery ? subrequest?.loaded : true;
  const listingItems = hasQuery ? subrequest?.items || [] : folderItems;

  // The backend counts the items the offset skips in its total, but the
  // listing never shows them. Everything the user sees — the page count and
  // the result counter — is about the items past the offset.
  const visibleTotal = computeVisibleTotal(subrequest?.total, offset);

  const showAsFolderListing = !hasQuery && content?.items_total > b_size;
  const showAsQueryListing = hasQuery && visibleTotal > b_size;

  let totalPages = 0;
  let batching = null;
  if (showAsFolderListing) {
    totalPages = computeTotalPages(content.items_total, b_size);
    batching = content.batching;
  } else if (showAsQueryListing) {
    totalPages = computeTotalPages(visibleTotal, b_size);
    batching = subrequest.batching;
  }
  const paginated = showAsFolderListing || showAsQueryListing;

  return {
    listingItems,
    hasLoaded,
    visibleTotal,
    showAsFolderListing,
    totalPages,
    prevBatch: paginated ? batching?.prev : null,
    nextBatch: paginated ? batching?.next : null,
  };
}

/**
 * The action that fetches the listing: the query results, every child of the
 * context for a query-less image gallery, or the context itself otherwise.
 */
export function buildListingFetchAction({
  hasQuery,
  isImageGallery,
  initialPath,
  adaptedQuery,
  subrequestID,
  currentPage,
}) {
  if (hasQuery) {
    return getQueryStringResults(
      initialPath,
      adaptedQuery,
      subrequestID,
      currentPage,
    );
  }
  if (isImageGallery) {
    // when used as image gallery, it doesn't need a query to list children
    return getQueryStringResults(
      initialPath,
      {
        ...adaptedQuery,
        b_size: 10000000000,
        query: [
          {
            i: 'path',
            o: 'plone.app.querystring.operation.string.relativePath',
            v: '',
          },
        ],
      },
      subrequestID,
    );
  }
  return getContent(initialPath, null, null, currentPage);
}
