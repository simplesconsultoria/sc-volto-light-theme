import { describe, expect, it } from 'vitest';
import { cloneSchema } from '@simplesconsultoria/volto-light-theme/helpers/cloneSchema';

describe('cloneSchema', () => {
  it('copies nested objects and arrays', () => {
    const schema = {
      fieldsets: [{ id: 'default', fields: ['title'] }],
      properties: { title: { title: 'Title' } },
    };
    const copy = cloneSchema(schema);
    expect(copy).toEqual(schema);
    expect(copy).not.toBe(schema);
    expect(copy.fieldsets[0]).not.toBe(schema.fieldsets[0]);
    copy.fieldsets[0].fields.push('description');
    expect(schema.fieldsets[0].fields).toEqual(['title']);
  });

  it('keeps functions, which a JSON round-trip would drop', () => {
    const filterOptions = () => [];
    const copy = cloneSchema({ properties: { x: { filterOptions } } });
    expect(copy.properties.x.filterOptions).toBe(filterOptions);
  });

  it('passes primitives and nullish values through', () => {
    expect(cloneSchema(null)).toBeNull();
    expect(cloneSchema(undefined)).toBeUndefined();
    expect(cloneSchema(3)).toBe(3);
  });
});
