import React from 'react';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { BlockWrapper } from '@kitconcept/volto-bm3-compat';
import FlexView from './FlexView';
import CardView from './CardView';
import {
  resolveBlockTheme,
  type ThemeDefinition,
} from '../../../config/blockThemes';

function getThemeDefinitions(blockType?: string): ThemeDefinition[] {
  const blockThemes = blockType
    ? (config.blocks?.blocksConfig as any)?.[blockType]?.themes
    : undefined;

  return (blockThemes ||
    (config.blocks as any)?.themes ||
    []) as ThemeDefinition[];
}

interface HeroBlockViewProps {
  data: Record<string, any>;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

const HeroBlockView: React.FC<HeroBlockViewProps> = (props) => {
  const { data = {}, className, isEditMode, style } = props;
  const blockType = data?.['@type'] as string | undefined;
  const themeDefinitions = getThemeDefinitions(blockType);
  const themeValue = data?.theme ?? data?.styles?.theme;
  const backColorGroup = data?.backColorGroup ?? data?.styles?.backColorGroup;
  const frontColorGroup = data?.frontColorGroup ?? data?.styles?.frontColorGroup;

  const resolved = resolveBlockTheme({
    theme: typeof themeValue === 'string' ? themeValue : undefined,
    backColorGroup,
    frontColorGroup,
    themeDefinitions,
  });

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
  let rawBlockWidth = data.blockWidth;

  if (typeof rawBlockWidth === 'object' && rawBlockWidth !== null) {
    rawBlockWidth =
      rawBlockWidth.value ||
      rawBlockWidth.id ||
      Object.values(rawBlockWidth)[0];
  }

  const blockWidthClass =
    rawBlockWidth && typeof rawBlockWidth === 'string'
      ? `has--block-width--${rawBlockWidth}`
      : 'has--block-width--layout';
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
    <BlockWrapper {...(props as any)}>
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
