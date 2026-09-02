# Design System Gaps

What is still **open** in `@simplesconsultoria/volto-light-theme` — defects not yet fixed,
coverage not yet built, and decisions nobody has taken.

Resolved items are not kept here. This document should answer "what is wrong now", and a
list of past fixes gets in the way of that; the history is in the changelog and in git.

Every entry was verified against source or measured in a browser. Where the fix is a
judgment call rather than a correction, it says so — those are collected in §7.

Companions: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for how the system works,
[INVENTORY.md](./INVENTORY.md) for the exhaustive tables.

---

## 1. The shipped palette fails WCAG AA twice

Ratios computed from the resolved defaults in [INVENTORY.md](./INVENTORY.md) §5.2, for
**normal-size body text** (AA ≥ 4.5, AAA ≥ 7). "AA-large" passes only at ≥18.66px bold or
≥24px.

### 1.1 Layout surfaces

| surface | pair | light | | dark | |
|---|---|---|---|---|---|
| page | `--primary-foreground-color` on `--primary-color` | 21.00 | AAA | 21.00 | AAA |
| page (low) | `--primary-low-foreground-color` on `--primary-color` | 12.63 | AAA | 19.77 | AAA |
| page (accent) | `--primary-accent-color` on `--primary-color` | 4.58 | AA | 8.08 | AAA |
| footer | `--secondary-foreground-color` on `--secondary-color` | 21.00 | AAA | 21.00 | AAA |
| footer (low) | `--secondary-low-foreground-color` on `--secondary-color` | 16.83 | AAA | 12.63 | AAA |
| footer (accent) | `--secondary-accent-color` on `--secondary-color` | 8.08 | AAA | **2.60** | **FAIL** |
| breadcrumbs | `--accent-foreground-color` on `--accent-color` | 8.08 | AAA | 4.58 | AA |
| breadcrumbs (low) | `--accent-low-foreground-color` on `--accent-color` | 4.86 | AA | 4.31 | AA-large |
| neutral | `--neutral-foreground-color` on `--neutral-color` | 18.21 | AAA | 12.63 | AAA |
| neutral (low) | `--neutral-low-foreground-color` on `--neutral-color` | 10.95 | AAA | 10.12 | AAA |
| neutral (accent) | `--neutral-accent-color` on `--neutral-color` | **2.25** | **FAIL** | 4.86 | AA |

### 1.2 Block themes

| theme | pair | light | | dark | |
|---|---|---|---|---|---|
| `default` | `text` on `bg` | 21.00 | AAA | 21.00 | AAA |
| `default` | `low-contrast` on `bg` | 12.63 | AAA | 19.77 | AAA |
| `default` | `accent-color` on `bg` | 4.58 | AA | 8.08 | AAA |
| `default` | `top-text` on `high-bg` | 18.21 | AAA | 12.63 | AAA |
| `default` | `top-low-contrast` on `high-bg` | 10.95 | AAA | 10.12 | AAA |
| `default` | `top-accent-color` on `high-bg` | **2.25** | **FAIL** | 4.86 | AA |
| `brand` | `text` on `bg` | 8.08 | AAA | 4.58 | AA |
| `brand` | `low-contrast` on `bg` | 4.86 | AA | **4.31** | **AA-large** |
| `brand` | `accent-color` on `bg` | 8.08 | AAA | 4.58 | AA |
| `brand` | `top-text` on `high-bg` | 21.00 | AAA | 21.00 | AAA |
| `brand` | `top-low-contrast` on `high-bg` | 12.63 | AAA | 19.77 | AAA |
| `brand` | `top-accent-color` on `high-bg` | 4.58 | AA | 8.08 | AAA |

### 1.3 The two hard failures

Both are `--brand-color` (`#f4822c`) on a near-white ground:

1. **`--neutral-accent-color` on `--neutral-color`, light — 2.25.** This is the `default`
   block theme's `top-accent-color` on `high-bg`: accent text on elevated cards, in the
   default theme, in the default colour mode. The most common surface in the system.
2. **`--secondary-accent-color` on `--secondary-color`, dark — 2.60.** Footer accent text
   in dark mode.

These two are the only accent tokens using the *same* value in both modes rather than
swapping between `--brand-color` and `--brand-color-dark` the way `--primary-accent-color`
and `--accent-color` do. Making them swap **fixes one of the two, not both**:

| token | mode | current | swapped to `--brand-color-dark` |
|---|---|---|---|
| `--secondary-accent-color` | dark, on `#ffffff` | 2.60 FAIL | **4.58 AA** ✓ |
| `--neutral-accent-color` | light, on `#edeff0` | 2.25 FAIL | 3.97 AA-large ✗ |

`#b55e1c` is not dark enough against `#edeff0`. Clearing 4.5:1 there needs roughly
`#af5009` — a third brand shade the palette does not have. So the footer is fixable today
with an existing token; the neutral one needs a design decision.

Neither change was applied: both alter shipped brand appearance, and both depend on
whether `#f4822c` survives at all (§7).

> Every ratio is a **default**. A site that sets its own theme through the Themes control
> panel replaces these values, so the audit must be re-run per project.

---

## 2. Colour tokens

### 2.1 Three content-type colours are raw CSS keywords

```scss
--event-color: red;
--file-color: blue;
--image-color: green;
```

`--news-item-color` and `--document-color` resolve through tokens; these three do not.
They are unthemed, ignore both colour modes, and will not survive a brand change. They are
visible on listing cards, where `getContentTypeColor` paints them as the card's top
border — a red and a blue rule sitting next to the brand orange.

### 2.2 A site theme pins six tokens to one value in both modes

`helpers/themeStyles.ts` maps each `ISCVLTThemeDefinition` field onto the custom property
of the same name — `primary_color` becomes `--primary-color`. That is written **flat**,
not as the `-light` / `-dark` pair `_root.scss` reads, so applying a site theme replaces
the `light-dark()` declaration outright and those six tokens stop responding to colour
mode.

The Storybook site-theme toolbar makes this visible: pick a theme, then flip light/dark.

Whether it is intended is the open question. Writing the pair instead would need a
backend change, since the control panel serves one value per field.

### 2.3 `--theme-font-color` is consumed upstream but never mapped

Read once by `@kitconcept/volto-light-theme@8.0.0-alpha.31`, not mapped by
`createThemeDefinition` and not defined here, so upstream's own fallback governs. Worth
confirming against upstream's intent before adding a mapping.

### 2.4 The Pattern layer is declared but unimplemented

`createThemeDefinition` maps `--theme-pattern-image` and `--theme-pattern-opacity`, and
`_root.scss` defines them as `none` / `0` for both themes so the mapping resolves — but
**nothing consumes them**. Implement the layer or delete the two mappings.

### 2.5 Duplicated link tokens

`--link-color` / `--color-link` and `--link-color-hover` / `--color-link-hover` are
duplicate pairs carrying the same values, kept for two naming conventions. Harmless, but a
project overriding one and not the other gets an inconsistent result.

---

## 3. Layout and type

### 3.1 `narrow` and `default` container widths are identical

Both are `940px !important`, while `--layout-container-width` is `1440px`. The
`blockWidth` widget offers `narrow`, `default`, `layout` and `full` as distinct choices,
but two produce the same result. All three also carry `!important`, which blocks a
downstream override without another `!important`.

### 3.2 `2xs` has no line-height

`$font-sizes` has 11 steps; `$line-heights` has 10. `map-get($line-heights, 2xs)` returns
null, so any rule pairing them fails. The step is unusable until it has one.

---

## 4. Components

### 4.1 `documentByline` ships no stylesheet

There is no `_documentByLine.scss` anywhere in `src/theme/`. In isolation this is
invisible, because a story gives the block a padded container; on a page it is obvious —
every other block sits in the centred content column while the byline starts flush against
the viewport edge.

Its markup is three `Container` elements from `@plone/components` inside a bare
`<div class="documentByLine">`, and nothing constrains that wrapper to a container width.
Visible in the `Public/Views/Default View` stories.

### 4.2 The fat-menu section title takes an inherited link colour

`.submenu-header-wrapper` is the anchor wrapping a fat-menu section's title.
`_navigation.scss` gives it `display: block` but sets no colour, so it computes to
`rgb(32, 92, 144)` — neither `--fatmenu-foreground` (black) nor the theme's `--link-color`
(`#f4822c`). It is inheriting a link colour from Semantic UI or Volto core.

It may be deliberate that a section title reads as a link, but the value tracks no theme
token, so a brand change will not move it. Visible in `Public/Navigation/SubMenu`.

---

## 5. Storybook coverage

All 42 registered blocks render without error. Eleven still show an **empty state** for
want of sample data:

| block | what it needs |
|---|---|
| `banner`, `carousel`, `heading`, `introduction`, `logos`, `maps`, `slider` | block data; derivable from each package's schema, but none of them ship a story or mocks to harvest |
| `toc` | sibling heading blocks — a composition fixture, not block data |
| `separator` | nothing; a horizontal rule legitimately has no text, and its five dedicated stories confirm it renders |
| `followUsBlock` | has data and does not error, but was never confirmed to paint visible links |

### 5.1 Not verified

- The block preview pages under `previews/` were generated from a Storybook capture whose
  pipeline lives **outside the repo**, so nobody else can regenerate them. Either commit
  the generator or drop them — shipping unreproducible generated artifacts is the worst of
  the options.
- Story imagery points at `picsum.photos`: arbitrary third-party photographs, unknown
  licence and subject, and a network dependency at view time. `public/images/` is wired
  and served, ready for bundled replacements.

---

## 6. Translation coverage

`pnpm i18n` extracts **147 messages** (the `.pot` reports 148 including its header).

| locale | translated | note |
|---|---|---|
| `en` | 0 / 147 | intentional — an empty `msgstr` falls back to the English `defaultMessage` |
| `pt_BR` | 147 / 147 | complete; validated with `msgfmt --check` |
| `es` | 0 / 147 | registered locale, never translated |
| `de` | 0 / 147 | registered locale, never translated |

`utils/speechSynthesis.ts` also hardcodes `pt-BR` when choosing a screen-reader voice.
Unlike the date formatters, that is arguably deliberate, so it was left alone.

---

## 7. Open decisions — need a human

Nothing here is a defect; each is a choice nobody has made.

| # | question | why it matters |
|---|---|---|
| H11 | Is `--brand-color: #f4822c` a deliberate default, or inherited from a client site? | It feeds `--accent-color`, all four link tokens, both block themes' accent slots, and both contrast failures in §1.3. If this is a reusable base, an opinionated orange is the wrong default. |
| — | Apply the `--secondary-accent-color` swap (§1.3)? | One line, clears a WCAG AA failure in the footer, but changes shipped appearance. |
| — | Add a third brand shade (~`#af5009`) for `--neutral-accent-color` (§1.3)? | The only way to clear AA on the neutral ground. |
| — | Replace the raw `red` / `blue` / `green` content-type colours (§2.1)? | They are unthemed and visible on every listing card. |
| — | Should a site theme write `-light` / `-dark` pairs (§2.2)? | Needs a backend change; today a themed site loses dark mode for six tokens. |
| — | Implement or delete the Pattern layer (§2.4)? | Its tokens resolve but nothing consumes them. |
| — | Should `narrow` and `default` container widths differ (§3.1)? | Two of four `blockWidth` choices are indistinguishable. |
| — | What line-height should `2xs` have (§3.2)? | The step is unusable until it has one. |
| — | Should `documentByline` get a stylesheet, and at what width (§4.1)? | It renders flush to the viewport edge on a page. |
| — | Which token should the fat-menu section title take (§4.2)? | It tracks none today. |
| — | Is `system-ui` for all four font tokens deliberate, or a stub? | Downstream projects need to know whether to override. |
| H14 | Translate `es` and `de` (§6)? | Both are registered locales with empty catalogues. |
| — | Replace placeholder imagery and sample copy with assets of known provenance (§5.1)? | Affects all 42 blocks, not only the ones with fixtures. |
| — | Is the Claude Design export still a goal? | Decides whether `previews/` earns its keep — see §5.1. |
