import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import type { ObjectBrowserItem } from '@plone/types';
import type { HeroBlockData } from './types';

export interface ImageInformation {
  imageItem: ObjectBrowserItem | null;
  imageSrc: string | null;
  hasImage: boolean;
}

function hasImageAttributes(
  item: ObjectBrowserItem | null | undefined,
): boolean {
  return item
    ? Boolean(item?.image_scales?.[item.image_field]?.[0]?.download)
    : false;
}

export function imageInfoFromHeroBlock(data: HeroBlockData): ImageInformation {
  const hrefItem = data.href?.[0];
  const oldUrl = data.url;
  const useHrefImage =
    hasImageAttributes(hrefItem) &&
    (!data.overwrite || (data.overwrite && !data.preview_image));
  const previewImageItem = Array.isArray(data.preview_image)
    ? data.preview_image[0]
    : null;
  const imageItem = useHrefImage
    ? hrefItem
    : hasImageAttributes(previewImageItem)
      ? previewImageItem
      : null;
  const imageSrc = imageItem
    ? null
    : previewImageItem?.['@id'] || oldUrl || null;
  return {
    imageItem: imageItem || null,
    imageSrc: imageSrc ? flattenToAppURL(imageSrc) : null,
    hasImage: Boolean(imageItem || imageSrc),
  };
}
