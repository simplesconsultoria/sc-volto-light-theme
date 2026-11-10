import { describe, expect, it, vi } from 'vitest';
import {
  findPreviewImage,
  hasImageScales,
  resolveEffectivePreview,
  resolveImageDescription,
  resolveImageTitle,
  resolveImageUrl,
  resolveMainImage,
  resolvePageContent,
  resolveThemeStyle,
  unwrapCandidate,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/MainImageBlock/helpers';

vi.mock(
  '@plone/volto/components/manage/Blocks/Listing/default-image.svg',
  () => ({
    default: 'placeholder.svg',
  }),
);

describe('unwrapCandidate / findPreviewImage', () => {
  it('unwraps the first array entry', () => {
    expect(unwrapCandidate([[{ a: 1 }]])).toEqual({ a: 1 });
    expect(unwrapCandidate([])).toBeUndefined();
  });

  it('returns the first source with a preview', () => {
    const scaled = { image_scales: { image: [] } };
    expect(
      findPreviewImage([{}, undefined, { preview_image: ['p'] }, scaled]),
    ).toBe('p');
    expect(findPreviewImage([{}, scaled])).toBe(scaled);
    expect(findPreviewImage([{}, null, 'string'])).toBeUndefined();
  });
});

describe('resolvePageContent', () => {
  it('takes the first non-empty object, then the state content', () => {
    expect(resolvePageContent({}, { a: 1 }, { b: 2 }, { c: 3 })).toEqual({
      a: 1,
    });
    expect(resolvePageContent(undefined, {}, {}, { c: 3 })).toEqual({ c: 3 });
    expect(resolvePageContent(undefined, undefined, undefined, null)).toEqual(
      {},
    );
  });
});

describe('resolveThemeStyle', () => {
  it('uses an object theme as is, otherwise the resolved style', () => {
    const resolved = { color: 'red' };
    expect(resolveThemeStyle({ theme: { color: 'blue' } }, resolved)).toEqual({
      color: 'blue',
    });
    expect(
      resolveThemeStyle({ styles: { theme: { color: 'green' } } }, resolved),
    ).toEqual({ color: 'green' });
    expect(resolveThemeStyle({ theme: 'dark' }, resolved)).toBe(resolved);
  });
});

describe('resolveEffectivePreview', () => {
  it('keeps a found preview', () => {
    expect(resolveEffectivePreview('img', {}, {})).toBe('img');
  });

  it('builds a placeholder when there is text to show', () => {
    expect(
      resolveEffectivePreview(
        undefined,
        {},
        { title: 'Page', description: 'D' },
      ),
    ).toEqual({
      title: 'Page',
      description: 'D',
      url: 'placeholder.svg',
      download: 'placeholder.svg',
    });
  });

  it('is undefined with nothing to show', () => {
    expect(resolveEffectivePreview(undefined, {}, {})).toBeUndefined();
  });
});

describe('title and description', () => {
  it('prefer the block values over the preview and page', () => {
    expect(resolveImageTitle({ title: 'B' }, { title: 'P' }, {})).toBe('B');
    expect(resolveImageTitle({ title: '' }, { title: 'P' }, {})).toBe('P');
    expect(resolveImageTitle({}, {}, { title: 'Page' })).toBe('Page');
    expect(resolveImageDescription({ description: 'B' }, {}, {})).toBe('B');
    expect(
      resolveImageDescription(
        {},
        { description: 'P' },
        { preview_caption: 'C', description: 'Page' },
      ),
    ).toBe('C');
    expect(resolveImageDescription({}, {}, {})).toBe('');
  });
});

describe('hasImageScales', () => {
  it('checks the scales of the field in use', () => {
    const preview = { image_scales: { image: [{}] } };
    expect(hasImageScales(preview, undefined)).toBe(true);
    expect(hasImageScales(preview, 'image')).toBe(true);
    expect(hasImageScales(preview, 'preview_image')).toBe(false);
    expect(hasImageScales('url', 'image')).toBe(false);
    expect(hasImageScales({}, 'image')).toBe(false);
  });
});

describe('resolveImageUrl', () => {
  it('reads string previews and nested urls, defaulting to the placeholder', () => {
    expect(resolveImageUrl('/a.png', {})).toBe('/a.png');
    expect(resolveImageUrl({ download: '/d.png' }, {})).toBe('/d.png');
    expect(resolveImageUrl({ image: { download: '/i.png' } }, {})).toBe(
      '/i.png',
    );
    expect(resolveImageUrl({ url: [{ '@id': '/x' }] }, {})).toBe('/x');
    expect(resolveImageUrl({}, {})).toBe('placeholder.svg');
  });
});

describe('resolveMainImage', () => {
  it('passes a scaled preview as item', () => {
    const preview = {
      title: 'P',
      image_field: 'image',
      image_scales: { image: [{}] },
    };
    expect(resolveMainImage({}, preview, {})).toEqual({
      title: 'P',
      description: '',
      alt: 'P',
      imageField: 'image',
      item: preview,
      src: undefined,
    });
  });

  it('passes a plain url as src, with alt text fallbacks', () => {
    expect(
      resolveMainImage({ altText: 'Alt' }, '/a.png', { preview_image_link: 1 }),
    ).toMatchObject({ alt: 'Alt', imageField: undefined, src: '/a.png' });
    expect(resolveMainImage({}, '/a.png', {})).toMatchObject({
      alt: 'Imagem principal',
      imageField: 'preview_image',
      item: undefined,
    });
  });
});
