import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import View from './View';
import { EventMetadataSchema } from './schema';
import { useIntl } from 'react-intl';

const EventMetadataEdit = (props: any) => {
  const { block, data, onChangeBlock, selected } = props;
  const intl = useIntl();
  const schema = EventMetadataSchema({ intl });

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

export default EventMetadataEdit;
