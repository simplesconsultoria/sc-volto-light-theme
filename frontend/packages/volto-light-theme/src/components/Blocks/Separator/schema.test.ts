import { describe, it, expect } from 'vitest';
import { SeparatorSchema } from './schema';

describe('SeparatorSchema', () => {
  const mockIntl = {
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  };

  it('generates the schema with default fieldset containing color, thickness, width, and alignment', () => {
    const schema = SeparatorSchema({ intl: mockIntl });

    expect(schema.title).toBe('Separator');
    expect(schema.fieldsets).toHaveLength(1);
    expect(schema.fieldsets[0].id).toBe('default');
    expect(schema.fieldsets[0].fields).toEqual([
      'color',
      'thickness',
      'width',
      'alignment',
    ]);

    expect(schema.properties.color).toBeDefined();
    expect(schema.properties.color.widget).toBe('style_simple_color');

    expect(schema.properties.thickness).toBeDefined();
    expect(schema.properties.thickness.type).toBe('number');
    expect(schema.properties.thickness.default).toBe(1);

    expect(schema.properties.width).toBeDefined();
    expect(schema.properties.width.choices).toEqual([
      ['100%', '100%'],
      ['75%', '75%'],
      ['50%', '50%'],
      ['25%', '25%'],
    ]);

    expect(schema.properties.alignment).toBeDefined();
    expect(schema.properties.alignment.widget).toBe('align');
    expect(schema.properties.alignment.actions).toEqual([
      'left',
      'center',
      'right',
    ]);
  });
});
