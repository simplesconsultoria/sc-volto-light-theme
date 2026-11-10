# Tests

Unit tests for `@simplesconsultoria/volto-light-theme`, run with Vitest
(`make test` from `frontend/`).

## Layout

`tests/` mirrors `src/`: the test for `src/<path>/<Name>.tsx` lives in
`tests/<path>/<Name>.test.tsx`.

| Folder                  | What is tested                                                  |
| ----------------------- | --------------------------------------------------------------- |
| `actions/`, `reducers/` | Redux actions and reducers (`@inherit`, querystring search)     |
| `components/`           | React components: blocks, widgets, navigation, control panels   |
| `config/`               | Block configuration and schema enhancers (`enhanceBlockConfig`) |
| `customizations/`       | Shadowed components and helpers from other add-ons              |
| `helpers/`              | Pure helpers: theme stylesheet, block width, pagination         |
| `theme/`                | SCSS contracts, read as text (see below)                        |
| `support/`              | Shared test utilities, not tests                                |

## Conventions

- Import the code under test through the package alias,
  `@simplesconsultoria/volto-light-theme/<path>`, never with a relative path
  into `src/`. The same goes for `vi.mock()`.
- Tests under `theme/` check what a stylesheet declares (custom properties,
  selectors, imports in `_main.scss`). Read the source with
  `readSource('theme/blocks/_banner.scss')` from `support/source.ts`.
- Name the file after the module it tests; a test covering several
  stylesheets is named after the feature (`imageAndMainImage.test.ts`).
