import React, { useContext } from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import Image from '@plone/volto/components/theme/Image/Image';
import defaultPlaceholderSVG from '@plone/volto/components/manage/Blocks/Listing/default-image.svg';
import config from '@plone/volto/registry';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import type { Content } from '@plone/types';
import type { MainImageBlockData } from './index';
import Layout, { type MainImageAlign, type MainImageSize } from './Layout';
import type { ThemeDefinition } from '../../../config/blocks';
import { ReactReduxContext, useSelector } from 'react-redux';

interface MainImageBlockViewProps {
  data: MainImageBlockData;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
  content?: Content;
  properties?: Content;
  metadata?: Content;
  [key: string]: any;
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

function unwrapCandidate(candidate: any): any {
  if (!candidate) return undefined;
  if (Array.isArray(candidate)) {
    return candidate.length > 0 ? unwrapCandidate(candidate[0]) : undefined;
  }
  return candidate;
}

function getPreviewCandidate(item: any) {
  if (!item || typeof item !== 'object') return undefined;
  const raw =
    item.preview_image_link ||
    item.preview_image ||
    item.image ||
    item.url ||
    (item.image_scales ? item : undefined);
  return unwrapCandidate(raw);
}

const MainImageBlockView: React.FC<MainImageBlockViewProps> = (props) => {
  const {
    data = {} as MainImageBlockData,
    className,
    style,
    isEditMode,
    content,
    properties,
    metadata,
  } = props;

  const reduxContext = useContext(ReactReduxContext);
  const reduxContent = useSelector((state: any) => state.content?.data);
  const stateContent =
    reduxContent || reduxContext?.store?.getState()?.content?.data;

  // Resolves preview image across block data, top-level page, Redux store, and nested containers
  // (GridBlock, CustomGrid, Accordion) where metadata holds the page document.
  const previewImage =
    getPreviewCandidate(data) ||
    getPreviewCandidate(metadata) ||
    getPreviewCandidate(properties) ||
    getPreviewCandidate(content) ||
    getPreviewCandidate(stateContent);

  const pageContent: Content =
    (metadata && Object.keys(metadata).length > 0 ? metadata : null) ||
    (properties && Object.keys(properties).length > 0 ? properties : null) ||
    (content && Object.keys(content).length > 0 ? content : null) ||
    stateContent ||
    ({} as Content);

  const blockType = (data as any)?.['@type'] as string | undefined;
  const themeDefinitions = getThemeDefinitions(blockType);
  const themeValue = (data as any)?.theme ?? (data as any)?.styles?.theme;
  const themeStyle = resolveThemeStyle(themeValue, themeDefinitions);
  const mergedStyle: React.CSSProperties = {
    ...(style || {}),
    ...themeStyle,
  };

  const effectivePreview =
    previewImage ||
    (data.title || data.description || (pageContent as any)?.title
      ? {
          title: data.title || (pageContent as any)?.title || 'Lead Image',
          description:
            data.description ||
            (pageContent as any)?.preview_caption_link ||
            (pageContent as any)?.description ||
            '',
          url: defaultPlaceholderSVG,
          download: defaultPlaceholderSVG,
        }
      : undefined);

  if (!effectivePreview) {
    return isEditMode ? (
      <div className={cx('main-image-block', 'empty', className)} style={style}>
        <FormattedMessage
          id="No preview image found on this page."
          defaultMessage="No preview image found on this page. Add a preview image to the page to display it in this block."
        />
      </div>
    ) : null;
  }

  // Use custom title/description when provided; otherwise default to preview image or page metadata
  const imageTitle =
    data.title !== undefined && data.title !== ''
      ? data.title
      : (effectivePreview as any)?.title || (pageContent as any)?.title || '';

  const imageDescription =
    data.description !== undefined && data.description !== ''
      ? data.description
      : (pageContent as any)?.preview_caption_link ||
        (pageContent as any)?.preview_caption ||
        (pageContent as any)?.image_caption ||
        (effectivePreview as any)?.description ||
        (pageContent as any)?.description ||
        '';

  const altText =
    data.altText ||
    imageTitle ||
    (effectivePreview as any)?.title ||
    imageDescription ||
    'Imagem principal';

  const imageFieldToUse =
    (effectivePreview as any)?.image_field ||
    ((pageContent as any)?.preview_image_link ? undefined : 'preview_image');

  const hasItemScales = Boolean(
    effectivePreview &&
      typeof effectivePreview === 'object' &&
      (effectivePreview as any).image_scales &&
      (imageFieldToUse
        ? (effectivePreview as any).image_scales[imageFieldToUse]
        : (effectivePreview as any).image_scales.preview_image ||
          (effectivePreview as any).image_scales.image),
  );

  const rawCandidate =
    typeof effectivePreview === 'string'
      ? effectivePreview
      : (effectivePreview as any)?.download ||
        (effectivePreview as any)?.url ||
        (effectivePreview as any)?.['@id'] ||
        (effectivePreview as any)?.image?.download ||
        (pageContent as any)?.preview_image_link ||
        (pageContent as any)?.preview_image ||
        defaultPlaceholderSVG;

  const unwrapped = unwrapCandidate(rawCandidate);
  const candidateUrl =
    typeof unwrapped === 'string'
      ? unwrapped
      : unwrapped?.['@id'] ||
        unwrapped?.url ||
        unwrapped?.download ||
        defaultPlaceholderSVG;

  const imageElement = (
    <Image
      item={hasItemScales ? effectivePreview : undefined}
      src={!hasItemScales && candidateUrl ? candidateUrl : undefined}
      imageField={imageFieldToUse}
      alt={altText}
      loading="lazy"
      responsive={true}
      sizes={(config.blocks.blocksConfig as any).image?.getSizes?.(data)}
    />
  );

  return (
    <Layout
      align={data.align as MainImageAlign | undefined}
      size={data.size as MainImageSize | undefined}
      title={imageTitle}
      description={imageDescription}
      className={className}
      style={mergedStyle}
      image={imageElement}
    />
  );
};

export default withBlockExtensions(MainImageBlockView);
