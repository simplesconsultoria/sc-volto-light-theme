import React from 'react';
import { render } from '@testing-library/react';
import CustomGridView from './View';
import '@testing-library/jest-dom';

// Mock RenderBlocks to isolate the grid component logic
vi.mock('@plone/volto/components', () => ({
  RenderBlocks: ({ content }: any) => (
    <div data-testid="render-blocks">
      {content?.settings?.theme || 'no-theme'}
    </div>
  ),
}));

describe('CustomGridView', () => {
  it('renders the correct number of columns for a 2-column layout', () => {
    const mockData = {
      layout: '1-1',
      data: {
        blocks_layout: { items: ['col1', 'col2'] },
        blocks: {
          col1: { '@type': 'customGridColumn', settings: { theme: 'primary' } },
          col2: {
            '@type': 'customGridColumn',
            settings: { theme: 'secondary' },
          },
        },
      },
    };

    const { container } = render(
      <CustomGridView data={mockData} path="/test" />,
    );

    // Correct layout class applied
    expect(container.querySelector('.custom-grid')).toHaveClass('layout-1-1');

    // Two columns rendered
    const columns = container.querySelectorAll('.custom-grid-column');
    expect(columns.length).toBe(2);

    // Theme classes applied
    expect(columns[0]).toHaveClass('has-theme');
    expect(columns[1]).toHaveClass('has-theme');
  });

  it('applies the correct layout class for asymmetric layouts', () => {
    const mockData = {
      layout: '2-1',
      data: {
        blocks_layout: { items: ['col1', 'col2'] },
        blocks: {
          col1: { '@type': 'customGridColumn', settings: {} },
          col2: { '@type': 'customGridColumn', settings: { theme: 'grey' } },
        },
      },
    };

    const { container } = render(
      <CustomGridView data={mockData} path="/test" />,
    );
    expect(container.querySelector('.custom-grid')).toHaveClass('layout-2-1');
  });

  it('handles missing data gracefully', () => {
    const mockData = { layout: '1-1' };
    const { container } = render(
      <CustomGridView data={mockData} path="/test" />,
    );

    // No columns since data is empty
    const columns = container.querySelectorAll('.custom-grid-column');
    expect(columns.length).toBe(0);
  });

  it('renders a 4-column layout', () => {
    const mockData = {
      layout: '1-1-1-1',
      data: {
        blocks_layout: { items: ['a', 'b', 'c', 'd'] },
        blocks: {
          a: { '@type': 'customGridColumn', settings: {} },
          b: { '@type': 'customGridColumn', settings: {} },
          c: { '@type': 'customGridColumn', settings: {} },
          d: { '@type': 'customGridColumn', settings: {} },
        },
      },
    };

    const { container } = render(
      <CustomGridView data={mockData} path="/test" />,
    );
    expect(container.querySelector('.custom-grid')).toHaveClass(
      'layout-1-1-1-1',
    );
    expect(container.querySelectorAll('.custom-grid-column').length).toBe(4);
  });
});
