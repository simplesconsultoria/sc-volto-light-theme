# Design System Inventory

Machine-extracted inventory of `@simplesconsultoria/volto-light-theme`.

Every row is derived from source by reading, not by inference. Evidence paths are
relative to `frontend/packages/volto-light-theme/`. `[V 2026-09-01]` marks a row
verified against the working tree on that date.

- **Package:** `@simplesconsultoria/volto-light-theme`
- **Upstream:** `@kitconcept/volto-light-theme@8.0.0-alpha.31` (declared in `package.json`, `theme` field)
- **Scope:** this document covers the add-on's *own* vocabulary. Upstream VLT and Volto
  core blocks are a referenced vocabulary and are not re-documented here.

---

## 1. Blocks the add-on ships

Registered in `src/config/blocks.ts` → `installLocalBlocks()`. `[V 2026-09-01]`

| id | title (registration) | group | icon | sidebarTab | restricted | evidence |
|---|---|---|---|---|---|---|
| `documentByline` | `Byline` | `common` | `pencil.svg` | 1 | `false` (`mostUsed: true`) | `src/components/Blocks/DocumentByLine/index.ts` |
| `mainImageBlock` | `Main Image` | `media` | `image.svg` | 1 | only when the content item has `preview_image_link` | `src/components/Blocks/MainImageBlock/index.ts` |
| `heroBlock` | `Hero Block` | `common` | `presentation.svg` | 1 | `false` | `src/components/Blocks/HeroBlock/index.ts` |
| `quoteBlock` | `Quote` | `text` | `quote.svg` | 1 | `false` | `src/components/Blocks/QuoteBlock/index.ts` |

All titles are English strings translated through `formatMessageWithFallback`, which uses
the string itself as the message id. See GAPS §6.

### 1.1 `documentByline`

Schema: `src/components/Blocks/DocumentByLine/schema.ts`

| field | type | default | required |
|---|---|---|---|
| `showPublished` | `boolean` | `true` | no |
| `showModified` | `boolean` | `true` | no |
| `showAuthor` | `boolean` | `false` | no |

Single fieldset `default`, `required: []`. **No** styling schema — this is the only own
block that does not call `defaultStylingSchema`, so it has no `theme` control.

### 1.2 `mainImageBlock`

Schema: `src/components/Blocks/MainImageBlock/schema.tsx`

| field | widget / type | default | notes |
|---|---|---|---|
| `title` | `string` | — | |
| `description` | `string`, `textarea` | — | |
| `altText` | `string` | — | description links to the W3C alt-text decision tree |
| `align` | `align` | `center` | actions restricted to `left` / `right` / `center` |
| `size` | `image_size` | `l` | set to `m` in `properties`, then overridden to `l`; disabled when `align === 'center'` |
| `href` | `object_browser`, `mode: link` | — | fieldset `link_settings`; externals allowed |
| `openLinkInNewTab` | `boolean` | — | fieldset `link_settings` |
| `styles.blockWidth:noprefix` | `blockWidth` | `default` | `filterActions: narrow, default, layout, full`; disabled when `align` is `left`/`right` |
| `styles.theme` | `color_picker` | `default` | injected by `defaultStylingSchema` |

Fieldsets: `default`, `styling`, `link_settings`. `required: []`.

### 1.3 `heroBlock`

Schema: `src/components/Blocks/HeroBlock/schema.ts`. Has a `dataAdapter`
(`adapter.ts`) and two variations declared in `index.ts`:

| variation | title | default |
|---|---|---|
| `flex` | `Flex / Decorative` | yes |
| `card` | `Attached Card` | no |

The schema is **dynamic** — fieldset composition depends on `formData`:

- `default` fieldset always carries `href`, `overwrite`, `headerText`, `showDate`, `footerText`
- `+ title`, `description` only when `overwrite` is `true`
- `+ tags` only when `variation === 'flex'`
- `fileType` prepended only when `variation === 'card'`
- `image` fieldset carries `preview_image` only when `overwrite` is `true`

| field | widget / type | default | choices |
|---|---|---|---|
| `href` | `object_browser`, `mode: link` | — | externals **not** allowed; **the only required field** |
| `overwrite` | `boolean` | `false` | |
| `headerText` | `string` | — | |
| `showDate` | `boolean` | `true` | |
| `title` | `string` | — | |
| `description` | `string`, `textarea` | — | |
| `footerText` | `string` | — | |
| `tags` | `array` of `string` | — | |
| `fileType` | `string` | — | free text; hint suggests `PDF`, `Report`, `Article` |
| `preview_image` | `object_browser`, `mode: image` | — | |
| `hideImage` | `boolean` | `false` | |
| `imageFit` | `string` | `cover` | `cover`, `contain` |
| `button` | `boolean` | — | |
| `buttonLink` | `object_browser`, `mode: link` | — | |
| `buttonText` | `string` | — | |
| `blockWidth` | `blockWidth` | `layout` | |
| `imageSize` | `string` | `50%` | `0%`, `30%`, `40%`, `50%`, `60%`, `70%` |
| `titleTag` | `string` | `h2` | `h1`, `h2`, `h3`, `p` |
| `textSide` | `align` | `left` | actions `left`, `right` |
| `fullWidth` | `boolean` | `false` | in the `layout` fieldset |
| `styles.theme` | `color_picker` | `default` | injected by `defaultStylingSchema` |

`href` selects a content item and pulls `Title`, `Description`, `hasPreviewImage`,
`head_title`, `image_field`, `image_scales`, `@type`, `EffectiveDate`, `CreationDate`,
`effective`, `start`, `end`.

### 1.4 `quoteBlock`

Schema: `src/components/Blocks/QuoteBlock/schema.ts`. `blockHasOwnFocusManagement: true`
(the block body is a Slate editor).

| field | type | default | choices |
|---|---|---|---|
| `value` | Slate value | — | not declared in the schema; supplied by the editor |
| `author` | `string` | — | |
| `backgroundStyle` | `string` | `transparent` | `transparent`, `filled` |
| `styles.theme` | `color_picker` | `default` | injected by `defaultStylingSchema` |

`required: []`.

---

## 2. Listing variations

Installed in `src/config/blocks.ts` → `install()`. `[V 2026-09-01]`

| id | title | template | schemaEnhancer | action |
|---|---|---|---|---|
| `grid` | *(upstream)* | `GridTemplate` | *(upstream)* | **overridden** |
| `imageGallery` | *(upstream)* | `GridTemplate` | *(upstream)* | **overridden** |
| `carousel` | `Carousel` | `CarouselTemplate` | `carouselSchemaEnhancer` | **added** |
| `mediaCarousel` | `Media Carousel` | `MediaCarouselTemplate` | `mediaCarouselSchemaEnhancer` | **added** |
| `teaser` | `Highlight` | `TeaserTemplate` | `teaserSchemaEnhancer` | **added** |

All three additions are guarded by an `id` existence check, so re-running `install()` is
idempotent. The `listing` block's own `schemaEnhancer` is wrapped so
`listingSchemaEnhancer` composes with, rather than replaces, the upstream one.

Variation titles go through `formatMessageWithFallback` like block titles, and are
registered for extraction in `src/index.ts`.

## 3. `gridBlock` extension

`installGridBlock()` — runs only if `gridBlock` is already registered. `[V 2026-09-01]`

- Assigns `customThemes` to both `gridBlock.themes` and `gridBlock.blocksConfig.themes`
- Appends 8 ids to `allowedBlocks`: `documentByline`, `__button`, `listing`, `slider`,
  `carousel`, `mainImageBlock`, `heroBlock`, `quoteBlock`
- Copies each of those blocks' config into `gridBlock.blocksConfig`

---

## 4. The block theme system

`createThemeDefinition(name, label)` in `src/config/blocks.ts:72`. `[V 2026-09-01]`

The factory maps 14 semantic `--theme-*` custom properties onto
`--block-theme-{name}-*` tokens, in four groups:

| group | `--theme-*` property | `--block-theme-{name}-*` suffix |
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

Two themes ship, both via the factory:

```ts
const customThemes: ThemeDefinition[] = [
  createThemeDefinition('default', 'Primary'),
  createThemeDefinition('brand', 'Brand'),
];
```

Adding a third in a downstream project is a one-liner plus a matching
`--block-theme-{name}-*` block in `_root.scss`.

All 14 suffixes are defined in `_root.scss` for both themes as of 2026-09-01. Four of
them previously were not, which silently dropped 12 declarations — including six focus
outlines. The mapping is now enforced by `src/theme/blockThemes.test.ts`.

### 4.1 Which `--theme-*` properties are consumed

Counted with `grep -rhoE 'var\(--theme-[a-z-]+'`. `[V 2026-09-01]`

| property | upstream VLT | this add-on | resolves? |
|---|---|---|---|
| `--theme-foreground-color` | 121 | 18 | yes |
| `--theme-color` | 32 | 13 | yes |
| `--theme-high-contrast-color` | 20 | 29 | yes |
| `--theme-low-contrast-foreground-color` | 19 | 1 | yes |
| `--theme-top-foreground-color` | — | 34 | yes |
| `--theme-border-color` | — | 10 | yes |
| `--theme-foreground-accent-color` | — | 6 | yes |
| `--theme-top-low-contrast-foreground-color` | — | 5 | yes |
| `--theme-top-accent-color` | — | 2 | yes |
| `--theme-top-high-contrast-foreground-color` | — | 9 | yes |
| `--theme-high-contrast-foreground-color` | — | 3 | yes |
| `--theme-border-width` | — | 4 | yes |
| `--theme-pattern-image` | — | 0 | yes, but unused |
| `--theme-pattern-opacity` | — | 0 | yes, but unused |
| `--theme-font-color` | 1 | — | **no** — consumed upstream, never mapped here |

---

## 5. Tokens

`src/theme/_root.scss` — 221 lines. 95 custom-property definition sites across the
package. `[V 2026-09-01]`

**Nothing in this package assigns the `--*-color-light` / `--*-color-dark` override
hooks.** They are populated at runtime from the backend Themes control panel
(`ISCVLTThemeDefinition`, see `src/types/theme.ts`). The `light-dark()` fallbacks are
therefore the shipped defaults, and every value below is exactly resolvable.

### 5.1 Base palette

| token | value |
|---|---|
| `--pure-white` | `#fff` |
| `--pure-black` | `#000` |
| `--gray-02` | `#f8f8f8` |
| `--gray-cool-05` | `#edeff0` |
| `--gray-10` | `#e6e6e6` |
| `--gray-50` | `#757575` |
| `--gray-80` | `#333` |
| `--brand-color` | `#f4822c` |
| `--brand-color-dark` | `#b55e1c` |

### 5.2 Semantic palette

Four families × four roles. Each is `light-dark(var(--x-light, FALLBACK), var(--x-dark, FALLBACK))`.

| token | light | dark |
|---|---|---|
| `--primary-color` | `#ffffff` | `#000000` |
| `--primary-foreground-color` | `#000000` | `#ffffff` |
| `--primary-low-foreground-color` | `#333333` | `#f8f8f8` |
| `--primary-accent-color` | `#b55e1c` | `#f4822c` |
| `--secondary-color` | `#000000` | `#ffffff` |
| `--secondary-foreground-color` | `#ffffff` | `#000000` |
| `--secondary-low-foreground-color` | `#e6e6e6` | `#333333` |
| `--secondary-accent-color` | `#f4822c` | `#f4822c` |
| `--accent-color` | `#f4822c` | `#b55e1c` |
| `--accent-foreground-color` | `#000000` | `#ffffff` |
| `--accent-low-foreground-color` | `#333333` | `#f8f8f8` |
| `--accent-accent-color` | `#000000` | `#ffffff` |
| `--neutral-color` | `#edeff0` | `#333333` |
| `--neutral-foreground-color` | `#000000` | `#ffffff` |
| `--neutral-low-foreground-color` | `#333333` | `#e6e6e6` |
| `--neutral-accent-color` | `#f4822c` | `#f4822c` |

### 5.3 Layout mappings

| token | maps to |
|---|---|
| `--header-background` | `--primary-color` |
| `--header-foreground` | `--header-foreground-color`, falling back to `--primary-foreground-color` |
| `--footer-background` | `--secondary-color` |
| `--footer-foreground` | `--secondary-foreground-color` |
| `--fatmenu-background` | `--primary-color` |
| `--fatmenu-foreground` | `--primary-foreground-color` |
| `--breadcrumbs-background` | `--accent-color` |
| `--breadcrumbs-foreground` | `--accent-foreground-color` |
| `--search-background` | `--primary-color` |
| `--search-foreground` | `--primary-foreground-color` |

`--header-foreground` keeps its name deliberately: upstream VLT's
`_bgcolor-blocks-layout.scss` reads that exact token. **Do not rename it.**

### 5.4 Content-type colours

| token | value |
|---|---|
| `--news-item-color` | `var(--pure-black)` |
| `--document-color` | `var(--accent-color)` |
| `--event-color` | `red` |
| `--file-color` | `blue` |
| `--image-color` | `green` |

> The last three are CSS named colours, not tokens — see GAPS §2.1.

### 5.5 Links

| token | value |
|---|---|
| `--link-foreground-color` | `var(--brand-color)` |
| `--link-color` | `var(--brand-color)` |
| `--link-color-hover` | `var(--brand-color-dark)` |
| `--color-link` | `var(--brand-color)` |
| `--color-link-hover` | `var(--brand-color-dark)` |

Four tokens for two values — `--link-color`/`--color-link` and their `-hover` pairs are
duplicates carried for compatibility with two naming conventions.

### 5.6 Container widths

| token | value |
|---|---|
| `--narrow-container-width` | `940px !important` |
| `--default-container-width` | `940px !important` |
| `--layout-container-width` | `1440px !important` |

`narrow` and `default` are the same value — see GAPS §3.1.

### 5.7 Typography tokens

| token | value |
|---|---|
| `--font-sans` | `system-ui, sans-serif` |
| `--custom-font` | `system-ui, sans-serif` |
| `--custom-main-font` | `system-ui, sans-serif` |
| `--font-body` | `system-ui, sans-serif` |

All four resolve to the same stack; the theme ships no brand typeface.

### 5.8 Colour modes

`_root.scss` defines three `data-theme` states:

| selector | `color-scheme` | notes |
|---|---|---|
| `[data-theme='light']` | `light` | |
| `[data-theme='dark']` | `dark` | |
| `[data-theme='high-contrast']` | `dark` | overrides all 16 semantic tokens plus links, content-type colours and both themes' borders |

High-contrast palette: `--text-high-contrast: #fff`, `--bg-high-contrast: #000`,
`--border-high-contrast: #fff`, `--link-high-contrast: #fff333`,
`--accent-high-contrast: #fff`. It collapses every family onto black/white and forces
underlines on links and `.card-summary .title`.

---

## 6. Type scale

`src/theme/_variables.scss` — rem-based overrides of upstream VLT's typography tokens,
so the global `--font-scale` on `html` resizes theme-mixin text. `[V 2026-09-01]`

| step | font-size | line-height |
|---|---|---|
| `2xs` | `0.75rem` | — |
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

`$font-sizes` has 11 steps, `$line-heights` has 10 — `2xs` has no matching line-height.

Scalar overrides: `$font-size: 1.125rem`, `$line-height: 1.5rem`, `$heading1: 3.75rem`,
`$heading2: 1.875rem`, `$heading3: 1.5rem`, `$block-title-h2: 2.625rem`.

> `$heading1` (`3.75rem`) does not correspond to any `$font-sizes` step, and the actual
> `h1.documentFirstHeading` rule uses `5xl` (`3rem`) instead. `2xs` having no line-height is GAPS §3.2.

### 6.1 Heading rules

`src/theme/_typography.scss`. `[V 2026-09-01]`

| rule | size | weight | line-height | mobile override |
|---|---|---|---|---|
| `h1.documentFirstHeading` | `5xl` | 400 | `5xl` | `3xl` / `3xl`, margin-bottom `1rem` |
| `@mixin h2_base` → `h2` | `l` | 700 | `l` | centred, 2rem side margins |
| `@mixin h2_headline` → `h2.headline` | `xl` | 400 | `2xl` | centred, 2rem side margins |

`h1`–`h6` are reset to `font-family: inherit`. Mobile breakpoint is
`$largest-mobile-screen` (from upstream VLT).

---

## 7. Stories

**103 stories.** The count and the classification below are current as of 2026-09-02;
`Public/Blocks/Inventory` is the authoritative live list of blocks, since it reads the
registry at runtime.

| group | stories | covers |
|---|---|---|
| `Public/Blocks` | 56 | the four own blocks, the four listing variations, grid at 1–4 columns, separator, plus the inventory and gallery |
| `Public/Navigation` | 31 | the navigation bar, menu items, the fat menu and its parts |
| `Controlpanels/Themes` | 17 | admin UI — **excluded from the design-system export** |
| `Public/Views` | 4 | Document, News Item and Event composed through `DefaultView` |
| `Public/DocumentByLine` | 4 | the byline in isolation |
| `Public/Header` | 4 | accessibility controls |
| `Public/ThemeToggle` | 4 | the three colour modes |
| `Components/DropdownMenu` | 3 | |
| `Components/HeaderBarActions` | 1 | |

Builder is `@storybook/react-webpack5` + Razzle (not Vite), configured in
`frontend/.storybook/`, run through `pnpm --filter @plone/volto storybook` — it borrows
Volto core's install from the `frontend/core` mrs-developer checkout.

### 7.1 Where a story lives

| the story covers | it lives |
|---|---|
| a component this package ships | beside the component |
| a component from a dependency, or nothing in particular | `src/storybook/` |

So `Blocks/HeroBlock/HeroBlock.stories.tsx` sits with its block, while `gridBlock`
(Volto core) and `separator` (`@kitconcept/volto-separator-block`) have their stories in
`src/storybook/` — putting them under `components/Blocks/` would imply this package owns
them. The same split applies to fixtures: `Listing/fixtures.ts` stays with the listing
templates, `storybook/galleryFixtures.ts` and `storybook/viewFixtures.ts` do not.

`src/storybook/README.md` states the rule alongside the code.

### 7.2 Conventions

- Stories render through the `withTheme` decorator (`src/storybook/withTheme.tsx`), which
  supplies the colour mode, the block theme and optionally a site theme, and constrains
  the story to `--default-container-width`, centred. Full-bleed stories opt out with
  `parameters: { fullBleed: true }`.
- A component whose stylesheet is scoped to an ancestor must be rendered inside that
  ancestor — see DESIGN_SYSTEM §7 for the cases where this bit.
- `Public/Blocks/Gallery` uses `RealStoreWrapper`, not `Wrapper`: `search` and
  `eventCalendar` dispatch thunks on mount, which a plain mock store rejects.

### 7.3 Static assets

`frontend/.storybook/main.js` serves `packages/volto-light-theme/public` at the Storybook
root, so `public/images/example.jpg` is reachable as `/images/example.jpg`. Fixtures
currently point at `picsum.photos`; `public/images/README.md` lists the four places to
change to move them onto bundled assets.
