import React from 'react';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { BlockWrapper } from '@kitconcept/volto-bm3-compat';
import FlexView from './FlexView';
import CardView from './CardView';

type ThemeDefinition = {
  name: string;
  style: Record<string, string>;
};

function getThemeDefinitions(blockType?: string): ThemeDefinition[] {
  const blockThemes = blockType
    ? (config.blocks?.blocksConfig as any)?.[blockType]?.themes
    : undefined;

  return (blockThemes ||
    (config.blocks as any)?.themes ||
    []) as ThemeDefinition[];
}

function resolveThemeStyle(
  theme: unknown,
  themeDefinitions: ThemeDefinition[],
): React.CSSProperties {
  if (!theme) return {};
  if (typeof theme === 'string') {
    return themeDefinitions.find((t) => t.name === theme)?.style ?? {};
  }
  if (typeof theme === 'object') {
    return theme as React.CSSProperties;
  }
  return {};
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
  const themeStyle = resolveThemeStyle(themeValue, themeDefinitions);
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
        className={cx('hero-block-container', typeHref, blockWidthClass)}
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
