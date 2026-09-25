import React from 'react';
import { render } from '@testing-library/react';
import Edit from './Edit';

vi.mock('./View', () => ({
  default: () => <div className="separator-view">View</div>,
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

describe('Separator Edit', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Edit
        data={{}}
        onChangeBlock={() => {}}
        block="123"
        selected={true}
        properties={{}}
      />,
    );
    expect(getByText('View')).toBeInTheDocument();
  });
});
