import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_ID,
  addSchema,
  cloneThemeFormData,
  editSchema,
  existingThemeIds,
  findTheme,
  isDeletable,
  isValidThemeId,
  splitFormData,
  validateNewThemeId,
} from './themesControlpanel';
import type { JsonSchema, ThemesControlpanelData } from './themesControlpanel';

const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { title: 'Theme name', type: 'string' },
    primary_color: {
      title: 'Primary Color',
      type: 'string',
      widget: 'colorPicker',
    },
  },
  required: ['name'],
  fieldsets: [
    { id: 'default', title: 'Default', fields: ['name', 'primary_color'] },
  ],
};

const data: ThemesControlpanelData = {
  '@id': 'http://localhost:8080/Plone/@controlpanels/themes',
  title: 'Themes',
  schema,
  items: [
    {
      '@id': 'http://localhost:8080/Plone/@controlpanels/themes/default',
      id: 'default',
      name: 'Default',
      primary_color: '#10375c',
    },
    {
      '@id': 'http://localhost:8080/Plone/@controlpanels/themes/corporate',
      id: 'corporate',
      name: 'Corporate',
    },
  ],
  items_total: 2,
};

describe('isDeletable', () => {
  it('protects the default theme', () => {
    expect(isDeletable(DEFAULT_THEME_ID)).toBe(false);
  });

  it('allows any other theme', () => {
    expect(isDeletable('corporate')).toBe(true);
  });
});

describe('isValidThemeId', () => {
  it.each(['corporate', 'theme-2', 't'])('accepts %o', (id) => {
    expect(isValidThemeId(id)).toBe(true);
  });

  it.each(['has.dot', '-leading', 'UPPER', 'with space', ''])(
    'rejects %o',
    (id) => {
      expect(isValidThemeId(id)).toBe(false);
    },
  );
});

describe('existingThemeIds', () => {
  it('lists the ids', () => {
    expect(existingThemeIds(data)).toEqual(['default', 'corporate']);
  });

  it('is empty without data', () => {
    expect(existingThemeIds(undefined)).toEqual([]);
  });
});

describe('findTheme', () => {
  it('finds a theme by id', () => {
    expect(findTheme(data, 'corporate')?.name).toBe('Corporate');
  });

  it('returns undefined for an unknown id', () => {
    expect(findTheme(data, 'not-here')).toBeUndefined();
  });

  it('tolerates missing data', () => {
    expect(findTheme(undefined, 'corporate')).toBeUndefined();
  });
});

describe('editSchema', () => {
  it('keeps the served schema untouched', () => {
    expect(editSchema(schema)).toEqual(schema);
  });

  it('does not offer an id field', () => {
    // A theme cannot be renamed: the id is part of the registry record name.
    expect(editSchema(schema).properties.id).toBeUndefined();
  });
});

describe('addSchema', () => {
  it('adds an id property', () => {
    expect(addSchema(schema).properties.id).toBeDefined();
  });

  it('marks the id required', () => {
    expect(addSchema(schema).required).toContain('id');
  });

  it('keeps the other required fields', () => {
    expect(addSchema(schema).required).toContain('name');
  });

  it('puts the id first in the first fieldset', () => {
    expect(addSchema(schema).fieldsets?.[0].fields).toEqual([
      'id',
      'name',
      'primary_color',
    ]);
  });

  it('keeps the theme fields', () => {
    const properties = addSchema(schema).properties;
    expect(properties.name).toBeDefined();
    expect(properties.primary_color.widget).toBe('colorPicker');
  });

  it('does not mutate the input schema', () => {
    addSchema(schema);
    expect(schema.properties.id).toBeUndefined();
    expect(schema.fieldsets?.[0].fields).toEqual(['name', 'primary_color']);
  });

  it('invents a fieldset when the schema has none', () => {
    const bare: JsonSchema = { properties: { name: { title: 'Name' } } };
    expect(addSchema(bare).fieldsets?.[0].fields).toEqual(['id', 'name']);
  });
});

describe('splitFormData', () => {
  it('separates the id from the values', () => {
    const { id, values } = splitFormData({ id: 'corporate', name: 'Corp' });
    expect(id).toBe('corporate');
    expect(values).toEqual({ name: 'Corp' });
  });

  it('drops @id', () => {
    const { values } = splitFormData({ id: 'x', '@id': 'http://x', name: 'X' });
    expect(values).toEqual({ name: 'X' });
  });

  it('returns an empty id when absent', () => {
    expect(splitFormData({ name: 'X' }).id).toBe('');
  });

  it('tolerates an empty form', () => {
    expect(splitFormData({})).toEqual({ id: '', values: {} });
  });
});

describe('validateNewThemeId', () => {
  it('accepts a fresh valid id', () => {
    expect(validateNewThemeId('brand-new', ['default'])).toBeNull();
  });

  it('requires an id', () => {
    expect(validateNewThemeId('', [])).toMatch(/required/);
  });

  it('rejects a malformed id', () => {
    expect(validateNewThemeId('has.dot', [])).toMatch(/lowercase/);
  });

  it('rejects a duplicate', () => {
    expect(validateNewThemeId('default', ['default'])).toMatch(/already/);
  });

  it('reports the malformed id before checking duplicates', () => {
    expect(validateNewThemeId('Has.Dot', ['Has.Dot'])).toMatch(/lowercase/);
  });
});

describe('cloneThemeFormData', () => {
  const source = data.items![0];

  it('keeps the settings', () => {
    expect(cloneThemeFormData(source).primary_color).toBe('#10375c');
  });

  it('drops the identity', () => {
    const clone = cloneThemeFormData(source);
    expect(clone.id).toBeUndefined();
    expect(clone['@id']).toBeUndefined();
  });

  it('suffixes the name so the copy is recognisable', () => {
    expect(cloneThemeFormData(source).name).toBe('Default (copy)');
  });

  it('leaves the name out when the source has none', () => {
    const nameless = { '@id': 'http://x', id: 'x', primary_color: '#000000' };
    expect(cloneThemeFormData(nameless).name).toBeUndefined();
  });

  it('does not mutate the source', () => {
    cloneThemeFormData(source);
    expect(source.name).toBe('Default');
    expect(source.id).toBe('default');
  });

  it('produces form data the add schema can render', () => {
    const clone = cloneThemeFormData(source);
    const properties = addSchema(schema).properties;
    for (const key of Object.keys(clone)) {
      expect(properties[key]).toBeDefined();
    }
  });
});
