import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  cssVariableFor,
  isSafeCssValue,
  isValidSettingValue,
  themeSettingsOf,
  themeCustomProperties,
  themeStyleSheet,
} from './themeStyles';
import type { SerializedTheme, ThemeSettings } from '../types/theme';

const settings = (partial: ThemeSettings): ThemeSettings => partial;

const serialized = (partial: Partial<SerializedTheme>): SerializedTheme =>
  partial as SerializedTheme;

/**
 * Every colour field of `ISCVLTThemeDefinition`, i.e. what `theme_settings()`
 * returns. Pinned here so a field added on the backend without a matching
 * token shows up as a failure rather than a silent no-op; the tests in
 * "stylesheet contract" below check this list against the schema itself and
 * against the properties `_root.scss` actually reads.
 */
const BACKEND_SETTING_FIELDS = [
  'primary_color_light',
  'primary_color_dark',
  'primary_foreground_color_light',
  'primary_foreground_color_dark',
  'primary_low_foreground_color_light',
  'primary_low_foreground_color_dark',
  'primary_accent_color_light',
  'primary_accent_color_dark',
  'secondary_color_light',
  'secondary_color_dark',
  'secondary_foreground_color_light',
  'secondary_foreground_color_dark',
  'secondary_low_foreground_color_light',
  'secondary_low_foreground_color_dark',
  'secondary_accent_color_light',
  'secondary_accent_color_dark',
  'accent_color_light',
  'accent_color_dark',
  'accent_foreground_color_light',
  'accent_foreground_color_dark',
  'accent_low_foreground_color_light',
  'accent_low_foreground_color_dark',
  'accent_accent_color_light',
  'accent_accent_color_dark',
  'neutral_color_light',
  'neutral_color_dark',
  'neutral_foreground_color_light',
  'neutral_foreground_color_dark',
  'neutral_low_foreground_color_light',
  'neutral_low_foreground_color_dark',
  'neutral_accent_color_light',
  'neutral_accent_color_dark',
  'event_color_light',
  'event_color_dark',
  'file_color_light',
  'file_color_dark',
  'image_color_light',
  'image_color_dark',
] as const;

describe('cssVariableFor', () => {
  it.each([
    ['primary_color_light', '--primary-color-light'],
    ['primary_foreground_color_light', '--primary-foreground-color-light'],
    ['header_foreground_color', '--header-foreground-color'],
    ['accent_color_dark', '--accent-color-dark'],
  ])('derives %o as %o', (field, variable) => {
    expect(cssVariableFor(field)).toBe(variable);
  });

  it('produces a token for every backend setting field', () => {
    // The derivation is mechanical, so a new backend colour needs no frontend
    // change — this asserts the rule holds for the current field set.
    for (const field of BACKEND_SETTING_FIELDS) {
      expect(cssVariableFor(field)).toBe(`--${field.replace(/_/g, '-')}`);
    }
  });
});

/**
 * The two ends of the contract this file only ever checked in the middle.
 *
 * `cssVariableFor` deriving `--event-color-light` from `event_color_light` is
 * worth nothing if no stylesheet reads that property. When `_root.scss` read
 * `--event-color-override` instead, every test here still passed and the
 * control panel's content-type colours did nothing at all.
 */
describe('stylesheet contract', () => {
  const ROOT_SCSS = fs.readFileSync(
    path.join(__dirname, '..', 'theme', '_root.scss'),
    'utf8',
  );

  /** Written as a regex so wrapping a long `light-dark()` still matches. */
  const isRead = (token: string) =>
    new RegExp(`var\\(\\s*${token}\\s*[,)]`).test(ROOT_SCSS);

  it('has _root.scss read the property every backend field derives', () => {
    const unread = BACKEND_SETTING_FIELDS.filter(
      (field) => !isRead(cssVariableFor(field)),
    );

    expect(
      unread,
      `_root.scss reads no such custom property, so setting ` +
        `${unread.join(', ')} in the themes control panel changes nothing`,
    ).toEqual([]);
  });

  const SCHEMA = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'backend',
    'src',
    'sc',
    'voltolighttheme',
    'interfaces.py',
  );

  it.skipIf(!fs.existsSync(SCHEMA))(
    'pins exactly the colour fields the backend schema declares',
    () => {
      const declared = [
        ...fs
          .readFileSync(SCHEMA, 'utf8')
          .matchAll(/^ {4}(\w+) = fields\.Color\(/gm),
      ].map((m) => m[1]);

      expect(
        declared.length,
        'no Color fields found in interfaces.py',
      ).toBeGreaterThan(0);
      expect([...BACKEND_SETTING_FIELDS].sort()).toEqual(declared.sort());
    },
  );
});

describe('themeCustomProperties', () => {
  it('maps every setting onto its custom property', () => {
    const values = settings({
      primary_color_light: '#123456',
      primary_foreground_color_light: '#ffffff',
      header_foreground_color: '#eeeeee',
      secondary_color_dark: '#000000',
      secondary_foreground_color_dark: '#fafafa',
      accent_color_light: '#ffb703',
      accent_foreground_color_dark: '#000000',
    });
    expect(themeCustomProperties(values)).toEqual({
      '--primary-color-light': '#123456',
      '--primary-foreground-color-light': '#ffffff',
      '--header-foreground-color': '#eeeeee',
      '--secondary-color-dark': '#000000',
      '--secondary-foreground-color-dark': '#fafafa',
      '--accent-color-light': '#ffb703',
      '--accent-foreground-color-dark': '#000000',
    });
  });

  it('handles every backend setting field', () => {
    const values = Object.fromEntries(
      BACKEND_SETTING_FIELDS.map((field) => [field, '#abcdef']),
    ) as ThemeSettings;
    expect(Object.keys(themeCustomProperties(values)).sort()).toEqual(
      BACKEND_SETTING_FIELDS.map(cssVariableFor).sort(),
    );
  });

  it('accepts the three-digit hex form', () => {
    expect(
      themeCustomProperties(settings({ primary_color_light: '#abc' })),
    ).toEqual({
      '--primary-color-light': '#abc',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(
      themeCustomProperties(settings({ primary_color_light: '  #123456  ' })),
    ).toEqual({
      '--primary-color-light': '#123456',
    });
  });

  it('omits fields the theme does not carry', () => {
    expect(
      themeCustomProperties(settings({ primary_color_light: '#123456' })),
    ).toEqual({
      '--primary-color-light': '#123456',
    });
  });

  it('returns nothing for a missing theme', () => {
    expect(themeCustomProperties(null)).toEqual({});
    expect(themeCustomProperties(undefined)).toEqual({});
  });

  it('returns nothing for an empty value object', () => {
    // A theme deleted while still selected serializes with `value: {}`.
    expect(themeCustomProperties({})).toEqual({});
  });

  describe('colour fields are held to the hex rule', () => {
    it.each([
      'red',
      'rgb(1,2,3)',
      '#12345',
      '#1234567',
      '#12345g',
      '',
      'var(--x)',
    ])('drops %o', (value) => {
      expect(themeCustomProperties({ primary_color_light: value })).toEqual({});
    });

    it('drops a value trying to close the declaration', () => {
      // The value is interpolated into a <style> element, so a payload that
      // escapes the declaration would inject arbitrary CSS.
      const injection = '#fff; } body { display: none; } :root {';
      expect(themeCustomProperties({ primary_color_light: injection })).toEqual(
        {},
      );
    });

    it('drops a non-string value', () => {
      const values = { primary_color_light: 123 } as unknown as ThemeSettings;
      expect(themeCustomProperties(values)).toEqual({});
    });
  });

  describe('non-colour settings take the general rule', () => {
    it.each(['1.5rem', '0', 'clamp(1rem, 2vw, 2rem)', 'var(--x)', 'bold'])(
      'keeps %o',
      (value) => {
        expect(
          themeCustomProperties({ heading_size: value } as ThemeSettings),
        ).toEqual({ '--heading-size': value });
      },
    );

    it('still refuses to let a value escape the declaration', () => {
      expect(
        themeCustomProperties({
          heading_size: '1rem; } body { display: none } :root {',
        } as ThemeSettings),
      ).toEqual({});
    });
  });
});

describe('isValidSettingValue', () => {
  describe('colour fields', () => {
    it.each([
      'primary_color_light',
      'accent_foreground_color_dark',
      // Not `_color`-suffixed, but a colour all the same — the reason the
      // pattern also covers `_foreground` and `_background`.
      'header_foreground_color',
    ])('%s requires a hex value', (field) => {
      expect(isValidSettingValue(field, '#123456')).toBe(true);
      expect(isValidSettingValue(field, '1.5rem')).toBe(false);
      expect(isValidSettingValue(field, 'red')).toBe(false);
    });

    it('treats every current backend field as a colour', () => {
      for (const field of BACKEND_SETTING_FIELDS) {
        expect(isValidSettingValue(field, 'not-a-colour')).toBe(false);
        expect(isValidSettingValue(field, '#abcdef')).toBe(true);
      }
    });
  });

  describe('other fields', () => {
    it('accepts a plain CSS length', () => {
      expect(isValidSettingValue('heading_size', '1.5rem')).toBe(true);
    });

    it('accepts a function value', () => {
      expect(isValidSettingValue('gutter', 'clamp(1rem, 2vw, 2rem)')).toBe(
        true,
      );
    });

    it('rejects a non-string', () => {
      expect(isValidSettingValue('heading_size', 12)).toBe(false);
      expect(isValidSettingValue('heading_size', null)).toBe(false);
    });
  });
});

describe('isSafeCssValue', () => {
  it.each([
    '1.5rem',
    '0',
    '#fff',
    'var(--brand)',
    'clamp(1rem, 2vw, 2rem)',
    'Helvetica, Arial, sans-serif',
  ])('accepts %o', (value) => {
    expect(isSafeCssValue(value)).toBe(true);
  });

  describe('rejects anything that could escape the declaration', () => {
    it.each([
      ['a semicolon', '1rem; color: red'],
      ['a closing brace', '1rem } body {'],
      ['an opening brace', 'a { b'],
      ['a comment opener', '1rem /* x'],
      ['a comment closer', '1rem */ x'],
    ])('%s', (_label, value) => {
      expect(isSafeCssValue(value)).toBe(false);
    });
  });

  describe('rejects anything that fetches or evaluates', () => {
    it.each([
      ['a remote url', 'url(https://evil.example/x.png)'],
      ['a spaced url', 'url (https://evil.example/x.png)'],
      ['an uppercase url', 'URL(https://evil.example/x.png)'],
      ['an import', '@import "https://evil.example/x.css"'],
      ['a legacy expression', 'expression(alert(1))'],
      ['a backslash escape', '\\75 rl(x)'],
    ])('%s', (_label, value) => {
      expect(isSafeCssValue(value)).toBe(false);
    });
  });

  it('rejects an empty value', () => {
    expect(isSafeCssValue('')).toBe(false);
    expect(isSafeCssValue('   ')).toBe(false);
  });

  it('rejects an absurdly long value', () => {
    expect(isSafeCssValue('a'.repeat(201))).toBe(false);
    expect(isSafeCssValue('a'.repeat(200))).toBe(true);
  });
});

describe('themeStyleSheet', () => {
  it('renders a rule for :root by default', () => {
    const css = themeStyleSheet(settings({ primary_color_light: '#123456' }));
    expect(css).toBe(':root {\n  --primary-color-light: #123456;\n}');
  });

  it('accepts a different selector', () => {
    const css = themeStyleSheet(
      settings({ primary_color_light: '#123456' }),
      '.themed',
    );
    expect(css.startsWith('.themed {')).toBe(true);
  });

  it('renders every declaration', () => {
    const css = themeStyleSheet(
      settings({
        primary_color_light: '#123456',
        accent_color_dark: '#ffb703',
      }),
    );
    expect(css).toContain('--primary-color-light: #123456;');
    expect(css).toContain('--accent-color-dark: #ffb703;');
  });

  it('is empty when the theme contributes nothing', () => {
    expect(themeStyleSheet(null)).toBe('');
    expect(themeStyleSheet({})).toBe('');
  });

  it('is empty when every value is rejected', () => {
    expect(themeStyleSheet(settings({ primary_color_light: 'red' }))).toBe('');
  });
});

describe('themeSettingsOf', () => {
  it('unwraps the resolved settings', () => {
    const field = serialized({
      token: 'corporate',
      title: 'Corporate',
      value: { primary_color_light: '#123456' },
    });
    expect(themeSettingsOf(field)?.primary_color_light).toBe('#123456');
  });

  it('returns undefined for a missing field', () => {
    expect(themeSettingsOf(null)).toBeUndefined();
    expect(themeSettingsOf(undefined)).toBeUndefined();
  });

  it('returns the empty object of a deleted theme', () => {
    const field = serialized({
      token: 'corporate',
      title: 'corporate',
      value: {},
    });
    expect(themeSettingsOf(field)).toEqual({});
  });

  it('yields no styles for a deleted theme', () => {
    const field = serialized({ token: 'corporate', value: {} });
    expect(themeStyleSheet(themeSettingsOf(field))).toBe('');
  });

  it('drives the stylesheet end to end', () => {
    const field = serialized({
      token: 'corporate',
      title: 'Corporate',
      value: { primary_color_light: '#123456' },
    });
    expect(themeStyleSheet(themeSettingsOf(field))).toBe(
      ':root {\n  --primary-color-light: #123456;\n}',
    );
  });
});
