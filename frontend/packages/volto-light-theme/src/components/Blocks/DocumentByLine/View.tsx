import React, { useContext } from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import DocumentByLine from '../../DocumentByLine/DocumentByLine';
import type { DocumentByLineBlockData } from './Data';
import type { Content } from '@plone/types';
import cx from 'classnames';
import { ReactReduxContext } from 'react-redux';

interface DocumentByLineBlockViewProps {
  data: DocumentByLineBlockData;
  properties?: Content;
  metadata?: Content;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
}

const DocumentByLineBlockView: React.FC<DocumentByLineBlockViewProps> = (
  props,
) => {
  const { data, properties, metadata, className, style, isEditMode } = props;
  const reduxContext = useContext(ReactReduxContext);
  const stateContent = reduxContext?.store
    ? reduxContext.store.getState()?.content?.data
    : undefined;

  // Resolves document content metadata:
  // Inside containers (GridBlock, CustomGrid, Accordion), metadata carries the document object,
  // while properties may carry the container or column object (or merged metadata).
  // stateContent provides an extra fallback from the Redux store.
  const hasMetadata = Boolean(
    metadata?.effective ||
      metadata?.modified ||
      (metadata?.creators && metadata.creators.length > 0),
  );
  const hasProperties = Boolean(
    properties?.effective ||
      properties?.modified ||
      (properties?.creators && properties.creators.length > 0),
  );

  const baseContent: Content = hasMetadata
    ? { ...(stateContent || {}), ...(properties || {}), ...metadata }
    : hasProperties
      ? { ...(stateContent || {}), ...properties }
      : stateContent || metadata || properties || ({} as Content);

  // In edit mode or inside containers where dates/authors might not be stored on the sub-item,
  // provide fallback values so the user sees metadata instead of an empty box.
  const isDocEmpty =
    !baseContent?.effective &&
    !baseContent?.modified &&
    (!baseContent?.creators || baseContent.creators.length === 0);

  const content: Content = isDocEmpty
    ? {
        effective:
          (data as any)?.effective ||
          baseContent?.effective ||
          new Date().toISOString(),
        modified:
          (data as any)?.modified ||
          baseContent?.modified ||
          new Date().toISOString(),
        creators: (data as any)?.creators || baseContent?.creators || ['admin'],
      }
    : baseContent;

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
