import { defineConfig } from 'vitest/config';
import voltoVitestConfig from '@plone/volto/vitest.config.mjs';
import path from 'path';

// Volto's config runs the tests through test.projects, and each project brings
// its own resolve.alias. A top-level resolve.alias here would never be applied,
// so these have to be merged into every project instead.
const addonAliases = {
  '@plone/volto': path.resolve(__dirname, '../../core/packages/volto/src'), // Add paths accordingly
  '@kitconcept/volto-light-theme': path.resolve(
    __dirname,
    './node_modules/@kitconcept/volto-light-theme/src',
  ),
  '@simplesconsultoria/volto-light-theme': path.resolve(__dirname, './src'),
  '@simplesconsultoria/showcase': path.resolve(__dirname, '../showcase/src'),
  // 'promise-file-reader': require.resolve('promise-file-reader') // Add to identify dependency from package
  // Volto provides these at runtime, so they are not our dependencies and are
  // not resolvable from this package. Tests that render hooks needing a store
  // or a router still have to import them, so point at Volto's own copies.
  'redux-mock-store': path.resolve(
    __dirname,
    '../../core/packages/volto/node_modules/redux-mock-store',
  ),
  'react-intl-redux': path.resolve(
    __dirname,
    '../../core/packages/volto/node_modules/react-intl-redux',
  ),
  'react-router-dom': path.resolve(
    __dirname,
    '../../core/packages/volto/node_modules/react-router-dom',
  ),
  'react-redux': path.resolve(
    __dirname,
    '../../core/packages/volto/node_modules/react-redux',
  ),
};

export default defineConfig({
  ...voltoVitestConfig,
  resolve: {
    ...voltoVitestConfig.resolve,
    alias: {
      ...voltoVitestConfig.resolve?.alias,
      ...addonAliases,
    },
  },
  test: {
    ...voltoVitestConfig.test,
    projects: voltoVitestConfig.test.projects.map((project) => ({
      ...project,
      resolve: {
        ...project.resolve,
        alias: {
          ...project.resolve?.alias,
          ...addonAliases,
        },
      },
    })),
  },
});
