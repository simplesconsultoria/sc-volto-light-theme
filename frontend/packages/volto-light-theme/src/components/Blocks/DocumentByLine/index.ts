import DocumentByLineBlockView from './View';
import DocumentByLineBlockEdit from './Edit';
import { DocumentByLineSchema } from './schema';
import DocumentByLineSVG from '@plone/volto/icons/pencil.svg';
import type { BlockConfigBase } from '@plone/types';

export interface DocumentByLineBlockData {
  location?: string;
  measure?: string;
}

const DocumentByLineBlockInfo: BlockConfigBase = {
  id: 'documentByline',
  title: 'Assinatura',
  icon: DocumentByLineSVG,
  group: 'common',
  view: DocumentByLineBlockView,
  edit: DocumentByLineBlockEdit,
  blockSchema: DocumentByLineSchema,
  restricted: false,
  mostUsed: true,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
};

export default DocumentByLineBlockInfo;
