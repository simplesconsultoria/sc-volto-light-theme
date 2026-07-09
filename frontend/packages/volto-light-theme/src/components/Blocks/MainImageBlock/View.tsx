import React from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import Image from '@plone/volto/components/theme/Image/Image';
import config from '@plone/volto/registry';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import type { Content } from '@plone/types';
import type { MainImageBlockData } from './index';
import Layout, { type MainImageAlign, type MainImageSize } from './Layout';

interface MainImageBlockViewProps {
  data: MainImageBlockData;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
  content?: Content;
  properties?: Content;
  [key: string]: any;
}

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

const MainImageBlockView: React.FC<MainImageBlockViewProps> = ({
  data = {} as MainImageBlockData,
  className,
  style,
  isEditMode,
  content,
  properties,
}) => {
  const blockType = (data as any)?.['@type'] as string | undefined;
  const themeDefinitions = getThemeDefinitions(blockType);
  const themeValue = (data as any)?.theme ?? (data as any)?.styles?.theme;
  const themeStyle = resolveThemeStyle(themeValue, themeDefinitions);
  const mergedStyle: React.CSSProperties = {
    ...(style || {}),
    ...themeStyle,
  };

  const pageContent = content || properties;
  const previewImage = (pageContent as any)?.preview_image_link;

  if (!previewImage) {
    return isEditMode ? (
      <div className={cx('main-image-block', 'empty', className)} style={style}>
        <FormattedMessage
          id="Nenhuma imagem de preview encontrada na página."
          defaultMessage="Nenhuma imagem de preview encontrada na página. Adicione uma imagem de preview na página para exibir neste bloco."
        />
      </div>
    ) : null;
  }

  return (
    <Layout
      align={data.align as MainImageAlign | undefined}
      size={data.size as MainImageSize | undefined}
      title={data.title}
      description={data.description}
      className={className}
      style={mergedStyle}
      image={
        <Image
          item={previewImage}
          alt={
            data.altText ||
            data.title ||
            previewImage?.title ||
            'Imagem principal'
          }
          loading="lazy"
          responsive={true}
          sizes={(config.blocks.blocksConfig as any).image?.getSizes?.(data)}
        />
      }
    />
  );
};

export default withBlockExtensions(MainImageBlockView);
