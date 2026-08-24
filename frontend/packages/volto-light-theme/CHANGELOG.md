# Changelog

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html#contributing-change-log-label
-->

<!-- towncrier release notes start -->

## 1.0.0-alpha.5 (2026-08-24)

### Feature

- Added a Themes control panel for managing named themes, where a theme can be edited, duplicated from an existing one, or deleted — the default theme can be edited like any other, only its deletion is refused. The selected theme is applied by overriding the colour custom properties for the whole page; it is read from the `@inherit` expander, so a section inherits the closest theme set above it, and unsaved edits are previewed live while the form is open. @ericof [#20](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/20)

### Bugfix

- Fixed the header and footer briefly losing their inherited settings when leaving an edit form. Volto resets `content.data` before re-fetching, which blanked every value read from the inherit expander; those values now live in their own store slice that survives the reset. @ericof 
- Fixed the themes control panel showing a blank page to a user without the permission to manage themes. The panel now renders `Unauthorized` when the API refuses the fetch, which is the only check that tells an editor apart from a manager — a token is present for both. @ericof 

### Internal

- Split the themes control panel into `ThemesUI`, `ThemesList`, `ThemeForm`, `ThemesToolbarActions` and `ThemeSwatches`, with a Storybook story for each, so the panel's four states can be seen without a running site. @ericof 

## 1.0.0-alpha.4 (2026-08-05)

### Breaking

- Removed the `@kitconcept/volto-dsgvo-banner` add-on, so the theme no longer ships the DSGVO cookie banner or its Matomo and Google Analytics tracker dependencies. Projects that need it should add the add-on to their own configuration. @ericof [#18](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/18)

## 1.0.0-alpha.3 (2026-08-03)

### Bugfix

- Fixed subitem and it's styling + Hero block button styling. @humanaice 

## 1.0.0-alpha.2 (2026-07-31)

### Bugfix

- Fix `tsconfig.json` to avoid shipping dev-only `paths` to the published npm tarball, which broke alias resolution in consuming projects. @humanaice [#14](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/14)

## 1.0.0-alpha.1 (2026-07-30)

### Feature

- Added an offset setting to listing blocks, letting a listing skip the first N items of its query and paginate over the remainder. @ericof [#2](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/2)
- Added a component registry lookup for structural components, so a project can choose which header, navigation, mobile navigation and footer to render through the vlt settings instead of customizing the components. Unknown names fall back to the upstream light theme component. @ericof [#8](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/8)
- Moved the accessibility bar out of the header component and into the headerTop slot, so a project can replace or remove it without customizing the header. @ericof [#9](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/9)
- Added Storybook coverage for `DocumentByLine` with publication, modification, and author states. @humanaice 
- Added Storybook coverage for the accessibility controls, including `ThemeToggle`, `FontSizeControls` and `HoverReaderControls`. @humanaice 
- Added `TeaserTemplate` and refactored existing Carousel and MediaCarousel listing block templates. 
- Added a showcase add-on that lists the components registered for each slot and lets a visitor switch between them from a floating panel. It lives in its own package and only loads when RAZZLE_VLT_SHOWCASE is set on the server, so it stays out of client sites. @ericof 
- Added and updated multiple blocks including DocumentByLine, HeroBlock, Listing (with Grid and Carousel templates), MainImageBlock, and QuoteBlock. @humanaice 
- Added custom hooks (`useAutoCollapse`, `useNavCollapse`, `useTheme`) and preferences utilities for UI behaviors. 
- Added new PostFooter component with its corresponding styles. @humanaice 
- Added new content type colors configuration, alongside various SCSS style improvements for blocks and components. @humanaice 
- Changed the post footer to show the brand slogan, brand message and footer logo configured on the site, replacing the placeholder text it shipped with. @ericof 
- Enhanced Navigation and Header components with updates to MenuItem, SubMenu, MobileTools, and FontSizeControls. @matheus 
- Implemented Accessibility Controls in Header, featuring ThemeToggle, FontSizeControls, HoverReaderControls, and text-to-speech support. @humanaice 
- Improved HeroBlock component including updates to schema, data handling, view, and added image information tests. @matheus 
- Introduced `DropdownMenu` component and its SCSS styles for general dropdown use cases in the theme. 
- Overhauled Navigation system with support for SubMenu, MenuItem sections, and mobile accessibility dropdowns. @humanaice 
- Refactored `HeaderBar` UI, including Accessibility Controls and Theme Toggle components, applying `react-doctor` optimizations. 
- Reorganized the header accessibility features into a dedicated header bar. The accessibility controls, language selector, theme toggle and user tools now render in a configurable `HeaderBar` (with a mobile dropdown), each toggled through `settings.scvlt.headerBar`, replacing the previous `headerTop` accessibility bar slot. @ericof 
- Updated Listing blocks with improvements in GridTemplate, CarouselTemplate, MediaCarouselTemplate, and added querystring results integration. @matheus 
- Updated SCNavigation, Header, and related components to improve layout and responsiveness. 
- Upgraded Volto to 19.1.6 and `@kitconcept/volto-light-theme` to 8.0.0-alpha.31, adopting the upstream component registry (`getVLTComponent`) and removing the local customizations and helpers now provided upstream. Added the calendar, DSGVO banner and image-editor blocks. @ericof 

### Bugfix

- Fixed the fat menu staying open after navigating through a simple link in the navigation. @ericof [#3](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/3)

### Internal

- Adjust spacing and typographic inheritance in the DropdownMenu. @humanaice 
- Cleaned up obsolete Listing overrides (`GridTemplate.jsx`, `getAsyncData.js`, `withQuerystringResults.jsx`). 
- Refactor HeroBlock to better use the default container space. @humanaice 
- Refactor accessibility controls (HeaderBar, MobileTools) and Hover components for better usability. @humanaice 
- Refactored base SCSS structure (added mixins, moved views) and updated project TypeScript definitions and configurations. 
- Updated global theme variables, root configurations, typography, and SCSS structure for blocks and components. @humanaice
