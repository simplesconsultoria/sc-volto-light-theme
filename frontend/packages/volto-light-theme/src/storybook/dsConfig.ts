/**
 * Populates the Volto config registry for Claude Design previews.
 *
 * Unlike the live Volto app (which runs `load-volto-addons` — a webpack virtual —
 * and Razzle node shims via `@plone/volto/config`), standalone `esbuild` bundles
 * cannot execute `@plone/volto/config` directly. Instead, this module runs the
 * real core initialisers (`Components`, `Widgets`, `Views`, `Blocks`, `slots`,
 * `validators`), `@plone/volto-slate`, all 16 declared addons (with bare `.less`/
 * `.scss` side-effect imports stripped in `.design-sync/nm-overlay/`), and finally
 * `@simplesconsultoria/volto-light-theme`'s own `applyConfig`.
 *
 * `dsGlobals` MUST be the very first import so `__CLIENT__` et al. exist on
 * `globalThis` before ES-hoisted dependencies (such as Slate) evaluate.
 */
import './dsGlobals';

import config from '@plone/volto/registry';

// @ts-ignore — untyped core JS module
import { nonContentRoutes } from '@plone/volto/config/NonContentRoutes';
// @ts-ignore — untyped core JS module
import { nonContentRoutesPublic } from '@plone/volto/config/NonContentRoutesPublic';
// @ts-ignore — untyped core JS module
import { workflowMapping } from '@plone/volto/config/Workflows';
// @ts-ignore — untyped core JS module
import slots from '@plone/volto/config/slots';
// @ts-ignore — untyped core JS module
import { contentIcons } from '@plone/volto/config/ContentIcons';
import {
  styleClassNameConverters,
  styleClassNameExtenders,
  // @ts-ignore — untyped core JS module
} from '@plone/volto/config/Style';
import {
  controlPanelsIcons,
  filterControlPanels,
  filterControlPanelsSchema,
  unwantedControlPanelsFields,
  // @ts-ignore — untyped core JS module
} from '@plone/volto/config/ControlPanels';
// @ts-ignore — untyped core JS module
import { installDefaultComponents } from '@plone/volto/config/Components';
// @ts-ignore — untyped core JS module
import { installDefaultWidgets } from '@plone/volto/config/Widgets';
// @ts-ignore — untyped core JS module
import { installDefaultViews } from '@plone/volto/config/Views';
// @ts-ignore — untyped core JS module
import { installDefaultBlocks } from '@plone/volto/config/Blocks';
// @ts-ignore — relative-resolved core TS module
import { registerValidators } from '@plone/volto/config/validation';

// @ts-ignore — Volto core addon resolved through nm-overlay
import installSlate from '@plone/volto-slate';
// @ts-ignore — addon resolved through nm-overlay
import installBm3Compat from '@kitconcept/volto-bm3-compat';
// @ts-ignore — addon resolved through nm-overlay
import installAccordion from '@eeacms/volto-accordion-block';
// @ts-ignore — addon resolved through nm-overlay
import installBanner from '@kitconcept/volto-banner-block';
// @ts-ignore — addon resolved through nm-overlay
import installButton from '@kitconcept/volto-button-block';
// @ts-ignore — addon resolved through nm-overlay
import installCalendar from '@kitconcept/volto-calendar-block';
// @ts-ignore — addon resolved through nm-overlay
import installCarousel from '@kitconcept/volto-carousel-block';
// @ts-ignore — addon resolved through nm-overlay
import installHeading from '@kitconcept/volto-heading-block';
// @ts-ignore — addon resolved through nm-overlay
import installHighlight from '@kitconcept/volto-highlight-block';
// @ts-ignore — addon resolved through nm-overlay
import installIntroduction from '@kitconcept/volto-introduction-block';
// @ts-ignore — addon resolved through nm-overlay
import installLogos from '@kitconcept/volto-logos-block';
// @ts-ignore — addon resolved through nm-overlay
import installSeparator from '@kitconcept/volto-separator-block';
// @ts-ignore — addon resolved through nm-overlay
import installSlider from '@kitconcept/volto-slider-block';
// @ts-ignore — addon resolved through nm-overlay
import installSocialBlocks from '@kitconcept/volto-social-blocks';
// @ts-ignore — addon resolved through nm-overlay
import installSocialMedia from '@plonegovbr/volto-social-media';
// @ts-ignore — addon resolved through nm-overlay
import installImageEditor from '@plone-collective/volto-image-editor';
// @ts-ignore — addon resolved through nm-overlay
import installUpstreamVLT from '@kitconcept/volto-light-theme';

import applySCVLTConfig from '../index';

const dsRegistry = config as unknown as Record<string, any> & {
  __dsConfigured?: boolean;
};

if (!dsRegistry.__dsConfigured && !dsRegistry.blocks?.blocksConfig?.heroBlock) {
  const settings = (dsRegistry.settings ??= {});

  // Core Volto defaults matching `packages/volto/src/config/index.js`
  settings.host ??= 'localhost';
  settings.port ??= '3000';
  settings.publicURL ??= 'http://localhost:3000';
  settings.okRoute ??= '/ok';
  settings.apiPath ??= 'http://localhost:3000';
  settings.internalApiPath ??= 'http://localhost:8080/Plone';
  settings.devProxyToApiPath ??= 'http://localhost:8080/Plone';
  settings.subpathPrefix ??= '';
  settings.actions_raising_api_errors ??= ['GET_CONTENT', 'UPDATE_CONTENT'];
  settings.cookieExpires ??= 15552000;
  settings.nonContentRoutes ??= nonContentRoutes;
  settings.nonContentRoutesPublic ??= nonContentRoutesPublic;
  settings.imageObjects ??= ['Image'];
  settings.reservedIds ??= ['login', 'layout', 'plone', 'zip', 'properties'];
  settings.downloadableObjects ??= ['File'];
  settings.viewableInBrowserObjects ??= [];
  settings.listingPreviewImageField ??= 'image';
  settings.openExternalLinkInNewTab ??= false;
  settings.notSupportedBrowsers ??= ['ie'];
  settings.defaultPageSize ??= 25;
  settings.supportedLanguages ??= ['en', 'pt-br', 'es', 'de'];
  settings.navDepth ??= 1;
  settings.siteMapDepth ??= 4;
  settings.defaultBlockType ??= 'slate';
  settings.verticalFormTabs ??= false;
  settings.useEmailAsLogin ??= false;
  settings.persistentReducers ??= [
    'blocksClipboard.cut',
    'blocksClipboard.copy',
  ];
  settings.initialReducersBlacklist ??= [];
  settings.asyncPropsExtenders ??= [];
  settings.contentIcons ??= contentIcons;
  settings.loadables ??= Object.fromEntries(
    [
      'prettierStandalone',
      'prettierParserHtml',
      'prismCore',
      'toastify',
      'reactSelect',
      'reactVirtualized',
      'reactSelectAsyncPaginate',
      'reactSelectAsync',
      'reactSelectCreateable',
      'reactSelectAsyncCreateable',
      'diffLib',
      'moment',
      'reactDates',
      'reactBeautifulDnd',
      'rrule',
      'dndKitCore',
      'dndKitModifiers',
      'dndKitSortable',
      'dndKitUtilities',
    ].map((name) => [name, { load: async () => null }]),
  );
  settings.lazyBundles ??= {
    cms: [
      'prettierStandalone',
      'prettierParserHtml',
      'prismCore',
      'toastify',
      'reactSelect',
      'reactBeautifulDnd',
    ],
  };
  settings.appExtras ??= [];
  settings.maxResponseSize ??= 2000000000;
  settings.maxFileUploadSize ??= null;
  settings.serverConfig ??= {};
  settings.storeExtenders ??= [];
  settings.showTags ??= true;
  settings.showRelatedItems ??= true;
  settings.controlpanels ??= [];
  settings.controlPanelsIcons ??= controlPanelsIcons;
  settings.filterControlPanels ??= filterControlPanels;
  settings.filterControlPanelsSchema ??= filterControlPanelsSchema;
  settings.unwantedControlPanelsFields ??= unwantedControlPanelsFields;
  settings.externalRoutes ??= [];
  settings.showSelfRegistration ??= false;
  settings.contentMetadataTagsImageField ??= 'image';
  settings.contentPropertiesSchemaEnhancer ??= null;
  settings.maxUndoLevels ??= 200;
  settings.addonsInfo ??= [];
  settings.workflowMapping ??= workflowMapping;
  settings.errorHandlers ??= [];
  settings.styleClassNameConverters ??= styleClassNameConverters;
  settings.styleClassNameExtenders ??= [...styleClassNameExtenders];
  settings.hashLinkSmoothScroll ??= false;
  settings.querystringSearchGet ??= false;
  settings.blockSettingsTabFieldsetsInitialStateOpen ??= true;
  settings.excludeLinksAndReferencesMenuItem ??= false;
  settings.siteTitleFormat ??= {
    includeSiteTitle: false,
    titleAndSiteTitleSeparator: '-',
  };
  settings.layout ??= {
    tabletBreakpoint: 768,
    defaultContainerWidth: 1200,
  };
  settings.apiExpanders = [
    ...(settings.apiExpanders ?? []),
    {
      match: '',
      GET_CONTENT: [
        'breadcrumbs',
        'actions',
        'types',
        'navroot',
        'translations',
      ],
    },
    {
      match: '',
      GET_CONTENT: ['navigation'],
      querystring: (cfg: typeof config) => ({
        'expand.navigation.depth': cfg.settings.navDepth,
      }),
    },
  ];

  dsRegistry.experimental ??= {
    addBlockButton: { enabled: true },
    saveAsDraft: { enabled: false },
  };
  dsRegistry.widgets ??= {};
  dsRegistry.views ??= {};
  dsRegistry.blocks ??= {};
  dsRegistry.addonRoutes ??= [];
  dsRegistry.addonReducers ??= {};
  dsRegistry.components ??= {};
  dsRegistry.slots ??= {};
  dsRegistry.utilities ??= {};

  Object.entries(slots as Record<string, any[]>).forEach(
    ([slotName, components]) => {
      components.forEach(({ name, component, predicates = [] }) => {
        config.registerSlotComponent({
          slot: slotName,
          name,
          component,
          predicates,
        });
      });
    },
  );

  registerValidators(config);
  installDefaultComponents(config as never);
  installDefaultWidgets(config as never);
  installDefaultViews(config as never);
  installDefaultBlocks(config as never);

  const installers: Array<(cfg: typeof config) => unknown> = [
    installSlate,
    installBm3Compat,
    installAccordion,
    installBanner,
    installButton,
    installCalendar,
    installCarousel,
    installHeading,
    installHighlight,
    installIntroduction,
    installLogos,
    installSeparator,
    installSlider,
    installSocialBlocks,
    installSocialMedia,
    installImageEditor,
    installUpstreamVLT,
    applySCVLTConfig,
  ];

  for (const apply of installers) {
    apply(config);
  }

  dsRegistry.__dsConfigured = true;
}

export {};
