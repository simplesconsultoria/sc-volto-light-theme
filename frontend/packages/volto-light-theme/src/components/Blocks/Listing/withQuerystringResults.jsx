import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import hoistNonReactStatics from 'hoist-non-react-statics';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { usePagination } from '@plone/volto/helpers/Utils/usePagination';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';

import config from '@plone/volto/registry';
import {
  buildAdaptedQuery,
  buildListingFetchAction,
  isImageGalleryListing,
  resolveListingResults,
} from './querystringResultsHelpers';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// For backwards compat with data saved before Blocks schema. Note, this is
// also how the Search block passes data to ListingBody
const getQuerystring = (data) => data.querystring || data;

const getSubrequestID = (content, id) =>
  content?.UID ? `${content?.UID}-${id}` : id;

/**
 * Fetches the listing (query results or folder contents) and tracks the
 * current page. Returns the props `withQuerystringResults` passes down.
 */
function useQuerystringResults({ data, id, content, path, variation }) {
  const querystring = getQuerystring(data);
  const subrequestID = getSubrequestID(content, id);
  const { b_size = config.settings.defaultPageSize } = querystring; // batchsize

  // save the path so it won't trigger dispatch on eager router location change
  const [initialPath] = React.useState(() => getBaseUrl(path));
  const { currentPage, setCurrentPage } = usePagination(id, 1);
  const adaptedQuery = buildAdaptedQuery(querystring, variation, b_size);
  const adaptedQueryRef = useRef(adaptedQuery);
  const currentPageRef = useRef(currentPage);

  const querystringResults = useSelector(
    (state) => state.querystringsearch.subrequests,
  );
  const dispatch = useDispatch();

  const hasQuery = querystring?.query?.length > 0;
  const results = resolveListingResults({
    content,
    subrequest: querystringResults?.[subrequestID],
    hasQuery,
    b_size,
    offset: adaptedQuery.offset,
  });
  const isImageGallery = isImageGalleryListing(data);

  useDeepCompareEffect(() => {
    dispatch(
      buildListingFetchAction({
        hasQuery,
        isImageGallery,
        initialPath,
        adaptedQuery,
        subrequestID,
        currentPage,
      }),
    );
    adaptedQueryRef.current = adaptedQuery;
    currentPageRef.current = currentPage;
  }, [
    subrequestID,
    isImageGallery,
    adaptedQuery,
    hasQuery,
    initialPath,
    dispatch,
    currentPage,
  ]);

  return {
    onPaginationChange: (e, { activePage }) => setCurrentPage(activePage),
    total: hasQuery ? results.visibleTotal : undefined,
    batch_size: b_size,
    currentPage,
    totalPages: results.totalPages,
    prevBatch: results.prevBatch,
    nextBatch: results.nextBatch,
    listingItems: results.listingItems,
    hasLoaded: results.hasLoaded,
    isFolderContentsListing: results.showAsFolderListing,
  };
}

export default function withQuerystringResults(WrappedComponent) {
  function WithQuerystringResults(props) {
    const {
      data = {},
      id = data.block,
      properties: content,
      path,
      variation,
    } = props;
    const listingProps = useQuerystringResults({
      data,
      id,
      content,
      path,
      variation,
    });

    return <WrappedComponent {...props} {...listingProps} />;
  }

  WithQuerystringResults.displayName = `WithQuerystringResults(${getDisplayName(
    WrappedComponent,
  )})`;

  return hoistNonReactStatics(WithQuerystringResults, WrappedComponent);
}
