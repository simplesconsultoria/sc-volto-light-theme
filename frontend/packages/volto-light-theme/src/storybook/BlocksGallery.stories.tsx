import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { RealStoreWrapper } from '@plone/volto/storybook';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import config from '@plone/volto/registry';

import { sampleBlocks, galleryStore, galleryContent } from './galleryFixtures';

/**
 * Every registered block rendered through the real `RenderBlocks`.
 *
 * The per-block stories cover what this add-on owns. This covers the other 36,
 * which come from Volto core, `@plone/volto-slate` and
 * `@kitconcept/volto-light-theme` — and which this theme restyles, so how they
 * look here is very much its concern.
 *
 * Each block is isolated behind an error boundary. A block that throws shows the
 * message instead of blanking the page, which makes this an audit as much as a
 * gallery: what renders, what renders empty, and what breaks.
 *
 * Note that `RenderBlocks` has an error boundary of its own, and it is the inner
 * one — it catches first and renders "Block error: The X block with the id Y
 * errored and cannot be displayed", so the boundary below never fires for a
 * failing block. When auditing this gallery, search the DOM for **"Block error"**
 * rather than for this component's message; a check for the latter alone reports
 * a clean run while five blocks are broken, because Volto's message is long
 * enough to pass for rendered content.
 */

class BlockBoundary extends React.Component<
  { id: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '10px 12px',
            border: '1px solid #f7d4d1',
            borderRadius: 8,
            background: '#fdecea',
            color: '#b3261e',
            font: '400 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          <strong>{this.props.id}</strong> threw: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

/** Ids that render a third-party embed rather than themed markup. */
const EMBEDS = new Set([
  'blueskyBlock',
  'facebookBlock',
  'flickrBlock',
  'followUsBlock',
  'instagramBlock',
  'linkedinBlock',
  'pinterestBlock',
  'soundcloudBlock',
  'spotifyBlock',
  'tiktokBlock',
  'tweetBlock',
]);

function registeredIds(): string[] {
  const blocksConfig = (config.blocks?.blocksConfig ?? {}) as Record<
    string,
    any
  >;
  return Object.entries(blocksConfig)
    .filter(([, b]) => b && typeof b === 'object' && b.id && b.view)
    .map(([key]) => key)
    .sort();
}

function Gallery({ scope = 'themed' }: { scope?: string }) {
  const ids = registeredIds().filter((id) => {
    if (scope === 'all') return true;
    if (scope === 'embeds') return EMBEDS.has(id);
    return !EMBEDS.has(id);
  });

  return (
    <div style={{ font: '400 14px/1.55 system-ui, sans-serif' }}>
      <p style={{ margin: '0 0 20px', color: '#5b6270' }}>
        <strong>{ids.length}</strong> block{ids.length === 1 ? '' : 's'},
        rendered through <code>RenderBlocks</code> with the sample data in{' '}
        <code>galleryFixtures.ts</code>. Blocks with no sample data get a bare{' '}
        <code>{'{ "@type": id }'}</code>, which shows their empty state.
      </p>
      {ids.map((id) => {
        const data = { '@type': id, ...(sampleBlocks[id] ?? {}) };
        const content = {
          ...galleryContent,
          blocks: { [`blk-${id}`]: data },
          blocks_layout: { items: [`blk-${id}`] },
        };
        return (
          <section key={id} style={{ marginBottom: 28 }}>
            <h3
              style={{
                margin: '0 0 8px',
                font: '600 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace',
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: '#5b6270',
              }}
            >
              {id}
              {!sampleBlocks[id] && (
                <span style={{ color: '#8a5300' }}> · no sample data</span>
              )}
            </h3>
            <div
              style={{
                border: '1px solid #e4e7ec',
                borderRadius: 10,
                padding: 16,
                overflowX: 'auto',
              }}
            >
              <BlockBoundary id={id}>
                <RenderBlocks
                  content={content}
                  location={{ pathname: '/gallery' }}
                />
              </BlockBoundary>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/*
 * `followUsBlock` reads `state.content.data` from the store rather than the
 * content prop, and `HighlightView` reads `state.content.subrequests[block]` —
 * so the `content` slice needs both keys. Spreading `galleryStore.content`
 * rather than replacing it is what keeps them from clobbering each other.
 */
const store = {
  ...galleryStore,
  content: { ...galleryStore.content, data: galleryContent },
};

/*
 * `RealStoreWrapper` rather than `Wrapper`: `search` and `eventCalendar` dispatch
 * thunks on mount, and the plain mock store has no thunk middleware, so both
 * failed with "Actions must be plain objects". With a real store the dispatch is
 * accepted; the fetch has no backend behind it, so they settle into their empty
 * state instead of erroring.
 */
const withGallery: Decorator = (Story) => (
  <RealStoreWrapper anonymous customStore={store} location="/gallery">
    <div style={{ padding: '2rem' }}>
      <Story />
    </div>
  </RealStoreWrapper>
);

const meta = {
  title: 'Public/Blocks/Gallery',
  component: Gallery,
  decorators: [withGallery],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: {
    scope: {
      control: { type: 'inline-radio' },
      options: ['themed', 'embeds', 'all'],
    },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Everything except the third-party embeds. */
export const Themed: Story = { args: { scope: 'themed' } };

/**
 * The social embed blocks. These render third-party iframes, so what shows here
 * depends on network access and on those services — very little of it is this
 * theme's styling.
 */
export const Embeds: Story = { args: { scope: 'embeds' } };

export const All: Story = { args: { scope: 'all' } };
