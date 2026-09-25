import React from 'react';
import { render } from '@testing-library/react';
import Edit from './Edit';

import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore();

vi.mock('./View', () => ({
  default: () => <div className="event-metadata-view">View</div>,
}));
vi.mock('@plone/volto/components/manage/Sidebar/SidebarPortal', () => ({
  default: ({ children }: any) => <div className="sidebar">{children}</div>,
}));
vi.mock('@plone/volto/components/manage/Form/InlineForm', () => ({
  default: () => <div className="inline-form">Form</div>,
}));
vi.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  default: () => <div className="block-data-form">BlockDataForm</div>,
}));
vi.mock('@plone/volto/helpers', async (importOriginal) => {
  return {
    ...((await importOriginal()) as any),
    withBlockSchemaEnhancer: (comp: any) => comp,
  };
});

describe('EventMetadata Edit', () => {
  it('renders correctly', () => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
    });

    const { getByText } = render(
      <Provider store={store}>
        <Edit
          data={{}}
          onChangeBlock={() => {}}
          block="123"
          selected={true}
          properties={{}}
        />
      </Provider>,
    );
    expect(getByText('View')).toBeInTheDocument();
  });
});
