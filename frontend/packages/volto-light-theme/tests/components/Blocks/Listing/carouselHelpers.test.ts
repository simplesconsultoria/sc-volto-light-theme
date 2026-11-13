import { describe, expect, it } from 'vitest';
import {
  buildContainerStyle,
  buildEmbedSrc,
  getAutoPlayIntervalMs,
  getFooterHref,
  getLikelyVideoUrl,
  getMediaHeight,
  getSlideText,
  isValidDate,
  toEmbedUrl,
  wrapIndex,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/Listing/carouselHelpers';

describe('isValidDate', () => {
  it('rejects empty, "None" and unparsable values', () => {
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate('None')).toBe(false);
    expect(isValidDate('not a date')).toBe(false);
  });

  it("rejects Plone's empty 1969/1970 dates", () => {
    expect(isValidDate('1969-12-31T00:00:00')).toBe(false);
    expect(isValidDate('1970-01-01T00:00:00')).toBe(false);
  });

  it('accepts real dates', () => {
    expect(isValidDate('2024-05-10T12:00:00')).toBe(true);
  });
});

describe('toEmbedUrl', () => {
  it('converts YouTube short and watch URLs', () => {
    expect(toEmbedUrl('https://youtu.be/abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
    expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe(
      'https://www.youtube.com/embed/abc123',
    );
  });

  it('keeps YouTube and Vimeo embed URLs', () => {
    const yt = 'https://www.youtube.com/embed/abc123';
    const vimeo = 'https://player.vimeo.com/video/42';
    expect(toEmbedUrl(yt)).toBe(yt);
    expect(toEmbedUrl(vimeo)).toBe(vimeo);
  });

  it('converts Vimeo URLs', () => {
    expect(toEmbedUrl('https://vimeo.com/42')).toBe(
      'https://player.vimeo.com/video/42',
    );
  });

  it('returns null for missing ids, other hosts and invalid URLs', () => {
    expect(toEmbedUrl('https://youtu.be/')).toBeNull();
    expect(toEmbedUrl('https://www.youtube.com/watch')).toBeNull();
    expect(toEmbedUrl('https://vimeo.com/')).toBeNull();
    expect(toEmbedUrl('https://example.com/video.mp4')).toBeNull();
    expect(toEmbedUrl('not a url')).toBeNull();
  });
});

describe('buildEmbedSrc', () => {
  it('uses YouTube params for YouTube URLs and generic ones otherwise', () => {
    expect(buildEmbedSrc('https://www.youtube.com/embed/x')).toBe(
      'https://www.youtube.com/embed/x?autoplay=0&mute=1&playsinline=1&rel=0&modestbranding=1',
    );
    expect(buildEmbedSrc('https://player.vimeo.com/video/1')).toBe(
      'https://player.vimeo.com/video/1?autoplay=0&muted=1&playsinline=1',
    );
  });
});

describe('getLikelyVideoUrl', () => {
  it('reads videoUrl or video_url, ignoring blanks', () => {
    expect(getLikelyVideoUrl({ videoUrl: 'a' })).toBe('a');
    expect(getLikelyVideoUrl({ video_url: 'b' })).toBe('b');
    expect(getLikelyVideoUrl({ videoUrl: '  ' })).toBeNull();
    expect(getLikelyVideoUrl({})).toBeNull();
  });
});

describe('clamped settings', () => {
  it('clamps the media height to 200–1200, defaulting to 520', () => {
    expect(getMediaHeight(undefined)).toBe(520);
    expect(getMediaHeight(50)).toBe(200);
    expect(getMediaHeight(5000)).toBe(1200);
    expect(getMediaHeight(640)).toBe(640);
  });

  it('clamps the autoplay interval to 2000–60000, defaulting to 6000', () => {
    expect(getAutoPlayIntervalMs(undefined)).toBe(6000);
    expect(getAutoPlayIntervalMs(10)).toBe(2000);
    expect(getAutoPlayIntervalMs(100000)).toBe(60000);
    expect(getAutoPlayIntervalMs(3500.7)).toBe(3500);
  });
});

describe('buildContainerStyle', () => {
  it('sets height and fit, and position only when given', () => {
    expect(buildContainerStyle({})).toEqual({
      '--listing-carousel-media-height': '520px',
      '--listing-carousel-object-fit': 'contain',
    });
    expect(
      buildContainerStyle({
        carouselMaxHeight: 300,
        carouselObjectFit: 'cover',
        carouselObjectPosition: 'top',
      }),
    ).toEqual({
      '--listing-carousel-media-height': '300px',
      '--listing-carousel-object-fit': 'cover',
      '--listing-carousel-object-position': 'top',
    });
  });
});

describe('wrapIndex', () => {
  it('wraps past either end', () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(1, 3)).toBe(1);
  });
});

describe('getSlideText', () => {
  it('falls back to summary and the first valid date', () => {
    const text = getSlideText(
      {
        title: 'T',
        summary: 'S',
        Date: 'None',
        effective: '1970-01-01T00:00:00',
        created: '2024-05-10T12:00:00',
      },
      'en-GB',
    );
    expect(text).toEqual({ title: 'T', description: 'S', date: '10/05/2024' });
  });

  it('returns empty strings when nothing is set', () => {
    expect(getSlideText({}, 'en')).toEqual({
      title: '',
      description: '',
      date: '',
    });
  });
});

describe('getFooterHref', () => {
  it('returns the first link @id when it is a string', () => {
    expect(getFooterHref([{ '@id': '/news' }])).toBe('/news');
    expect(getFooterHref([{ '@id': 42 }])).toBeNull();
    expect(getFooterHref(undefined)).toBeNull();
  });
});
