import React from 'react';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import QuoteBlockDataForm from './Data';
import QuoteBlockView from './View';

interface QuoteBlockEditProps {
  data: Record<string, any>;
  onChangeBlock: (id: string, data: Record<string, any>) => void;
  block: string;
  selected: boolean;
  [key: string]: any;
}

const QuoteBlockEdit: React.FC<QuoteBlockEditProps> = (props) => {
  const { data, onChangeBlock, block, selected } = props;

  return (
    <>
      <QuoteBlockView {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <QuoteBlockDataForm
          {...props}
          data={data}
          block={block}
          onChangeBlock={onChangeBlock}
        />
      </SidebarPortal>
    </>
  );
};

export default QuoteBlockEdit;
