import { describe, it, expect } from 'vitest';
import type { ConfigType } from '@plone/registry';
import { inheritBehaviors } from './settings';

const HEADER = 'sc.voltolighttheme.siteheader';
const THEME = 'sc.voltolighttheme.themeselector';
const FOOTER = 'sc.voltolighttheme.footer';
/** The behaviors this add-on always appends, in order. */
const LOCAL = `${HEADER},${THEME},${FOOTER}`;

/**
 * Minimal ConfigType carrying only what `inheritBehaviors` reads. Pass
 * `undefined` to exercise the case where the add-on's settings are absent.
 */
const configWith = (headerBehavior?: string): ConfigType =>
  ({
    settings: {
      scvlt: headerBehavior ? { headerBehavior } : undefined,
    },
  }) as unknown as ConfigType;

const config = configWith(HEADER);

/** Split the returned parameter back into behaviors, for order-free assertions. */
const behaviorsIn = (value: string) => value.split(',');

describe('inheritBehaviors', () => {
  describe('when nothing was inherited yet', () => {
    it('returns only this add-on behaviors for an empty querystring', () => {
      expect(inheritBehaviors(config, {})).toBe(LOCAL);
    });

    it('treats an empty parameter as absent', () => {
      expect(inheritBehaviors(config, { 'expand.inherit.behaviors': '' })).toBe(
        LOCAL,
      );
    });

    it('ignores unrelated querystring parameters', () => {
      expect(
        inheritBehaviors(config, { 'expand.inherit.something': 'else' }),
      ).toBe(LOCAL);
    });
  });

  describe('when other expanders already requested behaviors', () => {
    it('preserves them and appends its own', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': 'some.other.behavior',
        }),
      ).toBe(`some.other.behavior,${LOCAL}`);
    });

    it('preserves several of them, in order', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': 'first.behavior,second.behavior',
        }),
      ).toBe(`first.behavior,second.behavior,${LOCAL}`);
    });

    it('tolerates whitespace around the inherited values', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': ' first.behavior , second.behavior ',
        }),
      ).toBe(`first.behavior,second.behavior,${LOCAL}`);
    });

    it('drops empty segments left by a trailing comma', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': 'first.behavior,',
        }),
      ).toBe(`first.behavior,${LOCAL}`);
    });
  });

  describe('when a superseded behavior is present', () => {
    it.each([
      'voltolighttheme.header',
      'voltolighttheme.theme',
      'voltolighttheme.footer',
      'kitconcept.footer',
    ])('removes %s', (superseded) => {
      expect(
        behaviorsIn(
          inheritBehaviors(config, {
            'expand.inherit.behaviors': superseded,
          }),
        ),
      ).not.toContain(superseded);
    });

    it('removes every superseded behavior at once, keeping the rest', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': [
            'voltolighttheme.header',
            'keep.this.one',
            'voltolighttheme.theme',
            'voltolighttheme.footer',
            'kitconcept.footer',
          ].join(','),
        }),
      ).toBe(`keep.this.one,${LOCAL}`);
    });

    it('does not remove a behavior that merely shares a prefix', () => {
      expect(
        behaviorsIn(
          inheritBehaviors(config, {
            'expand.inherit.behaviors': 'voltolighttheme.header.extra',
          }),
        ),
      ).toContain('voltolighttheme.header.extra');
    });
  });

  describe('deduplication', () => {
    it('does not repeat a behavior another expander already requested', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': LOCAL,
        }),
      ).toBe(LOCAL);
    });

    it('collapses a duplicate among the inherited behaviors', () => {
      expect(
        inheritBehaviors(config, {
          'expand.inherit.behaviors': 'repeated.behavior,repeated.behavior',
        }),
      ).toBe(`repeated.behavior,${LOCAL}`);
    });
  });

  describe('when the add-on settings are missing', () => {
    it('falls back to the theme and footer behaviors', () => {
      expect(inheritBehaviors(configWith(), {})).toBe(`${THEME},${FOOTER}`);
    });

    it('still preserves and filters the inherited behaviors', () => {
      expect(
        inheritBehaviors(configWith(), {
          'expand.inherit.behaviors': 'keep.this.one,kitconcept.footer',
        }),
      ).toBe(`keep.this.one,${THEME},${FOOTER}`);
    });
  });
});
