/**
 * Component surface for the Claude Design export.
 *
 * The package's public entry (`src/index.ts`) exports only `applyConfig` — every
 * component reaches Volto through the block registry, not through an import. The
 * design-system converter needs the components as named exports so its bundle can put
 * them on `window.<Global>` and redirect story imports there, which is what this module
 * provides. Nothing in the add-on imports it.
 *
 * `dsGlobals` and `dsConfig` MUST be evaluated first so Razzle globals, Volto core
 * configuration, all addons (mirrored in `.design-sync/nm-overlay/` with `.less`/
 * `.scss` side-effect imports stripped), and our custom registry extensions are seeded
 * before any component evaluates.
 */

import './dsGlobals';
import './dsConfig';

export { default as DsPreviewProvider } from './DsPreviewProvider';
export { StyledBlock, StylingMatrix } from './blockStyling';
export { default as AccessibilityControls } from '../components/AccessibilityControls/AccessibilityControls';
export { default as CustomGrid } from '../components/Blocks/CustomGrid/View';
export { default as DocumentByLineBlock } from '../components/Blocks/DocumentByLine/View';
export { default as EventMetadata } from '../components/Blocks/EventMetadata/View';
export { default as HeroBlock } from '../components/Blocks/HeroBlock/View';
export { default as CarouselTemplate } from '../components/Blocks/Listing/CarouselTemplate';
export { default as EventsTemplate } from '../components/Blocks/Listing/EventsTemplate';
export { default as GridTemplate } from '../components/Blocks/Listing/GridTemplate';
export { default as MediaCarousel } from '../components/Blocks/Listing/MediaCarouselTemplate';
export { default as TeaserTemplate } from '../components/Blocks/Listing/TeaserTemplate';
export { default as MainImageBlock } from '../components/Blocks/MainImageBlock/Layout';
export { default as MainImageBlockView } from '../components/Blocks/MainImageBlock/View';
export { default as QuoteBlock } from '../components/Blocks/QuoteBlock/View';
export { default as Separator } from '../components/Blocks/Separator/View';
export { default as DocumentByLine } from '../components/DocumentByLine/DocumentByLine';
export { default as DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
export { default as Colophon } from '../components/Footer/slots/Colophon';
export { default as HeaderBarActions } from '../components/HeaderBar/HeaderBarActionsUI';
export { default as MenuItem } from '../components/Navigation/SCNavigation/MenuItem';
export { default as Navigation } from '../components/Navigation/SCNavigation/SCNavigation';
export { default as SubMenu } from '../components/Navigation/SCNavigation/SubMenu';
export { default as SubMenuItem } from '../components/Navigation/SCNavigation/SubMenuItem';
export { default as SubMenuItems } from '../components/Navigation/SCNavigation/SubMenuItems';
export { default as SubMenuSection } from '../components/Navigation/SCNavigation/SubMenuSection';
export { default as ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
