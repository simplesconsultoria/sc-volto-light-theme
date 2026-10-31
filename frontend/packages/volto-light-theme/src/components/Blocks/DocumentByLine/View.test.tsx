import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import DocumentByLineBlockView from './View';

vi.mock('@plone/volto/helpers/Extensions/withBlockExtensions', () => ({
  default: (Component: any) => (props: any) => <Component {...props} />,
}));

vi.mock('../../DocumentByLine/DocumentByLine', () => ({
  default: ({ showModified, showPublished, showAuthor, content }: any) => (
    <div data-testid="mock-document-byline">
      {showModified && <span>Modified</span>}
      {showPublished && <span>Published</span>}
      {showAuthor && <span>Author</span>}
      {content?.creators && (
        <span data-testid="author-name">{content.creators.join(', ')}</span>
      )}
      {content?.effective && (
        <span data-testid="effective-date">{content.effective}</span>
      )}
    </div>
  ),
}));

describe('DocumentByLineBlock View', () => {
  it('renders correctly with default settings', () => {
    const data = {
      showModified: true,
      showPublished: true,
      showAuthor: false,
    };

    const { getByTestId, getByText, queryByText } = render(
      <DocumentByLineBlockView data={data as any} properties={{} as any} />,
    );

    expect(getByTestId('mock-document-byline')).toBeInTheDocument();
    expect(getByText('Modified')).toBeInTheDocument();
    expect(getByText('Published')).toBeInTheDocument();
    expect(queryByText('Author')).toBeNull();
  });

  it('renders correctly with all settings true', () => {
    const data = {
      showModified: true,
      showPublished: true,
      showAuthor: true,
    };

    const { getByTestId, getByText } = render(
      <DocumentByLineBlockView data={data as any} properties={{} as any} />,
    );

    expect(getByTestId('mock-document-byline')).toBeInTheDocument();
    expect(getByText('Modified')).toBeInTheDocument();
    expect(getByText('Published')).toBeInTheDocument();
    expect(getByText('Author')).toBeInTheDocument();
  });

  it('adds edit class in edit mode', () => {
    const data = {
      showModified: false,
      showPublished: false,
      showAuthor: false,
    };

    const { container } = render(
      <DocumentByLineBlockView
        data={data as any}
        properties={{} as any}
        isEditMode={true}
      />,
    );

    expect(container.firstChild).toHaveClass('edit');
  });

  it('resolves metadata when properties is an empty container object (inside GridBlock or Accordion in edit mode)', () => {
    const data = {
      showModified: true,
      showPublished: true,
      showAuthor: true,
    };
    const metadata = {
      effective: '2026-10-30T17:36:37+00:00',
      modified: '2026-10-30T17:36:37+00:00',
      creators: ['admin'],
    };
    // properties is the container data without document dates
    const properties = {
      '@type': 'gridBlock',
      blocks: {},
      blocks_layout: { items: [] },
    };

    const { getByTestId } = render(
      <DocumentByLineBlockView
        data={data as any}
        properties={properties as any}
        metadata={metadata as any}
      />,
    );

    expect(getByTestId('author-name')).toHaveTextContent('admin');
    expect(getByTestId('effective-date')).toHaveTextContent(
      '2026-10-30T17:36:37+00:00',
    );
  });

  it('provides fallback preview content in edit mode when both metadata and properties are empty', () => {
    const data = {
      showModified: true,
      showPublished: true,
      showAuthor: true,
    };

    const { getByTestId } = render(
      <DocumentByLineBlockView
        data={data as any}
        properties={{} as any}
        isEditMode={true}
      />,
    );

    expect(getByTestId('author-name')).toHaveTextContent('admin');
    expect(getByTestId('effective-date')).toBeInTheDocument();
  });
});
