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
        fields: ['color', 'thickness', 'width', 'alignment', 'blockWidth'],
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
      // Controle de largura do separador (linha)
      width: {
        title: 'Width',
        type: 'string',
        default: '100%',
        choices: [
          ['100%', 'Full (100%)'],
          ['75%', '75%'],
          ['50%', '50%'],
          ['25%', '25%'],
        ],
      },
      // Alinhamento horizontal do separador (linha)
      alignment: {
        title: 'Alignment',
        widget: 'align',
        actions: ['left', 'center', 'right'],
        default: 'center',
      },
      // Largura do bloco em si (wrapper)
      blockWidth: {
        title: 'Block Width',
        widget: 'blockWidth',
        default: 'default',
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
