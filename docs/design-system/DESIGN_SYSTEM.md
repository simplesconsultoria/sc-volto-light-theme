# Design System — `@simplesconsultoria/volto-light-theme`

The architectural manifest for `@simplesconsultoria/volto-light-theme`: what this add-on owns, how it extends upstream Volto and `@kitconcept/volto-light-theme`, and the rules governing tokens, container queries, block themes, Storybook stories, and Claude Design sync.

All factual claims were verified against source or runtime probes on **2026-11-11**.

- **Package:** `@simplesconsultoria/volto-light-theme@1.0.0-alpha.14`
- **Built on:** `@kitconcept/volto-light-theme@8.1.4` (`package.json` `theme`) + 16 declared addons
- **Companion documents:** [INVENTORY.md](./INVENTORY.md) for exhaustive schemas and token tables, [GAPS.md](./GAPS.md) for verified open defects and design decisions

---

## 1. Architecture & layer stack

Four layers compose at runtime, and debugging any visual issue starts with identifying which layer owns the element:

| layer | supplies | how you change it |
|---|---|---|
| **Volto core** + `@plone/volto-slate` | block registry, Slate editor, layout grid primitives, default widgets/views | core/addon releases (or targeted `customizations/` shadows) |
| **`@kitconcept/volto-light-theme@8.1.4`** + block addons | base visual language, `--theme-*` convention, 10 `@property` declarations, 3rd-party blocks (`accordion`, `banner`, `carousel`, `highlight`, `logos`, `separator`, `slider`, etc.) | upgrading npm dependencies or SC-VLT SCSS/schema extensions |
| **`sc-vlt` (`this add-on`)** | **6** own blocks, **10** extended blocks + **6** listing variations, universal styling injection (`theme`, `blockWidth`, `borders`), **Color Groups + Block Themes**, semantic cool-slate palette, `rem` type scale, accessible HeaderBar/Navigation/EventMetadata | editing this package |
| **Site configuration** | site palette, fonts, 2nd-layer patterns/images, custom block-theme combinations | creating/editing records in `@controlpanels/themes` (`ISCVLTThemeDefinition`) |

**The live authoritative catalogue is Storybook's `Blocks/Inventory`**, which reads `config.blocks.blocksConfig` at runtime — **47 blocks** today (**6** own, **10** extended, **31** inherited).

---

## 2. What this add-on owns & extends

### 2.1 Shipped blocks (6)

Registered in `src/config/blocks.ts` → `installLocalBlocks()`:

- **`heroBlock`** (`Flex / Decorative`, `Attached Card`): dynamic schema (`HeroBlockSchema`), `dataAdapter`, multi-CTA buttons (`buttons`), `30+` theme variable consumers across `_heroBlock.scss`. Defaults unspecified block width to `'layout'`.
- **`customGrid`**: 13 fractional CSS Grid layouts (`1` through `1-1-1-1`), independent per-column `block_theme_widget` themes (`ColumnSchema`), container-query-aware columns, defaults unspecified block width to `'layout'`.
- **`mainImageBlock`**: renders page `preview_image_link` (resolved across block data, metadata, properties, content, or Redux store), supports float align (`left`/`right`/`center`), and wraps `Layout` in `withBlockExtensions` + `resolveBlockTheme`.
- **`quoteBlock`**: Slate-powered blockquote (`blockHasOwnFocusManagement: true`) with `author` and `transparent`/`filled` background modes.
- **`documentByline`**: publication date, modification date, and author chips with `_documentByLine.scss` styling and `withBlockExtensions`.
- **`eventMetadata`**: four-column event schedule, location/stream link, contact, and participation summary pulling from Event content properties with schema field overrides (`EventMetadataSchema`), `normalizeBlockWidth`, and `_eventMetadataBlock.scss`.

### 2.2 Extended blocks & container rules (10 + universal enhancer)

- **`listing`:** replaces upstream `grid` and `imageGallery` templates with `GridTemplate` (adds `gridColumns` 1–4), adds `carousel`, `mediaCarousel`, `teaser` ("Highlight"), and `events` variations, and composes `listingSchemaEnhancer` (`headlineButtonText`/`headlineButtonLink`) on top of upstream's enhancer.
- **Standalone extensions:** `separator` (custom `SeparatorSchema` with colour/thickness/width/alignment, excluded from card borders), `introduction` (injects `styles.align`), `banner` (injects `styles.size:noprefix` `image_size` widget titled `"Height"`), `search` (`SearchBlockView`/`SearchBlockEdit` + `sanitizeSearchData` guarding invalid variations), and thin wrapper `<div>`s forwarding `className`/`style` on `slate`, `toc`, and `slateTable`.
- **Container sync (`syncContainerBlocks`):** expands `allowedBlocks` on `gridBlock` (**46**) and `accordion` (**49**) and mirrors `blocksConfig` into containers (`accordion`, `tabs_block`, `columnsBlock`, `gridBlock`, `customGrid`). Inside `accordion`, every child block's `schemaEnhancer` is wrapped with `disableThemeSchema` and `_accordion.scss` forces `--theme-*` / `--colorgroup-*-font` `inherit !important` so nested blocks never split panel colour schemes.
- **Universal block styling (`enhanceBlockConfig` + `Proxy`):** wraps every existing and dynamically registered block's `schemaEnhancer` (including blocks and enhancers that add-ons loaded later register, replace or spread) to expose root `theme` (`block_theme_widget`), `styles.blockWidth:noprefix` (`narrow`, `default`, `layout`, `full`), `styles.--cardBorderColor`, and `styles.--cardBorderWidth` (`border_widget`, unless excluded via `borderExcludedBlocks`). Three `styleClassNameExtenders` in `src/index.ts` emit `has--block-width--*`, `has--block-alignment--*`, `has--border`, `has--theme--*`, and `has-{back,front}-colorgroup-*`. On left/right floated `image` and `mainImageBlock` blocks, `blockWidth` is omitted from the sidebar and `resolveBlockWidthForBlock` inherits the adjacent sibling's width.

---

## 3. Color Groups & the Block Theme system

Rather than editing 14 tokens per block theme manually, `sc-vlt` separates palette **Color Groups** from block-level **Block Themes**:

1. **Color Group** (`primary`, `secondary`, `accent`, `neutral`, or custom site-created groups): defines light & dark values for `background_color`, `text_color`, `subtext_color`, and `accent_color`, a `font_family`, and an optional **2nd background layer** (`bg_image_{light,dark}_{desktop,mobile}` or one of **8** `CSS_PATTERN_PRESETS`, plus `bg_size`, `bg_repeat`, `bg_position`).
2. **Block Theme** pairs a **back** Color Group (**Ground**: block background, headings, outline/solid ground text, borders) with a **front** Color Group (**High Ground**: cards, teaser boxes, badges, chips, elevated surfaces):
   - **`default`**: `back = primary`, `front = neutral`, top accent bar (`4px 0 0 var(--accent-color)`).
   - **`alternative`** (`brand` preserved as CSS & JS lookup alias): `back = accent`, `front = primary`, borderless (`0`).
   - **`grey`** (plain VLT's theme, kept as an alias in `LEGACY_THEME_ALIASES`): read as `custom-secondary-primary`, a grey band with white cards.
   - **`custom-<back>-<front>`**: ad-hoc per-block pairing synthesized by `createCustomThemeDefinition` / `resolveBlockTheme` and propagated up to `.blocks-group-wrapper` (with `.blocks-group-wrapper.custom-*-*` rules generated for all 16 base pairings in `_root.scss`, and custom utility rules generated by `themeStyleSheet` for user-created Color Groups).
3. **Second background layer inheritance:** `resolveBlockTheme`, `blockThemeUtilityClasses`, and `colorGroupUtilityClasses` bind `--theme-bg-*` for Ground and `--highground-bg-*` / `--colorgroup-front-bg-*` for High Ground containers (`.teaser-item`, `.hero-card`, `.hero-card-info`, `.is-highground`, `[data-ground='high']` in `_globals.scss:227-248`), while non-high-ground intermediate containers inside `.blocks-group-wrapper` are forced transparent so group backgrounds bleed cleanly.

> **Token contract test:** `tests/theme/blockThemes.test.ts` parses `_root.scss` and every SCSS consumer of `--theme-*` to fail builds if a factory mapping is undeclared in `:root` or a stylesheet reads an unmapped `--theme-*` token (preventing silent computed-value drops). See [GAPS.md](./GAPS.md) §1.1–1.2 for remaining pattern/legacy-token exceptions.

---

## 4. Colour architecture, `@property` constraints & contrast

### 4.1 Semantic tokens first

Base neutrals (`--gray-02`..`--gray-dark-*`) and brand shades (`--brand-color*`) live in `src/theme/_root.scss`. Components must consume `--theme-*` or semantic `--{primary,secondary,accent,neutral}-*` tokens — never literal hex or `--gray-*` steps — so dark mode, high-contrast mode (`[data-theme='high-contrast']`), and site control-panel overrides work automatically. Visual reference: [previews/colors.html](./previews/colors.html) and [previews/block-themes.html](./previews/block-themes.html).

### 4.2 `@property` eager resolution constraint (`@kitconcept/volto-light-theme@8.1.4`)

Upstream VLT registers **10** custom properties via `@property` in `src/theme/_variables.scss`:
`--background`, `--text-color`, `--text-size`, `--primary-color`, `--primary-foreground-color`, `--secondary-color`, `--secondary-foreground-color`, `--accent-color`, `--accent-foreground-color`, `--image-aspect-ratio`.

Because `@property { syntax: '<color>'; }` is **computed eagerly where declared** (at `:root`), `light-dark(...)` inside those six registered colour tokens locks onto the `color-scheme` of `<html>`. Unregistered properties (`--*-low-foreground-color`, `--*-accent-color`, etc.) stay as token streams and resolve against the **closest ancestor's** `color-scheme`.

Therefore, whenever rendering a colour-mode switcher on a scoped wrapper (such as Storybook's `withTheme.tsx` or `DsPreviewProvider.tsx`), `color-scheme` / `data-theme` MUST be set on **both `document.documentElement` and the story wrapper**; setting it on only one freezes half the tokens.

### 4.3 Default contrast (WCAG 2.1 AA)

`DEFAULT_COLOR_GROUPS` uses a cool slate neutral scale + light-blue brand ramp (`#a5d8ff` light / `#1c3a57` dark). Across all 4 Color Groups × 3 foreground roles × 2 colour modes (24 foreground/background pairs), every shipped pair clears **WCAG 2.1 AA (≥ 4.5:1)**: ratios range from **4.68:1** (`neutral` light accent `#1971c2` on `#f6f7f9`) to **16.15:1** (`primary` dark text `#f1f3f5` on `#14171c`). Because site admins replace Color Group colours per project via the Themes control panel, per-site contrast validation remains necessary on deployment.

---

## 5. Typography

- **Typeface:** `Inter` (`font_family: 'Inter, sans-serif'` in `DEFAULT_COLOR_GROUPS`, bundled across 83 font/specimen files in `dist/fonts/` via upstream VLT). While `_root.scss:151-154` initializes `--font-*` to `system-ui, sans-serif`, `_globals.scss:6-17` rebinds `--font-body`, `--custom-font`, `--custom-main-font`, and `--font-sans` on `body` to `var(--font-family-primary, 'Inter', sans-serif)` (with `--custom-font` preferring `--font-family-secondary`), and `themeStyles.ts:480-489` mirrors `primary.font_family` onto `:root`. `_variables.scss` keeps all 11 `$font-sizes` / `$line-heights` steps (`2xs` `0.75rem` – `6xl` `5rem`) and 6 scalar heading sizes in **`rem`** so `--font-scale` (`0.8`–`1.3`) scales everything proportionally.
- **Headings & scale preview:** [previews/typography.html](./previews/typography.html).

---

## 6. Layout, Borders & Scoping Rules

### 6.1 Widths & Responsive Columns

`--narrow-container-width` (`940px !important`), `--default-container-width` (`940px !important`), and `--layout-container-width` (`1440px !important`) govern `has--block-width--{narrow,default,layout,full}` across `_blockWidth.scss` in both view and `#page-edit` / `#page-add` modes (excluding nested blocks inside `.column`, `.custom-grid-column`, and `.contained`). `_customGrid.scss` defines container queries (`container-type: inline-size` on `.custom-grid-column`, `.block.gridBlock .column`, `#page-document`): below **`280px`** (and explicitly on 20% / 4+ column grids), `image` blocks switch from overlay caption to stacked `<figcaption>` underneath (`@mixin small-grid-image-caption-layout`).

### 6.2 Decoupled Border Placement (`_borders.scss`)

Instead of framing every outer `.block` box uniformly, `_borders.scss` targets inner semantic surfaces when `--cardBorderWidth` is set: `img` (`image` / `mainImageBlock`), `.quote-block` (`quoteBlock`), `.ui.accordion` (`accordion`), `.teaser-item` (`highlight`), `table` (`slateTable`), `.item` / `.logo-item` (`logos`), `.carousel-container .card` (`carousel`), `.slider-viewport` (`slider`), explicit `[data-border-target]` / `.block-border-target`, and fallback `.block-inner-container`.

### 6.3 Selector scoping — Storybook & Preview Gotcha

Many stylesheets depend on ancestor DOM selectors present on real Plone pages. Rendering a component outside its ancestor chain drops all matching rules cleanly without throwing errors:

| stylesheet | required ancestor / ground |
|---|---|
| `blocks/_listing.scss` & `listing/*` | `body .block.listing` (or `#page-edit .block.listing`, `.block.search`), plus variation class (`carousel`, `mediaCarousel`, `teaser`, `events`) |
| `components/_header*.scss`, `_mobileTools.scss` | `body header.header-wrapper` (plus `.header-bar-wrapper`) |
| `components/_navigation.scss` | `#navigation.navigation.scNavigation` |
| `blocks/_heroBlock.scss` / `_quoteBlock.scss` / themed blocks | ancestor resolving `--theme-*` & `--highground-bg-*` (`resolveBlockTheme` or themed `blocks-group-wrapper`) |
| `components/_accessibilityControls.scss`, `_themeToggle.scss` | unscoped selectors, but styled for the dark `--secondary-color` bar (`HeaderBar`) |

Stories and previews must wrap these components in their matching ancestor + ground rather than an unstyled neutral canvas.

---

## 7. Per-project overlay (`ISCVLTThemeDefinition`)

`backend/src/sc/voltolighttheme/interfaces.py` defines `ISCVLTThemeDefinition` with 4 fields (`name`, `description`, `color_groups`, `block_themes`). At runtime:
1. `src/config/settings.ts` adds the `sc.voltolighttheme.themeselector` behavior to `expand.inherit.behaviors` (dropping upstream `voltolighttheme.*` behaviors).
2. `src/config/slots.ts` registers `Theming` into `aboveHeader`. Even on 404 routes (`errorContext`), `Theming` fetches `@inherit` from the site root (`''`) so branded colours persist on Not Found pages.
3. `src/helpers/themeStyles.ts` compiles the theme into `:root` tokens + utility classes inside `<Helmet><style data-sc-theme="...">` and bridges `primary`/`secondary`/`accent`/`neutral` onto upstream's CSS tokens.
4. `src/helpers/themesControlpanel.ts` strips **40** legacy per-colour/font fields (`LEGACY_THEME_FIELDS`, matching `backend/src/sc/voltolighttheme/utils/legacy_themes.py`) from control panel forms while legacy passthrough records still feed CSS custom properties if stored.
5. `src/index.ts` registers the 5 custom sidebar/controlpanel widgets (`style_simple_color`, `color_groups_widget`, `block_themes_widget`, `block_theme_widget`, `border_widget`).

---

## 8. Storybook & Export to Claude Design (`.design-sync/`)

- **Storybook (50 files, 261 exports):** built with `@storybook/react-webpack5` + Razzle (`frontend/.storybook/`). Owned component stories sit beside their component (`src/components/`); inherited Volto/addon block showcases (`Blocks/Grid`, `Blocks/Banner`, `Blocks/Slider`, `Blocks/Gallery`, `Blocks/Inventory`, `Views/Default View`) sit in `src/storybook/` alongside `withTheme.tsx` and `blockStyling.tsx` (`StyledBlock` + `StylingMatrix`). Sample photography is bundled locally in `src/storybook/images/` (`14` `.jpg` assets).
- **Standalone converter pipeline (`.design-sync/`):** because Volto relies on webpack relative/tilde aliases and `load-volto-addons`, `./.design-sync/prepare.sh` prepares standalone `esbuild` & `tsc` outputs without altering Volto core:
  - `build-icons.py`: compiles `373` SVGs across Volto/VLT/addons into `svg-loader`-compatible `.svg.js` twins. (Own icons imported by shipped components must use `@simplesconsultoria/volto-light-theme/icons/<name>.svg`, never relative `../../icons/...` paths.)
  - `build-overlay.py`: generates `.design-sync/nm-overlay/` mapping `@plone/volto/src`, `@plone/volto-slate/src`, `@kitconcept/volto-light-theme@8.1.4`, stripped addon sources (removing bare `.less`/`.scss` side-effect imports), layered `customizations/`, and singleton `@plone/registry`.
  - `build-css.sh`: emits standalone `dist/theme.css` + `83` files under `dist/fonts/`.
  - `dsEntry.ts`: exports **28** design-system components/providers initialized via `dsGlobals.ts` + `dsConfig.ts` (seeding Volto core, `@plone/volto-slate`, all 16 addons, and `applyConfig`), with `tsconfig.ds.json` wiring paths to `nm-overlay`.
  - [previews/](./previews/): **7** `@dsCard` HTML previews (`colors.html`, `block-themes.html`, `typography.html`, `block-byline.html`, `block-hero.html`, `block-main-image.html`, `block-quote.html`), captured with computed styles and rendered cleanly. _Keep `.design-sync/config.json` path overrides documented in `.design-sync/NOTES.md` in mind when running the converter on another checkout._

---

## 9. Open decisions summary

Non-defect product/design choices needing human resolution are tracked alongside code/CSS gaps in [GAPS.md](./GAPS.md):
- Differentiate `--narrow-container-width` from `--default-container-width` (currently both `940px !important`) and review `!important` container overrides.
- Decide whether to implement `--theme-pattern-{image,opacity}` or remove those unused mappings (the active 2nd background layer already uses Color Group `--colorgroup-*-bg-image` / `--highground-bg-image` + `--theme-bg-image`).
- Clear background images/patterns under `[data-theme='high-contrast']`.
- Expose a header foreground field or remove the unreachable `--header-foreground-color` / `LEGACY_PASSTHROUGH_FIELDS` controlpanel gap.
- Add sample fixtures for the 16 unseeded themed blocks in `Blocks/Gallery` and update legacy `HeroBlock.stories.tsx` button props.
- Decide on `es` / `de` translation completeness (`0 / 376`) and `pt-BR` / `BRT` locale hardcoding in event components.
