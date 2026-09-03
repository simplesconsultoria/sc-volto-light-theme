/**
 * Bundler-provided asset imports.
 *
 * Webpack (Storybook) and esbuild (the Claude Design export) both resolve an
 * image import to a URL string — a served path in one, an inlined data URI in
 * the other. TypeScript needs telling; without this every fixture importing a
 * photograph raises TS2307.
 */

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}
