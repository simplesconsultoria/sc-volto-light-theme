/**
 * The block-styling matrix every block story shares.
 *
 * Almost every block on this branch takes the same three editor controls, all
 * wired by `enhanceBlockConfig` in `config/blocks.ts`:
 *
 * - **Block theme** — `data.theme`, written by `block_theme_widget`: `default`,
 *   `alternative`, or `custom-<back>-<front>` pairing two Color Groups.
 * - **Block width** — `styles['blockWidth:noprefix']`, one of `narrow`,
 *   `default`, `layout` or `full`.
 * - **Border** — `styles['--cardBorderWidth']`, a CSS `border-width` string the
 *   `BorderWidget` builds, plus `styles['--cardBorderColor']`. Every block except
 *   `separator` (`DEFAULT_BORDER_EXCLUDED_BLOCKS`).
 *
 * None of these reach a block through its view's props: the theme is turned into
 * `has--theme--*` / `has-*-colorgroup-*` classes and a `.blocks-group-wrapper`,
 * the width into `has--block-width--*`, and the border into inline custom
 * properties — all by `RenderBlocks`, its `StyleWrapper` and the
 * `styleClassNameExtenders` in `index.ts`. So a story that renders a block's
 * `View` directly shows none of them. Everything here renders through the real
 * `RenderBlocks`, inside the `.q.container > #page-document` frame a page gives
 * it, because most width rules are scoped to `#page-document .blocks-group-wrapper`.
 *
 * Not a `*.stories.*` file, so Storybook does not try to render it.
 */

import React from 'react';
import type { Decorator, StoryObj } from '@storybook/react';
import Wrapper, { RealStoreWrapper } from '@plone/volto/storybook';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

import { VALID_BLOCK_WIDTHS } from '../helpers/blockWidth';
import type { BlockWidth } from '../helpers/blockWidth';
import {
  CSS_PATTERN_PRESETS,
  DEFAULT_COLOR_GROUPS,
} from '../config/blockThemes';
import { colorGroupCustomProperties } from '../helpers/themeStyles';
import { listingItems } from '../components/Blocks/Listing/fixtures';
import { galleryContent, galleryStore } from './galleryFixtures';

type BlockData = Record<string, any>;

/** The three kinds of block theme an editor can pick. */
export const THEME_SAMPLES = [
  { theme: 'default', label: 'default — primary back, neutral front' },
  { theme: 'alternative', label: 'alternative — accent back, primary front' },
  {
    theme: 'custom-secondary-accent',
    label: 'custom-secondary-accent — secondary back, accent front',
  },
] as const;

export const WIDTH_SAMPLES: readonly BlockWidth[] = VALID_BLOCK_WIDTHS;

/** Values in the shape `BorderWidget` writes them. */
export const BORDER_SAMPLES = [
  { label: 'all sides — 2px, theme color', width: '2px' },
  { label: 'bottom only — 0px 0px 3px 0px', width: '0px 0px 3px 0px' },
  {
    label: 'left only — 0px 0px 0px 6px, custom color',
    width: '0px 0px 0px 6px',
    color: '#c2255c',
  },
] as const;

const pattern = (id: string) =>
  CSS_PATTERN_PRESETS.find((p) => p.id === id) ?? CSS_PATTERN_PRESETS[0];

/**
 * Color Groups with a second background layer, as the Themes control panel
 * stores them (`ColorGroups/constants.ts`). The block theme picks which group is
 * the back and which the front, so the layer shows on the block ground or on its
 * cards respectively.
 */
const LAYER_SAMPLES = [
  {
    label: 'back layer — accent group with the "dots" pattern',
    theme: 'custom-accent-neutral',
    group: {
      ...DEFAULT_COLOR_GROUPS.accent,
      bg_image_light_desktop: pattern('dots').css,
      bg_size: pattern('dots').defaultSize,
      bg_repeat: pattern('dots').defaultRepeat,
      bg_position: pattern('dots').defaultPosition,
    },
  },
  {
    label: 'front layer — secondary group with the "grid" pattern',
    theme: 'custom-primary-secondary',
    group: {
      ...DEFAULT_COLOR_GROUPS.secondary,
      bg_image_light_desktop: pattern('grid').css,
      bg_size: pattern('grid').defaultSize,
      bg_repeat: pattern('grid').defaultRepeat,
      bg_position: pattern('grid').defaultPosition,
    },
  },
];

export interface StylingOptions {
  /** `data.theme`. */
  theme?: string;
  /** `styles['blockWidth:noprefix']`. */
  width?: BlockWidth;
  /** `styles['--cardBorderWidth']`. */
  border?: string;
  /** `styles['--cardBorderColor']`. */
  borderColor?: string;
}

/** Merge the styling controls into block data the way the sidebar stores them. */
export function applyStyling(
  data: BlockData,
  { theme, width, border, borderColor }: StylingOptions = {},
): BlockData {
  const styles = { ...(data.styles ?? {}) };
  if (width) styles['blockWidth:noprefix'] = width;
  if (border) styles['--cardBorderWidth'] = border;
  if (borderColor) styles['--cardBorderColor'] = borderColor;
  return { ...data, ...(theme ? { theme } : {}), styles };
}

/** Matrix samples are numbered so the store can be seeded for each of them. */
const MAX_SAMPLES = 12;
const sampleId = (index: number) => `story-block-${index}`;

export interface StyledBlockProps extends StylingOptions {
  /** The block's data, including its `@type`. */
  data: BlockData;
  /**
   * Blocks rendered after this one in the same content — what a TOC lists, or
   * the text a floated image sits beside. They keep their own theme and width.
   */
  extraBlocks?: BlockData[];
  /** The content item the block renders against. */
  content?: Record<string, any>;
  /** Position in a matrix; keeps block ids, and so store keys, distinct. */
  index?: number;
}

/** One block through `RenderBlocks`, without the page frame. */
function RenderedBlock({
  data,
  extraBlocks = [],
  content = galleryContent,
  index = 0,
  ...styling
}: StyledBlockProps) {
  const id = sampleId(index);
  const extraIds = extraBlocks.map((_, i) => `${id}-extra-${i}`);
  const page = {
    ...content,
    blocks: {
      [id]: applyStyling(data, styling),
      ...Object.fromEntries(extraIds.map((x, i) => [x, extraBlocks[i]])),
    },
    blocks_layout: { items: [id, ...extraIds] },
  };
  return (
    <RenderBlocks
      content={page}
      location={{ pathname: content['@id'] ?? '/gallery' }}
    />
  );
}

/** The frame a block has on a real page. */
function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="q container" style={{ containerType: 'inline-size' }}>
      <div id="page-document">{children}</div>
    </div>
  );
}

/**
 * A single block, styled by the `theme` / `width` / `border` controls.
 *
 * Use it as a story file's `component`, so every story gets the controls in
 * `stylingArgTypes`.
 */
export function StyledBlock(props: StyledBlockProps) {
  return (
    <PageFrame>
      <RenderedBlock {...props} />
    </PageFrame>
  );
}

const labelStyle: React.CSSProperties = {
  margin: '32px auto 8px',
  font: '600 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace',
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: '#5b6270',
  background: '#fff',
  padding: '2px 6px',
  width: 'fit-content',
  borderRadius: 4,
};

export type StylingAxis = 'theme' | 'width' | 'border' | 'layer';

export interface StylingMatrixProps extends StyledBlockProps {
  axis: StylingAxis;
}

/**
 * The same block once per value of one styling control, each labelled.
 *
 * Every sample is its own `RenderBlocks` call, so each gets its own
 * `.blocks-group-wrapper` — the way blocks with different themes are grouped on
 * a page. The other controls keep whatever the story passes.
 */
export function StylingMatrix({ axis, ...props }: StylingMatrixProps) {
  let samples: { label: string; options: StylingOptions; style?: object }[];
  if (axis === 'theme') {
    samples = THEME_SAMPLES.map(({ theme, label }) => ({
      label,
      options: { theme },
    }));
  } else if (axis === 'width') {
    samples = WIDTH_SAMPLES.map((width) => ({
      label: `width: ${width}`,
      options: { width },
    }));
  } else if (axis === 'border') {
    samples = BORDER_SAMPLES.map((b) => ({
      label: b.label,
      options: {
        border: b.width,
        borderColor: 'color' in b ? b.color : undefined,
      },
    }));
  } else {
    samples = LAYER_SAMPLES.map(({ label, theme, group }) => ({
      label,
      options: { theme },
      style: colorGroupCustomProperties(group),
    }));
  }

  return (
    <PageFrame>
      {samples.slice(0, MAX_SAMPLES).map(({ label, options, style }, i) => (
        <div key={label} style={style}>
          <p style={labelStyle}>{label}</p>
          <RenderedBlock {...props} {...options} index={i} />
        </div>
      ))}
    </PageFrame>
  );
}

/** Controls for the three styling fields, for a meta using `StyledBlock`. */
export const stylingArgTypes = {
  theme: {
    control: { type: 'select' },
    options: THEME_SAMPLES.map((t) => t.theme),
  },
  width: { control: { type: 'inline-radio' }, options: WIDTH_SAMPLES },
  border: {
    control: { type: 'select' },
    options: ['', ...BORDER_SAMPLES.map((b) => b.width)],
  },
  borderColor: { control: { type: 'color' } },
  data: { control: 'object' },
  extraBlocks: { table: { disable: true } },
  content: { table: { disable: true } },
  index: { table: { disable: true } },
} as const;

/**
 * A story that renders the matrix for one axis from the story's `data` arg.
 *
 * `fullBleed` lifts the decorator's container cap, without which `layout` and
 * `full` widths would be indistinguishable from `default`.
 */
export function matrixStory(
  axis: StylingAxis,
  extra: Partial<StyledBlockProps> = {},
): StoryObj<any> {
  return {
    render: (args: any) => (
      <StylingMatrix
        {...args}
        {...extra}
        data={extra.data ?? args.data}
        axis={axis}
      />
    ),
    parameters: { layout: 'fullscreen', fullBleed: true },
  };
}

/**
 * The store the blocks read from.
 *
 * `HighlightView` reads `state.content.subrequests[block]`, the listing reads
 * `state.querystringsearch.subrequests[`${UID}-${block}`]`, and some blocks read
 * `state.content.data` — so each sample id is seeded with the listing fixtures.
 */
function blockStore(
  content: Record<string, any>,
  items: Record<string, any>[] = listingItems,
) {
  const result = {
    loading: false,
    loaded: true,
    error: null,
    items,
    total: items.length,
    batching: {},
  };
  return {
    ...galleryStore,
    content: { ...galleryStore.content, data: content },
    querystringsearch: {
      subrequests: Object.fromEntries(
        Array.from({ length: MAX_SAMPLES }, (_, i) => [
          `${content.UID}-${sampleId(i)}`,
          result,
        ]),
      ),
    },
  };
}

/**
 * The store wrapper.
 *
 * A mock store by default: the listing dispatches a fetch on mount, and on a
 * real store its `_PENDING` reducer would wipe the seeded results. Blocks that
 * dispatch *thunks* — `search`, `eventCalendar` — need `real: true`, and settle
 * into their empty state because there is no backend behind the fetch.
 */
export function withBlockStore({
  real = false,
  content = galleryContent,
  items,
}: {
  real?: boolean;
  content?: Record<string, any>;
  /** Listing results to seed; defaults to the listing fixtures. */
  items?: Record<string, any>[];
} = {}): Decorator {
  const StoreWrapper = real ? RealStoreWrapper : Wrapper;
  const decorator: Decorator = (Story) => (
    <StoreWrapper
      anonymous
      customStore={blockStore(content, items)}
      location={content['@id'] ?? '/gallery'}
    >
      <Story />
    </StoreWrapper>
  );
  return decorator;
}
