import React from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import DocumentByLine from '../../DocumentByLine/DocumentByLine';
import type { DocumentByLineBlockData } from './Data';
import type { Content } from '@plone/types';
import cx from 'classnames';

interface DocumentByLineBlockViewProps {
  data: DocumentByLineBlockData;
  properties: Content;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
}

const DocumentByLineBlockView: React.FC<DocumentByLineBlockViewProps> = ({
  data,
  properties,
  className,
  style,
  isEditMode,
}) => {
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
        content={properties}
        showModified={data.showModified}
        showPublished={data.showPublished}
        showAuthor={data.showAuthor}
      />
    </div>
  );
};

export default withBlockExtensions(DocumentByLineBlockView);
