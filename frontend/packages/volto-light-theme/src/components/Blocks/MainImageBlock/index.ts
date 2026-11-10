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
  title: 'Main Image',
  icon: imageSVG,
  group: 'media',
  view: MainImageBlockView,
  edit: MainImageBlockEdit,
  blockSchema: MainImageSchema,
  restricted: ({ properties }) => {
    // Plone serializes every item with a `preview_image_link` key, so check
    // for a link that is set rather than for the key.
    const link = properties?.preview_image_link;
    return !(Array.isArray(link) ? link.length > 0 : Boolean(link));
  },
  mostUsed: false,
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
};

export default MainImageBlockInfo;
