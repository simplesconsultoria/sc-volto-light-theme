import { describe, it, expect, vi } from 'vitest';
import {
  normalizeItemRef,
  resolveImageUrlSrc,
  resolveItemImageSrc,
} from '@simplesconsultoria/volto-light-theme/helpers/itemImage';

vi.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: (url: string) => url.replace('http://localhost:8080', ''),
}));

describe('normalizeItemRef', () => {
  it('takes the first entry of an array', () => {
    expect(normalizeItemRef([{ '@id': '/a' }, { '@id': '/b' }])).toEqual({
      '@id': '/a',
    });
    expect(normalizeItemRef([])).toBeUndefined();
  });

  it('keeps an object as is', () => {
    const ref = { '@id': '/a' };
    expect(normalizeItemRef(ref)).toBe(ref);
  });

  it('wraps a non-empty string', () => {
    expect(normalizeItemRef('/a')).toEqual({ '@id': '/a' });
  });

  it('returns undefined for empty values', () => {
    expect(normalizeItemRef('')).toBeUndefined();
    expect(normalizeItemRef(null)).toBeUndefined();
    expect(normalizeItemRef(undefined)).toBeUndefined();
  });
});

describe('resolveItemImageSrc', () => {
  it('returns undefined without an @id', () => {
    expect(resolveItemImageSrc(undefined)).toBeUndefined();
    expect(resolveItemImageSrc({})).toBeUndefined();
  });

  it('uses the download path of the image_field scale', () => {
    expect(
      resolveItemImageSrc({
        '@id': 'http://localhost:8080/news/item',
        image_field: 'preview_image',
        image_scales: {
          image: [{ download: '@@images/image-1.jpeg' }],
          preview_image: [{ download: '/@@images/preview_image-2.jpeg' }],
        },
      }),
    ).toBe('/news/item/@@images/preview_image-2.jpeg');
  });

  it('falls back to the first image field found', () => {
    expect(
      resolveItemImageSrc({
        '@id': '/item',
        image_scales: { lead: [{ download: '@@images/lead-3.png' }] },
      }),
    ).toBe('/item/@@images/lead-3.png');
  });

  it('falls back to @@images/image without scales', () => {
    expect(resolveItemImageSrc({ '@id': '/item' })).toBe(
      '/item/@@images/image',
    );
    expect(resolveItemImageSrc({ '@id': '/item', image_scales: {} })).toBe(
      '/item/@@images/image',
    );
  });
});

describe('resolveImageUrlSrc', () => {
  it('keeps URLs that already point to an image', () => {
    expect(resolveImageUrlSrc('/a/@@images/image/large')).toBe(
      '/a/@@images/image/large',
    );
    expect(resolveImageUrlSrc('/a/@@download/file')).toBe('/a/@@download/file');
    expect(resolveImageUrlSrc('/a/photo.JPG')).toBe('/a/photo.JPG');
    expect(resolveImageUrlSrc('/a/photo.webp?x=1')).toBe('/a/photo.webp?x=1');
  });

  it('appends @@images/image to content URLs', () => {
    expect(resolveImageUrlSrc('http://localhost:8080/a/image/')).toBe(
      '/a/image/@@images/image',
    );
    expect(resolveImageUrlSrc('/a/photo.jpg.html')).toBe(
      '/a/photo.jpg.html/@@images/image',
    );
  });
});
