import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { HeroBlockData } from './types';
import { imageInfoFromHeroBlock } from './imageInformation';

const messages = defineMessages({
  selectHighlightItem: {
    id: 'Select a highlighted item',
    defaultMessage: 'Select a highlighted item',
  },
  emptyHeroBlock: {
    id: 'Empty hero block placeholder',
    defaultMessage:
      'This is a Hero Block. Add an item in the sidebar to fill it automatically.',
  },
});

interface UseHeroBlockContentProps {
  data: HeroBlockData;
  isEditMode?: boolean;
  defaultTitleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function useHeroBlockContent({
  data,
  isEditMode,
  defaultTitleTag = 'h2',
}: UseHeroBlockContentProps) {
  const intl = useIntl();

  return useMemo(() => {
    const hrefItem = data.href?.[0];

    const title =
      data.overwrite && data.title
        ? data.title
        : hrefItem?.Title || hrefItem?.title || data.title;

    const description =
      data.overwrite && data.description
        ? data.description
        : hrefItem?.Description || hrefItem?.description || data.description;

    const displayTitle =
      title ||
      (isEditMode ? intl.formatMessage(messages.selectHighlightItem) : '');

    const displayDescription =
      description ||
      (isEditMode && !title ? intl.formatMessage(messages.emptyHeroBlock) : '');

    const date =
      hrefItem?.EffectiveDate ||
      hrefItem?.CreationDate ||
      hrefItem?.effective ||
      null;

    const rawTextSide = data.textSide || 'left';
    const textSide = rawTextSide === 'left' ? 'right' : 'left';
    const imageFit = data.imageFit || 'cover';
    const imageSize = data.imageSize || '50%';

    const buttonLink = data.buttonLink?.[0]?.['@id'] || hrefItem?.['@id'] || '';

    const TitleTag = (data.titleTag ||
      defaultTitleTag) as keyof JSX.IntrinsicElements;

    const imageInfo = imageInfoFromHeroBlock(data);
    let hasImage = imageInfo.hasImage;

    if (data.hideImage || imageSize === '0%') {
      hasImage = false;
    }

    return {
      title,
      description,
      displayTitle,
      displayDescription,
      date,
      textSide,
      imageFit,
      imageSize,
      buttonLink,
      TitleTag,
      imageInfo,
      hasImage,
    };
  }, [data, isEditMode, defaultTitleTag, intl]);
}
