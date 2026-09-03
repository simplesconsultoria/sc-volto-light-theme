/**
 * Listing items shared by the listing-variation stories.
 *
 * Shaped like what `@querystring-search` returns for a listing block: only the
 * fields the templates actually read are present, and `@id` values are already
 * flattened to app-relative URLs the way the reducer leaves them.
 *
 * Not a `*.stories.*` file, so Storybook does not try to render it.
 */

import listing01 from '../../../storybook/images/listing-01.jpg';
import listing02 from '../../../storybook/images/listing-02.jpg';
import listing03 from '../../../storybook/images/listing-03.jpg';
import listing04 from '../../../storybook/images/listing-04.jpg';
import listing05 from '../../../storybook/images/listing-05.jpg';
import listing06 from '../../../storybook/images/listing-06.jpg';

import { imageScales } from '../../../storybook/images/imageScales';

type ListingItem = Record<string, any>;

/**
 * Photography bundled with the package, so cards render with no backend and no
 * network behind Storybook.
 *
 * This still exercises the `base_path` branch of Volto's `Image` — the same one
 * `preview_image_link` takes on a real site — because :func:`imageScales` splits
 * the imported URL across `base_path` and `download` exactly as the API would.
 */
const image = (url: string) => ({
  image_field: 'preview_image',
  image_scales: { preview_image: [imageScales(url)] },
});

export const listingItems: ListingItem[] = [
  {
    '@id': '/news/budget-hearing-draws-a-full-room',
    '@type': 'News Item',
    id: 'budget-hearing-draws-a-full-room',
    title: 'Budget hearing draws a full room',
    head_title: 'Public finance',
    description:
      'Residents filled the chamber to question next year’s spending plan, with most of the debate turning on transport.',
    effective: '2026-08-14T10:00:00+00:00',
    ...image(listing01),
  },
  {
    '@id': '/documents/open-data-policy',
    '@type': 'Document',
    id: 'open-data-policy',
    title: 'The open data policy, explained',
    head_title: 'Transparency',
    description:
      'What the new policy covers, which datasets are published first, and how to request one that is missing.',
    effective: '2026-07-30T09:30:00+00:00',
    ...image(listing02),
  },
  {
    '@id': '/events/accessibility-workshop',
    '@type': 'Event',
    id: 'accessibility-workshop',
    title: 'Accessibility workshop for content editors',
    head_title: 'Training',
    description:
      'A hands-on session on alt text, heading structure and colour contrast, aimed at anyone who publishes to the site.',
    effective: '2026-09-05T13:00:00+00:00',
    // upstream's `EventSummary` reads these; without them it throws
    start: '2026-09-05T13:00:00+00:00',
    end: '2026-09-05T16:00:00+00:00',
    ...image(listing03),
  },
  {
    '@id': '/documents/annual-report-2025',
    '@type': 'File',
    id: 'annual-report-2025',
    title: 'Annual report 2025',
    head_title: 'Publications',
    description:
      'The full year in review, including the audited accounts and the service performance figures.',
    effective: '2026-06-18T08:00:00+00:00',
    ...image(listing04),
  },
  {
    '@id': '/news/library-reopens-after-refurbishment',
    '@type': 'News Item',
    id: 'library-reopens-after-refurbishment',
    title: 'Library reopens after refurbishment',
    head_title: 'Culture',
    description:
      'Longer opening hours, a new study area and a lift to the first floor.',
    effective: '2026-05-22T11:15:00+00:00',
    ...image(listing05),
  },
  {
    '@id': '/documents/how-to-request-a-service',
    '@type': 'Document',
    id: 'how-to-request-a-service',
    title: 'How to request a service',
    head_title: 'Guides',
    description:
      'The three routes available, what each one needs from you, and the expected turnaround.',
    effective: '2026-04-09T16:45:00+00:00',
    ...image(listing06),
  },
];

/**
 * Items carrying a `videoUrl`, which is what `MediaCarouselTemplate` switches
 * on to render an embed rather than an image.
 */
export const mediaItems: ListingItem[] = [
  {
    ...listingItems[0],
    '@id': '/media/council-meeting-recording',
    title: 'Council meeting, full recording',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  },
  {
    ...listingItems[2],
    '@id': '/media/accessibility-workshop-recap',
    title: 'Accessibility workshop, recap',
    videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
  },
  {
    ...listingItems[4],
    '@id': '/media/library-tour',
    title: 'A tour of the refurbished library',
  },
];

/** A single item, for isolating the one-card layouts. */
export const singleItem: ListingItem[] = [listingItems[0]];
