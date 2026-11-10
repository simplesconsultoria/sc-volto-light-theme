import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

/**
 * Normalizes an item reference stored in block data, which may be an array
 * (object browser widget), a plain object or a URL string, into a single
 * object (or `undefined` when empty).
 */
export function normalizeItemRef(raw: any): any {
  if (Array.isArray(raw)) return raw[0];
  if (typeof raw === 'object' && raw !== null) return raw;
  if (typeof raw === 'string' && raw) return { '@id': raw };
  return undefined;
}

/**
 * Direct image URL for a catalog item: the download path of its first scale
 * of `image_field` (or of the first image field found), falling back to
 * `<item>/@@images/image`. Returns `undefined` when the item has no `@id`.
 */
export function resolveItemImageSrc(item: any): string | undefined {
  if (!item?.['@id']) return undefined;
  const base = flattenToAppURL(item['@id']);
  const scales = item.image_scales;
  const imageField = item.image_field || 'image';
  const scaleObj =
    scales?.[imageField]?.[0] ||
    (scales && (Object.values(scales) as any[])?.[0]?.[0]);
  if (scaleObj?.download) {
    return `${base}/${scaleObj.download.replace(/^\//, '')}`;
  }
  return `${base}/@@images/image`;
}

/**
 * Direct image URL for a bare image URL: kept as is when it already points to
 * an image (`@@images`, `@@download` or an image file extension), otherwise
 * `<url>/@@images/image`.
 */
export function resolveImageUrlSrc(url: string): string {
  const flatUrl = flattenToAppURL(url);
  const isImageUrl =
    flatUrl.includes('@@images') ||
    flatUrl.includes('@@download') ||
    /\.(jpe?g|png|gif|svg|webp)($|\?)/i.test(flatUrl);
  return isImageUrl ? flatUrl : `${flatUrl.replace(/\/$/, '')}/@@images/image`;
}
