import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import { vi } from 'vitest';

// We need to require the component after the mocks are set up
import MainImageBlockView from './View';

// MainImageBlockView is wrapped in withBlockExtensions, so we need to mock it.
vi.mock('@plone/volto/helpers/Extensions/withBlockExtensions', () => ({
  default: (Component: any) => (props: any) => <Component {...props} />,
}));

vi.mock('@plone/volto/components/theme/Image/Image', () => ({
  default: () => <img alt="Mocked preview" />,
}));

vi.mock('@plone/volto/registry', () => ({
  default: {
    blocks: {
      blocksConfig: {
        mainImageBlock: {
          themes: [{ name: 'default', style: { '--theme-color': 'red' } }],
        },
        image: {
          getSizes: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('./Layout', () => ({
  default: ({ title, description, image, className, style }: any) => (
    <div
      className={`mock-layout ${className}`}
      style={style}
      data-testid="layout"
    >
      {title && <h1>{title}</h1>}
      {description && <p>{description}</p>}
      {image}
    </div>
  ),
}));

const mockStore = configureStore();

describe('MainImageBlock View', () => {
  it('renders correctly with an image', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const data = {
      title: 'Block Title',
      description: 'Block Description',
    };

    const properties = {
      preview_image_link: 'http://example.com/image.jpg',
    };

    const { getByText, getByAltText } = render(
      <Provider store={store}>
        <MainImageBlockView data={data as any} properties={properties} />
      </Provider>,
    );

    expect(getByText('Block Title')).toBeInTheDocument();
    expect(getByText('Block Description')).toBeInTheDocument();
    expect(getByAltText('Mocked preview')).toBeInTheDocument();
  });

  it('renders empty message in edit mode when no image is provided', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const { getByText } = render(
      <Provider store={store}>
        <MainImageBlockView data={{}} properties={{}} isEditMode={true} />
      </Provider>,
    );

    expect(
      getByText(
        'No preview image found on this page. Add a preview image to the page to display it in this block.',
      ),
    ).toBeInTheDocument();
  });

  it('renders nothing in view mode when no image is provided', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const { container } = render(
      <Provider store={store}>
        <MainImageBlockView data={{}} properties={{}} />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
