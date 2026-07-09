import QuoteBlockView from './View';
import QuoteBlockEdit from './Edit';
import { QuoteBlockSchema } from './schema';
import quoteSVG from '@plone/volto/icons/quote.svg';
import type { BlockConfigBase } from '@plone/types';

export interface QuoteBlockData {
  author?: string;
  backgroundStyle?: 'transparent' | 'filled';
  theme?: string;
  styles?: Record<string, any>;
}

const QuoteBlockInfo: BlockConfigBase = {
  id: 'quoteBlock',
  title: 'Citação',
  icon: quoteSVG,
  group: 'text',
  view: QuoteBlockView as any,
  edit: QuoteBlockEdit as any,
  blockSchema: QuoteBlockSchema as any,
  restricted: false,
  mostUsed: false,
  sidebarTab: 1,
  blockHasOwnFocusManagement: true,
};

export default QuoteBlockInfo;
