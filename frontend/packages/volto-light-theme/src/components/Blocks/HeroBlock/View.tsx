import React from 'react';
import cx from 'classnames';
import { BlockWrapper } from '@kitconcept/volto-bm3-compat';
import FlexView from './FlexView';
import CardView from './CardView';
import { resolveBlockTheme } from '../../../config/blockThemes';
import { normalizeBlockWidth } from '../../../helpers/blockWidth';

interface HeroBlockViewProps {
  data: Record<string, any>;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

const HeroBlockView: React.FC<HeroBlockViewProps> = (props) => {
  const { data = {}, className, isEditMode, style } = props;
  const themeValue = data?.theme ?? data?.styles?.theme;
  const resolved = resolveBlockTheme(data);

  const themeStyle =
    typeof themeValue === 'object' && themeValue !== null
      ? (themeValue as React.CSSProperties)
      : resolved.style;

  const mergedStyle: React.CSSProperties = {
    ...(style || {}),
    ...themeStyle,
  };

  const variation = data.variation || 'flex';
  const typeHref = data?.href?.[0]?.['@type'] || '';
  const normalizedWidth = normalizeBlockWidth(data, 'layout');
  const blockWidthClass = `has--block-width--${normalizedWidth}`;
  const imageSize = data.imageSize || '50%';

  const finalStyle: React.CSSProperties = {
    ...mergedStyle,
    '--hero-image-size': imageSize,
  } as React.CSSProperties;

  const viewProps = {
    data,
    className: cx(className),
    isEditMode,
  };

  return (
    <BlockWrapper
      {...(props as any)}
      className={cx(props.className, blockWidthClass, resolved.className)}
      style={finalStyle}
    >
      <div
        className={cx(
          'hero-block-container',
          typeHref,
          blockWidthClass,
          resolved.className,
          {
            'has--full-width-image':
              data.fullWidthImage && variation === 'flex',
          },
        )}
        style={finalStyle}
      >
        {variation === 'card' ? (
          <CardView {...viewProps} />
        ) : (
          <FlexView {...viewProps} />
        )}
      </div>
    </BlockWrapper>
  );
};

export default HeroBlockView;
