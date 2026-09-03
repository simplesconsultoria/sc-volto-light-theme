# design-sync notes — sc-volto-light-theme

State as of 2026-09-02. No sync has completed yet, but the converter pipeline **works**:
bundle, previews and CSS all build, and 13 of 17 components render. The target project
`sc-volto-light-theme` (`f0a26637-18ca-4f24-80e7-8d196207efcc`) exists and is empty —
created this session and pinned in `config.json`, so a retry repairs it rather than
orphaning it.

An earlier revision of this file said the converter path was out of reach. That was wrong,
and the correction is the whole point of the recipe below.

## The recipe

Volto is a webpack application, not a publishable component package. Five things bridge
that gap; none of them forks the converter.

### 1. A synthetic `node_modules` that encodes Volto's alias scheme

`webpack-plugins/webpack-relative-resolver.js` rewrites `@plone/volto/X` to
`@plone/volto/src/X` at build time, so `@plone/volto/components/theme/Icon/Icon` exists on
disk only under `src/`. esbuild resolves node-style and finds nothing — 121 errors.

`.design-sync/nm-overlay/` is a directory of symlinks that encodes the rewrite: the three
aliased packages point at their `src/`, everything else passes through. Sources are the
add-on's own `node_modules`, the app's, **and Volto's** (`react-redux`,
`semantic-ui-react`, `react-router-dom` and `react-toastify` resolve only from there).
Built by the script in the scratchpad recipe below; rebuild it after any `pnpm install`.

Aliased: `@plone/volto` → `core/packages/volto/src`, `@plone/volto-slate` →
`core/packages/volto-slate/src`, `@kitconcept/volto-light-theme` → its `src` **at the
declared version** — the pnpm store holds several and a bare glob picks alpha.22 over
alpha.31.

### 2. A curated entry, because the package exports no components

`src/index.ts` exports only `applyConfig`. `src/storybook/dsEntry.ts` re-exports the 17
storied view components under the names their storybook titles use.

**QuoteBlock is excluded on purpose**: its view imports `@plone/volto-slate/blocks/Text`,
whose graph reaches the slate editor's `.less` stylesheets, and the converter's esbuild has
no `.less` loader. The same trap caught `config/blocks` — see §5.

### 3. `.d.ts`, emitted rather than shipped

The converter reads the component roster from `<pkg>/index.d.ts`; it resolves the package
through its realpath, so a `types` field in an overlay manifest is **not** consulted.

```bash
cd frontend/packages/volto-light-theme
./node_modules/.bin/tsc --emitDeclarationOnly --declaration --noEmit false \
  --skipLibCheck --outDir ./dist -p tsconfig.json
```

Exits 1 with ~173 TS2307 — the known pnpm false positives — and **emits all 146 files
anyway**. `index.d.ts` at the package root re-exports `./dist/src/storybook/dsEntry`.
Both are gitignored build products.

### 4. CSS, compiled on purpose

Volto compiles the SCSS and style-loader injects it at runtime, so the storybook build
contains no `.css` file to scrape (`[CSS_RUNTIME]`). `.design-sync/build-css.sh` compiles
upstream VLT's theme plus ours into `dist/theme.css` (488 KB), stubbing the two webpack
virtuals sass can't resolve (`addonsThemeCustomizationsVariables`, `…Main`). `cfg.cssEntry`
points at it.

### 5. Runtime context the app normally provides

Three modules under `src/storybook/`, imported in order by `dsEntry`:

- **`dsGlobals.ts`** — razzle defines `__CLIENT__`, `__SERVER__`, `__DEVELOPMENT__` and
  `__DEBUG__` through webpack's DefinePlugin. Without them the first component to touch one
  throws `ReferenceError: __CLIENT__ is not defined`. **This single fix took the render
  check from 4/17 to 13/17.**
- **`dsConfig.ts`** — seeds `config.settings`. Note `installSettings` spreads the existing
  `apiExpanders` and writes into `settings.vlt.components`, so both must exist first or it
  throws on its first statement and every later setting is silently skipped.
  `@plone/volto/config` cannot be imported: it reaches `load-volto-addons` (a webpack
  virtual) and node builtins.
- **`DsPreviewProvider.tsx`** — `cfg.provider`, because the real decorators import
  `@root/../locales/en.json`. Reproduces `withTheme`'s defaults plus `IntlProvider` and
  `MemoryRouter`.

### 6. Run the converter from the storybook project root

`index.json` `importPath`s are relative to `frontend/core/packages/volto` — that is where
`pnpm --filter @plone/volto build-storybook` runs. The converter resolves them against the
`.storybook` parent, the cwd, or the static dir's parent, so **run it with cwd =
`frontend/core/packages/volto`** and pass absolute paths. Without that: `story sources:
0/0`; with it: `103/103`.

The reference storybook itself builds clean (124 entries, 28 titles):

```bash
cd frontend && VOLTOCONFIG=$(pwd)/volto.config.js \
  pnpm --filter @plone/volto build-storybook -c $(pwd)/.storybook \
  -o "$(git rev-parse --show-toplevel)/.design-sync/sb-reference"
```

Do **not** use `npx storybook build`: the binary lives in the vendored Volto package, the
build needs `VOLTOCONFIG`, and `frontend/` has no `razzle.config.js`.

## Where it stands

`package-validate.mjs`: **13/17 render cleanly.** Outstanding:

| component | cause |
|---|---|
| `Grid`, `Highlight` | `config.settings.downloadableObjects.includes(...)` inside Volto's `UniversalLink` — the *preview's* registry is empty (see below) |
| `Navigation` | `items.map` on undefined — same root cause |
| `MediaCarousel` | `SecurityError: … 'caches' … context is sandboxed` — an artifact of the capture sandbox, not the component |

Also `[GRID_OVERFLOW]` on HeroBlock, MainImageBlock, HeaderBarActions and MenuItem
(`cardMode: "column"`, a config fix), `[RENDER_THIN]` on ThemeToggle, `[TOKENS_MISSING]`
for 11 quanta tokens Volto injects at runtime, and `[FONT_DANGLING]` for two upstream
`@font-face` rules whose files were not copied.

### The one unsolved blocker: two config registries

`@plone/registry` ends with `const instance = new Config(); Object.freeze(instance);` — a
**module-local** singleton. The converter bundles Volto twice: once into `_ds_bundle.js`
and again into each compiled preview (story imports resolve components to the bundle
global, but everything else bundles from source). Each copy constructs its own empty
`Config`, and `dsConfig.ts` seeds only the bundle's. Components reading `config.settings` —
`UniversalLink`, which every listing card links through — throw in the preview no matter
how well the bundle is seeded.

Shimming `@plone/registry` in the overlay to memoise the instance on `globalThis`
**does not work**: esbuild resolves it from the importer's own `node_modules`
(`frontend/core/packages/volto/node_modules/@plone/registry`) before consulting the
`--node-modules` path, so the shim is never reached. Verified — `__dsPloneRegistry` appears
in neither output bundle.

Untried options, cheapest first:

1. Exclude the three with `cfg.titleMap: {"<title>": null}` — validate goes clean and the
   sync ships the 14 components that render.
2. Shadow the package inside the vendored checkout
   (`frontend/core/packages/volto/node_modules/@plone/registry`), where esbuild *does*
   look. Reversible and gitignored, but any `pnpm install` undoes it.
3. Fork `lib/story-imports.mjs` — the seam explicitly built for per-repo resolution policy
   and, unlike `bundle.mjs`, sanctioned for forking.

`compare.mjs` — the fidelity oracle — has **not run yet**; the skill gates it behind a
clean validate.

## [GENERAL] Icons — solved, and the two traps that hid the fix

Volto imports icons as `.svg` and its webpack turns them into components via `svg-loader`.
The converter's esbuild loads `.svg` as a **data URL string** (`loader: {'.svg': 'dataurl'}`
in `lib/bundle.mjs`, not configurable), so `Icon` received a string and rendered an empty
`<svg>` — a blank box wherever a component draws an icon.

The fix has three parts:

1. `.design-sync/build-icons.py` generates a `<name>.svg.js` twin per icon, carrying the
   `{attributes, content}` shape `Icon` reads. The parsing mirrors `svg-loader@0.0.2`
   statement for statement. Both icon sets are covered: Volto's 335 and our 5.
2. The overlay points `@plone/volto/icons` at the generated directory (which deliberately
   contains no `.svg` files — esbuild would find those first).
3. Our own five icons are reached through the package name rather than a relative path,
   because **the overlay cannot intercept a relative import**. `ThemeToggle.tsx` and
   `HoverReaderControls.tsx` now import
   `@simplesconsultoria/volto-light-theme/icons/<name>.svg`, the same form
   `.storybook/preview.jsx` already used, and `.design-sync/tsconfig.ds.json` maps that
   subpath at the twins. esbuild honours tsconfig `paths` ahead of the overlay, which is
   why the mapping — not a symlink — is what fixes it.

**Two silent traps cost most of the debugging**, both now documented in
`tsconfig.ds.json` itself:

- A `"//"` documentation *key* breaks the converter's comment-stripping regex, which
  treats it as a line comment, mangles the JSON, and drops the paths mapping **without
  printing anything**. Use a block comment.
- The path target must end in a bare `*`, never `*.js`. The plugin strips only a trailing
  `*` and appends its own extension list, so `*.js` becomes a literal directory name, the
  rule never matches, and the broader `/*` rule silently wins — sending icons straight back
  to the real `.svg` files.

Also worth knowing: `_x32_` and `M460.292` appear **inside the data URL** too, because
URL-encoding leaves digits and underscores alone. Grepping the bundle for icon content is
therefore not evidence the twins are in use; check the rendered DOM for a `viewBox`
attribute instead.

Graded after the fix: AccessibilityControls and ThemeToggle both `match` across all
stories.

## Source changes this work required

Committed source, not just sync config:

- `src/config/blockThemes.ts` — `createThemeDefinition` extracted from `config/blocks`,
  which re-exports it so every existing import still works. Needed because importing the
  factory from `config/blocks` registers every block and drags in QuoteBlock's slate graph.
- `src/storybook/{dsEntry,dsGlobals,dsConfig}.ts`, `src/storybook/DsPreviewProvider.tsx`.

The 244-test suite passes with all of it.

## Re-sync risks

- **Nothing is anchored** — the project is pinned but no `_ds_sync.json` has been
  uploaded, so a future run re-verifies everything. That is the documented safe state.
- **`config.json` holds absolute paths** (`storybookConfigDir`, `storybookStatic`,
  `entry`) because the converter runs from a different cwd. They are machine-specific and
  will need rewriting on any other checkout.
- The overlay and the emitted `.d.ts`/`theme.css` are all gitignored build products —
  every one of them must be regenerated after a fresh clone or a `pnpm install`.
- Érico deleted his two earlier Claude Design projects before this run. The general
  caution still stands: never sync into a project holding hand-authored work, because the
  reconciliation pass deletes everything the build does not produce.
