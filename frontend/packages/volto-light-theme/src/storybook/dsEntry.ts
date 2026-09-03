/**
 * Component surface for the Claude Design export.
 *
 * The package's public entry (`src/index.ts`) exports only `applyConfig` — every
 * component reaches Volto through the block registry, not through an import. The
 * design-system converter needs the components as named exports so its bundle can put
 * them on `window.<Global>` and redirect story imports there, which is what this module
 * provides. Nothing in the add-on imports it.
 *
 * `QuoteBlock` is deliberately absent: its view imports `@plone/volto-slate/blocks/Text`,
 * whose graph reaches the slate editor's `.less` stylesheets, and the converter's esbuild
 * has no `.less` loader.
 */

import './dsGlobals';
import './dsConfig';

export { default as DsPreviewProvider } from './DsPreviewProvider';
export { default as AccessibilityControls } from '../components/AccessibilityControls/AccessibilityControls';
export { default as HeroBlock } from '../components/Blocks/HeroBlock/View';
export { default as Carousel } from '../components/Blocks/Listing/CarouselTemplate';
export { default as Grid } from '../components/Blocks/Listing/GridTemplate';
export { default as MediaCarousel } from '../components/Blocks/Listing/MediaCarouselTemplate';
export { default as Highlight } from '../components/Blocks/Listing/TeaserTemplate';
export { default as MainImageBlock } from '../components/Blocks/MainImageBlock/View';
export { default as DocumentByLine } from '../components/DocumentByLine/DocumentByLine';
export { default as DropdownMenu } from '../components/DropdownMenu/DropdownMenu';
export { default as HeaderBarActions } from '../components/HeaderBar/HeaderBarActionsUI';
export { default as MenuItem } from '../components/Navigation/SCNavigation/MenuItem';
export { default as Navigation } from '../components/Navigation/SCNavigation/SCNavigation';
export { default as SubMenu } from '../components/Navigation/SCNavigation/SubMenu';
export { default as SubMenuItem } from '../components/Navigation/SCNavigation/SubMenuItem';
export { default as SubMenuItems } from '../components/Navigation/SCNavigation/SubMenuItems';
export { default as SubMenuSection } from '../components/Navigation/SCNavigation/SubMenuSection';
export { default as ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
