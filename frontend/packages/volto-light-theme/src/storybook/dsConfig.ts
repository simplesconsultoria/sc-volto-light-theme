/**
 * A minimally populated Volto config registry for Claude Design previews.
 *
 * Components read `config.settings` directly, and an empty registry makes them
 * throw at render (`Cannot read properties of undefined`). On a real page the
 * app's bootstrap fills it; in a standalone bundle nothing does.
 *
 * Two things are deliberately NOT done here:
 *
 * - **`@plone/volto/config` is not imported.** Volto's default config reaches
 *   `load-volto-addons` (a webpack virtual) and node builtins (`path`,
 *   `querystring`, `zlib`), none of which esbuild can resolve for the browser.
 *   Only the handful of settings the shipped components actually read are seeded,
 *   with Volto's own defaults as the values.
 * - **`config/blocks` is not applied.** Registering the blocks pulls QuoteBlock's
 *   slate graph, whose `.less` imports esbuild has no loader for.
 */
import config from '@plone/volto/registry';

import installSettings from '../config/settings';
import { defaultContentTypeColors } from '../config/contentTypeColors';

const settings = (config.settings ??= {} as never) as Record<string, unknown>;

// Volto's own defaults, from `packages/volto/src/config/index.js`.
settings.navDepth ??= 1;
settings.openExternalLinkInNewTab ??= false;

// `installSettings` spreads the existing `apiExpanders` and writes into
// `settings.vlt.components`; both are established by Volto's bootstrap and by
// upstream VLT's own install, so without them it throws on its first statement
// and every later setting — `scvlt.headerBar` among them — is never applied.
settings.apiExpanders ??= [];
settings.vlt ??= { components: {} };

// Read by `UniversalLink` (which every listing card links through) and by
// `RenderBlocks`. Values are Volto's own defaults; the URLs stand in for what
// razzle derives from the environment at build time.
settings.publicURL ??= 'http://localhost:3000';
settings.apiPath ??= 'http://localhost:3000';
settings.internalApiPath ??= 'http://localhost:8080/Plone';
settings.downloadableObjects ??= ['File'];
settings.viewableInBrowserObjects ??= [];
settings.hashLinkSmoothScroll ??= false;
settings.externalRoutes ??= [];
settings.nonContentRoutes ??= [];

// `RenderBlocks` indexes `config.blocks.blocksConfig[type]` without guarding it.
// The blocks themselves are not registered here (that is `config/blocks`, and it
// reaches slate), so a composed block renders empty rather than throwing.
const blocks = ((config as Record<string, unknown>).blocks ??= {}) as Record<
  string,
  unknown
>;
blocks.blocksConfig ??= {};
blocks.requiredBlocks ??= [];

installSettings(config as never);

// Set by `config/blocks` on a real page; seeded here because that module is
// excluded (see above).
settings.contentTypeColors = { ...defaultContentTypeColors };

export {};
