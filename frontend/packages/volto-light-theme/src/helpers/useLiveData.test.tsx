import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-intl-redux';
import { MemoryRouter } from 'react-router-dom';
import type { Content } from '@plone/types';
import config from '@plone/volto/registry';
import { useLiveData } from './useLiveData';

// `BEHAVIOR_MAPPING` reads `config.settings.scvlt.headerBehavior` once, when
// the module is first imported, so the registry has to be stubbed before that
// happens. Vitest hoists `vi.mock` above every import, which is what makes
// this work despite the import above. For the same reason the behavior name
// is inlined here rather than referencing the constant below.
vi.mock('@plone/volto/registry', () => ({
  default: {
    settings: { scvlt: { headerBehavior: 'sc.voltolighttheme.siteheader' } },
  },
}));

const CONFIGURED_HEADER_BEHAVIOR = 'sc.voltolighttheme.siteheader';

/** Behavior names as callers (upstream VLT components) still pass them. */
const KC_HEADER = 'voltolighttheme.header';
const KC_FOOTER = 'voltolighttheme.footer';
const KC_FOOTER_LEGACY = 'kitconcept.footer';

/** Behavior names this add-on actually ships, as returned by the backend. */
const SC_HEADER = CONFIGURED_HEADER_BEHAVIOR;
const SC_FOOTER = 'sc.voltolighttheme.footer';

const mockStore = configureStore();

type StoreState = {
  form: { global: Record<string, unknown> };
  errorContext: Content | null;
  inherit?: { data: Record<string, unknown> };
};

function renderUseLiveData<T>({
  content,
  behavior,
  field,
  storeState,
  pathname = '/page',
}: {
  content: Content | null;
  behavior: string | undefined;
  field: string;
  storeState: StoreState;
  pathname?: string;
}) {
  const store = mockStore({
    intl: { locale: 'en', messages: {} },
    ...storeState,
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    </Provider>
  );

  return renderHook(() => useLiveData<T>(content as Content, behavior, field), {
    wrapper,
  });
}

const emptyStore: StoreState = { form: { global: {} }, errorContext: null };

/**
 * Content as the backend now returns it: the inherit expander is keyed by this
 * add-on's own behavior names, never by the kitconcept ones.
 */
const contentWithInheritedData = {
  '@components': {
    inherit: {
      [SC_HEADER]: {
        data: { has_intranet_header: true, intranet_flag: 'Intranet' },
      },
      [SC_FOOTER]: {
        data: { footer_links: ['/imprint'], footer_note: 'Inherited note' },
      },
    },
  },
  subjects: ['parent-tag'],
} as unknown as Content;

describe('useLiveData', () => {
  describe('behavior mapping', () => {
    it('reads the sc header behavior when asked for the kitconcept one', () => {
      const { result } = renderUseLiveData<boolean>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'has_intranet_header',
        storeState: emptyStore,
      });
      expect(result.current).toBe(true);
    });

    it('maps the kitconcept footer behavior to the sc one', () => {
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_FOOTER,
        field: 'footer_note',
        storeState: emptyStore,
      });
      expect(result.current).toBe('Inherited note');
    });

    it('maps the legacy kitconcept.footer behavior to the same sc one', () => {
      const { result } = renderUseLiveData<string[]>({
        content: contentWithInheritedData,
        behavior: KC_FOOTER_LEGACY,
        field: 'footer_links',
        storeState: emptyStore,
      });
      expect(result.current).toEqual(['/imprint']);
    });

    it('uses the header behavior configured in settings, not a hardcoded name', () => {
      // The mapped key must be the one the registry stub provides; if the
      // mapping ignored config this would read from some other key and fail.
      const contentUnderConfiguredKey = {
        '@components': {
          inherit: {
            [CONFIGURED_HEADER_BEHAVIOR]: {
              data: { intranet_flag: 'From config' },
            },
          },
        },
      } as unknown as Content;

      const { result } = renderUseLiveData<string>({
        content: contentUnderConfiguredKey,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: emptyStore,
      });
      expect(result.current).toBe('From config');
    });

    it('picks up a header behavior configured after this module was imported', () => {
      // The mapping is resolved per call, not snapshotted at import time, so a
      // late `install()` (or a project overriding the setting) still wins.
      const previous = config.settings.scvlt?.headerBehavior;
      config.settings.scvlt!.headerBehavior = 'sc.voltolighttheme.lateheader';

      try {
        const contentUnderLateKey = {
          '@components': {
            inherit: {
              'sc.voltolighttheme.lateheader': {
                data: { intranet_flag: 'Late' },
              },
            },
          },
        } as unknown as Content;

        const { result } = renderUseLiveData<string>({
          content: contentUnderLateKey,
          behavior: KC_HEADER,
          field: 'intranet_flag',
          storeState: emptyStore,
        });
        expect(result.current).toBe('Late');
      } finally {
        config.settings.scvlt!.headerBehavior = previous!;
      }
    });

    it('does not read the un-mapped kitconcept key even when present', () => {
      // Guards against the mapping silently falling through to the old name.
      const contentUnderOldKey = {
        '@components': {
          inherit: { [KC_HEADER]: { data: { intranet_flag: 'Stale' } } },
        },
      } as unknown as Content;

      const { result } = renderUseLiveData<string | undefined>({
        content: contentUnderOldKey,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: emptyStore,
      });
      expect(result.current).toBeUndefined();
    });

    it('passes an unmapped behavior through untouched', () => {
      // A behavior this add-on does not supersede — e.g. from a third-party
      // package — must still resolve against its own inherit key.
      const contentWithForeignBehavior = {
        '@components': {
          inherit: {
            'third.party.behavior': { data: { some_field: 'Foreign value' } },
          },
        },
      } as unknown as Content;

      const { result } = renderUseLiveData<string>({
        content: contentWithForeignBehavior,
        behavior: 'third.party.behavior',
        field: 'some_field',
        storeState: emptyStore,
      });
      expect(result.current).toBe('Foreign value');
    });

    it('does not read a per-object field when given an unmapped behavior', () => {
      // The unmapped name is still a behavior, so the lookup goes through the
      // inherit expander and must not fall back to the content itself.
      const { result } = renderUseLiveData<string[] | undefined>({
        content: contentWithInheritedData,
        behavior: 'some.unmapped.behavior',
        field: 'subjects',
        storeState: emptyStore,
      });
      expect(result.current).toBeUndefined();
    });
  });

  describe('inherit store slice', () => {
    it('reads the value from the store when the content has none', () => {
      // The flicker case: the response replaced `content.data` without an
      // inherit expander, but the reducer still holds the last values.
      const { result } = renderUseLiveData<string>({
        content: { '@components': {} } as unknown as Content,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: {
          ...emptyStore,
          inherit: {
            data: { [SC_HEADER]: { data: { intranet_flag: 'From store' } } },
          },
        },
      });
      expect(result.current).toBe('From store');
    });

    it('prefers the store over the copy carried on the content', () => {
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: {
          ...emptyStore,
          inherit: {
            data: { [SC_HEADER]: { data: { intranet_flag: 'From store' } } },
          },
        },
      });
      expect(result.current).toBe('From store');
    });

    it('falls back to the content when the slice is not registered', () => {
      // Consumers that never install the reducer must keep working.
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: emptyStore,
      });
      expect(result.current).toBe('Intranet');
    });

    it('falls back to the content for a field the slice does not carry', () => {
      const { result } = renderUseLiveData<string[]>({
        content: contentWithInheritedData,
        behavior: KC_FOOTER,
        field: 'footer_links',
        storeState: {
          ...emptyStore,
          inherit: {
            data: { [SC_HEADER]: { data: { intranet_flag: 'From store' } } },
          },
        },
      });
      expect(result.current).toEqual(['/imprint']);
    });

    it('still lets live form data win over the store', () => {
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: {
          form: { global: { intranet_flag: 'Edited flag' } },
          errorContext: null,
          inherit: {
            data: { [SC_HEADER]: { data: { intranet_flag: 'From store' } } },
          },
        },
      });
      expect(result.current).toBe('Edited flag');
    });

    it('preserves a false value from the store instead of falling through', () => {
      // `??` must not treat `false` as absent and reach for the content copy.
      const { result } = renderUseLiveData<boolean>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'has_intranet_header',
        storeState: {
          ...emptyStore,
          inherit: {
            data: { [SC_HEADER]: { data: { has_intranet_header: false } } },
          },
        },
      });
      expect(result.current).toBe(false);
    });
  });

  describe('view/edit mode', () => {
    it('returns the inherited (behavior) value when there is no form data', () => {
      const { result } = renderUseLiveData<boolean>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'has_intranet_header',
        storeState: emptyStore,
      });
      expect(result.current).toBe(true);
    });

    it('prefers live form data over the inherited value', () => {
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: {
          form: { global: { intranet_flag: 'Edited flag' } },
          errorContext: null,
        },
      });
      expect(result.current).toBe('Edited flag');
    });

    it('reads a per-object field directly from the content (no behavior)', () => {
      const { result } = renderUseLiveData<string[]>({
        content: contentWithInheritedData,
        behavior: undefined,
        field: 'subjects',
        storeState: emptyStore,
      });
      expect(result.current).toEqual(['parent-tag']);
    });

    it('falls back to errorContext when there is no content', () => {
      const { result } = renderUseLiveData<boolean>({
        content: null,
        behavior: KC_HEADER,
        field: 'has_intranet_header',
        storeState: {
          form: { global: {} },
          errorContext: contentWithInheritedData,
        },
      });
      expect(result.current).toBe(true);
    });

    it('returns undefined for a field absent from the inherited data', () => {
      const { result } = renderUseLiveData<string | undefined>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'not_a_field',
        storeState: emptyStore,
      });
      expect(result.current).toBeUndefined();
    });

    it('returns undefined when the content carries no inherit expander', () => {
      const { result } = renderUseLiveData<string | undefined>({
        content: { subjects: [] } as unknown as Content,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: emptyStore,
      });
      expect(result.current).toBeUndefined();
    });
  });

  describe('add mode', () => {
    it('keeps the inherited (behavior) value while adding a child', () => {
      const { result } = renderUseLiveData<boolean>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'has_intranet_header',
        storeState: emptyStore,
        pathname: '/some-folder/add',
      });
      expect(result.current).toBe(true);
    });

    it('still previews live form data for inherited settings while adding', () => {
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_HEADER,
        field: 'intranet_flag',
        storeState: {
          form: { global: { intranet_flag: 'New flag' } },
          errorContext: null,
        },
        pathname: '/some-folder/add',
      });
      expect(result.current).toBe('New flag');
    });

    it('keeps the mapped footer value while adding a child', () => {
      const { result } = renderUseLiveData<string>({
        content: contentWithInheritedData,
        behavior: KC_FOOTER,
        field: 'footer_note',
        storeState: emptyStore,
        pathname: '/some-folder/add',
      });
      expect(result.current).toBe('Inherited note');
    });

    it('does not inherit a per-object field from the parent object', () => {
      // The new child must not show the parent's tags.
      const { result } = renderUseLiveData<string[] | undefined>({
        content: contentWithInheritedData,
        behavior: undefined,
        field: 'subjects',
        storeState: emptyStore,
        pathname: '/some-folder/add',
      });
      expect(result.current).toBeUndefined();
    });

    it('previews the per-object field value being entered on the add form', () => {
      const { result } = renderUseLiveData<string[]>({
        content: contentWithInheritedData,
        behavior: undefined,
        field: 'subjects',
        storeState: {
          form: { global: { subjects: ['new-tag'] } },
          errorContext: null,
        },
        pathname: '/some-folder/add',
      });
      expect(result.current).toEqual(['new-tag']);
    });

    it('keeps inheriting under an unmapped behavior while adding', () => {
      // An unmapped name is still a behavior, so add mode must treat it as
      // inherited rather than dropping to the per-object branch.
      const contentWithForeignBehavior = {
        '@components': {
          inherit: {
            'third.party.behavior': { data: { some_field: 'Foreign value' } },
          },
        },
      } as unknown as Content;

      const { result } = renderUseLiveData<string>({
        content: contentWithForeignBehavior,
        behavior: 'third.party.behavior',
        field: 'some_field',
        storeState: emptyStore,
        pathname: '/some-folder/add',
      });
      expect(result.current).toBe('Foreign value');
    });
  });
});
