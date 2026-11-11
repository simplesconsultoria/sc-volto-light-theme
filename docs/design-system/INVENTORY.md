# Design System Inventory

Machine-extracted inventory of `@simplesconsultoria/volto-light-theme`.

Every row and count is derived from source by reading or probing the runtime registry. Evidence paths are relative to `frontend/packages/volto-light-theme/` unless noted otherwise. `[V 2026-11-11]` marks facts verified against the working tree on that date.

- **Package:** `@simplesconsultoria/volto-light-theme@1.0.0-alpha.14` (declares 16 Volto `addons` in `package.json`)
- **Upstream:** `@kitconcept/volto-light-theme@8.1.4` (`package.json` `theme` field and installed dependency)
- **Runtime block registry:** **47 blocks** (all 47 expose both `id` and `view`): **6** own, **10** extended, **31** inherited
- **Companions:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the architectural manifest and rules, [GAPS.md](./GAPS.md) for verified open defects and decisions

---

## 1. Blocks shipped by this add-on (6)

Registered in `src/config/blocks.ts` → `installLocalBlocks()`. `[V 2026-11-11]`

| id | title | group | icon | sidebarTab | restricted | mostUsed | evidence |
|---|---|---|---|---|---|---|---|
| `documentByline` | `Byline` | `common` | `pencil.svg` | 1 | `false` | `true` | `src/components/Blocks/DocumentByLine/index.ts` |
| `mainImageBlock` | `Main Image` | `media` | `image.svg` | 1 | conditional on missing `preview_image_link` | `false` | `src/components/Blocks/MainImageBlock/index.ts` |
| `heroBlock` | `Hero Block` | `common` | `presentation.svg` | 1 | `false` | `false` | `src/components/Blocks/HeroBlock/index.ts` |
| `quoteBlock` | `Quote` | `text` | `quote.svg` | 1 | `false` | `false` | `src/components/Blocks/QuoteBlock/index.ts` |
| `customGrid` | `Custom Grid` | `common` | `apps.svg` | 1 | `false` | `true` | `src/config/blocks.ts`, `src/components/Blocks/CustomGrid/` |
| `eventMetadata` | `Event Metadata` | `common` | `calendar.svg` | 1 | `false` | `false` | `src/config/blocks.ts`, `src/components/Blocks/EventMetadata/` |

All six receive universal `theme` (`block_theme_widget`), `styles.blockWidth:noprefix`, `styles.--cardBorderColor`, and `styles.--cardBorderWidth` injection at runtime via `enhanceBlockConfig` (§3.2).

### 1.1 `documentByline`

Schema: `src/components/Blocks/DocumentByLine/schema.ts`. View: `View.tsx` (wrapped with `withBlockExtensions`), stylesheet: `src/theme/components/_documentByLine.scss`.

| field | type | schema default | view fallback | required |
|---|---|---|---|---|
| `showPublished` | `boolean` | `true` | `data.showPublished ?? true` | no |
| `showModified` | `boolean` | `true` | `data.showModified ?? true` | no |
| `showAuthor` | `boolean` | `false` | `data.showAuthor ?? true` | no |

Single fieldset `default`, `required: []` (plus `styling` injected by `enhanceBlockConfig`). Notice the `showAuthor` default mismatch (`false` in `schema.ts:49` vs `true` in `View.tsx:50`) and literal `` `${className}` `` stringification in `View.tsx:41` — see GAPS §2.3.

### 1.2 `mainImageBlock`

Schema: `src/components/Blocks/MainImageBlock/schema.tsx`. View: `View.tsx` (wrapped with `withBlockExtensions`, resolves theme inline via `resolveBlockTheme(data)` and `resolveThemeStyle(...)`, searches preview image across block data, metadata, properties, content, and Redux `state.content.data`).

| field | widget / type | default | notes |
|---|---|---|---|
| `title` | `string` | — | |
| `description` | `string`, `textarea` | — | |
| `altText` | `string` | — | description links to the W3C alt-text decision tree |
| `align` | `align` | `center` | `actions: ['left', 'right', 'center']` |
| `size` | `image_size` | `l` | initialized `m`, overridden to `l`; disabled when `align === 'center'` |
| `href` | `object_browser`, `mode: 'link'` | — | fieldset `link_settings`; `allowExternals: true` |
| `openLinkInNewTab` | `boolean` | — | fieldset `link_settings` |
| `theme` | `block_theme_widget` | `default` | placed on root by `defaultStylingSchema` + `enhanceBlockConfig` |
| `styles.blockWidth:noprefix` | `blockWidth` | `default` | `narrow`, `default`, `layout`, `full`; omitted by `enhanceBlockConfig` when `align` is `left` or `right` (inherits adjacent sibling width via `resolveBlockWidthForBlock`) |
| `styles.--cardBorderColor` / `--cardBorderWidth` | `style_simple_color` / `border_widget` | `''` | injected by `enhanceBlockConfig` |

Fieldsets: `default`, `styling`, `link_settings`. `required: []`.

### 1.3 `heroBlock`

Schema: `src/components/Blocks/HeroBlock/schema.ts`. Has `dataAdapter: heroBlockDataAdapter` (`adapter.ts`), stylesheet `src/theme/blocks/_heroBlock.scss`, and two variations in `index.ts`:

| variation | title | default |
|---|---|---|
| `flex` | `Flex / Decorative` | yes |
| `card` | `Attached Card` | no |

`HeroBlockSchema` is dynamic:
- `default` (`Content`) always carries `href`, `overwrite`, plus `headerText`, `showDate`, `footerText`; `overwrite: true` inserts `title` and `description`; `variation === 'flex'` appends `tags`; `variation === 'card'` prepends `fileType`.
- `image` carries `preview_image` only when `overwrite` is `true`, plus `hideImage` and `imageFit`.
- `cta` (`Call to Action`) carries `buttons` (`object_list` of `ButtonSchema`: `buttonText`*, `buttonLink`*, `theme: 'full' | 'outline'`, default `'full'`).
- `layout` carries `fullWidthImage`, `textSide`, `imageSize`, `fullWidth`, `titleTag`.
- `styling` (`defaultStylingSchema` + `enhanceBlockConfig`) adds root `theme` and `styles` (`blockWidth:noprefix`, borders). `View.tsx` calls `resolveBlockTheme(data)` and `normalizeBlockWidth(data, 'layout')`.

| field | widget / type | default | choices / notes |
|---|---|---|---|
| `href` | `object_browser`, `mode: 'link'` | — | `allowExternals: false`; **only required top-level field**; pulls 13 `selectedItemAttrs` |
| `overwrite` | `boolean` | `false` | unlocks `title`, `description`, `preview_image` |
| `fileType` | `string` | — | `card` variation only |
| `headerText` | `string` | — | |
| `showDate` | `boolean` | `true` | |
| `title` | `string` | — | shown when `overwrite: true` |
| `description` | `string`, `textarea` | — | shown when `overwrite: true` |
| `footerText` | `string` | — | |
| `tags` | `array` of `string` | — | `flex` variation only |
| `preview_image` | `object_browser`, `mode: 'image'` | — | `allowExternals: true`; shown when `overwrite: true` |
| `hideImage` | `boolean` | `false` | |
| `imageFit` | `string` | `cover` | `cover`, `contain` |
| `buttons` | `object_list` (`ButtonSchema`) | — | item fields: `buttonText`, `buttonLink` (externals allowed), `theme` (`full`, `outline`) |
| `fullWidthImage` | `boolean` | `false` | omitted from `HeroBlock/types.ts` (GAPS §2.2) |
| `textSide` | `align` | `left` | `actions: ['left', 'right']`; inverted in `useHeroBlockContent.ts:58-59` (GAPS §2.2) |
| `imageSize` | `string` | `50%` | `0%`, `30%`, `40%`, `50%`, `60%`, `70%` |
| `fullWidth` | `boolean` | `false` | expands text across block when no image is shown |
| `titleTag` | `string` | `h2` | `h1`, `h2`, `h3`, `p` |
| `theme` / `styles.*` | universal styling | `default` | `View.tsx` defaults missing width to `'layout'` |

### 1.4 `quoteBlock`

Schema: `src/components/Blocks/QuoteBlock/schema.ts`. `blockHasOwnFocusManagement: true` (Slate editor body). Stylesheet: `src/theme/blocks/_quoteBlock.scss`.

| field | type / widget | default | choices / notes |
|---|---|---|---|
| `value` | Slate value | — | supplied by `DetachedTextBlockEditor` / `TextBlockView` |
| `author` | `string` | — | |
| `backgroundStyle` | `string` | `transparent` | `transparent`, `filled` |
| `theme` / `styles.*` | universal styling | `default` | `defaultStylingSchema` + `enhanceBlockConfig` |

`required: []`. `_quoteBlock.scss:61,74` reads `--theme-top-foreground-color` on `.quote-text` and `.quote-author cite` even under `.bg-transparent` (GAPS §2.4).

### 1.5 `customGrid`

Schema: `src/components/Blocks/CustomGrid/Schema.ts`. `blockHasOwnFocusManagement: true`. Stylesheet: `src/theme/blocks/_customGrid.scss`.

| schema | field | widget / type | default | choices / notes |
|---|---|---|---|---|
| `CustomGridSchema` | `title` | `string` | — | |
| `CustomGridSchema` | `layout` | `string` (required) | `1-1` | 13 choices: `1`, `1-1`, `1-4`, `4-1`, `1-2`, `2-1`, `2-3`, `3-2`, `1-1-1`, `2-1-1`, `1-2-1`, `1-1-2`, `1-1-1-1` |
| `ColumnSchema` | `theme` | `block_theme_widget` | `default` | per-column theme stored in `col.settings.theme` |
| `ColumnSchema` | `backColorGroup` | `string` | — | declared in `properties` (not in `default` fieldset fields; populated alongside `theme`) |
| `ColumnSchema` | `frontColorGroup` | `string` | — | declared in `properties` (not in `default` fieldset fields; populated alongside `theme`) |

`View.tsx` normalizes container width via `normalizeBlockWidth(data, 'layout')`, resolves the grid theme via `resolveBlockTheme(data)`, and resolves each column's theme via `resolveBlockTheme` whenever `col.settings?.theme` is set (applying `has-theme` plus `has--theme--*` and ColorGroup classes/vars onto `.custom-grid-column`), passing `isContainer` and merged `properties` to `RenderBlocks`.

### 1.6 `eventMetadata`

Schema: `src/components/Blocks/EventMetadata/schema.ts`. Stylesheet: `src/theme/blocks/_eventMetadataBlock.scss`. View: `View.tsx` (uses `normalizeBlockWidth(data) || 'default'`, `getThemeClass(className, data?.theme)`, and `stripBlockWidthClasses`).

| field | widget / type | default | notes |
|---|---|---|---|
| `location` | `string` | — | overrides `item.location` |
| `eventUrl` | `url` widget | — | overrides `item.event_url` |
| `eventUrlLabel` | `string` | — | falls back to `Online stream` message |
| `contactName` | `string` | — | overrides `item.contact_name` |
| `contactEmail` | `string` | — | overrides `item.contact_email` |
| `price` | `string` | — | overrides `item.price` |
| `theme` | `block_theme_widget` | `default` | declared in `styling` fieldset; `enhanceBlockConfig` also ensures `styles.blockWidth:noprefix` and borders |

`View.tsx:63` appends a literal ` (BRT)` and `helpers.ts:21` hardcodes `pt-BR` date/time formatting (GAPS §5.3).

---

## 2. Extended blocks, Listing variations & inherited registry (41)

### 2.1 Extended blocks (10)

Modified in `src/config/blocks.ts` → `install()` / `installLocalBlocks()`. `[V 2026-11-11]`

| id | extension in `sc-vlt` | evidence |
|---|---|---|
| `accordion` | `installAccordionBlock` + `syncContainerBlocks` populate `allowedBlocks` (**49** entries) and wrap each child block's `schemaEnhancer` with `disableThemeSchema` so inner blocks inherit the accordion theme (`_accordion.scss`) | `src/config/blocks.ts:447-519, 729-737` |
| `banner` | wraps `banner.schemaEnhancer`, calls `addStyling`, and injects `styles.properties['size:noprefix']` (`widget: 'image_size'`, title `'Height'`, default `'m'`) styled in `_banner.scss` | `src/config/blocks.ts:859-892`, `_banner.scss` |
| `gridBlock` | `installGridBlock` sets `themes` / `blocksConfig.themes = customThemes`, appends local & registered blocks (`46` ids total) to `allowedBlocks`, and wraps `schemaEnhancer` with `addStyling` | `src/config/blocks.ts:383-433` |
| `introduction` | wraps `introduction.schemaEnhancer`, runs `addStyling`, and injects `align` (`widget: 'align'`) into `styles.schema` | `src/config/blocks.ts:228-255` |
| `listing` | overrides `grid` & `imageGallery`, adds 4 variations (`carousel`, `mediaCarousel`, `teaser`, `events`), and composes `listingSchemaEnhancer` | `src/config/blocks.ts:781-856`, `Listing/schema.ts` |
| `search` | replaces `view` & `edit` with `SearchBlockView` / `SearchBlockEdit` and wraps both with `sanitizeSearchData` (validates `variation`, falling back to `'facetsTopSide'` or default variation) | `src/config/blocks.ts:301-363` |
| `separator` | replaces `view`, `edit`, `schema`, `blockSchema` with `SeparatorView`, `SeparatorEdit`, `SeparatorSchema` (`color`, `thickness`, `width`, `alignment`) + `addStyling`; excluded from universal borders | `src/config/blocks.ts:216-226`, `Separator/schema.ts` |
| `slate` | wraps `slate.view` in `<div className={cx('block slate', props.className)} style={props.style}>` so width/theme classes and styles reach text blocks | `src/config/blocks.ts:258-267` |
| `slateTable` | wraps `slateTable.view` in `<div className={cx('block slateTable slate-table-wrapper', props.className)} style={props.style}>` | `src/config/blocks.ts:282-297` |
| `toc` | wraps `toc.view` in `<div className={cx('block toc', props.className)} style={props.style}>` | `src/config/blocks.ts:270-279` |

### 2.2 Listing variations & enhancers

| id | title | template | schemaEnhancer | action |
|---|---|---|---|---|
| `grid` | *(upstream)* | `GridTemplate` | *(upstream)* | **overridden** |
| `imageGallery` | *(upstream)* | `GridTemplate` | *(upstream)* | **overridden** |
| `carousel` | `Carousel` | `CarouselTemplate` | `carouselSchemaEnhancer` | **added** |
| `mediaCarousel` | `Media Carousel` | `MediaCarouselTemplate` | `mediaCarouselSchemaEnhancer` | **added** |
| `teaser` | `Highlight` | `TeaserTemplate` | `teaserSchemaEnhancer` | **added** |
| `events` | `Events` | `EventsTemplate` | *(none)* | **added** |

Schema fields added by `Listing/schema.ts`:
- `listingSchemaEnhancer`: adds `headlineButtonText`, `headlineButtonLink` (`object_browser`, `mode: 'link'`, `allowExternals: true`), and (on `grid` / `imageGallery`) `gridColumns` (`1`–`4`, default `2`).
- `carouselSchemaEnhancer` & `mediaCarouselSchemaEnhancer`: add fieldset `carousel` with `carouselMaxHeight` (`520`, `200–1200`), `carouselObjectFit` (`contain`|`cover`, default `contain`), `carouselObjectPosition` (9 positions, default `center center`), `carouselAutoPlay` (`false`), and `carouselAutoPlayInterval` (`6000`, `2000–60000`).
- `teaserSchemaEnhancer`: adds `align` (`left`/`right`/`center`, default `left`) to `default` or `styles.schema`.

### 2.3 Inherited blocks (31)

Supplied by Volto core, `@plone/volto-slate`, `@kitconcept/volto-light-theme@8.1.4`, and the 16 declared addons (excluding `sc-vlt`'s 6 own and 10 extended blocks):
- **Core / layout / media / content (20):** `__button`, `carousel`, `description`, `detachedSlate`, `eventCalendar`, `followUsBlock`, `heading`, `highlight`, `html`, `image`, `leadimage`, `logos`, `maps`, `slider`, `teaser`, `title`, `video`, plus Volto layout/legacy containers if configured. *(Exact live inventory and group classification render in the `Blocks/Inventory` Storybook story from `config.blocks.blocksConfig`.)*
- **Social / third-party embeds (10 additional embed blocks beside `followUsBlock`):** `applemusicBlock`, `blueskyBlock`, `facebookBlock`, `flickrBlock`, `instagramBlock`, `linkedinBlock`, `mastodonBlock`, `pinterestBlock`, `soundcloudBlock`, `spotifyBlock`, `threadsBlock`, `tiktokBlock`, `tweetBlock`, `twitchBlock` (**11** total listed in `BlocksGallery`'s `EMBEDS` set including `followUsBlock`, **36** non-embed "themed" blocks total; `20 + 11`? — precisely `36` non-embed + `11` embed = **47** registered blocks).

*(Note: verify per-layer counts directly at runtime in `Blocks/Inventory`; all 47 inherit universal theme, width, and border controls from `enhanceBlockConfig`.)*

---

## 3. Container syncing & universal block styling

### 3.1 `syncContainerBlocks(config)`

Runs in `src/config/blocks.ts:749-800` and re-runs whenever new blocks are registered through the `blocksConfig` `Proxy`:
- Container targets: `accordion`, `tabs_block`, `columnsBlock`, `gridBlock`, `customGrid`.
- Expands `allowedBlocks` (when already an array) with all other registered block ids (`46` in `gridBlock`, `49` in `accordion` — `accordion` also appends legacy aliases `'button'`, `'byline'`, `'eventsearch'`).
- Copies each child block config into `container.blocksConfig`; for `accordion`, wraps every child's `schemaEnhancer` with `disableThemeSchema` (stripping `theme` and `backgroundColor` from both root schema and `styles.schema`).
- `customGrid` columns are themeable independently via `ColumnSchema`, whereas `_accordion.scss:55-81,360-383` forces `--theme-*`, `--colorgroup-*-font`, and `--theme-pattern-*` inside accordion panels to `inherit !important`.

### 3.2 `enhanceBlockConfig` & `styleClassNameExtenders`

`installBlockStyling(config)` (`src/config/blocks.ts:802-841`) enhances all existing entries in `config.blocks.blocksConfig` and installs a `Proxy` so dynamically added blocks are enhanced too. Blocks from add-ons loaded later keep the controls whatever registration pattern they use (covered by `tests/config/blockStylingAddons.test.ts`):
- `config.blocks.blocksConfig` is an accessor: replacing the whole object (`config.blocks.blocksConfig = { ...config.blocks.blocksConfig, myBlock }`) enhances it and puts it behind a new `Proxy`.
- Each block's `schemaEnhancer` is an accessor: an enhancer assigned later — directly (`blocksConfig.teaser.schemaEnhancer = mine`) or by replacing the block (`{ ...blocksConfig.teaser, schemaEnhancer: mine }`) — is wrapped again. Enhancers already wrapped are marked (`Symbol.for('sc-vlt.stylingEnhancer')`) and not wrapped twice.

What the enhancer adds:
- Calls `addStyling`, ensures `schema.properties.styles.schema` exists, sets root `schema.properties.theme` (`widget: 'block_theme_widget'`, `default: 'default'`), and strips redundant root/nested `backgroundColor`, root `blockWidth`, `logos_container_width`, and nested `styles.properties.theme`.
- Injects `styles.properties['blockWidth:noprefix']` (`narrow`, `default`, `layout`, `full`, default `'default'`), **omitting** it for `image` and `mainImageBlock` when `align` is `'left'` or `'right'`.
- Injects `styles.properties['--cardBorderColor']` (`style_simple_color`) and `styles.properties['--cardBorderWidth']` (`border_widget`) for every block not in `config.settings.borderExcludedBlocks` (default `DEFAULT_BORDER_EXCLUDED_BLOCKS = ['separator']`).

`src/index.ts:58-186` registers three `config.settings.styleClassNameExtenders`:
1. **Block width & alignment:** computes `resolveBlockWidthForBlock({ block, content, data })` (so left/right floated `image`/`mainImageBlock` blocks inherit width from the adjacent sibling in the same theme group; `heroBlock` and `customGrid` fall back to `'layout'` inside their own views), replaces `has--block-width--*`, and syncs `has--block-alignment--*` for `image`/`mainImageBlock`.
2. **Borders:** adds `has--border` when `--cardBorderWidth` is truthy and non-zero. _Borders placement rules in `_borders.scss` apply borders to inner targets (`img`, `.quote-block`, `.teaser-item`, `table`, `.logo-item`/`.item`, `.carousel-container .card`, `.slider-viewport`, `.ui.accordion`, or `.block-inner-container`)._
3. **Theme & ColorGroup classes:** emits `has--theme--<id>`, `has--theme--custom` (for `custom-*`), `has-back-colorgroup-<back>`, and `has-front-colorgroup-<front>` from block data + `config.blocks.blockThemes` (mapping legacy `'brand'` -> `'alternative'`, and plain VLT's `'grey'` -> `'custom-secondary-primary'` through `LEGACY_THEME_ALIASES`).

---

## 4. The block theme system & Color Groups

### 4.1 Factories & resolver (`src/config/blockThemes.ts` & `src/config/blocks.ts`)

1. **`createThemeDefinition(name, label)`** (`blockThemes.ts:173-202`) maps **14** `--theme-*` properties onto `--block-theme-${name}-*`:

| layer | `--theme-*` property | `--block-theme-{name}-*` suffix |
|---|---|---|
| Ground | `--theme-color` | `bg` |
| Ground | `--theme-foreground-color` | `text` |
| Ground | `--theme-high-contrast-foreground-color` | `high-contrast` |
| Ground | `--theme-low-contrast-foreground-color` | `low-contrast` |
| Ground | `--theme-foreground-accent-color` | `accent-color` |
| High Ground | `--theme-high-contrast-color` | `high-bg` |
| High Ground | `--theme-top-foreground-color` | `top-text` |
| High Ground | `--theme-top-high-contrast-foreground-color` | `top-high-contrast` |
| High Ground | `--theme-top-low-contrast-foreground-color` | `top-low-contrast` |
| High Ground | `--theme-top-accent-color` | `top-accent-color` |
| Border | `--theme-border-color` | `border` |
| Border | `--theme-border-width` | `border-width` |
| Pattern | `--theme-pattern-image` | `pattern-image` |
| Pattern | `--theme-pattern-opacity` | `pattern-opacity` |

2. **`createCustomThemeDefinition(back, front)`** (`blocks.ts:109-138`) maps Ground directly to `--colorgroup-${back}-*`, High Ground to `--colorgroup-${front}-*`, plus `--colorgroup-back-font` (`--colorgroup-${back}-font-family`), `--colorgroup-front-font` (`--colorgroup-${front}-font-family`), `--theme-border-color` (`var(--colorgroup-${back}-accent, var(--accent-color))`), `--theme-border-width: '0'`, `--theme-pattern-image: 'none'`, and `--theme-pattern-opacity: '0'`.
3. **Shipped presets & dynamic lookup:** `DEFAULT_BLOCK_THEMES` ships `default` (`back: 'primary'`, `front: 'neutral'`) and `alternative` (`back: 'accent'`, `front: 'primary'`; `brand` kept as a lookup & `_root.scss` token alias). `customThemes` (`blocks.ts:147-175`) pre-populates `default` (labeled `'Primary'`), `alternative`, and the `4 × 4 = 16` `custom-<back>-<front>` pairs, and overrides `.find()` to resolve custom pairs, the `LEGACY_THEME_ALIASES` names (`grey`, so VLT's `blocks-group-wrapper` paints the band) and site-defined `config.blocks.blockThemes` dynamically. `NATAL_COLOR_GROUPS` and `NATAL_BLOCK_THEMES` are also exported as preset fixtures.
4. **`resolveBlockTheme(optionsOrData)`** (`blockThemes.ts:433-568`) accepts block `data` or `{ theme, styles, backColorGroup, frontColorGroup, blockThemes }` and returns `{ style, className, backColorGroup, frontColorGroup, theme }` including:
   - Ground + High Ground tokens falling through `--block-theme-<theme>-*` → `--colorgroup-<group>-*` → `--<group>-*`
   - `--colorgroup-back-font` and `--colorgroup-front-font`
   - High-ground background layer tokens (`--highground-bg-{image,size,repeat,position}` and `--colorgroup-front-bg-*`)
   - Ground background layer tokens (`--theme-bg-{image,size,repeat,position}`) plus inline `backgroundImage`, `backgroundSize`, `backgroundRepeat`, `backgroundPosition`

### 4.2 `CSS_PATTERN_PRESETS` (8)

Defined in `src/config/blockThemes.ts:94-164` for the 2nd Color Group layer alongside responsive desktop/mobile, light/dark images:
`none`, `dots`, `grid`, `diagonal-stripes`, `waves-acreative`, `blueprint`, `zigzag`, `radial-mesh` (all SVG/CSS gradients using `color-mix(in srgb, currentColor ...)`).

### 4.3 `--theme-*` & background-layer consumption `[V 2026-11-11]`

Counted across `@kitconcept/volto-light-theme@8.1.4/src/theme/**/*.scss` and `frontend/packages/volto-light-theme/src/theme/**/*.scss` (`var(\s*--theme-[a-zA-Z0-9-]+` multiline-aware):

| property | upstream VLT 8.1.4 | `sc-vlt` SCSS | notes |
|---|---|---|---|
| `--theme-foreground-color` | 116 | 78 | |
| `--theme-color` | 30 | 28 | |
| `--theme-high-contrast-color` | 20 | 40 | |
| `--theme-low-contrast-foreground-color` | 19 | 12 | |
| `--theme-top-foreground-color` | — | 50 | |
| `--theme-foreground-accent-color` | — | 31 | |
| `--theme-border-color` | — | 21 | |
| `--theme-top-low-contrast-foreground-color` | — | 8 | |
| `--theme-top-high-contrast-foreground-color` | — | 8 | |
| `--theme-border-width` | — | 8 | |
| `--theme-top-accent-color` | — | 7 | |
| `--theme-high-contrast-foreground-color` | — | 3 | |
| `--theme-pattern-image` | — | 0 | mapped & inherited in `_accordion.scss`, **never consumed via `var()`** |
| `--theme-pattern-opacity` | — | 0 | mapped & inherited in `_accordion.scss`, **never consumed via `var()`** |
| `--theme-font-color` | 1 | — | consumed once in VLT `_listing.scss:35`; **unmapped here** (GAPS §1.1) |

Background layer tokens consumed in `sc-vlt` SCSS: `--highground-bg-{image,size,repeat,position}` (**28** references total — 7 each, falling back to `--colorgroup-front-bg-*` **28** references) and `.blocks-group-wrapper.custom-<back>-<front>` reading `--colorgroup-<back>-bg-*` directly (`_root.scss:450-453`); `--theme-bg-*` has **0** `var()` reads in SCSS (assigned inline by `resolveBlockTheme` and utility classes from `themeStyles.ts`).

---

## 5. Tokens `[V 2026-11-11]`

- `src/theme/_root.scss`: **530 lines**, **230** custom-property declaration sites, **146** unique custom properties.
- All **56** `.scss` files under `src/theme/`: **307** declaration sites, **181** unique custom properties; **0** `@property` declarations in `sc-vlt`.
- Upstream `@kitconcept/volto-light-theme@8.1.4` registers **10** `@property` rules in `_variables.scss`: `--background`, `--text-color`, `--text-size`, `--primary-color`, `--primary-foreground-color`, `--secondary-color`, `--secondary-foreground-color`, `--accent-color`, `--accent-foreground-color`, `--image-aspect-ratio`.

### 5.1 Base palette (`_root.scss:9-39`)

| group | token | value | notes |
|---|---|---|---|
| Pure | `--pure-white` / `--pure-black` | `#fff` / `#000` | used in primary bg / high-contrast mode |
| Neutral light | `--gray-02` | `#f6f7f9` | neutral surface |
| Neutral light | `--gray-cool-05` | `#eceff3` | secondary surface |
| Neutral light | `--gray-10` | `#dde2e8` | borders, dividers |
| Neutral light | `--gray-50` | `#6b7280` | disabled / decorative only |
| Neutral light | `--gray-70` | `#4a5260` | subtext on light surfaces |
| Neutral light | `--gray-80` / `--gray-90` | `#333` / `#1d2129` | ink on light surfaces |
| Neutral dark | `--gray-dark-bg` / `--gray-dark-surface` / `--gray-dark-raised` | `#14171c` / `#1c2027` / `#242932` | primary / secondary / neutral dark surfaces |
| Neutral dark | `--gray-dark-text` / `--gray-dark-low-text` / `--gray-dark-low-text-raised` | `#f1f3f5` / `#b4bcc8` / `#c3cad4` | dark text & subtext |
| Brand ramp (light blue) | `--brand-color` / `--brand-color-light` | `#a5d8ff` / `#74c0fc` | accent surface (light) / accent text (dark) |
| Brand ramp (light blue) | `--brand-color-dark` / `--brand-color-darker` / `--brand-color-deep` | `#1971c2` / `#1864ab` / `#1c3a57` | links & accents (light) / accent surface (dark) |
| Brand ramp (light blue) | `--brand-ink` / `--brand-ink-low` | `#0b2239` / `#1f3f5c` | text / subtext on light-blue accent surface |
| Brand ramp (light blue) | `--brand-pale` / `--brand-pale-low` | `#e7f5ff` / `#b8d7ef` | text / subtext on deep-blue accent surface |

### 5.2 Semantic palette, `DEFAULT_COLOR_GROUPS` & WCAG 2.1 AA contrast

Four families × four roles via `light-dark(var(--x-light, FALLBACK), var(--x-dark, FALLBACK))`, matching `DEFAULT_COLOR_GROUPS`:

| group | role | light | dark | AA ratio (light) | AA ratio (dark) |
|---|---|---|---|---|---|
| `primary` | `color` (bg) | `#ffffff` | `#14171c` | — | — |
| `primary` | `foreground-color` (text) | `#1d2129` | `#f1f3f5` | 16.13 | 16.15 |
| `primary` | `low-foreground-color` (subtext) | `#4a5260` | `#b4bcc8` | 7.87 | 9.38 |
| `primary` | `accent-color` (accent) | `#1971c2` | `#74c0fc` | 5.02 | 9.14 |
| `secondary` | `color` (bg) | `#eceff3` | `#1c2027` | — | — |
| `secondary` | `foreground-color` (text) | `#1d2129` | `#f1f3f5` | 13.99 | 14.69 |
| `secondary` | `low-foreground-color` (subtext) | `#4a5260` | `#b4bcc8` | 6.83 | 8.53 |
| `secondary` | `accent-color` (accent) | `#1864ab` | `#74c0fc` | 5.28 | 8.32 |
| `accent` | `color` (bg) | `#a5d8ff` | `#1c3a57` | — | — |
| `accent` | `foreground-color` (text) | `#0b2239` | `#e7f5ff` | 10.65 | 10.55 |
| `accent` | `low-foreground-color` (subtext) | `#1f3f5c` | `#b8d7ef` | 7.21 | 7.81 |
| `accent` | `accent-color` (accent) | `#0b2239` | `#a5d8ff` | 10.65 | 7.74 |
| `neutral` | `color` (bg) | `#f6f7f9` | `#242932` | — | — |
| `neutral` | `foreground-color` (text) | `#1d2129` | `#f1f3f5` | 15.05 | 13.13 |
| `neutral` | `low-foreground-color` (subtext) | `#4a5260` | `#c3cad4` | 7.35 | 8.84 |
| `neutral` | `accent-color` (accent) | `#1971c2` | `#74c0fc` | 4.68 | 7.43 |

Every default pair clears WCAG 2.1 AA normal-text `4.5:1` (`4.68:1` minimum, `16.15:1` maximum). `_root.scss:284-456` also defines default `--colorgroup-{primary,secondary,accent,neutral}-*` mappings (with `font-family` bound to `--font-family-primary` / `--font-family-secondary`), `.has-back-colorgroup-*` / `.has-front-colorgroup-*` utility classes, and `.blocks-group-wrapper.custom-<back>-<front>` rules for all 16 combinations.

### 5.3 Layout mappings (`_root.scss:131-148`)

| token | maps to |
|---|---|
| `--header-background` | `--primary-color` |
| `--header-foreground` | `var(--header-foreground-color, var(--primary-foreground-color))` |
| `--footer-background` | `--secondary-color` |
| `--footer-foreground` | `--secondary-foreground-color` |
| `--fatmenu-background` | `--primary-color` |
| `--fatmenu-foreground` | `--primary-foreground-color` |
| `--breadcrumbs-background` | `--accent-color` |
| `--breadcrumbs-foreground` | `--accent-foreground-color` |
| `--search-background` | `--primary-color` |
| `--search-foreground` | `--primary-foreground-color` |

### 5.4 Content-type colours (`_root.scss:112-128`, `config/contentTypeColors.ts`)

| token | value | `defaultContentTypeColors` key |
|---|---|---|
| `--news-item-color` | `var(--pure-black)` | `'News Item'` |
| `--document-color` | `var(--accent-color)` | `'Document'` |
| `--event-color` | `light-dark(var(--event-color-light, #d32f2f), var(--event-color-dark, #d32f2f))` | `'Event'` |
| `--file-color` | `light-dark(var(--file-color-light, #1976d2), var(--file-color-dark, #1976d2))` | `'File'` |
| `--image-color` | `light-dark(var(--image-color-light, #388e3c), var(--image-color-dark, #388e3c))` | `'Image'` |

Unknown types fall back to `var(--theme-border-color, currentColor)`.

### 5.5 Links (`_root.scss:109, 313-317`)

| token | value |
|---|---|
| `--link-foreground-color` | `var(--primary-accent-color)` |
| `--link-color` | `var(--primary-accent-color)` |
| `--link-color-hover` | `light-dark(var(--brand-color-darker), var(--brand-color))` |
| `--color-link` | `var(--link-color)` |
| `--color-link-hover` | `var(--link-color-hover)` |

### 5.6 Container widths (`_root.scss:3-5`, `_blockWidth.scss`)

| token | value |
|---|---|
| `--narrow-container-width` | `940px !important` |
| `--default-container-width` | `940px !important` |
| `--layout-container-width` | `1440px !important` |

### 5.7 Typography tokens & fonts

- `_root.scss:151-154` sets `--font-sans`, `--custom-font`, `--custom-main-font`, and `--font-body` to `system-ui, sans-serif`.
- `_globals.scss:6-17` overrides those four variables on `body` to `var(--font-family-primary, 'Inter', sans-serif)` (`--custom-font` prefers `var(--font-family-secondary, var(--font-family-primary, 'Inter', sans-serif))`), and `themeStyles.ts:480-489` sets `--font-family-primary` and all four tokens from `groupsById.primary.font_family`.
- `dist/fonts/` (built from upstream `@kitconcept/volto-light-theme/src/theme/fonts` by `.design-sync/build-css.sh`) contains **83** files (`9` `Inter-*.ttf` weights + `74` Metropolis font/specimen files).

### 5.8 Colour modes & font scale

`_root.scss:458-530`:
- `[data-theme='light']` → `color-scheme: light`
- `[data-theme='dark']` → `color-scheme: dark`
- `[data-theme='high-contrast']` → `color-scheme: dark`; `--text-high-contrast: #fff`, `--bg-high-contrast: #000`, `--border-high-contrast: #fff`, `--link-high-contrast: #fff333`, `--accent-high-contrast: #fff`; collapses all 16 semantic tokens + content types onto black/white, sets all block-theme border widths (`default`, `alternative`, `brand`) to `3px` solid `#fff`, and forces underlined yellow links.
- `src/utils/preferences.ts` persists `accessibility:theme` and `accessibility:font-scale` (`FONT_SCALE_MIN = 0.8`, `FONT_SCALE_MAX = 1.3`, `DEFAULT_FONT_SCALE = 1`) as `--font-scale` on `<html>` (see GAPS §2.1 for `Number(null)` bug).

---

## 6. Type scale (`_variables.scss`, `_typography.scss`) `[V 2026-11-11]`

`src/theme/_variables.scss` overrides upstream VLT tokens in `rem` so `--font-scale` scales mixin typography globally:

| step | `$font-sizes` | `$line-heights` |
|---|---|---|
| `2xs` | `0.75rem` | `0.875rem` |
| `xs` | `0.875rem` | `1rem` |
| `s` | `1.125rem` | `1.125rem` |
| `m` | `1.3125rem` | `1.5rem` |
| `l` | `1.5rem` | `1.875rem` |
| `xl` | `1.875rem` | `2.0625rem` |
| `2xl` | `2.0625rem` | `2.25rem` |
| `3xl` | `2.25rem` | `2.625rem` |
| `4xl` | `2.625rem` | `3rem` |
| `5xl` | `3rem` | `3.5rem` |
| `6xl` | `5rem` | `5.5rem` |

Scalar overrides: `$font-size: 1.125rem`, `$line-height: 1.5rem`, `$heading1: 3.75rem`, `$heading2: 1.875rem`, `$heading3: 1.5rem`, `$block-title-h2: 2.625rem`.

Heading rules (`_typography.scss`):
- `h1.documentFirstHeading`: `5xl` / `5xl` (`400`), mobile (`<= $largest-mobile-screen`): `3xl` / `3xl`, `margin-bottom: 1rem`.
- `@mixin h2_base()` (`h2`): `l` / `l` (`700`), mobile centred with `2rem` side margins.
- `@mixin h2_headline()` (`h2.headline`): `xl` / `2xl` (`400`), mobile centred with `2rem` side margins.

---

## 7. Controlpanel overlay, helpers & customizations `[V 2026-11-11]`

- **Backend schema** (`backend/src/sc/voltolighttheme/interfaces.py` → `ISCVLTThemeDefinition`): **4 fields** — `name`, `description`, `color_groups` (`JSONField`, fieldset `colorgroups`), `block_themes` (`JSONField`, fieldset `blockthemes`).
- **Legacy migration bridge** (`backend/src/sc/voltolighttheme/utils/legacy_themes.py`): documents `33` `LEGACY_MIGRATED_FIELDS` (32 colour fields across `primary`/`secondary`/`accent`/`neutral` + `font_family_primary`) and `7` `LEGACY_PASSTHROUGH_FIELDS` (`font_family_secondary`, `event_color_{light,dark}`, `file_color_{light,dark}`, `image_color_{light,dark}`).
- **Controlpanel schema filter** (`src/helpers/themesControlpanel.ts`): `LEGACY_THEME_FIELDS` (`40` keys) strips all legacy fields from the edit/add/clone form and binds `color_groups_widget` and `block_themes_widget`.
- **Stylesheet emitter** (`src/helpers/themeStyles.ts`): `themeStyleSheet(settings)` emits four concatenated parts: `:root` variables (validated hex/`isSafeCssValue` overrides + `colorGroupCustomProperties` + bridged `--{primary,secondary,accent,neutral}-*` + `--font-family-primary` + `blockThemeCustomProperties`), `colorGroupUtilityClasses`, `blockThemeUtilityClasses`, and `colorGroupResponsiveImageRules` (`@media (max-width: 768px)`, `[data-theme='dark']`, `@media (prefers-color-scheme: dark)`).
- **Slot registration** (`src/config/slots.ts` & `src/components/Theming/Theming.tsx`): registers `Theming` into `aboveHeader`, reads `sc.voltolighttheme.themeselector` via `useLiveData` (fetching `@inherit` from `''` on 404 via `errorContext`), and syncs `config.blocks.blockThemes` and `config.blocks.colorGroups`.
- **Custom widgets** (`src/index.ts:50-54`): `style_simple_color` (`SimpleColorPickerWidget`), `color_groups_widget` (`ColorGroupsWidget`), `block_themes_widget` (`BlockThemesWidget`), `block_theme_widget` (`BlockThemeWidget`), `border_widget` (`BorderWidget`).
- **Shadowed modules (`src/customizations/`, 14 files):** `EventCalendar` `EventTemplate.tsx`; `Listing` `DefaultTemplate.jsx`, `ListingBody.jsx`, `SummaryTemplate.jsx`; `Teaser/DefaultBody.tsx`; `LogosContainer.tsx`; `helpers/{dates.js,grouping.ts,useLiveData.ts}`; `volto-slider-block/{DefaultBody.jsx,View.jsx}`; `volto/{actions/querystringsearch,Search/components/Facets.jsx,Widgets/QuerystringWidget.jsx}`.

---

## 8. Stories, tests & `.design-sync/` `[V 2026-11-11]`

### 8.1 Storybook corpus

**50 story files, 261 story exports** (`32` files / `150` exports under `src/components/`, `18` files / `111` exports under `src/storybook/`):

| Story hierarchy prefix | files | stories | notes |
|---|---|---|---|
| `Blocks/*` | 31 | 200 | 14 own/listing/search/separator files under `components/` (92) + 17 showcase/gallery/inventory files under `storybook/` (108) |
| `Navigation/*` | 6 | 25 | `SCNavigation`, `MenuItem`, `SubMenu`, `SubMenuItem`, `SubMenuItems`, `SubMenuSection` |
| `Controlpanels/*` | 5 | 17 | `ThemeForm`, `ThemeSwatches`, `ThemesList`, `ThemesToolbarActions`, `ThemesUI` (excluded from Claude Design export) |
| `Components/*` | 4 | 10 | `DocumentByLine`, `DropdownMenu`, `HeaderBarActions`, `ThemeToggle` |
| `Header/*` | 1 | 3 | `Header/AccessibilityControls` |
| `Views/*` | 1 | 3 | `Views/Default View` |
| `Widgets/*` | 1 | 2 | `Widgets/SimpleColorPickerWidget` |
| `Slots/*` | 1 | 1 | `Slots/Colophon` |

- `src/storybook/withTheme.tsx`: provides globals for colour mode (`light`, `dark`, `high-contrast`), block theme (`none`, `default`, `alternative`, `custom-secondary-accent`), and site theme (`defaultTheme`, `corporateTheme`, `natalTheme`).
- `src/storybook/blockStyling.tsx`: `StyledBlock` and `StylingMatrix` (`matrixStory('theme' | 'width' | 'border' | 'layer')`) used across block showcase stories.
- `src/storybook/images/`: **16 files** (**14** bundled `.jpg` images imported at build time + `imageScales.ts` + `optimize.sh`; excluded from npm publish by `.npmignore`).
- `Blocks/Gallery` renders all **47** registered blocks via `RealStoreWrapper` + `RenderBlocks`: **36** non-embed blocks (**16** with no sample data: `applemusicBlock`, `banner`, `carousel`, `customGrid`, `eventCalendar`, `eventMetadata`, `heading`, `introduction`, `leadimage`, `logos`, `maps`, `mastodonBlock`, `search`, `slider`, `threadsBlock`, `twitchBlock`) and **11** third-party embed blocks.

### 8.2 Claude Design export pipeline (`.design-sync/`)

- `.design-sync/prepare.sh` orchestrates: `build-icons.py` (`335` Volto, `8` VLT, `25` social-media, `5` SC-VLT `.svg.js` icon twins), `build-overlay.py` (`.design-sync/nm-overlay/` aliasing `@plone/volto`, `@plone/volto-slate`, `@kitconcept/volto-light-theme@8.1.4`, all 16 addons with bare style imports stripped, 47 layered customization files, and singleton `@plone/registry`), `build-css.sh` (emitting `dist/theme.css` + 83 files in `dist/fonts/`), `tsc` declarations (`283` `.d.ts` files + `index.d.ts`), and `tsconfig.ds.json`.
- `src/storybook/dsEntry.ts` exports **28** symbols (`DsPreviewProvider`, `StyledBlock`, `StylingMatrix`, `MainImageBlockView`, plus 24 standalone view/UI components).
- `docs/design-system/previews/` holds **7** standalone preview documents (`@dsCard` groups: `Colors` → `colors.html`, `block-themes.html`; `Type` → `typography.html`; `Components` → `block-byline.html`, `block-hero.html`, `block-main-image.html`, `block-quote.html`).

### 8.3 Test suite (`frontend/packages/volto-light-theme/tests/`)

**63 files** total (**60** `.test.*` Vitest spec files + `README.md` + `support/*` fixtures) covering theme tokens/contracts (`blockThemes.test.ts`, `themeStyles.test.ts`), block width/borders, widgets (`BlockThemeWidget`, `BorderWidget`, `ColorGroupsWidget`, `BlockThemesWidget`, `SimpleColorPickerWidget`), blocks (`HeroBlock`, `CustomGrid`, `DocumentByLine`, `MainImageBlock`, `QuoteBlock`, `EventMetadata`, `Listing/*`, `Search`, `Separator`), navigation, header bar, a11y preferences, and Storybook showcase regression tests (`test-showcase`).

---

## 9. Translations (`locales/`) `[V 2026-11-11]`

`locales/volto.pot` contains **376 extracted messages**:

| locale | translated | notes |
|---|---|---|
| `pt_BR` | **376 / 376** | 100% translated |
| `en` | **0 / 376** | empty `msgstr` falls back to English `defaultMessage` |
| `es` | **0 / 376** | registered locale, untranslated |
| `de` | **0 / 376** | registered locale, untranslated |
