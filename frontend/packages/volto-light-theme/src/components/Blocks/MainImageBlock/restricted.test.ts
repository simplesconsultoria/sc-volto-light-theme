import { describe, it, expect } from 'vitest';
import MainImageBlockInfo from './index';

const restricted = MainImageBlockInfo.restricted as (args: {
  properties?: Record<string, any>;
}) => boolean;

describe('mainImageBlock restricted', () => {
  it('is restricted on an item without a preview image link', () => {
    expect(restricted({ properties: {} })).toBe(true);
  });

  it('is restricted when Plone serializes the link as null', () => {
    expect(restricted({ properties: { preview_image_link: null } })).toBe(true);
  });

  it('is restricted when the link is an empty list', () => {
    expect(restricted({ properties: { preview_image_link: [] } })).toBe(true);
  });

  it('is offered on an item with a preview image link', () => {
    expect(
      restricted({
        properties: { preview_image_link: [{ '@id': '/path/to/item' }] },
      }),
    ).toBe(false);
  });

  it('is restricted when the properties are missing', () => {
    expect(restricted({})).toBe(true);
  });
});
