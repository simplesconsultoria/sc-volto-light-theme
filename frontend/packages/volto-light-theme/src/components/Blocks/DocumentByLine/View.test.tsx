import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import DocumentByLineBlockView from './View';

vi.mock('@plone/volto/helpers/Extensions/withBlockExtensions', () => ({
  default: (Component: any) => (props: any) => <Component {...props} />,
}));

vi.mock('../../DocumentByLine/DocumentByLine', () => ({
  default: ({ showModified, showPublished, showAuthor }: any) => (
    <div data-testid="mock-document-byline">
      {showModified && <span>Modified</span>}
      {showPublished && <span>Published</span>}
      {showAuthor && <span>Author</span>}
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
});
