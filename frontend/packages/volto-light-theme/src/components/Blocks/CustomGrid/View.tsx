import React from 'react';
import cx from 'classnames';
import { RenderBlocks } from '@plone/volto/components';
import { BlockWrapper } from '@kitconcept/volto-bm3-compat';
import config from '@plone/volto/registry';

// ========================================================================
// Theme Resolution Logic (padronizado com o HeroBlock)
// ========================================================================

export interface ThemeDefinition {
  name: string;
  style: React.CSSProperties;
}

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

// ========================================================================
// Componentes do Bloco
// ========================================================================

/**
 * CustomGridColumn - Renders a single column container with theme class and styles.
 * Delegates rendering of nested blocks to RenderBlocks.
 */
const CustomGridColumn = ({
  colData,
  colId,
  path,
  className,
  style,
  metadata,
}: any) => {
  return (
    <div className={cx('custom-grid-column', className)} style={style}>
      <RenderBlocks content={colData} metadata={metadata} path={path} />
    </div>
  );
};

/**
 * CustomGridView - Renders the grid layout on the public-facing site.
 * Reads `layout` to determine grid proportions and renders each column
 * with its configured theme.
 */
const CustomGridView = (props: any) => {
  const { data = {}, path, className, metadata, properties, style } = props;
  const { layout = '1-1' } = data;
  const contentMetadata = metadata || properties;
  const columnsLayout = data?.data?.blocks_layout?.items || [];

  // Theme resolution for the Grid Wrapper
  const blockType = data?.['@type'] as string | undefined;
  const themeDefinitions = getThemeDefinitions(blockType);
  const themeValue = data?.theme ?? data?.styles?.theme;
  const themeStyle = resolveThemeStyle(themeValue, themeDefinitions);

  const mergedStyle: React.CSSProperties = {
    ...(style || {}),
    ...themeStyle,
  };

  // Block width classes
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

  // Remove Volto's injected width classes to prevent conflicts with our custom logic
  const cleanedClassName = (className || '')
    .split(' ')
    .filter(
      (c: string) =>
        !c.startsWith('has--block-width--') &&
        !['full', 'narrow', 'layout', 'default'].includes(c),
    )
    .join(' ');

  // Grid level class with any themes resolved
  const gridClasses = cx(
    'block custom-grid',
    blockWidthClass,
    cleanedClassName,
    `layout-${layout}`,
    { 'has-theme': !!themeValue },
  );

  return (
    <BlockWrapper {...props}>
      <div className={gridClasses} style={mergedStyle}>
        {columnsLayout.map((colId: string) => {
          const rawColData = data?.data?.blocks?.[colId] || {};
          const safeColData = {
            ...rawColData,
            blocks: rawColData.blocks || {},
            blocks_layout: rawColData.blocks_layout || { items: [] },
          };

          // Theme resolution for the Column
          const colThemeValue = safeColData.settings?.theme;
          const colThemeStyle = resolveThemeStyle(
            colThemeValue,
            themeDefinitions,
          );

          const colThemeClass = cx({ 'has-theme': !!colThemeValue });

          return (
            <CustomGridColumn
              key={colId}
              colId={colId}
              colData={safeColData}
              metadata={contentMetadata}
              path={path}
              className={colThemeClass}
              style={colThemeStyle}
            />
          );
        })}
      </div>
    </BlockWrapper>
  );
};

export default CustomGridView;
