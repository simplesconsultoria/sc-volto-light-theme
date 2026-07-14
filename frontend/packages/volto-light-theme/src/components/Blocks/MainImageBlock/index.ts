import MainImageBlockView from './View';
import MainImageBlockEdit from './Edit';
import { MainImageSchema } from './schema';
import imageSVG from '@plone/volto/icons/image.svg';
import type { BlockConfigBase } from '@plone/types';

export interface MainImageBlockData {
  title?: string;
  description?: string;
  altText?: string;
  align?: 'left' | 'center' | 'right' | 'full';
  size?: 's' | 'm' | 'l';
  theme?: string;
  styles?: Record<string, any>;
}

const MainImageBlockInfo: BlockConfigBase = {
  id: 'mainImageBlock',
  title: 'Imagem Principal',
  icon: imageSVG,
  group: 'media',
  view: MainImageBlockView,
  edit: MainImageBlockEdit,
  blockSchema: MainImageSchema,
  restricted: ({ properties }) =>
    !properties.hasOwnProperty('preview_image_link'),
  mostUsed: false,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
};

export default MainImageBlockInfo;
