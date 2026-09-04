# Changelog

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html#contributing-change-log-label
-->

<!-- towncrier release notes start -->

## 1.0.0-alpha.6 (2026-09-04)

### Feature

- Added stories for the navigation components — the navigation itself, menu items, the fat menu, and its section header and item grid — covering the active states, sections with and without children, and missing descriptions. The fixtures and a scope decorator had been written for this in an earlier change but nothing consumed them. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added an Event view story. Upstream volto-light-theme gives the Event type its own initial blocks — `title`, a fixed `eventMetadata` and `slate` — and the `eventMetadata` block reads the schedule, location and contact fields off the content item, which is what gives the type its distinct layout. The fixture carries those fields so the block renders as it would on a site. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Extended the Storybook coverage of blocks that come from dependencies. The social embed blocks now carry the sample payloads from their own stories in `@kitconcept/volto-social-blocks` rather than invented ones; `gridBlock` gets stories at one, two, three and four columns of image blocks with titles and captions; and the page-level composition gained a grid and an embed alongside the existing blocks. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added separator block stories covering its three controls — block width, the short-line toggle and alignment. Alignment only applies when `shortLine` is on, which its schema enforces by disabling the control otherwise, so the stories pair them rather than offering alignment on a full-width rule. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added page-level view stories rendering a Document and a News Item through Volto's `DefaultView`, with every block the add-on ships composed in one `blocks_layout`. Block stories show each block alone; these show the spacing between them, the container widths, and the `#page-document` container that several listing rules are scoped to. The fixture seeds the querystring results the listing block would otherwise fetch, so it renders real cards without a backend. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added stories for the four listing variations — Grid, Highlight, Carousel and Media Carousel — with a shared fixture shaped like a `@querystring-search` response. Each renders inside the `block listing <variation>` wrapper the listing block produces on a page, because `_listing.scss` is scoped to `body .block.listing`: without it none of the variation styling applies. This is what makes the restored focus outlines observable, and it closes the largest remaining gap in Storybook coverage. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Made every user-facing string in the add-on translatable. All labels, block and variation titles, schema field titles and descriptions, editor placeholders and carousel `aria-label`s now go through `react-intl` with stable message ids and English default messages, replacing the hardcoded Portuguese that had no catalogue behind it. Block and listing-variation titles are registered for extraction in `src/index.ts`, since Volto translates those through `formatMessageWithFallback` using the string itself as the id. The extraction yields 147 messages and the `pt_BR` catalogue is complete; `es` and `de` remain empty. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added a Storybook theme decorator with three toolbar controls: colour mode (light, dark, high contrast), block theme (Primary, Brand) and site theme (an `ISCVLTThemeDefinition` record). Stories previously rendered block views bare, so `--theme-*` was undefined in every one of them and Storybook never exercised the block theme system at all — HeroBlock alone carries 30 references to it, none of which resolved. The decorator reuses `createThemeDefinition`, so a theme added to the block config needs no change there. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added a blocks inventory and a blocks gallery to Storybook. The inventory reads `config.blocks.blocksConfig` at runtime, so it lists every block an editor actually has — 42 of them, of which this add-on ships four and extends two, the rest coming from Volto core, `@plone/volto-slate` and `@kitconcept/volto-light-theme`. The gallery renders each one through `RenderBlocks` with sample data, isolated behind a per-block error boundary so a block that throws is reported rather than blanking the page. Both update themselves when a dependency is bumped. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)

### Bugfix

- Fixed five blocks erroring in the blocks gallery. `accordion` needs `data.data` with a nested `blocks_layout`, `slateTable` needs `data.table.rows`, and `highlight` reads `state.content.subrequests` keyed by block id — all three threw on undefined. `search` and `eventCalendar` dispatch thunks on mount, which the plain mock store rejects, so the gallery now uses Volto's real-store wrapper. All 42 registered blocks render without error. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Aligned `ThemeSettings` type and `fixtures.ts` mock data to match the actual backend schema (which provides `_light` and `_dark` pairs directly). Removed redundant CSS token generation in `themeStyles.ts` and fixed the `COLOR_FIELD` validation regex to correctly process the `_light` and `_dark` color fields. @humanaice [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the fat menu stories rendering out of position and unstyled. The panel is absolutely positioned against the menu item that triggers it, so it needs the `.desktop-menu` list and an item with width; the open state is signalled by an `active` class, which two decorators had spelled differently. Every story is now also constrained to the default container width and centred, with an opt-out for the views and header that genuinely span the page. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the navigation story decorator applying only part of the selector the stylesheet needs. `_navigation.scss` nests everything under `#navigation.navigation` and `&.scNavigation`, and the decorator supplied the id and the first class but not the second, so none of the rules matched: the fat menu rendered its content but `.submenu-items` never became a two-column grid and its links kept the browser's default colour. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed keyboard focus being invisible on listing cards. Six `outline` declarations in `_listing.scss` read `--theme-top-high-contrast-foreground-color`, which no theme defined, so the whole declaration was invalid and dropped. Four of the fourteen properties mapped by `createThemeDefinition` had no value in either theme; all of them are now defined, which also restores the carousel's high-contrast foreground, gives the `brand` theme a valid `border-width` outside high-contrast mode, and makes the Pattern layer's tokens resolve. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Gave the `documentByline` block a stylesheet. It had none anywhere in `src/theme/`, so on a page it started flush against the viewport edge while every other block sat in the centred content column. The three fields are now inline, separated by a dash, at the small type step, with author names comma-separated; the byline also reads author first, then published, then modified, and its rows are paragraphs rather than nested containers. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the content-type colours doing nothing when set from the themes control panel. `_root.scss` read `--event-color-override`, `--file-color-override` and `--image-color-override`, which nothing writes: a theme's `event_color_light` setting reaches the page as `--event-color-light`. The three tokens now read the properties a theme actually sets, through `light-dark()` like every other colour, so they follow the colour mode as well. The contract between the backend schema and the stylesheet is now tested from both ends — the previous tests checked that a field derives a custom property, but not that any stylesheet reads it. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the Hero block's `fullWidth` option being unreachable. Both views branch on it to render full-bleed when there is no image, but it appeared in no fieldset, so no editor could set it. It is now part of the Layout fieldset. Also corrected a `--theme-low-contrast-foreground` reference in `_heroBlock.scss` that was missing its `-color` suffix and silently dropped the colour. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the carousel and highlight listing variations formatting dates as `pt-BR` regardless of the active language. Both now format through the locale from `react-intl`. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the header bar and accessibility control stories rendering out of context. The accessibility controls are drawn as light pills for the dark header bar, so on the story's hardcoded pale background they read as unstyled browser buttons and wrapped onto two lines; they now render inside the same `header-wrapper` → `header-bar-wrapper` → `header-bar` → `header-bar__inner` chain the header builds. The hardcoded greys in the header bar, accessibility and dropdown stories were replaced with theme tokens so they follow the colour mode, and two Portuguese labels left in the header bar mocks were translated. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Fixed the `documentByline` block presenting itself as a weather block: its schema title read "Previsão do Tempo", contradicting its registration title, and its exported data interface declared `location` and `measure` instead of the three fields the schema actually has. The block is now titled "Byline" throughout, and its boolean fields are no longer marked required — one of them defaults to `false`, which made the block unsaveable in a strict form. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)

### Internal

- Replaced the story imagery with fourteen bundled photographs of known provenance. The fixtures pointed at `picsum.photos` — arbitrary third-party images, no licence trail, and a network request at view time. They now `import` files from `src/storybook/images/`, which webpack inlines for Storybook and esbuild inlines for the Claude Design export, so stories render offline and reproducibly. A new `imageScales()` helper shapes them the way Plone's REST API shapes an image field, and `optimize.sh` keeps them under a weight budget that matters because the export inlines them as data URIs. Also scoped the package's `README.md` ignore rule to the package root: a bare rule was hiding `src/storybook/README.md`, which `DESIGN_SYSTEM.md` links to, from git entirely. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Added a test guarding the contract between `createThemeDefinition` and `_root.scss`. Nothing else catches a theme property that the factory maps but the stylesheet never defines: a `var()` with no definition and no fallback is invalid at computed-value time, so the whole declaration is silently dropped — which is how six focus outlines in `_listing.scss` stopped rendering. The test reads the `:root` block specifically, because a token declared only under `[data-theme='high-contrast']` is still undefined in light and dark. Verified by reintroducing both original defects and confirming each one fails it. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Storybook now serves the add-on's `public` folder at its root, so a story can reference a bundled asset as `/images/example.jpg` instead of depending on a remote image host at view time. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Stopped publishing what projects do not consume. `.npmignore` now excludes stories, tests, their fixture assets, and the build products the design-system export emits — npm ignores `.gitignore` entirely once an `.npmignore` exists, so gitignored artifacts were being packed. The tarball drops from 404 files (1242 KB) to 192 (509 KB). @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Prepared the add-on for export to Claude Design. `createThemeDefinition` moved to its own `config/blockThemes` module — `config/blocks` re-exports it, so every existing import is unchanged — because importing the factory from there registers every block and drags in the slate editor. Four modules under `src/storybook/` supply what a standalone bundle lacks: a curated component surface, Volto's razzle-time globals, a minimally seeded config registry, and the provider chain the storybook decorators would otherwise give a story. The icons in `ThemeToggle` and `HoverReaderControls` are now imported through the package name rather than a relative path, the same form `.storybook/preview.jsx` already used, so a bundler other than webpack can resolve them. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)
- Split the stories by ownership: a story for a component this package ships stays beside the component, and a story for a component from a dependency moved to `src/storybook/` next to the decorator and the shared fixtures. The blocks inventory and gallery, Volto's `DefaultView`, core's `gridBlock` and the separator block were filed under `components/` as though the add-on owned them. @ericof [#22](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/22)

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
