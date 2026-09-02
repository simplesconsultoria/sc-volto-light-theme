/**
 * Sample block data for the blocks gallery.
 *
 * Keyed by block id, merged over `{ '@type': id }`. Only the fields a block's
 * view actually reads are set; anything absent from this map renders with a bare
 * type, which is still useful — it shows the block's empty state.
 *
 * Deliberately conservative: a guessed shape that silently renders nothing is
 * worse than an honest empty state, so shapes here are ones taken from the
 * block's own view or schema rather than assumed.
 *
 * Not a `*.stories.*` file, so Storybook does not try to render it.
 */

import { listingItems } from '../components/Blocks/Listing/fixtures';

/** A Slate value — `[{ type, children }]`. */
const slate = (text: string) => [{ type: 'p', children: [{ text }] }];

const IMAGE = {
  base_path: 'https://picsum.photos/seed/gallery',
  download: '1200/675',
  width: 1200,
  height: 675,
  scales: {
    preview: { download: '400/225', width: 400, height: 225 },
    large: { download: '1000/563', width: 1000, height: 563 },
  },
};

/** An item shaped for the blocks that take an `href` to another object. */
const linkedItem = {
  ...listingItems[0],
  image_field: 'preview_image',
  image_scales: { preview_image: [IMAGE] },
};

/**
 * A grid of `image` blocks, `count` wide.
 *
 * `gridBlock` nests real blocks under its own `blocks` / `blocks_layout`, and
 * core caps it at `maxLength: 4`. Each cell gets a distinct seed so the columns
 * are visually distinguishable.
 */
export function imageGrid(count: number): Record<string, any> {
  const ids = Array.from({ length: count }, (_, i) => `grid-cell-${i + 1}`);
  return {
    blocks: Object.fromEntries(
      ids.map((id, i) => [
        id,
        {
          '@type': 'image',
          url: `https://picsum.photos/seed/grid-${i + 1}/800/600`,
          alt: `Placeholder photograph ${i + 1}`,
          title: `Column ${i + 1}`,
          description: 'A short caption under the image.',
        },
      ]),
    ),
    blocks_layout: { items: ids },
  };
}

/**
 * Sample data for the social embed blocks, taken from each block's own story in
 * `@kitconcept/volto-social-blocks` rather than invented — those are the URLs
 * and ids the block authors test against.
 */
export const socialBlocks: Record<string, Record<string, any>> = {
  blueskyBlock: {
    blueskyUrl: 'https://bsky.app/profile/plone.org/post/3mddkocpicz2t',
    align: 'center',
    size: 'l',
    colorMode: 'system',
  },
  facebookBlock: {
    facebookId:
      'https://m.facebook.com/story.php?story_fbid=pfbid08AKg1aseCjJek1nrRL8hXRCFe6v645pJt15as4Vm1YG2MjoGkFZ1biA6hmHX6qfql&id=100067147516508',
    align: 'center',
    size: 'l',
  },
  instagramBlock: {
    instagramId: 'https://www.instagram.com/p/CjTBnwju6XY/',
    captioned: true,
    align: 'center',
    size: 'l',
  },
  linkedinBlock: {
    postURL:
      'https://www.linkedin.com/embed/feed/update/urn:li:share:7318254492443979777',
    align: 'center',
    size: 'l',
  },
  pinterestBlock: {
    pinterestUrl: 'https://www.pinterest.com/pin/99360735500167749/',
    align: 'center',
    size: 'm',
  },
  soundcloudBlock: {
    soundcloudId:
      'https://api.soundcloud.com/tracks/472694601&color=%23ff5500&auto_play=false&show_user=true&visual=true',
    align: 'center',
    size: 'l',
  },
  spotifyBlock: {
    spotifyId:
      'https://open.spotify.com/episode/0EPE3mFCbNUunN3PFUv1lT?si=1ef7ad30c07744c4',
    align: 'center',
    size: 'l',
  },
  tiktokBlock: {
    tiktokUrl: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    align: 'center',
  },
  tweetBlock: {
    tweetId: '1542568225527005184',
    align: 'center',
    size: 'l',
    theme: 'dark',
    lang: 'en',
    dnt: true,
  },
  flickrBlock: {
    flickrId:
      '<a data-flickr-embed="true" href="https://www.flickr.com/photos/plone-foundation/albums/72177720303069181" title="Plone Conference 2022 Namur"><img src="https://live.staticflickr.com/65535/52443622430_c442b75502.jpg" width="500" height="375" alt="Plone Conference 2022 Namur"/></a>',
    align: 'center',
  },
};

export const sampleBlocks: Record<string, Record<string, any>> = {
  title: {},
  description: {},
  slate: {
    value: slate(
      'A paragraph of body copy, so the block shows the theme typography rather than an empty box.',
    ),
  },
  detachedSlate: {
    value: slate('Detached slate renders outside the main text flow.'),
  },
  html: { html: '<p>Raw HTML block output.</p>' },
  // `@kitconcept/volto-separator-block`: block width, a short-line toggle, and
  // an alignment that the schema *disables* unless `shortLine` is on.
  separator: {
    styles: {
      'blockWidth:noprefix': 'default',
      shortLine: true,
      'align:noprefix': 'center',
    },
  },
  toc: { title: 'On this page' },
  __button: {
    title: 'Read the full report',
    href: [{ '@id': '/annual-review', title: 'Annual review' }],
  },
  teaser: {
    href: [linkedItem],
    title: linkedItem.title,
    description: linkedItem.description,
    head_title: linkedItem.head_title,
    preview_image: [linkedItem],
  },
  highlight: {
    href: [linkedItem],
    title: linkedItem.title,
    description: linkedItem.description,
  },
  image: {
    url: 'https://picsum.photos/seed/gallery/1200/675',
    alt: 'Placeholder photograph',
    align: 'center',
    size: 'l',
  },
  video: { url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
  listing: {
    variation: 'grid',
    gridColumns: 3,
    querystring: {
      query: [
        {
          i: 'portal_type',
          o: 'plone.app.querystring.operation.selection.any',
          v: ['News Item', 'Document'],
        },
      ],
    },
  },
  // `getPanels` maps `data.data.blocks_layout.items`; without `data.data` the
  // block throws "undefined is not iterable".
  accordion: {
    headline: 'Frequently asked questions',
    data: {
      blocks_layout: { items: ['acc-1', 'acc-2'] },
      blocks: {
        'acc-1': {
          '@type': 'accordionPanel',
          title: 'How do I request a service?',
          blocks_layout: { items: ['acc-1-body'] },
          blocks: {
            'acc-1-body': {
              '@type': 'slate',
              value: slate(
                'Three routes are available; each is described below.',
              ),
            },
          },
        },
        'acc-2': {
          '@type': 'accordionPanel',
          title: 'How long does it take?',
          blocks_layout: { items: ['acc-2-body'] },
          blocks: {
            'acc-2-body': {
              '@type': 'slate',
              value: slate(
                'Most requests are answered within ten working days.',
              ),
            },
          },
        },
      },
    },
  },
  // `TableBlockView` reads `data.table.rows[].cells[].value`, and the first row
  // is treated as the header.
  slateTable: {
    table: {
      hideHeaders: false,
      fixed: true,
      compact: false,
      basic: false,
      celled: true,
      inverted: false,
      striped: false,
      rows: [
        {
          key: 'r0',
          cells: [
            { key: 'r0c0', type: 'header', value: slate('Service') },
            { key: 'r0c1', type: 'header', value: slate('Turnaround') },
          ],
        },
        {
          key: 'r1',
          cells: [
            { key: 'r1c0', type: 'data', value: slate('Records request') },
            { key: 'r1c1', type: 'data', value: slate('10 working days') },
          ],
        },
        {
          key: 'r2',
          cells: [
            { key: 'r2c0', type: 'data', value: slate('Planning enquiry') },
            { key: 'r2c1', type: 'data', value: slate('21 working days') },
          ],
        },
      ],
    },
  },
  // The add-on's own blocks, so the gallery is complete on its own terms.
  documentByline: { showPublished: true, showModified: true, showAuthor: true },
  quoteBlock: {
    value: slate('A short quotation, attributed below.'),
    author: 'Attribution',
    backgroundStyle: 'filled',
  },
  mainImageBlock: {
    align: 'full',
    size: 'l',
    title: 'Main image',
    description: 'With a caption underneath.',
  },
  gridBlock: imageGrid(3),
  heroBlock: {
    variation: 'flex',
    overwrite: true,
    title: 'Hero block',
    description: 'Pulled from the highlighted item unless overwritten.',
    href: [linkedItem],
    textSide: 'left',
    imageSize: '50%',
    titleTag: 'h2',
  },
};

/**
 * Store state the gallery needs.
 *
 * The listing block reads `state.querystringsearch.subrequests` under
 * `${content.UID}-${blockId}`; the gallery gives every block the same content
 * UID, so only the listing's own key is needed.
 */
socialBlocks.followUsBlock = { animate: false };

Object.assign(sampleBlocks, socialBlocks);

export const galleryStore = {
  // `HighlightView` reads `state.content.subrequests[block]`; without the
  // `subrequests` key the lookup throws on `undefined`.
  content: { subrequests: {} },
  querystringsearch: {
    subrequests: {
      'gallery-uid-blk-listing': {
        loading: false,
        loaded: true,
        error: null,
        items: listingItems.slice(0, 3),
        total: 3,
        batching: {},
      },
    },
  },
};

/**
 * The content object every gallery block is rendered against.
 *
 * Several blocks read the *content item* rather than their own data — `title`
 * and `description` mirror the fields, `documentByline` reads the dates and
 * creators, `mainImageBlock` reads `preview_image_link`, and `leadimage` reads
 * `image`. Without these they render empty, which looks like a broken block
 * rather than missing data.
 */
export const galleryContent = {
  '@id': '/gallery',
  '@type': 'Document',
  UID: 'gallery-uid',
  title: 'Every block, one page',
  description:
    'A sample description, so the description block has something to show.',
  creators: ['Comms team'],
  effective: '2026-08-20T09:00:00+00:00',
  modified: '2026-08-28T17:30:00+00:00',
  preview_image_link: {
    '@id': '/gallery/preview',
    '@type': 'Image',
    title: 'Placeholder photograph',
    image_field: 'image',
    image_scales: { image: [IMAGE] },
  },
  image: { ...IMAGE, download: 'https://picsum.photos/seed/gallery/1200/675' },
  image_field: 'image',
  image_scales: { image: [IMAGE] },
  // `followUsBlock` reads its networks from the inherit expander rather than
  // from block data — `useNetworks` -> `useLiveData(content,
  // 'plonegovbr.socialmedia.settings', 'social_links')`.
  '@components': {
    inherit: {
      'plonegovbr.socialmedia.settings': {
        data: {
          social_links: [
            {
              id: 'facebook',
              title: 'Facebook',
              href: 'https://example.org/facebook',
            },
            {
              id: 'instagram',
              title: 'Instagram',
              href: 'https://example.org/instagram',
            },
            {
              id: 'linkedin',
              title: 'LinkedIn',
              href: 'https://example.org/linkedin',
            },
            {
              id: 'youtube',
              title: 'YouTube',
              href: 'https://example.org/youtube',
            },
          ],
        },
      },
    },
  },
};
