# Design System Gaps

What is still **open** in `@simplesconsultoria/volto-light-theme` as of **2026-11-13** — verified defects, token/schema mismatches, incomplete coverage, and unmade product decisions.

Resolved past gaps are omitted; history belongs in git and the changelog (`news/`). Every entry below was verified directly in the working tree.

- **Companions:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for how the system works, [INVENTORY.md](./INVENTORY.md) for the full tables

---

## 1. Color, Pattern & High-Contrast tokens

### 1.1 `--theme-font-color` is consumed upstream but unmapped

`@kitconcept/volto-light-theme@8.1.4` reads `--theme-font-color` once (`src/theme/blocks/_listing.scss:35`: `border-bottom: 1px solid var(--theme-font-color, black);`). Neither `createThemeDefinition`, `createCustomThemeDefinition`, nor `resolveBlockTheme` maps it, so upstream's `black` fallback governs regardless of dark mode or selected theme.

### 1.2 Unused `--theme-pattern-*` tokens

`--theme-pattern-{image,opacity}` are mapped by `createThemeDefinition`, `createCustomThemeDefinition`, `blockThemeUtilityClasses`, and `_root.scss` (`--block-theme-{default,alternative}-pattern-*`), and forced `inherit !important` in `_accordion.scss:79-80,381-382` — yet **0 `var(--theme-pattern-*)` reads** exist anywhere in CSS. `--block-theme-{default,alternative}-pattern-image` are declared `initial` so they fall through to the back Color Group's background layer; a project can still set a block-theme pattern there.

### 1.3 `[data-theme='high-contrast']` does not suppress 2nd-layer background images/patterns

`_root.scss:464-530` collapses foreground/background/border colors onto `#000` / `#fff` / `#fff333`, but never overrides `--colorgroup-*-bg-image`, `--highground-bg-image`, or `--theme-bg-image` to `none`. Photos or CSS patterns configured on a Color Group continue rendering behind high-contrast text and borders.

### 1.4 Responsive Color Group background images switch on viewport width, not container width

`colorGroupResponsiveImageRules` (`src/helpers/themeStyles.ts:287-351`) uses `@media (max-width: 768px)` and `[data-theme='dark']` / `@media (prefers-color-scheme: dark)` at `:root`, rather than container queries — so mobile vs desktop background image switching inside narrow grid columns tracks the viewport, not column width.

### 1.5 Duplicated link tokens

`_root.scss:314-317` defines both `--link-color` / `--link-color-hover` and `--color-link` / `--color-link-hover` for upstream compatibility (`--link-color` and `--color-link` read `--primary-accent-color`, while `--link-foreground-color` also exists on line 109).

---

## 2. Preferences & Owned Blocks

### 2.1 Missing `localStorage` font scale coerces `null` to `0.8` (`preferences.ts`)

In `src/utils/preferences.ts:92-95`:

```ts
const value = Number(window.localStorage.getItem(FONT_SCALE_STORAGE_KEY));
return Number.isFinite(value)
  ? normalizeFontScale(value)
  : DEFAULT_FONT_SCALE;
```

When `accessibility:font-scale` has never been saved, `getItem(...)` returns `null`, `Number(null)` evaluates to `0`, and `Number.isFinite(0)` is `true` — so `normalizeFontScale(0)` clamps a fresh visitor's `--font-scale` to `FONT_SCALE_MIN` (`0.8`) on `bootstrapFontScale()` instead of `DEFAULT_FONT_SCALE` (`1`).

### 2.2 `HeroBlock` schema, CSS, adapter, and type inconsistencies

Five independent mismatches exist in `src/components/Blocks/HeroBlock/` and `src/theme/blocks/_heroBlock.scss`:

1. **Card CTA `.theme-outline` masked by CSS override:** `_heroBlock.scss:565-581` under `.hero-card .hero-card-info .hero-cta` unconditionally forces solid `background-color: var(--theme-color); color: var(--theme-foreground-color);`, overriding `.hero-cta.theme-outline` (defined at lines 289–305), whereas lines 695–709 only restore `.hero-flex-inner .hero-cta.theme-outline`. Choosing `Outline` in the Card variation still renders a solid button.
2. **Dead `'theme-primary'` fallback & hardcoded CTA text:** `heroContent.ts:20-21` falls back to `text: button.buttonText || 'Saiba mais'` (untranslated hardcoded Portuguese) and `themeClass: button.theme ? ... : 'theme-primary'`, but `_heroBlock.scss` defines only `.theme-full`, `.theme-outline`, and `.theme-danger` (no `.theme-primary` rule exists).
3. **`textSide` polarity inversion:** `useHeroBlockContent.ts:58-59` swaps `'left'` ↔ `'right'` (`const textSide = rawTextSide === 'left' ? 'right' : 'left'`), inverting the class name relative to what `schema.ts` stores.
4. **Legacy button fields in `adapter.ts` and `HeroBlock.stories.tsx`:** `schema.ts` replaced `button`/`buttonLink`/`buttonText` with `buttons` (`object_list`), but `adapter.ts:56-86` still syncs `data.buttonLink`, `HeroBlock/HeroBlock.stories.tsx:43-44` still passes `button: true` and `buttonText: 'Read more'`, and `HeroBlock/types.ts` omits `fullWidthImage`.
5. **Undefined `--brand-cyan` fallback:** `_heroBlock.scss:440` falls back `.hero-decorative-square` to `var(--theme-high-contrast-color, var(--brand-cyan))`, where `--brand-cyan` is never defined.

### 2.3 `documentByline` default mismatch and `"undefined"` class

- `DocumentByLine/schema.ts:49` sets `showAuthor.default` to `false`, whereas `DocumentByLine/View.tsx:50` evaluates `data.showAuthor ?? true` (blocks created without saving sidebar edits render authors despite the schema saying off).
- `DocumentByLine/View.tsx:41` passes `` `${className}` `` directly into `cx(...)`, emitting a literal `"undefined"` CSS class whenever `className` is omitted.

### 2.4 `QuoteBlock` reads High Ground ink on a transparent background

`_quoteBlock.scss:61,74` sets `.quote-text` and `.quote-author cite` color to `var(--theme-top-foreground-color)` even when `backgroundStyle` is `'transparent'` (the default, sitting directly on Ground `--theme-color` rather than High Ground `--theme-high-contrast-color`). Whenever back and front Color Groups differ in luminance (e.g. dark back + light front), quote text reads High Ground ink against Ground background.

---

## 3. Layout & Borders

### 3.1 `narrow` and `default` container widths are identical (`!important`)

In `src/theme/_root.scss:3-5`:
- `--narrow-container-width: 940px !important;`
- `--default-container-width: 940px !important;`
- `--layout-container-width: 1440px !important;`

The `blockWidth` widget offers four distinct options (`narrow`, `default`, `layout`, `full`), but `narrow` and `default` resolve to the same `940px`. All three also carry `!important`, preventing site CSS overrides without `!important`.

---

## 4. Controlpanel, Registry & Schemas

### 4.1 `--header-foreground-color` is read in `_root.scss` without a schema field

`_root.scss:137-140` resolves `--header-foreground: var(--header-foreground-color, var(--primary-foreground-color))` (comment still citing `header_foreground_color`), but `ISCVLTThemeSchema` (`backend/src/sc/voltolighttheme/interfaces.py`) exposes no `header_foreground_color` field, and `themeStyles.ts:494-496` forces `--header-foreground: var(--primary-foreground-color)` whenever `color_groups` is present.

### 4.2 `LEGACY_PASSTHROUGH_FIELDS` cannot be edited in the Themes panel

`backend/src/sc/voltolighttheme/utils/legacy_themes.py:43-51` keeps 7 passthrough fields (`font_family_secondary`, `event_color_{light,dark}`, `file_color_{light,dark}`, `image_color_{light,dark}`) active so `_root.scss` / `_globals.scss` still read their CSS variables — yet `LEGACY_THEME_FIELDS` in `src/helpers/themesControlpanel.ts:59-100` strips all 7 from control panel add/edit forms, leaving no UI to configure secondary fonts or content-type colors per site theme.

### 4.3 Accordion-only legacy aliases & schema message location

- `installAccordionBlock` (`src/config/blocks.ts:501-508`) appends three unprefixed/legacy block IDs (`'button'`, `'byline'`, `'eventsearch'`) only to `accordion.allowedBlocks`, whereas `gridBlock` and the actual registered IDs are `'__button'`, `'documentByline'`, and `'eventCalendar'`.
- The central `src/index.ts` message extractor leaves `Custom Grid`, `Event Metadata`, and `Events` split across individual schema/config files.

---

## 5. Storybook, `.design-sync/` & i18n coverage

### 5.1 `Blocks/Gallery` sample coverage & `HeroBlock.stories.tsx` props

All **47** registered blocks render without error in `Blocks/Gallery`, and all **261** story exports across **50** files pass showcase tests — however, **16** of the **36** non-embed blocks in `Blocks/Gallery` still have no sample data in `src/storybook/galleryFixtures.ts` and render empty states:
`applemusicBlock`, `banner`, `carousel`, `customGrid`, `eventCalendar`, `eventMetadata`, `heading`, `introduction`, `leadimage`, `logos`, `maps`, `mastodonBlock`, `search`, `slider`, `threadsBlock`, `twitchBlock` (4 of which — `customGrid`, `eventMetadata`, `banner`, `search` — are owned or extended by this package). Additionally, `HeroBlock.stories.tsx` uses legacy `button`/`buttonText` props rather than `buttons`.

### 5.2 Machine-specific absolute paths in `.design-sync/config.json`

`.design-sync/config.json` stores machine-specific absolute paths for `storybookConfigDir`, `storybookStatic`, and `entry` (preserved intentionally as documented in `.design-sync/NOTES.md` §Re-sync notes). Running the external Claude Design converter from another workstation requires updating those paths locally without committing user-specific paths back.

### 5.3 Translation & hardcoded-locale gaps

`locales/volto.pot` extracts **376 messages**:

| locale | translated | note |
|---|---|---|
| `pt_BR` | `376 / 376` | complete |
| `en` | `0 / 376` | intentional — falls back to English `defaultMessage` |
| `es` | `0 / 376` | registered locale, untranslated |
| `de` | `0 / 376` | registered locale, untranslated |

Hardcoded Portuguese / `pt-BR` strings that bypass `react-intl` in view components:
- `src/components/Blocks/Listing/EventsTemplate.tsx`: `'pt-BR'` date/time formatting (`lines 80, 105, 135, 143`), `'Evento'` (`line 93`), and `'Ver todos'` (`line 165`).
- `src/components/Blocks/EventMetadata/helpers.ts:21` (`LOCALE = 'pt-BR'`) and `EventMetadata/View.tsx:63` (`(BRT)`).
- `src/components/Blocks/HeroBlock/heroContent.ts:20` (`'Saiba mais'`).
- *(Intentional product behaviour, left untouched: `src/utils/speechSynthesis.ts` selects a `pt-BR` Web Speech voice.)*

---

## 6. Open decisions — need a human

Nothing below is an unintended bug; each requires a design or product owner decision:

| area | question | why it matters |
|---|---|---|
| Layout (§3.1) | Should `--narrow-container-width` differ from `--default-container-width`, and can `!important` be dropped? | Two of the four `blockWidth` options look identical today, and downstream sites cannot override container widths cleanly. |
| Pattern tokens (§1.2) | Implement `--theme-pattern-{image,opacity}` or remove them? | Keeping `--theme-pattern-*` is redundant unless block-theme-level patterns are planned. |
| High Contrast (§1.3) | Should `[data-theme='high-contrast']` force `none` on all background images/patterns? | Ensures pure `#000`/`#fff` legibility even when a site uploads busy decorative images on Color Groups. |
| Header & Legacy Passthrough (§4.1–4.2) | Expose `header_foreground`, `font_family_secondary`, and content-type color pickers in Color Groups / `ISCVLTThemeSchema`, or deprecate those CSS overrides? | Currently admins cannot edit secondary heading font, header foreground, or `event`/`file`/`image` tag colors in the control panel UI. |
| Links (§1.5) | Consolidate `--link-color` / `--color-link` with `--link-foreground-color`? | Three names for one colour; a project overriding one of them may miss the others. |
| Typography (`system-ui` vs `Inter`) | Keep `_root.scss` at `system-ui` overridden on `body` by `_globals.scss` (`Inter`), or align `_root.scss` directly? | Unwrapped portals/modals outside `body` inheritance (if any) read `_root.scss`, while normal pages inherit `Inter` from `body`. |
| Event locale & i18n (§5.3) | Internationalise `EventsTemplate` / `EventMetadata` / `heroContent`, and translate `es` and `de`? | All three components ignore Plone's active `intl.locale`, and `es`/`de` ship with `0 / 376` translations. |
| Gallery Fixtures (§5.1) | Add sample payloads for the 16 unseeded themed blocks (especially owned/extended `customGrid`, `eventMetadata`, `banner`, `search`)? | Improves visual regression and Claude Design auditing across `Blocks/Gallery`. |
