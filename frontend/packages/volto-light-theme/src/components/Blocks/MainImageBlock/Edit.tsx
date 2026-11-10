import React from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import MainImageBlockDataForm from './Data';
import MainImageBlockView from './View';
import type { MainImageBlockData } from './index';

interface MainImageBlockEditProps {
  data: MainImageBlockData;
  onChangeBlock: (id: string, data: MainImageBlockData) => void;
  block: string;
  selected: boolean;
  [key: string]: any;
}

const MainImageBlockEdit: React.FC<MainImageBlockEditProps> = (props) => {
  const { selected } = props;

  return (
    <>
      <MainImageBlockView {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <MainImageBlockDataForm {...props} />
      </SidebarPortal>
    </>
  );
};

export default withBlockExtensions(MainImageBlockEdit);
