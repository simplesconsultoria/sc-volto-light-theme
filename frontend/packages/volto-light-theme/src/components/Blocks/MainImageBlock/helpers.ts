import type React from 'react';
import defaultPlaceholderSVG from '@plone/volto/components/manage/Blocks/Listing/default-image.svg';

export function unwrapCandidate(candidate: any): any {
  if (!candidate) return undefined;
  if (Array.isArray(candidate)) {
    return candidate.length > 0 ? unwrapCandidate(candidate[0]) : undefined;
  }
  return candidate;
}

export function getPreviewCandidate(item: any) {
  if (!item || typeof item !== 'object') return undefined;
  const raw =
    item.preview_image_link ||
    item.preview_image ||
    item.image ||
    item.url ||
    (item.image_scales ? item : undefined);
  return unwrapCandidate(raw);
}

/** The first preview image found among `sources`, in order. */
export function findPreviewImage(sources: any[]): any {
  for (const source of sources) {
    const candidate = getPreviewCandidate(source);
    if (candidate) return candidate;
  }
  return undefined;
}

const nonEmpty = (obj: any) =>
  obj && Object.keys(obj).length > 0 ? obj : null;

/**
 * The page document: the first non-empty of `metadata` (set inside nested
 * containers), `properties` and `content`, then the Redux content.
 */
export function resolvePageContent(
  metadata: any,
  properties: any,
  content: any,
  stateContent: any,
): any {
  return (
    nonEmpty(metadata) ||
    nonEmpty(properties) ||
    nonEmpty(content) ||
    stateContent ||
    {}
  );
}

/**
 * Inline style for the block theme: a theme stored as an object is used as
 * is, otherwise the style resolved from the theme registry.
 */
export function resolveThemeStyle(
  data: any,
  resolvedStyle: React.CSSProperties,
): React.CSSProperties {
  const themeValue = data?.theme ?? data?.styles?.theme;
  return typeof themeValue === 'object' && themeValue !== null
    ? (themeValue as React.CSSProperties)
    : resolvedStyle;
}

/**
 * The preview to render: the image found, or a placeholder when the block or
 * the page has a title or description to show. `undefined` when neither.
 */
export function resolveEffectivePreview(
  previewImage: any,
  data: any,
  pageContent: any,
): any {
  if (previewImage) return previewImage;
  if (!(data.title || data.description || pageContent?.title)) return undefined;
  return {
    title: data.title || pageContent?.title || 'Lead Image',
    description:
      data.description ||
      pageContent?.preview_caption_link ||
      pageContent?.description ||
      '',
    url: defaultPlaceholderSVG,
    download: defaultPlaceholderSVG,
  };
}

const isSet = (value: any) => value !== undefined && value !== '';

// Use custom title/description when provided; otherwise default to preview image or page metadata
export function resolveImageTitle(
  data: any,
  preview: any,
  pageContent: any,
): string {
  return isSet(data.title)
    ? data.title
    : preview?.title || pageContent?.title || '';
}

export function resolveImageDescription(
  data: any,
  preview: any,
  pageContent: any,
): string {
  return isSet(data.description)
    ? data.description
    : pageContent?.preview_caption_link ||
        pageContent?.preview_caption ||
        pageContent?.image_caption ||
        preview?.description ||
        pageContent?.description ||
        '';
}

export function resolveImageField(
  preview: any,
  pageContent: any,
): string | undefined {
  return (
    preview?.image_field ||
    (pageContent?.preview_image_link ? undefined : 'preview_image')
  );
}

/** Whether `preview` carries scales for the field the image is read from. */
export function hasImageScales(preview: any, imageField?: string): boolean {
  if (!preview || typeof preview !== 'object' || !preview.image_scales) {
    return false;
  }
  const scales = preview.image_scales;
  return Boolean(
    imageField ? scales[imageField] : scales.preview_image || scales.image,
  );
}

/** A plain image URL for previews without usable scales. */
export function resolveImageUrl(preview: any, pageContent: any): string {
  const rawCandidate =
    typeof preview === 'string'
      ? preview
      : preview?.download ||
        preview?.url ||
        preview?.['@id'] ||
        preview?.image?.download ||
        pageContent?.preview_image_link ||
        pageContent?.preview_image ||
        defaultPlaceholderSVG;

  const unwrapped = unwrapCandidate(rawCandidate);
  return typeof unwrapped === 'string'
    ? unwrapped
    : unwrapped?.['@id'] ||
        unwrapped?.url ||
        unwrapped?.download ||
        defaultPlaceholderSVG;
}

export interface MainImageProps {
  title: string;
  description: string;
  alt: string;
  imageField?: string;
  item?: any;
  src?: string;
}

/** Everything the view needs to render the image and its caption. */
export function resolveMainImage(
  data: any,
  preview: any,
  pageContent: any,
): MainImageProps {
  const title = resolveImageTitle(data, preview, pageContent);
  const description = resolveImageDescription(data, preview, pageContent);
  const imageField = resolveImageField(preview, pageContent);
  const withScales = hasImageScales(preview, imageField);
  const url = resolveImageUrl(preview, pageContent);

  return {
    title,
    description,
    alt:
      data.altText ||
      title ||
      preview?.title ||
      description ||
      'Imagem principal',
    imageField,
    item: withScales ? preview : undefined,
    src: !withScales && url ? url : undefined,
  };
}
