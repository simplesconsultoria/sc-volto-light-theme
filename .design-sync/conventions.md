# design-sync conventions

Rules and architectural invariants for keeping `@simplesconsultoria/volto-light-theme` exportable through `.design-sync/` without breaking bundler resolution, Storybook previews, or Vitest.

## 1. `tsconfig.ds.json` traps

1. **Never put `"//"` pseudo-comment keys inside JSON.** The converter's JSON comment stripper treats `//` as a line comment and corrupts the `paths` map silently with zero diagnostics. Use `/* ... */` JSONC block comments if needed.
2. **Path targets must end with a bare `*`, never `*.js`.** Both `esbuild` and the converter append candidate extensions after stripping `*`; writing `*.js` produces a literal `.js/` directory lookup that never matches and falls back to raw `.svg` files.
3. **Keep `@plone/registry` mapped to `.design-sync/nm-overlay/@plone/registry/index.js`.** Mapping `tsconfig` `paths` overrides local `node_modules/@plone/registry` inside `frontend/core/packages/volto/node_modules`, guaranteeing bundle and story previews share `globalThis.__dsPloneRegistry`.

## 2. Import order in runtime bootstrap modules

Both `src/storybook/dsConfig.ts` and `src/storybook/dsEntry.ts` MUST keep:

```ts
import './dsGlobals';
import './dsConfig';
```

before any Volto, addon, or block import. ES module evaluation is hoisted; without `dsGlobals` evaluated first, modules inspecting `__CLIENT__` / `__DEVELOPMENT__` at top-level throw `ReferenceError`.

## 3. SVG icons

- Own icons imported by components rendered in Storybook/Claude Design (e.g., `ThemeToggle`, `HoverReaderControls`) MUST import via package subpath `@simplesconsultoria/volto-light-theme/icons/<name>.svg`, never relative `../../icons/...` imports. Relative paths bypass both `nm-overlay` and `tsconfig.ds.json` `paths` and load as `data:image/svg+xml` strings, leaving `<Icon>` empty.
- Volto (`335`), upstream VLT (`8`), `volto-social-media` (`25`), and SC-VLT (`5`) icons are compiled to `.svg.js` twins by `build-icons.py`. Always verify DOM `<svg viewBox="...">` rather than grepping bundle bytes (data URLs still contain path strings).

## 4. `dsEntry.ts` vs `src/index.ts`

- `src/index.ts` remains purely `applyConfig` for Volto runtime. Do NOT export components from `src/index.ts` solely for design-sync; add named exports to `src/storybook/dsEntry.ts` instead.
- Separate registry-free token helpers (`src/config/blockThemes.ts`) from full block registration (`src/config/blocks.ts`) so decorators (`withTheme.tsx`, `DsPreviewProvider.tsx`) do not pull the full block graph when unnecessary.
- Use light `settings.loadables` async stubs (`{ load: async () => null }`) in `dsConfig.ts` rather than importing `@plone/volto/config/Loadables` directly — `Loadables.jsx` imports `react-virtualized` (which fails esbuild due to missing `bpfrpt_proptype_WindowScroller`) and heavy editor bundles (`prettier`).

## 5. Story titles & `titleMap` collisions

- Every `components/**/*.stories.tsx` file documents a component owned and exported by `sc-vlt`; `src/storybook/*.stories.tsx` documents inherited core/addon blocks or theme/width/border/layer showcases rendered via `RenderBlocks` / `StyledBlock`.
- When adding a story under `components/`, check for leaf-name collisions against `storybook/*.stories.tsx` (currently `Carousel`, `Grid`, `Highlight`, `View`). Add an explicit full-title mapping in `.design-sync/config.json` `titleMap` and matching named export in `src/storybook/dsEntry.ts`.
- Keep `"cardMode": "column"` in `config.json` `overrides` for wide horizontal blocks (`HeroBlock`, `MainImageBlock`, `CustomGrid`, `EventMetadata`, `Navigation`, `Colophon`, `HeaderBarActions`, `MenuItem`, `SubMenu*`, and listing grid/carousel templates) to prevent grid overflow warnings.

## 6. Regenerating build artifacts & git hygiene

Run `./.design-sync/prepare.sh` whenever any of the following change:
- `frontend/package.json` or `pnpm-lock.yaml` (`pnpm install` changes pnpm store paths linked by `nm-overlay`)
- Any `.scss` / `_root.scss` token or font rule
- Any file under `src/icons/` or `src/customizations/`
- Any component signature or export in `src/storybook/dsEntry.ts`

All outputs (`dist/`, `index.d.ts`, `.design-sync/.cache/`, `.design-sync/nm-overlay/`, `.design-sync/sb-reference/`) remain gitignored and must never be committed.
