/**
 * Content objects for the page-level view stories.
 *
 * Shaped like what `plone.restapi` serves for a single item: the blocks live in
 * `blocks` keyed by id with the order in `blocks_layout.items`, which is what
 * `RenderBlocks` walks.
 *
 * These exist to show the add-on's blocks *composed on a page* rather than in
 * isolation — spacing between blocks, the container widths, and the way a
 * listing sits under a hero are only visible here.
 *
 * Not a `*.stories.*` file, so Storybook does not try to render it.
 */

import { listingItems } from '../components/Blocks/Listing/fixtures';
import { imageGrid, socialBlocks } from './galleryFixtures';

/** Block ids, named rather than UUID so the layout below stays readable. */
export const blockIds = {
  title: 'b1-title',
  byline: 'b2-byline',
  mainImage: 'b3-main-image',
  intro: 'b4-intro',
  hero: 'b5-hero',
  quote: 'b6-quote',
  body: 'b7-body',
  listing: 'b8-listing',
  grid: 'b9-grid',
  social: 'b10-social',
};

/** A Slate value — the shape the `slate` block stores in `value`. */
const slate = (text: string) => [{ type: 'p', children: [{ text }] }];

/**
 * The image the `mainImageBlock` reads off the content item.
 *
 * `base_path` carries the external host so the scales resolve without a
 * backend — see the note in `Blocks/Listing/fixtures.ts`.
 */
const previewImageLink = {
  '@id': '/annual-review/preview-image',
  '@type': 'Image',
  title: 'Council chamber during a public session',
  image_field: 'image',
  image_scales: {
    image: [
      {
        base_path: 'https://picsum.photos/seed/page-hero',
        download: '1600/900',
        width: 1600,
        height: 900,
        scales: {
          preview: { download: '400/225', width: 400, height: 225 },
          large: { download: '1200/675', width: 1200, height: 675 },
        },
      },
    ],
  },
};

export const documentUID = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';

/** A Document exercising every block the add-on ships. */
export const pageContent: Record<string, any> = {
  '@id': '/annual-review',
  '@type': 'Document',
  UID: documentUID,
  id: 'annual-review',
  title: 'Annual review',
  description:
    'What changed this year across services, budgets and the way decisions are taken.',
  creators: ['Comms team'],
  effective: '2026-08-20T09:00:00+00:00',
  modified: '2026-08-28T17:30:00+00:00',
  preview_image_link: previewImageLink,
  blocks_layout: {
    items: [
      blockIds.title,
      blockIds.byline,
      blockIds.mainImage,
      blockIds.intro,
      blockIds.hero,
      blockIds.quote,
      blockIds.body,
      blockIds.grid,
      blockIds.listing,
      blockIds.social,
    ],
  },
  blocks: {
    [blockIds.title]: { '@type': 'title' },
    [blockIds.byline]: {
      '@type': 'documentByline',
      showPublished: true,
      showModified: true,
      showAuthor: true,
    },
    [blockIds.mainImage]: {
      '@type': 'mainImageBlock',
      align: 'full',
      size: 'l',
      title: 'A year of public sessions',
      description: 'Attendance rose by a third on the previous year.',
      theme: 'default',
    },
    [blockIds.intro]: {
      '@type': 'slate',
      value: slate(
        'This review sets out what the organisation did over the past twelve months, what it cost, and what is planned next. Figures are drawn from the audited accounts published alongside it.',
      ),
    },
    [blockIds.hero]: {
      '@type': 'heroBlock',
      variation: 'flex',
      overwrite: true,
      title: 'Budget hearing draws a full room',
      description:
        'Residents filled the chamber to question next year’s spending plan.',
      headerText: 'In focus',
      footerText: 'Reported 14 August 2026',
      button: true,
      buttonText: 'Read the full report',
      showDate: true,
      tags: ['Policy', 'Community'],
      textSide: 'left',
      imageSize: '50%',
      imageFit: 'cover',
      blockWidth: 'layout',
      titleTag: 'h2',
      href: [listingItems[0]],
      theme: 'default',
    },
    [blockIds.quote]: {
      '@type': 'quoteBlock',
      backgroundStyle: 'filled',
      author: 'Chair of the review panel',
      value: slate(
        'The test of a review like this is whether someone outside the organisation can follow the reasoning. That is what we set out to make possible.',
      ),
      theme: 'brand',
    },
    [blockIds.body]: {
      '@type': 'slate',
      value: slate(
        'Each section below links to the underlying data. Where a figure is provisional it is marked as such, and the date it was last revised is given.',
      ),
    },
    [blockIds.grid]: {
      '@type': 'gridBlock',
      theme: 'default',
      ...imageGrid(3),
    },
    // One representative embed. The rest have their own stories and the
    // `Blocks/Gallery` Embeds view; stacking eleven third-party iframes on one
    // page would say more about those services than about this theme.
    [blockIds.social]: {
      '@type': 'blueskyBlock',
      ...socialBlocks.blueskyBlock,
    },
    [blockIds.listing]: {
      '@type': 'listing',
      variation: 'grid',
      gridColumns: 3,
      headlineButtonText: 'See all publications',
      // `hasQuery` in `withQuerystringResults` is `querystring.query.length > 0`.
      // With an empty query the block takes the *folder* path and ignores the
      // store entirely, so real criteria are what make `pageStore` take effect.
      querystring: {
        query: [
          {
            i: 'portal_type',
            o: 'plone.app.querystring.operation.selection.any',
            v: ['News Item', 'Document', 'Event', 'File'],
          },
        ],
        sort_on: 'effective',
        sort_order: 'reverse',
      },
      theme: 'default',
    },
  },
};

/**
 * Store state the listing block needs.
 *
 * `withQuerystringResults` reads `state.querystringsearch.subrequests` under
 * `${content.UID}-${blockId}`, so seeding that key is what makes the listing
 * render results instead of an empty state.
 */
export const pageStore = {
  querystringsearch: {
    subrequests: {
      [`${documentUID}-${blockIds.listing}`]: {
        loading: false,
        loaded: true,
        error: null,
        items: listingItems,
        total: listingItems.length,
        batching: {},
      },
    },
  },
  content: { data: pageContent },
};

/** A News Item, to show the byline and hero against a different type. */
export const newsContent: Record<string, any> = {
  ...pageContent,
  '@id': '/news/library-reopens-after-refurbishment',
  '@type': 'News Item',
  id: 'library-reopens-after-refurbishment',
  title: 'Library reopens after refurbishment',
  description:
    'Longer opening hours, a new study area and a lift to the first floor.',
  blocks_layout: {
    items: [
      blockIds.title,
      blockIds.byline,
      blockIds.mainImage,
      blockIds.intro,
      blockIds.quote,
    ],
  },
};

/**
 * An Event, built from the initial blocks upstream VLT defines for the type.
 *
 * `config.blocks.initialBlocks.Event` is `title`, `eventMetadata` (marked
 * `fixed` and `required`, so an editor cannot remove it) and `slate` — see
 * `@kitconcept/volto-light-theme/config/blocks.tsx`. The distinct look comes
 * from `eventMetadata`, which reads the *content item's* scheduling fields
 * rather than any block data of its own.
 */
export const eventContent: Record<string, any> = {
  '@id': '/events/accessibility-workshop',
  '@type': 'Event',
  UID: 'e1f2a3b4c5d60718293a4b5c6d7e8f01',
  id: 'accessibility-workshop',
  title: 'Accessibility workshop for content editors',
  description:
    'A hands-on session on alt text, heading structure and colour contrast, aimed at anyone who publishes to the site.',
  creators: ['Comms team'],
  effective: '2026-08-01T09:00:00+00:00',
  modified: '2026-08-12T14:00:00+00:00',
  // Fields `eventMetadata` renders
  start: '2026-09-05T13:00:00+00:00',
  end: '2026-09-05T16:00:00+00:00',
  whole_day: false,
  open_end: false,
  location: 'Council chamber, ground floor',
  event_url: 'https://example.org/events/accessibility-workshop',
  contact_name: 'Training team',
  contact_email: 'training@example.org',
  contact_phone: '+55 11 5555 0100',
  preview_image_link: previewImageLink,
  blocks_layout: {
    items: [blockIds.title, 'ev-metadata', blockIds.intro, blockIds.quote],
  },
  blocks: {
    [blockIds.title]: { '@type': 'title' },
    'ev-metadata': { '@type': 'eventMetadata', fixed: true, required: true },
    [blockIds.intro]: {
      '@type': 'slate',
      value: slate(
        'Bring a laptop. The session is capped at twenty places and runs to three hours with a short break.',
      ),
    },
    [blockIds.quote]: {
      '@type': 'quoteBlock',
      backgroundStyle: 'transparent',
      author: 'Previous attendee',
      theme: 'default',
      value: slate(
        'I had been publishing for two years and still learned something in the first ten minutes.',
      ),
    },
  },
};
