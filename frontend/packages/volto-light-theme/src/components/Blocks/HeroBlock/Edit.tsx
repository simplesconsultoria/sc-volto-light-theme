import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import HeroBlockDataForm from './Data';
import HeroBlockView from './View';

interface HeroBlockEditProps {
  data: Record<string, any>;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  block: string;
  selected: boolean;
  [key: string]: any;
}

const HeroBlockEdit: React.FC<HeroBlockEditProps> = (props) => {
  const { data, onChangeBlock, block, selected } = props;

  return (
    <>
      <HeroBlockView {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <HeroBlockDataForm
          {...props}
          data={data}
          block={block}
          onChangeBlock={onChangeBlock}
        />
      </SidebarPortal>
    </>
  );
};

export default HeroBlockEdit;
