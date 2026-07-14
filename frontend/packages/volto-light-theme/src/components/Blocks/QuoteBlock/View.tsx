import React from 'react';
import cx from 'classnames';
// @ts-expect-error - volto-slate has no TS declarations
import { TextBlockView } from '@plone/volto-slate/blocks/Text';
// @ts-expect-error - volto-slate has no TS declarations
import { DetachedTextBlockEditor } from '@plone/volto-slate/blocks/Text/DetachedTextBlockEditor';

interface QuoteBlockViewProps {
  data: Record<string, any>;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
  block?: string;
  [key: string]: any;
}

const QuoteBlockView: React.FC<QuoteBlockViewProps> = (props) => {
  const { data = {}, isEditMode } = props;

  const backgroundStyle = data.backgroundStyle || 'transparent';

  return (
    <blockquote className={cx('quote-block', `bg-${backgroundStyle}`)}>
      <div className="quote-text">
        {isEditMode ? (
          <DetachedTextBlockEditor {...props} />
        ) : (
          <TextBlockView {...props} />
        )}
      </div>
      {data.author && (
        <footer className="quote-author">
          <cite>{data.author}</cite>
        </footer>
      )}
    </blockquote>
  );
};

export default QuoteBlockView;
