import React, { useContext } from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import DocumentByLine from '../../DocumentByLine/DocumentByLine';
import type { DocumentByLineBlockData } from './Data';
import type { Content } from '@plone/types';
import cx from 'classnames';
import { ReactReduxContext } from 'react-redux';
import { resolveBaseContent, withByLineFallback } from './helpers';

interface DocumentByLineBlockViewProps {
  data: DocumentByLineBlockData;
  properties?: Content;
  metadata?: Content;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
}

// Reads the current content from the Redux store, when a store is available.
const useStateContent = (): Content | undefined => {
  const reduxContext = useContext(ReactReduxContext);
  return reduxContext?.store
    ? reduxContext.store.getState()?.content?.data
    : undefined;
};

const DocumentByLineBlockView: React.FC<DocumentByLineBlockViewProps> = (
  props,
) => {
  const { data, properties, metadata, className, style, isEditMode } = props;
  const stateContent = useStateContent();
  const content = withByLineFallback(
    resolveBaseContent(stateContent, properties, metadata),
    data as Record<string, any>,
  );

  return (
    <div
      className={cx(
        'block DocumentByLineBlock',
        `${className}`,
        isEditMode ? 'edit' : '',
      )}
      style={style}
    >
      <DocumentByLine
        content={content}
        showModified={data.showModified ?? true}
        showPublished={data.showPublished ?? true}
        showAuthor={data.showAuthor ?? true}
      />
    </div>
  );
};

export default withBlockExtensions(DocumentByLineBlockView);
