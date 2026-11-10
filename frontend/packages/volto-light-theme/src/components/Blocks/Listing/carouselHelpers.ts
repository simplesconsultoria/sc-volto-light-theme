import type React from 'react';

export type ListingItem = Record<string, any>;

export const isValidDate = (dateString?: string): boolean => {
  if (!dateString || dateString === 'None') return false;
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    // Plone's empty effective date defaults to 1969 or 1970
    if (isNaN(date.getTime()) || year === 1969 || year === 1970) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const formatDate = (
  dateString: string | undefined,
  locale: string,
): string => {
  if (!isValidDate(dateString)) return '';
  const date = new Date(dateString as string);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getLikelyVideoUrl = (item: ListingItem): string | null => {
  const url = item?.videoUrl || item?.video_url;
  return typeof url === 'string' && url.trim() ? url : null;
};

const youtubeEmbed = (id?: string | null): string | null =>
  id ? `https://www.youtube.com/embed/${id}` : null;

const parsedToEmbedUrl = (url: string, parsed: URL): string | null => {
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const path = parsed.pathname || '';

  // YouTube - youtu.be shortener
  if (host === 'youtu.be') {
    return youtubeEmbed(path.split('/')[1]);
  }

  // YouTube - full domain
  if (host === 'youtube.com') {
    if (path.startsWith('/embed/')) return url;
    return youtubeEmbed(parsed.searchParams.get('v'));
  }

  // Vimeo
  if (host === 'vimeo.com') {
    const id = path.split('/').filter(Boolean)[0];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  // Already embed URL
  if (host === 'player.vimeo.com' && path.startsWith('/video/')) {
    return url;
  }

  return null;
};

export const toEmbedUrl = (url: string): string | null => {
  try {
    return parsedToEmbedUrl(url, new URL(url));
  } catch {
    return null;
  }
};

/** Query string appended to the embed URL: muted, inline, no autoplay. */
export const buildEmbedSrc = (embedUrl: string): string =>
  [
    embedUrl,
    embedUrl.includes('youtube')
      ? '?autoplay=0&mute=1&playsinline=1&rel=0&modestbranding=1'
      : '?autoplay=0&muted=1&playsinline=1',
  ].join('');

/** Media height in px, clamped to 200–1200 (default 520). */
export const getMediaHeight = (carouselMaxHeight?: number): number =>
  Math.max(200, Math.min(1200, Number(carouselMaxHeight) || 520));

/** Autoplay interval in ms, clamped to 2000–60000 (default 6000). */
export const getAutoPlayIntervalMs = (interval?: number): number =>
  Math.max(2000, Math.min(60000, Math.floor(Number(interval) || 6000)));

export const getObjectFit = (fit?: string): 'cover' | 'contain' =>
  fit === 'cover' ? 'cover' : 'contain';

export const buildContainerStyle = ({
  carouselMaxHeight,
  carouselObjectFit,
  carouselObjectPosition,
}: {
  carouselMaxHeight?: number;
  carouselObjectFit?: string;
  carouselObjectPosition?: string;
}): React.CSSProperties =>
  ({
    ['--listing-carousel-media-height' as any]: `${getMediaHeight(
      carouselMaxHeight,
    )}px`,
    ['--listing-carousel-object-fit' as any]: getObjectFit(carouselObjectFit),
    ...(carouselObjectPosition
      ? {
          ['--listing-carousel-object-position' as any]: carouselObjectPosition,
        }
      : null),
  }) as React.CSSProperties;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

/** Wraps an index into the 0..count-1 range (negative indexes included). */
export const wrapIndex = (index: number, count: number): number =>
  ((index % count) + count) % count;

export interface SlideText {
  title: string;
  description: string;
  date: string;
}

/** Title, description and formatted date shown in a slide caption. */
export const getSlideText = (item: ListingItem, locale: string): SlideText => {
  const dateString = [item?.Date, item?.effective, item?.created].find(
    isValidDate,
  );
  return {
    title: item?.title || '',
    description: (item?.description || item?.summary || '').toString(),
    date: formatDate(dateString, locale),
  };
};

/** The footer link target, when `linkHref` holds a string `@id`. */
export const getFooterHref = (linkHref?: any[]): string | null => {
  const href = linkHref?.[0]?.['@id'];
  return href && typeof href === 'string' ? href : null;
};
