import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import View from './View';

const SeparatorEdit = (props: any) => {
  const { block, data, onChangeBlock, selected } = props;

  const schema = {
    title: 'Separator',
    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['color', 'thickness'],
      },
    ],
    properties: {
      color: {
        title: 'Color',
        widget: 'style_simple_color',
      },
      thickness: {
        title: 'Thickness (px)',
        type: 'number',
        default: 1,
      },
    },
    required: [],
  };

  return (
    <>
      <View {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
          block={block}
        />
      </SidebarPortal>
    </>
  );
};

export default SeparatorEdit;
