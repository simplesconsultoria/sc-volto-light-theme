import React from 'react';
import config from '@plone/volto/registry';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import type { ImageInformation } from './imageInformation';

interface CardViewProps {
  imageInfo: ImageInformation;
}

const CardImage: React.FC<CardViewProps> = ({ imageInfo }) => {
  const ImageComponent = config.getComponent('Image').component;
  const item = imageInfo.imageItem;

  // Resolve direct URL fallback
  let rawSrc = imageInfo.imageSrc;
  if (!rawSrc && item?.['@id']) {
    const scales = item.image_scales;
    const imageField = item.image_field || 'image';
    const scaleObj =
      scales?.[imageField]?.[0] || (scales && Object.values(scales)?.[0]?.[0]);
    if (scaleObj?.download) {
      rawSrc = `${flattenToAppURL(item['@id'])}/${scaleObj.download.replace(/^\//, '')}`;
    } else {
      rawSrc = `${flattenToAppURL(item['@id'])}/@@images/image`;
    }
  }

  const resolvedSrc = rawSrc
    ? !rawSrc.includes('@@images') &&
      !rawSrc.includes('@@download') &&
      !/\.(jpe?g|png|gif|svg|webp)($|\?)/i.test(rawSrc)
      ? `${rawSrc.replace(/\/$/, '')}/@@images/image`
      : rawSrc
    : undefined;

  // Safe wrapper for Image component ensuring an image element is always returned
  const SafeImage = React.useCallback(
    (props: any) => {
      if (props.src) {
        return <ImageComponent {...props} />;
      }
      try {
        const res = ImageComponent ? ImageComponent(props) : null;
        if (res) return res;
      } catch {
        // Fallback on scale rendering error
      }
      if (resolvedSrc) {
        return (
          <img
            src={resolvedSrc}
            alt={props.alt || ''}
            loading={props.loading || 'lazy'}
            className={props.responsive ? 'responsive' : undefined}
          />
        );
      }
      return null;
    },
    [ImageComponent, resolvedSrc],
  );

  const props = {
    item: item || undefined,
    image: item || undefined,
    src: item ? undefined : resolvedSrc,
    imageComponent: SafeImage,
  };

  return <Card.Image {...props} />;
};

export default CardImage;
