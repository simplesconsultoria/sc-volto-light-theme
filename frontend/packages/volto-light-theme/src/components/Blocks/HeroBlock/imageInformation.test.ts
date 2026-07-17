import { describe, it, expect, vi } from 'vitest';
import type { ObjectBrowserItem } from '@plone/types';
import { imageInfoFromHeroBlock } from './imageInformation';
import type { HeroBlockData } from './types';

// Deterministic stub: strip a known backend prefix so we can assert both that
// the right source is picked *and* that it is flattened to an app-relative URL.
const BACKEND = 'http://backend:8080/Plone';
vi.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: (url: string) => (url ? url.replace(BACKEND, '') : url),
}));

/**
 * Build an ObjectBrowserItem that carries real image scales, i.e. one that
 * `hasImageAttributes` treats as an image.
 */
const imageItem = (id: string): ObjectBrowserItem =>
  ({
    '@id': id,
    image_field: 'image',
    image_scales: {
      image: [{ download: `${id}/@@images/image/preview` }],
    },
  }) as unknown as ObjectBrowserItem;

/**
 * Build an ObjectBrowserItem with no usable image scales — e.g. a plain link or
 * an externally selected object exposed only through its `@id`.
 */
const plainItem = (id: string): ObjectBrowserItem =>
  ({ '@id': id }) as unknown as ObjectBrowserItem;

const heroData = (partial: Partial<HeroBlockData>): HeroBlockData =>
  partial as HeroBlockData;

describe('imageInfoFromHeroBlock', () => {
  describe('when no image source is available', () => {
    it('returns an empty result for empty data', () => {
      expect(imageInfoFromHeroBlock(heroData({}))).toEqual({
        imageItem: null,
        imageSrc: null,
        hasImage: false,
      });
    });

    it('does not treat a non-image href link as an image', () => {
      const result = imageInfoFromHeroBlock(
        heroData({ href: [plainItem('/some/page')] }),
      );
      expect(result).toEqual({
        imageItem: null,
        imageSrc: null,
        hasImage: false,
      });
    });

    it('renders nothing when overwrite is on but no image was selected', () => {
      const result = imageInfoFromHeroBlock(
        heroData({ overwrite: true, preview_image: [] }),
      );
      expect(result.hasImage).toBe(false);
      expect(result.imageItem).toBeNull();
      expect(result.imageSrc).toBeNull();
    });
  });

  describe('href image (default, non-overwrite path)', () => {
    it('uses the href item image when overwrite is off', () => {
      const href = imageItem('/news/story');
      const result = imageInfoFromHeroBlock(heroData({ href: [href] }));
      expect(result.imageItem).toBe(href);
      expect(result.imageSrc).toBeNull();
      expect(result.hasImage).toBe(true);
    });

    it('falls back to the href image when overwrite is on but no preview_image is set', () => {
      const href = imageItem('/news/story');
      const result = imageInfoFromHeroBlock(
        heroData({ href: [href], overwrite: true }),
      );
      expect(result.imageItem).toBe(href);
      expect(result.hasImage).toBe(true);
    });

    it('ignores a legacy url when a valid href image is present', () => {
      const href = imageItem('/news/story');
      const result = imageInfoFromHeroBlock(
        heroData({ href: [href], url: `${BACKEND}/legacy.png` }),
      );
      expect(result.imageItem).toBe(href);
      expect(result.imageSrc).toBeNull();
    });
  });

  describe('overwrite with preview_image', () => {
    it('uses the preview_image item when it carries image scales', () => {
      const href = imageItem('/news/story');
      const preview = imageItem('/uploads/hero');
      const result = imageInfoFromHeroBlock(
        heroData({ href: [href], overwrite: true, preview_image: [preview] }),
      );
      expect(result.imageItem).toBe(preview);
      expect(result.imageSrc).toBeNull();
      expect(result.hasImage).toBe(true);
    });

    it('falls back to the preview_image @id (flattened) when it has no image scales', () => {
      const preview = plainItem(`${BACKEND}/external/banner`);
      const result = imageInfoFromHeroBlock(
        heroData({ overwrite: true, preview_image: [preview] }),
      );
      expect(result.imageItem).toBeNull();
      expect(result.imageSrc).toBe('/external/banner');
      expect(result.hasImage).toBe(true);
    });
  });

  describe('legacy url fallback (pre-migration content)', () => {
    it('renders the legacy url when neither href nor preview_image provide an image', () => {
      const result = imageInfoFromHeroBlock(
        heroData({ overwrite: true, url: `${BACKEND}/legacy/banner.png` }),
      );
      expect(result.imageItem).toBeNull();
      expect(result.imageSrc).toBe('/legacy/banner.png');
      expect(result.hasImage).toBe(true);
    });

    it('renders the legacy url even without the overwrite flag', () => {
      const result = imageInfoFromHeroBlock(
        heroData({ url: `${BACKEND}/legacy/banner.png` }),
      );
      expect(result.imageSrc).toBe('/legacy/banner.png');
      expect(result.hasImage).toBe(true);
    });

    it('prefers the preview_image @id over the legacy url', () => {
      const preview = plainItem(`${BACKEND}/new/banner`);
      const result = imageInfoFromHeroBlock(
        heroData({
          overwrite: true,
          preview_image: [preview],
          url: `${BACKEND}/legacy/banner.png`,
        }),
      );
      expect(result.imageSrc).toBe('/new/banner');
    });
  });
});
