import React from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import DocumentByLineBlockDataForm from './Data';
import SidebarPortal from '@plone/volto/components/manage/Sidebar/SidebarPortal';
import type { DocumentByLineBlockData } from './Data';
import DocumentByLineBlockView from './View';

interface DocumentByLineBlockEditProps {
  data: DocumentByLineBlockData;
  onChangeBlock: (id: string, data: DocumentByLineBlockData) => void;
  block: string;
  selected: boolean;
  [key: string]: any;
}

const DocumentByLineBlockEdit: React.FC<DocumentByLineBlockEditProps> = (
  props,
) => {
  const { data, onChangeBlock, block, selected } = props;

  return (
    <>
      <DocumentByLineBlockView {...props} isEditMode={true} />
      <SidebarPortal selected={selected}>
        <DocumentByLineBlockDataForm
          data={data}
          block={block}
          onChangeBlock={onChangeBlock}
        />
      </SidebarPortal>
    </>
  );
};

export default withBlockExtensions(DocumentByLineBlockEdit);
