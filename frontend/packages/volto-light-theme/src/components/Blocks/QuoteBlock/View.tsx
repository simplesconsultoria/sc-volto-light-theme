import React from 'react';
import cx from 'classnames';
import { BlockWrapper } from '@kitconcept/volto-bm3-compat';
// volto-slate is untyped JS that resolves only under tsconfig.dev.json, so an
// expect-error would fail there and a plain import would fail in editors.
// @ts-ignore
import { TextBlockView } from '@plone/volto-slate/blocks/Text';
// @ts-ignore
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
    <BlockWrapper {...(props as any)}>
      <blockquote
        className={cx('quote-block', `bg-${backgroundStyle}`, props.className)}
      >
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
    </BlockWrapper>
  );
};

export default QuoteBlockView;
