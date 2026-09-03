# Design System — `@simplesconsultoria/volto-light-theme`

The manifest for this add-on's design system: what it owns, what it inherits, and the
rules that govern how the two compose.

Every factual claim here was checked against the source or measured in a browser on
2026-09-01/02. Where something is a decision nobody has taken yet, it says so rather than
guessing.

- **Package:** `@simplesconsultoria/volto-light-theme`
- **Built on:** `@kitconcept/volto-light-theme@8.0.0-alpha.31` (the `theme` in `package.json`)
- **Companion documents:** [INVENTORY.md](./INVENTORY.md) for the exhaustive tables,
  [GAPS.md](./GAPS.md) for defects and open questions

---

## 1. How to read this system

Three layers stack, and almost everything confusing about the theme comes from not
knowing which layer you are looking at:

| layer | supplies | you change it by |
|---|---|---|
| **Volto core** + `@plone/volto-slate` | the block vocabulary and page rendering | not at all |
| **`@kitconcept/volto-light-theme`** | most of the visual language, the `--theme-*` contract, `@property` registrations, `initialBlocks` per type | upgrading the dependency |
| **this add-on** | 4 blocks, 3 listing variations, 2 template overrides, the block theme factory, the semantic palette, the type scale | editing this package |
| **a project using it** | concrete colours, via the Themes control panel | an `ISCVLTThemeDefinition` record |

**The single most useful entry point is Storybook**, not this file. `Public/Blocks/Inventory`
reads `config.blocks.blocksConfig` at runtime, so it always lists what an editor actually
has — 42 blocks today. This document explains the parts that a table cannot.

---

## 2. What this add-on owns

### 2.1 Blocks

Four, registered in `src/config/blocks.ts`:

| id | title | group | notes |
|---|---|---|---|
| `heroBlock` | Hero Block | common | two variations (`flex`, `card`); dynamic schema; 30 `--theme-*` references — the most theme-sensitive block in the system |
| `mainImageBlock` | Main Image | media | renders the content item's `preview_image_link`; **no colour tokens at all**, only container widths |
| `quoteBlock` | Quote | text | Slate body; the only own block reading semantic tokens (`--accent-color`) directly as well as `--theme-*` |
| `documentByline` | Byline | common | publication/modification dates and authors; **ships no stylesheet** — see GAPS §2.1 |

Full schemas in [INVENTORY.md](./INVENTORY.md) §1.

### 2.2 Listing variations

Three added, two overridden — `src/config/blocks.ts` → `install()`:

| id | title | action |
|---|---|---|
| `carousel` | Carousel | added |
| `mediaCarousel` | Media Carousel | added |
| `teaser` | Highlight | added |
| `grid` | *(upstream)* | template replaced with `GridTemplate` |
| `imageGallery` | *(upstream)* | template replaced with `GridTemplate` |

Each addition is guarded by an existence check, so `install()` is idempotent, and the
`listing` block's own `schemaEnhancer` is *composed with* rather than replacing upstream's.

### 2.3 The `gridBlock` extension

`installGridBlock()` assigns this add-on's themes to both `gridBlock.themes` and
`gridBlock.blocksConfig.themes`, and appends eight ids to `allowedBlocks`:
`documentByline`, `__button`, `listing`, `slider`, `carousel`, `mainImageBlock`,
`heroBlock`, `quoteBlock`. Core caps the grid at `maxLength: 4`.

---

## 3. The block theme system

This is the part most worth understanding, because it is this add-on's own invention and
it is what a project extends.

`createThemeDefinition(name, label)` maps **14 semantic `--theme-*` properties** onto
`--block-theme-{name}-*` tokens, in four groups:

- **Ground** — the block's own background and text: `bg`, `text`, `high-contrast`,
  `low-contrast`, `accent-color`
- **High Ground** — elevated elements inside it (cards, chips): `high-bg`, `top-text`,
  `top-high-contrast`, `top-low-contrast`, `top-accent-color`
- **Border** — `border`, `border-width`
- **Pattern** — `pattern-image`, `pattern-opacity`. Declared, defined as `none`/`0`, and
  **consumed nowhere**. Implement or delete; see GAPS §1.2.

Two themes ship: `default` (labelled "Primary") and `brand` ("Brand"). Adding a third
downstream is one line plus a matching token block in `_root.scss`:

```ts
createThemeDefinition('purple', 'Purple')
```

> **The contract is enforced by a test.** `src/theme/blockThemes.test.ts` fails if the
> factory maps a property `_root.scss` does not declare in its `:root` block, or if a
> stylesheet reads a `--theme-*` no theme supplies. It exists because the failure is
> otherwise silent — a `var()` with no definition and no fallback is invalid at
> computed-value time, so the whole declaration is dropped. That is how six focus
> outlines went missing.

---

## 4. Colour

### 4.1 Structure

Ten base values feed a **4 × 4 semantic matrix** — `primary` / `secondary` / `accent` /
`neutral`, each with `color`, `foreground-color`, `low-foreground-color`,
`accent-color`. Every semantic token is a `light-dark()` pair, so the system is
dual-mode by construction.

Resolved values for both modes: [INVENTORY.md](./INVENTORY.md) §5.2. Visual:
[previews/colors.html](./previews/colors.html).

### 4.2 The rule that matters

**Components read semantic tokens, never base values.** `--gray-80` appears in
`_root.scss` and essentially nowhere else; a component that reaches for it bypasses both
colour modes and the Themes control panel.

### 4.3 Registered properties — a real constraint

Upstream registers six tokens with `@property { syntax: '<color>' }`: `--primary-color`,
`--primary-foreground-color`, `--secondary-color`, `--secondary-foreground-color`,
`--accent-color`, `--accent-foreground-color`.

A **registered** custom property is computed eagerly at the element that declares it, so
its `light-dark()` resolves once at `:root` and inherits as a flat colour. An
**unregistered** one stays an unresolved token stream and resolves wherever it is *used*,
following the `color-scheme` in force at that element.

The two halves therefore fail in opposite directions, which is what makes this confusing
in practice:

| | mode set on `:root` only | mode set on a wrapper only |
|---|---|---|
| the six **registered** tokens | correct | frozen at the root's mode |
| every **unregistered** token | frozen, *if something resets `color-scheme` below the root* | correct |

Storybook's preview does reset `color-scheme` below `<html>`, so neither placement alone
works there — `withTheme` sets it in **both** places. On a real page the mode lives on
`<html>` and the question never arises; it only bites when switching mode on a descendant.

### 4.4 Contrast

Both AA failures the first audit found are now fixed. They were the two accent tokens
that used `--brand-color` in *both* modes rather than swapping between the brand shades
the way `--primary-accent-color` and `--accent-color` do:

| token | mode | was | now |
|---|---|---|---|
| `--secondary-accent-color` | dark, on `#ffffff` | `#f4822c` — 2.60 **FAIL** | `#b55e1c` — 4.58 AA |
| `--neutral-accent-color` | light, on `#edeff0` | `#f4822c` — 2.25 **FAIL** | `#af5009` — 4.58 AA |

The second one is why `--brand-color-darker` (`#af5009`) exists: `#b55e1c` reaches only
3.97 against `#edeff0`, which is AA-large at best.

> Every ratio in this system is a **default**. A site that sets its own colours through
> the Themes control panel replaces them, so the audit has to be re-run per project.

---

## 5. Typography

Eleven steps in `$font-sizes`, and now eleven in `$line-heights` too. Declared in
**rem** so the global `--font-scale` on `html` resizes text emitted by upstream mixins.

The six scalar overrides (`$font-size`, `$heading1`, …) are exact px→rem conversions of
upstream's `!default` values. That conversion is their entire purpose; they are not
duplicates and should stay.

All four font tokens resolve to `system-ui` — the theme ships no brand typeface. Note
that `--custom-main-font` has no consumer in this package but drives upstream's
`$page-font`.

Scale and heading rules: [previews/typography.html](./previews/typography.html).

---

## 6. Layout

| token | value |
|---|---|
| `--narrow-container-width` | `940px !important` |
| `--default-container-width` | `940px !important` |
| `--layout-container-width` | `1440px !important` |

`narrow` and `default` are currently identical, so two of the four `blockWidth` choices
are indistinguishable; all three carry `!important`, which blocks downstream override.
Both are open questions — GAPS §3.1.

---

## 7. Scoping rules — the thing that trips people up

Stylesheets in this package are scoped to ancestors that only exist on a real page. A
component rendered outside its chain gets **none** of its styling, and the symptom always
looks like missing CSS rather than a missing wrapper:

| stylesheet | scoped to |
|---|---|
| `_listing.scss` | `body .block.listing`, then `&.carousel` / `&.mediaCarousel` / … |
| `_header.scss`, `_headerBar.scss`, `_mobileTools.scss` | `body header.header-wrapper` |
| `_navigation.scss` | `#navigation.navigation` **and** `&.scNavigation` |
| any themed block | needs `--theme-*` from a themed wrapper |
| `_accessibilityControls.scss`, `_themeToggle.scss` | *unscoped* — but drawn for the dark bar, so they need the right **ground**, not the right ancestor |

Anything rendering these outside a page — a story, a preview, a screenshot harness — has
to reproduce the chain.

The accessibility controls are the instructive counter-example: their selectors are
unscoped, so the rules *did* apply, and they still looked wrong — the buttons are drawn as
light pills for the dark `--secondary-color` bar, so on a pale ground they read as
unstyled browser defaults. The CSS was never the problem; the **ground** was.

The rule this suggests: a story should reproduce the ancestor chain its component's
stylesheet names, and sit on a themed ground rather than a hardcoded grey — the hardcoded
value is exactly what hides the mismatch.

---

## 8. Per-project overlay

A project supplies colours through the Themes control panel, not by forking this package.
The backend serves an `ISCVLTThemeDefinition` with **38 colour fields** — the four
semantic families × four roles, plus the three content types — each of them a `_light` /
`_dark` pair. `helpers/themeStyles.ts` maps every field onto the custom property of the
same name, so `primary_color_light` becomes `--primary-color-light`: exactly the override
hook `_root.scss` reads inside its `light-dark()`. A themed site therefore keeps both
colour modes.

The mapping is mechanical, so a colour added to the schema needs no frontend change — and
`themeStyles.test.ts` now checks **both** ends of that contract: that the pinned field
list still matches the schema, and that `_root.scss` actually reads every property the
mapping derives. The second half is the one that was missing when the content-type
colours were wired to `--event-color-override`, a property nothing writes.

`--header-foreground-color` is the exception in the other direction: `_root.scss` reads
it, but no field of `ISCVLTThemeDefinition` supplies it, so nothing can set it today.

`Themes/fixtures.ts` holds three realistic records, and the Storybook toolbar can apply
any of them to any story.

---

## 9. Storybook

103 stories. The ones that answer design-system questions:

| story | answers |
|---|---|
| `Public/Blocks/Inventory` | what blocks exist, and which layer supplies each |
| `Public/Blocks/Gallery` | every registered block rendered — all 42 without error |
| `Public/Views/Default View` | how blocks compose on a Document, News Item and Event |
| `Public/Blocks/Grid` | `gridBlock` at 1–4 columns |
| `Public/Blocks/Listing/*` | the four listing variations |
| `Public/Blocks/Separator` | block width × short line × alignment |
| `Public/Navigation/*` | the navigation bar and the fat menu |

The toolbar carries three globals — **colour mode** (light / dark / high contrast),
**block theme** (Primary / Brand) and **site theme** — so any story can be checked in any
combination. See `src/storybook/withTheme.tsx`.

Every story is constrained to `--default-container-width` and centred, so components are
seen at the measure they occupy on a page. Stories that genuinely span the viewport —
the page views, the header bar, the navigation — opt out with
`parameters: { fullBleed: true }`.

### 9.1 Where a story lives

A story for a component this package ships sits **beside the component**; a story for a
component from a dependency sits in **`src/storybook/`**, alongside the decorator and the
shared fixtures. That is why `gridBlock` and `separator` — core and
`@kitconcept/volto-separator-block` respectively — are not filed under
`components/Blocks/`. See `src/storybook/README.md`.

### 9.2 Story images

`frontend/.storybook/main.js` serves `packages/volto-light-theme/public` at the Storybook
root, so a file at `public/images/example.jpg` is reachable as `/images/example.jpg` and
ships with the package. Fixtures currently point at `picsum.photos` instead, which serves
arbitrary third-party photographs and needs network access — replacing them is the
provenance question in §11. `public/images/README.md` lists the four places a fixture
names its image host.

---

## 10. Export to Claude Design

Preview pages live in [previews/](./previews/), each marked with a first-line
`<!-- @dsCard group="…" -->` comment, which is what the Design System pane builds its card
index from. Foundations (`colors`, `typography`, `block-themes`) are generated from the
SCSS; the block previews are captured from the built Storybook with computed styles
inlined, so they are the real component output rather than a reimplementation.

`register_assets` is legacy and not needed — the `@dsCard` markers are sufficient.

---

## 11. Open decisions

Nothing below is a defect; each is a choice nobody has made. Full context in
[GAPS.md](./GAPS.md) §6.

- Is `--brand-color: #f4822c` a deliberate default, or inherited from a client site?
  It feeds `--accent-color`, all four link tokens and both block themes' accent slots.
- Should the content-type colours (`#d32f2f`, `#1976d2`, `#388e3c`) be brand-aligned?
  They sit off the brand ramp and carry the same value in both colour modes.
- Should `narrow` and `default` container widths differ?
- Should the `documentByline` block get a stylesheet?
- Implement the Pattern layer, or delete it?
- Translate `es` and `de`? Both are registered locales with empty catalogues; `pt_BR` is
  complete at 147 messages.
- Replace the placeholder imagery and sample copy with assets of known provenance.
