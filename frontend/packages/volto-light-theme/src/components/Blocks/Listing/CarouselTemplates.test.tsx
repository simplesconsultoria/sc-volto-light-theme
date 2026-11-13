import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import CarouselTemplate from './CarouselTemplate';
import MediaCarouselTemplate from './MediaCarouselTemplate';

vi.mock('@plone/volto/registry', () => ({
  default: {
    settings: { apiPath: 'http://localhost:3000' },
    getComponent: () => ({ component: undefined }),
  },
}));
vi.mock(
  '@plone/volto/components/manage/ConditionalLink/ConditionalLink',
  () => ({
    default: ({ to, className, children }: any) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  }),
);

const items = ['first', 'second', 'third'].map((id) => ({
  '@id': `/news/${id}`,
  title: `The ${id} item`,
}));

const TEMPLATES: [string, React.FC<any>, string][] = [
  ['CarouselTemplate', CarouselTemplate, 'Carousel'],
  ['MediaCarouselTemplate', MediaCarouselTemplate, 'Media Carousel'],
];

function renderTemplate(Template: React.FC<any>) {
  return render(
    <IntlProvider locale="en" messages={{}}>
      <Template items={items} isEditMode={false} />
    </IntlProvider>,
  );
}

describe.each(TEMPLATES)('%s', (_name, Template, label) => {
  it('labels the viewport as a carousel region', () => {
    renderTemplate(Template);
    const viewport = screen.getByRole('region', { name: label });
    expect(viewport).toHaveClass('listing-carousel__viewport');
    expect(viewport).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('makes only the inactive slides inert and hidden', () => {
    const { container } = renderTemplate(Template);
    const slides = Array.from(
      container.querySelectorAll('.listing-carousel__slide'),
    );
    expect(slides).toHaveLength(items.length);

    const [active, ...inactive] = slides;
    expect(active).not.toHaveAttribute('inert');
    expect(active).not.toHaveAttribute('aria-hidden');
    inactive.forEach((slide) => {
      expect(slide).toHaveAttribute('inert');
      expect(slide).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

it('keeps the links of inactive slides out of reach', () => {
  const { container } = renderTemplate(CarouselTemplate);
  const links = container.querySelectorAll('a.listing-carousel__slideLink');
  expect(links).toHaveLength(items.length);
  const reachable = Array.from(links).filter(
    (link) => !link.closest('[inert]'),
  );
  expect(reachable.map((link) => link.getAttribute('href'))).toEqual([
    '/news/first',
  ]);
});
