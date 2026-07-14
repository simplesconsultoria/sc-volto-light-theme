import { useMemo } from 'react';
import type { HeroBlockData } from './types';
import { imageInfoFromHeroBlock } from './imageInformation';

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
      title || (isEditMode ? 'Selecione um Item de Destaque' : '');

    const displayDescription =
      description ||
      (isEditMode && !title
        ? 'Este é um Hero Block. Por favor, adicione um item no menu lateral para preenchê-lo automaticamente.'
        : '');

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
    const hasImage = imageInfo.hasImage;

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
  }, [data, isEditMode, defaultTitleTag]);
}
