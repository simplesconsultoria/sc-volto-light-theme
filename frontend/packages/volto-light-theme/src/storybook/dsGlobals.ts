/**
 * Volto's build-time globals, for bundlers that aren't webpack.
 *
 * Razzle defines `__CLIENT__`, `__SERVER__`, `__DEVELOPMENT__` and `__DEBUG__`
 * through webpack's DefinePlugin, so Volto's source reads them as bare
 * identifiers. The design-system converter bundles with esbuild, which defines
 * none of them, and the first component to touch one throws
 * `ReferenceError: __CLIENT__ is not defined` at render.
 *
 * Imported for its side effect as the first import of `dsEntry`, so the
 * assignment runs before any component module evaluates.
 */
const g = globalThis as unknown as Record<string, unknown>;

g.__CLIENT__ ??= true;
g.__SERVER__ ??= false;
g.__DEVELOPMENT__ ??= true;
g.__DEBUG__ ??= false;

export {};
