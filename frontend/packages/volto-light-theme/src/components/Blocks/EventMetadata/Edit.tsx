import React from 'react';
import { SidebarPortal } from '@plone/volto/components';
import View from './View';
import EventMetadataDataForm from './Data';

const EventMetadataEdit = (props: any) => {
  const { selected } = props;

  return (
    <>
      <View {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <EventMetadataDataForm {...props} />
      </SidebarPortal>
    </>
  );
};

export default EventMetadataEdit;
