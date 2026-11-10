import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import LogosContainer from './LogosContainer';

vi.mock('@plone/volto/helpers/Url/Url', () => ({
  flattenToAppURL: (url: string) =>
    url?.replace('http://localhost:8080/Plone', '') || url,
}));

vi.mock(
  '@plone/volto/components/manage/ConditionalLink/ConditionalLink',
  () => ({
    default: ({ condition, to, title, children }: any) =>
      condition ? (
        <a href={to} title={title}>
          {children}
        </a>
      ) : (
        <>{children}</>
      ),
  }),
);

vi.mock('@plone/components', () => ({
  Container: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

describe('LogosContainer', () => {
  it('renders logos with full image_scales and image_field', () => {
    const logos = [
      {
        '@id': 'logo-1',
        title: 'Partner 1',
        href: [{ '@id': '/partner-1', title: 'Partner 1' }],
        logo: [
          {
            '@id': '/images/p1',
            title: 'Partner 1',
            image_field: 'image',
            image_scales: {
              image: [{ download: '@@images/image.png' }],
            },
          },
        ],
      },
    ] as any;

    const { container } = render(
      <LogosContainer
        logos={logos}
        logos_size="m"
        logos_container_width="default"
      />,
    );

    const img = container.querySelector('img.logo-image') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/images/p1/@@images/image.png');
  });

  it('handles missing image_field without throwing TypeError', () => {
    const logos = [
      {
        '@id': 'logo-2',
        title: 'Partner 2',
        href: [{ '@id': '/partner-2', title: 'Partner 2' }],
        logo: [
          {
            '@id': '/images/p2',
            title: 'Partner 2',
            // image_field is deliberately omitted
            image_scales: {
              image: [{ download: '@@images/custom_scale.png' }],
            },
          },
        ],
      },
    ] as any;

    const { container } = render(
      <LogosContainer
        logos={logos}
        logos_size="m"
        logos_container_width="default"
      />,
    );

    const img = container.querySelector('img.logo-image') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe(
      '/images/p2/@@images/custom_scale.png',
    );
  });

  it('falls back to @@images/image when image_scales has no scale for field', () => {
    const logos = [
      {
        '@id': 'logo-3',
        title: 'Partner 3',
        logo: [
          {
            '@id': '/images/p3',
            // image_scales is empty
            image_scales: {},
          },
        ],
      },
    ] as any;

    const { container } = render(
      <LogosContainer
        logos={logos}
        logos_size="m"
        logos_container_width="default"
      />,
    );

    const img = container.querySelector('img.logo-image') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/images/p3/@@images/image');
  });
});
