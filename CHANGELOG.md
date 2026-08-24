# Change log

<!-- You should *NOT* be adding new change log entries to this file.
     You should create a file in the news directory instead.
     For helpful instructions, please see:
     https://6.docs.plone.org/contributing/index.html#contributing-change-log-label
-->

<!-- towncrier release notes start -->
## 1.0.0a5 (2026-08-24)

### Backend


#### New features:

- Added named themes: managers define them in a new Themes control panel and editors select one per site or section through the `sc.voltolighttheme.themeselector` behavior. Themes are stored in the registry as `ISCVLTThemeDefinition` records, exposed through the `sc.voltolighttheme.themes` vocabulary, and their settings are resolved when the field is serialized, so the closest theme up the acquisition chain applies. Also replaced the `kitconcept.voltolighttheme` header and footer behaviors with our own. @ericof [#20](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/20)
- Added an `intranet` extension profile that enables the `sc.voltolighttheme.intranetheader` behavior on the site root in place of `sc.voltolighttheme.siteheader`. The profile is hidden from the add-ons control panel, so it is applied by a distribution rather than installed by hand. @ericof 


#### Internal:

- Bumped the default profile to version 1001 and added the matching upgrade step, which reimports the registry, the Plone Site FTI and the control panel configuration, and uninstalls `kitconcept.voltolighttheme`. The dependency on `profile-kitconcept.voltolighttheme:default` was dropped, and its header, theme and footer behaviors are now unregistered through `z3c.unconfigure` when the package is present. @ericof [#20](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/20)
- Moved the `natal` example theme out of the default profile and into the `initial` example-content profile, so a plain installation ships only the `default` theme. @ericof 


#### Tests

- Consolidated the test fixtures into a single `tests/conftest.py`: `dummy_type_schema` and `create_dummy_content` were duplicated verbatim in `tests/behaviors/conftest.py`, which also held the only definition of the `role_request` they depend on. `portal_factory` gained a `container` flag so a type can hold pages, and `themed_portal` builds on it instead of declaring its own FTI. @ericof 



### Frontend

#### Feature

- Added a Themes control panel for managing named themes, where a theme can be edited, duplicated from an existing one, or deleted — the default theme can be edited like any other, only its deletion is refused. The selected theme is applied by overriding the colour custom properties for the whole page; it is read from the `@inherit` expander, so a section inherits the closest theme set above it, and unsaved edits are previewed live while the form is open. @ericof [#20](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/20)

#### Bugfix

- Fixed the header and footer briefly losing their inherited settings when leaving an edit form. Volto resets `content.data` before re-fetching, which blanked every value read from the inherit expander; those values now live in their own store slice that survives the reset. @ericof 
- Fixed the themes control panel showing a blank page to a user without the permission to manage themes. The panel now renders `Unauthorized` when the API refuses the fetch, which is the only check that tells an editor apart from a manager — a token is present for both. @ericof 

#### Internal

- Split the themes control panel into `ThemesUI`, `ThemesList`, `ThemeForm`, `ThemesToolbarActions` and `ThemeSwatches`, with a Storybook story for each, so the panel's four states can be seen without a running site. @ericof 



### Project


#### Internal

- Deploy Storybook from the main workflow, and take the Node version from the workflow inputs rather than a job output that is not in scope there. @ericof 



## 1.0.0a4 (2026-08-05)

### Backend

No significant changes.




### Frontend

#### Breaking

- Removed the `@kitconcept/volto-dsgvo-banner` add-on, so the theme no longer ships the DSGVO cookie banner or its Matomo and Google Analytics tracker dependencies. Projects that need it should add the add-on to their own configuration. @ericof [#18](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/18)



### Project

No significant changes.




## 1.0.0a3 (2026-08-03)

### Backend

No significant changes.




### Frontend

#### Bugfix

- Fixed subitem and it's styling + Hero block button styling. @humanaice 



### Project

No significant changes.




## 1.0.0a2 (2026-07-31)

### Backend

No significant changes.




### Frontend

#### Bugfix

- Fix `tsconfig.json` to avoid shipping dev-only `paths` to the published npm tarball, which broke alias resolution in consuming projects. @humanaice [#14](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/14)



### Project

No significant changes.




## 1.0.0a1 (2026-07-30)

### Backend


#### New features:

- Added example content showcasing the new blocks and elements, and included Link in the navigation displayed types. @ericof [#4](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/4)
- Added a backend container image that ships with a Plone site and the example content already created, so the demo stack starts with a populated site. @ericof [#7](https://github.com/simplesconsultoria/sc-volto-light-theme/issues/7)
- Added a footer behavior with a brand slogan and a brand message, and enabled the kitconcept footer behavior so a site can set its own footer logo. Both are editable per site and subsite, and the example content now fills them in. @ericof 



### Frontend

#### Feature

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

#### Bugfix

- Fixed the fat menu staying open after navigating through a simple link in the navigation. @ericof [#3](https://github.com/simplesconsultoria/sc-volto-light-theme/issue/3)

#### Internal

- Adjust spacing and typographic inheritance in the DropdownMenu. @humanaice 
- Cleaned up obsolete Listing overrides (`GridTemplate.jsx`, `getAsyncData.js`, `withQuerystringResults.jsx`). 
- Refactor HeroBlock to better use the default container space. @humanaice 
- Refactor accessibility controls (HeaderBar, MobileTools) and Hover components for better usability. @humanaice 
- Refactored base SCSS structure (added mixins, moved views) and updated project TypeScript definitions and configurations. 
- Updated global theme variables, root configurations, typography, and SCSS structure for blocks and components. @humanaice 



### Project


#### Feature

- Changed the Docker Compose stack to run the published demo images from ghcr.io instead of building them locally, removing the ZEO service and its data volume, and made the stack hostname configurable through the STACK_HOSTNAME environment variable. @ericof [#7](https://github.com/simplesconsultoria/sc-volto-light-theme/pull/7)
- Enabled the showcase add-on on the demo stack by setting RAZZLE_VLT_SHOWCASE on the frontend service. @ericof 



