import HeroBlockView from './View';
import HeroBlockEdit from './Edit';
import { heroBlockDataAdapter } from './adapter';
import { HeroBlockSchema } from './schema';
import presentationSVG from '@plone/volto/icons/presentation.svg';
import type { BlockConfigBase } from '@plone/types';

export type { HeroBlockData } from './types';

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
  sidebarTab: 1,
  blockHasOwnFocusManagement: false,
  dataAdapter: heroBlockDataAdapter,
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
