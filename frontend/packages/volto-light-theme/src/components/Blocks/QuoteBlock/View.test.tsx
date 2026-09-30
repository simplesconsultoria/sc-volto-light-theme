import React from 'react';
import { render } from '@testing-library/react';
import View from './View';
import { vi } from 'vitest';

vi.mock('@kitconcept/volto-bm3-compat', () => ({
  BlockWrapper: ({ children }: any) => (
    <div className="mock-block-wrapper">{children}</div>
  ),
}));

vi.mock('@plone/volto-slate/blocks/Text', () => ({
  TextBlockView: () => (
    <div className="mock-text-block-view">Mock TextBlockView</div>
  ),
}));

vi.mock('@plone/volto-slate/blocks/Text/DetachedTextBlockEditor', () => ({
  DetachedTextBlockEditor: () => (
    <div className="mock-detached-text-block-editor">
      Mock DetachedTextBlockEditor
    </div>
  ),
}));

describe('QuoteBlock View', () => {
  it('renders correctly with default transparent background', () => {
    const data = {
      author: 'Jane Doe',
    };

    const { getByText, container } = render(<View data={data} />);

    expect(container.querySelector('blockquote')).toHaveClass(
      'quote-block bg-transparent',
    );
    expect(getByText('Mock TextBlockView')).toBeInTheDocument();
    expect(getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders correctly with custom background', () => {
    const data = {
      backgroundStyle: 'primary',
      author: 'John Doe',
    };

    const { getByText, container } = render(<View data={data} />);

    expect(container.querySelector('blockquote')).toHaveClass(
      'quote-block bg-primary',
    );
    expect(getByText('Mock TextBlockView')).toBeInTheDocument();
    expect(getByText('John Doe')).toBeInTheDocument();
  });

  it('renders editor mode correctly', () => {
    const data = {
      author: 'Editor Author',
    };

    const { getByText } = render(<View data={data} isEditMode={true} />);

    expect(getByText('Mock DetachedTextBlockEditor')).toBeInTheDocument();
    expect(getByText('Editor Author')).toBeInTheDocument();
  });
});
