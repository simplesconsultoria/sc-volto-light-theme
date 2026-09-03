import React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import Wrapper from '@plone/volto/storybook';
import config from '@plone/volto/registry';

/**
 * Every block registered at runtime, whatever package put it there.
 *
 * The inventory is read from `config.blocks.blocksConfig` rather than compiled
 * from source, so it cannot drift: a block added by an upstream release shows up
 * here the moment the dependency is bumped, and one that disappears stops being
 * listed. Three layers contribute — Volto core, `@plone/volto-slate`, and
 * `@kitconcept/volto-light-theme` — on top of the four this add-on ships.
 */

/** Blocks this add-on registers itself. */
const OWNED = new Set([
  'documentByline',
  'mainImageBlock',
  'heroBlock',
  'quoteBlock',
]);

/** Blocks this add-on modifies without owning — see `config/blocks.ts`. */
const EXTENDED = new Set(['listing', 'gridBlock']);

type Row = {
  id: string;
  title: string;
  group: string;
  variations: string[];
  themes: number;
  sidebarTab: string;
  restricted: string;
  origin: 'own' | 'extended' | 'inherited';
};

function collect(): Row[] {
  const blocksConfig = (config.blocks?.blocksConfig ?? {}) as Record<
    string,
    any
  >;
  return Object.entries(blocksConfig)
    .filter(([, block]) => block && typeof block === 'object' && block.id)
    .map(([key, block]) => ({
      id: key,
      title: String(block.title ?? '—'),
      group: String(block.group ?? '—'),
      variations: (block.variations ?? []).map((v: any) => String(v.id)),
      themes: (block.themes ?? []).length,
      sidebarTab:
        block.sidebarTab === undefined ? '—' : String(block.sidebarTab),
      restricted:
        typeof block.restricted === 'function'
          ? 'conditional'
          : String(Boolean(block.restricted)),
      origin: OWNED.has(key)
        ? 'own'
        : EXTENDED.has(key)
          ? 'extended'
          : 'inherited',
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

const ORIGIN_STYLE: Record<Row['origin'], React.CSSProperties> = {
  own: { background: '#dff0e4', color: '#1c6b35' },
  extended: { background: '#f6e3c2', color: '#8a5300' },
  inherited: { background: '#eceff1', color: '#5b6270' },
};

function BlocksInventory({ origin = 'all' }: { origin?: string }) {
  const rows = collect().filter((r) => origin === 'all' || r.origin === origin);
  const counts = collect().reduce<Record<string, number>>((acc, r) => {
    acc[r.origin] = (acc[r.origin] ?? 0) + 1;
    return acc;
  }, {});

  const cell: React.CSSProperties = {
    padding: '7px 10px',
    borderBottom: '1px solid #e4e7ec',
    textAlign: 'left',
    verticalAlign: 'top',
  };
  const mono: React.CSSProperties = {
    ...cell,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '12px',
  };

  return (
    <div style={{ font: '400 14px/1.5 system-ui, sans-serif', padding: '8px' }}>
      <p style={{ margin: '0 0 14px', color: '#5b6270' }}>
        <strong>{rows.length}</strong> block{rows.length === 1 ? '' : 's'} shown
        · {counts.own ?? 0} shipped by this add-on, {counts.extended ?? 0}{' '}
        extended, {counts.inherited ?? 0} inherited from Volto core, volto-slate
        and @kitconcept/volto-light-theme.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {[
              'id',
              'title',
              'group',
              'variations',
              'themes',
              'tab',
              'restricted',
              'origin',
            ].map((h) => (
              <th
                key={h}
                style={{
                  ...cell,
                  font: '600 10.5px/1.4 system-ui, sans-serif',
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: '#5b6270',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={mono}>{r.id}</td>
              <td style={cell}>{r.title}</td>
              <td style={mono}>{r.group}</td>
              <td style={mono}>{r.variations.join(', ') || '—'}</td>
              <td style={mono}>{r.themes || '—'}</td>
              <td style={mono}>{r.sidebarTab}</td>
              <td style={mono}>{r.restricted}</td>
              <td style={cell}>
                <span
                  style={{
                    ...ORIGIN_STYLE[r.origin],
                    padding: '1px 7px',
                    borderRadius: 999,
                    font: '600 10px/1.7 system-ui, sans-serif',
                  }}
                >
                  {r.origin}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const withWrapper: Decorator = (Story) => (
  <Wrapper anonymous>
    <Story />
  </Wrapper>
);

const meta = {
  title: 'Public/Blocks/Inventory',
  component: BlocksInventory,
  decorators: [withWrapper],
  parameters: { layout: 'fullscreen', fullBleed: true },
  tags: ['autodocs'],
  argTypes: {
    origin: {
      control: { type: 'inline-radio' },
      options: ['all', 'own', 'extended', 'inherited'],
    },
  },
} satisfies Meta<typeof BlocksInventory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every block available to an editor on a site running this theme. */
export const All: Story = { args: { origin: 'all' } };

/** The four blocks this add-on registers. */
export const ShippedByThisAddon: Story = { args: { origin: 'own' } };

/** Blocks this add-on modifies but does not own. */
export const Extended: Story = { args: { origin: 'extended' } };

/** Everything inherited from core, volto-slate and upstream VLT. */
export const Inherited: Story = { args: { origin: 'inherited' } };
