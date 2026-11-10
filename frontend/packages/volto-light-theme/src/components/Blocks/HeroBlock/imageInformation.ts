import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import type { ObjectBrowserItem } from '@plone/types';
import type { HeroBlockData } from './types';

export interface ImageInformation {
  imageItem: ObjectBrowserItem | null;
  imageSrc: string | null;
  hasImage: boolean;
}

function getValidImageItem(
  item: ObjectBrowserItem | null | undefined,
): ObjectBrowserItem | null {
  if (!item) return null;
  const field = item.image_field || 'image';
  const scales = item.image_scales;
  if (scales?.[field]?.[0]?.download) {
    return item.image_field ? item : { ...item, image_field: field };
  }
  if (scales && typeof scales === 'object') {
    for (const [key, val] of Object.entries(scales)) {
      if (Array.isArray(val) && val[0]?.download) {
        return { ...item, image_field: key };
      }
    }
  }
  if (item?.image?.download) {
    return { ...item, image_field: 'image' };
  }
  return null;
}

function hasImageAttributes(
  item: ObjectBrowserItem | null | undefined,
): boolean {
  return Boolean(getValidImageItem(item));
}

export function imageInfoFromHeroBlock(data: HeroBlockData): ImageInformation {
  const hrefItem = data.href?.[0];
  const oldUrl = data.url;
  const previewImageItem = Array.isArray(data.preview_image)
    ? data.preview_image[0]
    : typeof data.preview_image === 'string'
      ? ({ '@id': data.preview_image } as unknown as ObjectBrowserItem)
      : (data.preview_image as ObjectBrowserItem) || null;

  const validHref = getValidImageItem(hrefItem);
  const validPreview = getValidImageItem(previewImageItem);

  const useHrefImage =
    hasImageAttributes(hrefItem) &&
    (!data.overwrite ||
      (data.overwrite &&
        (!data.preview_image || data.preview_image.length === 0)));

  const imageItem = useHrefImage ? validHref : validPreview;
  const fallbackSrc = imageItem
    ? null
    : previewImageItem?.['@id'] || oldUrl || null;

  return {
    imageItem: imageItem || null,
    imageSrc: fallbackSrc ? flattenToAppURL(fallbackSrc) : null,
    hasImage: Boolean(imageItem || fallbackSrc),
  };
}
