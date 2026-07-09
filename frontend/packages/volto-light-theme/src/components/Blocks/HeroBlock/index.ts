import HeroBlockView from './View';
import HeroBlockEdit from './Edit';
import { HeroBlockDataAdapter } from './adapter';
import { HeroBlockSchema } from './schema';
import presentationSVG from '@plone/volto/icons/presentation.svg';
import type { BlockConfigBase } from '@plone/types';

export interface HeroBlockData {
  headerText?: string;
  title?: string;
  description?: string;
  footerText?: string;
  tags?: string[];
  url?: string;
  image_field?: string;
  image_scales?: Record<string, any>;
  button?: boolean;
  buttonLink?: Array<{ '@id': string }>;
  buttonText?: string;
  fullWidth?: boolean;
  textSide?: 'left' | 'right';
  variation?: 'flex' | 'card';
  fileType?: string;
  href?: Array<{ '@id': string }>;
  theme?: string;
  styles?: Record<string, any>;
}

const HeroBlockInfo: BlockConfigBase = {
  id: 'heroBlock',
  title: 'Hero Block',
  icon: presentationSVG,
  group: 'common',
  view: HeroBlockView as any,
  edit: HeroBlockEdit as any,
  blockSchema: HeroBlockSchema as any,
  restricted: false,
  mostUsed: false,
  sidebarTab: 0,
  blockHasOwnFocusManagement: false,
  dataAdapter: HeroBlockDataAdapter,
  variations: [
    {
      id: 'flex',
      title: 'Flex / Decorativa',
      isDefault: true,
    },
    {
      id: 'card',
      title: 'Card Colado',
    },
  ],
};

export default HeroBlockInfo;
