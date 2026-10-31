import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const THEME_DIR = path.resolve(__dirname, '../../..');

function readThemeFile(relPath: string): string {
  return fs.readFileSync(path.join(THEME_DIR, relPath), 'utf8');
}

describe('Listing Block Variations & Responsiveness SCSS', () => {
  it('Summary variation: overrides min-width on small screens', () => {
    const listingScss = readThemeFile('theme/blocks/_listing.scss');

    // Must target summary variation and unset min-width on small screens
    expect(listingScss).toMatch(/&?\.summary/);
    expect(listingScss).toContain('min-width: unset !important');
    expect(listingScss).toContain('max-width: 100% !important');
  });

  it('Listing headline and body: resets lateral margins to avoid stacking with parent block width', () => {
    const listingScss = readThemeFile('theme/blocks/_listing.scss');
    const headlineScss = readThemeFile('theme/blocks/listing/_headline.scss');

    // In _listing.scss, .listing-headline-wrapper and .listing-body have margins set to 0
    expect(listingScss).toMatch(
      /\.listing-headline-wrapper,\s*\.listing-body\s*\{[^}]*margin-right:\s*0\s*!important/s,
    );
    expect(listingScss).toMatch(
      /\.listing-headline-wrapper,\s*\.listing-body\s*\{[^}]*margin-left:\s*0\s*!important/s,
    );

    // In _headline.scss, adjustMarginsToContainer should NOT be called on headline wrapper
    expect(headlineScss).not.toContain('adjustMarginsToContainer');
    expect(headlineScss).toContain('margin-left: 0 !important');
    expect(headlineScss).toContain('margin-right: 0 !important');
  });

  it('Image Gallery variation: removes bottom border and includes card padding between image and text', () => {
    const gridScss = readThemeFile('theme/blocks/listing/_grid.scss');

    // Must include imageGallery alongside grid
    expect(gridScss).toContain('&.imageGallery');

    // Must remove bottom border on listing-item
    expect(gridScss).toMatch(
      /\.listing-item[^}]*border-bottom:\s*none\s*!important/s,
    );

    // Must have padding on card-summary and top padding after item-image
    expect(gridScss).toContain(
      'padding: $spacing-medium $spacing-small !important',
    );
    expect(gridScss).toContain('.item-image + .card-summary');
  });

  it('Listing inside Grid Block / Contained: resets lateral margins across all screen sizes without forcing width: 100%', () => {
    const listingScss = readThemeFile('theme/blocks/_listing.scss');
    const blockWidthScss = readThemeFile('theme/blocks/_blockWidth.scss');

    // Must target custom-grid and gridBlock and contained
    expect(listingScss).toContain('.custom-grid');
    expect(listingScss).toContain('.gridBlock');
    expect(listingScss).toContain('.block.listing.contained');

    // Must reset margins inside grid and for contained blocks
    expect(listingScss).toMatch(
      /(margin-left:\s*0\s*!important;\s*margin-right:\s*0\s*!important|margin-right:\s*0\s*!important;\s*margin-left:\s*0\s*!important)/,
    );
    // Must NOT force width: 100% on the block inside grid
    expect(listingScss).toContain('width: auto !important');
    expect(listingScss).toContain('align-self: stretch');

    // _blockWidth.scss must exclude contained and grid column blocks from applying blockWidth margins
    expect(blockWidthScss).toContain(':not(.contained)');
    expect(blockWidthScss).toContain('.block.contained');
  });

  it('Carousel and Media Carousel: stretches naturally without width: 100% and contains full width on small screens', () => {
    const carouselScss = readThemeFile('theme/blocks/listing/_carousel.scss');
    const listingScss = readThemeFile('theme/blocks/_listing.scss');

    // Carousel uses stretch on flex container without hardcoding width: 100%
    expect(carouselScss).toContain('align-self: stretch');
    expect(carouselScss).toContain('width: auto');

    // Full width containment: prevents breaking out of screen
    expect(carouselScss).toContain('&.has--block-width--full');
    expect(carouselScss).toContain('box-sizing: border-box !important');
    expect(carouselScss).toContain('overflow-x: hidden');

    expect(listingScss).toContain('.block.listing.has--block-width--full');
    expect(listingScss).toContain('box-sizing: border-box !important');
  });

  it('Standalone Grid & Image Gallery: never unsets margins or max-width on the block wrapper itself', () => {
    const listingScss = readThemeFile('theme/blocks/_listing.scss');

    // #page-document .blocks-group-wrapper > .block.listing must NOT target &.grid or &.imageGallery with unset margins
    expect(listingScss).not.toMatch(
      /#page-document\s+\.blocks-group-wrapper\s*>\s*\.block\.listing\s*\{[^}]*&(?:\.grid|\.imageGallery|\.image-gallery)/s,
    );
  });

  it('Highlight (Teaser) variation: resets lateral image margins, supports container queries and responsive stacking', () => {
    const listingScss = readThemeFile('theme/blocks/_listing.scss');
    const teaserScss = readThemeFile('theme/blocks/listing/_teaser.scss');

    // Must import listing/teaser in _listing.scss
    expect(listingScss).toContain("@import 'listing/teaser';");

    // Must define container-type: inline-size
    expect(teaserScss).toContain('container-type: inline-size;');

    // Must reset image-wrapper margins to prevent overflow beyond 100%
    expect(teaserScss).toContain('margin: 0 !important;');

    // Must contain min-width: 0 and box-sizing for flex children
    expect(teaserScss).toContain('min-width: 0;');
    expect(teaserScss).toContain('box-sizing: border-box;');

    // Must support alignments: left, right, center
    expect(teaserScss).toContain('&.has--align--left');
    expect(teaserScss).toContain('&.has--align--right');
    expect(teaserScss).toContain('&.has--align--center');
    expect(teaserScss).toContain('flex-direction: row-reverse');

    // Must support container query and media query stacking
    expect(teaserScss).toContain(
      '@container (max-width: #{$largest-mobile-screen})',
    );
    expect(teaserScss).toContain(
      '@media (max-width: #{$largest-mobile-screen})',
    );

    // Must support card borders via --cardBorderColor and --cardBorderWidth
    expect(teaserScss).toContain('--cardBorderColor');
    expect(teaserScss).toContain('--cardBorderWidth');
  });

  it('Events variation: uses theme variables and supports container queries for compact grids', () => {
    const eventsScss = readThemeFile('theme/blocks/listing/_events.scss');

    // Must define container-type: inline-size
    expect(eventsScss).toContain('container-type: inline-size;');

    // Must use theme tokens
    expect(eventsScss).toContain('var(--theme-foreground-color');
    expect(eventsScss).toContain('var(--theme-low-contrast-foreground-color)');
    expect(eventsScss).toContain('var(--theme-foreground-accent-color)');
    expect(eventsScss).toContain('var(--colorgroup-back-font');

    // Must support container queries for compact grids (640px and 320px)
    expect(eventsScss).toContain('@container (max-width: 640px)');
    expect(eventsScss).toContain('@container (max-width: 320px)');
    expect(eventsScss).toContain('min-width: 0;');
  });

  it('GridBlock and Contained Listings: enforces column widths and resets flex containers in edit mode', () => {
    const listingScss = readThemeFile('theme/blocks/_listing.scss');
    const blockWidthScss = readThemeFile('theme/blocks/_blockWidth.scss');

    // _blockWidth.scss must not force width: auto on editor cell wrappers
    expect(blockWidthScss).toContain(
      ".contained:not([class*='block-editor-'])",
    );

    // _listing.scss must enforce column widths in edit mode
    expect(listingScss).toContain('.block-editor-gridBlock');
    expect(listingScss).toContain("&.two [class*='block-editor-']");
    expect(listingScss).toContain("&.three [class*='block-editor-']");
    expect(listingScss).toContain("&.four [class*='block-editor-']");
    expect(listingScss).toContain('.block-editor-listing.contained');
  });

  it('Event Calendar: supports theme tokens, container queries and small div adaptation', () => {
    const calendarScss = readThemeFile('theme/blocks/_eventCalendar.scss');

    // Must define container-type
    expect(calendarScss).toContain('container-type: inline-size;');

    // Must use theme tokens for date-inset and cards
    expect(calendarScss).toContain('.date-inset');
    expect(calendarScss).toContain('var(--theme-foreground-accent-color');
    expect(calendarScss).toContain('var(--theme-high-contrast-color');
    expect(calendarScss).toContain('var(--theme-top-foreground-color');

    // Must support container queries for small div / narrow container
    expect(calendarScss).toContain('@container (max-width: 420px)');
    expect(calendarScss).toContain('@container (max-width: 720px)');

    // Must adapt inside custom-grid columns without clipping the container
    expect(calendarScss).toContain(':is(.custom-grid-column, .column)');
    expect(calendarScss).toContain('overflow: visible !important;');
    expect(calendarScss).not.toMatch(
      /:is\([^)]+\)\s+\.block\.eventCalendar\s*\{[^}]*overflow:\s*hidden/,
    );
  });

  it('Accordion Block: title background matches theme background and active states', () => {
    const accordionScss = readThemeFile('theme/blocks/_accordion.scss');

    expect(accordionScss).toContain('.title.accordion-title');
    expect(accordionScss).toContain(
      'background-color: var(--theme-color, transparent) !important;',
    );
    expect(accordionScss).toContain('&.active');
    expect(accordionScss).toContain('.block.eventCalendar');
    expect(accordionScss).toContain('border: none !important;');
    expect(accordionScss).toContain('font-size: 1.25rem !important;');
  });

  it('Custom Grid: sidebar column settings and narrow column padding', () => {
    const customGridScss = readThemeFile('theme/blocks/_customGrid.scss');

    expect(customGridScss).toContain('.custom-grid-sidebar-column');
    expect(customGridScss).toContain('.ui.segment.custom-grid-sidebar-header');
    expect(customGridScss).toContain('min-width: 0;');
  });
});
