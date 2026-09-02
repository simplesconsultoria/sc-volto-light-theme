# Design System Gaps

What is still **open** in `@simplesconsultoria/volto-light-theme` — defects not yet fixed,
coverage not yet built, and decisions nobody has taken.

Resolved items are not kept here. This document should answer "what is wrong now", and a
list of past fixes gets in the way of that; the history is in the changelog and in git.

Every entry was verified against source or measured in a browser. Where the fix is a
judgment call rather than a correction, it says so — those are collected in §5.

Companions: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for how the system works,
[INVENTORY.md](./INVENTORY.md) for the exhaustive tables.

---

## 1. Colour tokens

### 1.1 `--theme-font-color` is consumed upstream but never mapped

Read once by `@kitconcept/volto-light-theme@8.0.0-alpha.31`, not mapped by
`createThemeDefinition` and not defined here, so upstream's own fallback governs. Worth
confirming against upstream's intent before adding a mapping.

### 1.2 The Pattern layer is declared but unimplemented

`createThemeDefinition` maps `--theme-pattern-image` and `--theme-pattern-opacity`, and
`_root.scss` defines them as `none` / `0` for both themes so the mapping resolves — but
**nothing consumes them**. Implement the layer or delete the two mappings.

### 1.3 Duplicated link tokens

`--link-color` / `--color-link` and `--link-color-hover` / `--color-link-hover` are
duplicate pairs carrying the same values, kept for two naming conventions. Harmless, but a
project overriding one and not the other gets an inconsistent result.

---

## 2. Components

### 2.1 `documentByline` ships no stylesheet

There is no `_documentByLine.scss` anywhere in `src/theme/`. In isolation this is
invisible, because a story gives the block a padded container; on a page it is obvious —
every other block sits in the centred content column while the byline starts flush against
the viewport edge.

Its markup is three `Container` elements from `@plone/components` inside a bare
`<div class="documentByLine">`, and nothing constrains that wrapper to a container width.
Visible in the `Public/Views/Default View` stories.

---

## 3. Storybook coverage

All 42 registered blocks render without error. Eleven still show an **empty state** for
want of sample data:

| block | what it needs |
|---|---|
| `banner`, `carousel`, `heading`, `introduction`, `logos`, `maps`, `slider` | block data; derivable from each package's schema, but none of them ship a story or mocks to harvest |
| `toc` | sibling heading blocks — a composition fixture, not block data |
| `separator` | nothing; a horizontal rule legitimately has no text, and its five dedicated stories confirm it renders |
| `followUsBlock` | has data and does not error, but was never confirmed to paint visible links |

### 3.1 Not verified

- The block preview pages under `previews/` were generated from a Storybook capture whose
  pipeline lives **outside the repo**, so nobody else can regenerate them. Either commit
  the generator or drop them — shipping unreproducible generated artifacts is the worst of
  the options.
- Story imagery points at `picsum.photos`: arbitrary third-party photographs, unknown
  licence and subject, and a network dependency at view time. `public/images/` is wired
  and served, ready for bundled replacements.

---

## 4. Translation coverage

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

## 5. Open decisions — need a human

Nothing here is a defect; each is a choice nobody has made.

| # | question | why it matters |
|---|---|---|
| — | Implement or delete the Pattern layer (§1.2)? | Its tokens resolve but nothing consumes them. |
| — | Should `documentByline` get a stylesheet, and at what width (§2.1)? | It renders flush to the viewport edge on a page. |
| H14 | Translate `es` and `de` (§4)? | Both are registered locales with empty catalogues. |
| — | Replace placeholder imagery and sample copy with assets of known provenance (§3.1)? | Affects all 42 blocks, not only the ones with fixtures. |
| — | Is the Claude Design export still a goal? | Decides whether `previews/` earns its keep — see §3.1. |
