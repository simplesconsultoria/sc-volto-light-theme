import {
  applyLayoutChange,
  applyThemeToBlocks,
  buildColumnWithFirstBlock,
  buildColumnsForLayout,
  cleanGridClassName,
  countLayoutColumns,
  getBlockWidthClass,
  getColumnTheme,
  getThemeColorGroups,
  mergeColumnSettings,
  normalizeColumnFormData,
  setColumn,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/CustomGrid/helpers';

describe('CustomGrid helpers', () => {
  it('counts layout columns', () => {
    expect(countLayoutColumns('50-50')).toBe(2);
    expect(countLayoutColumns('25-25-25-25')).toBe(4);
  });

  it('builds empty columns for a layout', () => {
    const result = buildColumnsForLayout('33-33-33');
    expect(result.blocks_layout.items).toHaveLength(3);
    result.blocks_layout.items.forEach((id) => {
      expect(result.blocks[id]).toEqual({
        '@type': 'customGridColumn',
        blocks: {},
        blocks_layout: { items: [] },
      });
    });
  });

  describe('applyLayoutChange', () => {
    const colA = { '@type': 'customGridColumn', blocks: { x: {} } };
    const colB = { '@type': 'customGridColumn', blocks: { y: {} } };
    const data = {
      layout: '50-50',
      other: 1,
      data: {
        blocks: { a: colA, b: colB },
        blocks_layout: { items: ['a', 'b'] },
      },
    };

    it('only changes the layout when the column count is the same', () => {
      expect(applyLayoutChange(data, '33-67')).toEqual({
        ...data,
        layout: '33-67',
      });
    });

    it('preserves existing columns in order when adding columns', () => {
      const result = applyLayoutChange(data, '33-33-33');
      const items = result.data.blocks_layout.items;
      expect(result.layout).toBe('33-33-33');
      expect(items).toHaveLength(3);
      expect(result.data.blocks[items[0]]).toBe(colA);
      expect(result.data.blocks[items[1]]).toBe(colB);
      expect(result.data.blocks[items[2]].blocks).toEqual({});
    });

    it('drops trailing columns when removing columns', () => {
      const result = applyLayoutChange(data, '100');
      const items = result.data.blocks_layout.items;
      expect(items).toHaveLength(1);
      expect(result.data.blocks[items[0]]).toBe(colA);
    });
  });

  it('replaces one column', () => {
    const data = { layout: '50-50', data: { blocks: { a: 1, b: 2 } } };
    expect(setColumn(data, 'b', { z: 1 })).toEqual({
      layout: '50-50',
      data: { blocks: { a: 1, b: { z: 1 } } },
    });
  });

  it('derives color groups from the theme value', () => {
    expect(getThemeColorGroups('custom-accent-neutral')).toEqual({
      backColorGroup: 'accent',
      frontColorGroup: 'neutral',
    });
    expect(getThemeColorGroups('default')).toEqual({
      backColorGroup: 'primary',
      frontColorGroup: 'neutral',
    });
    expect(getThemeColorGroups('alternative')).toEqual({
      backColorGroup: 'accent',
      frontColorGroup: 'primary',
    });
    expect(getThemeColorGroups('other')).toEqual({});
    expect(getThemeColorGroups(undefined)).toEqual({});
  });

  it('applies a theme to every child block', () => {
    const blocks = {
      a: { '@type': 'slate', styles: { align: 'left' } },
      b: {},
    };
    expect(applyThemeToBlocks(blocks, 't', 'back', 'front')).toEqual({
      a: {
        '@type': 'slate',
        theme: 't',
        backColorGroup: 'back',
        frontColorGroup: 'front',
        styles: {
          align: 'left',
          theme: 't',
          backColorGroup: 'back',
          frontColorGroup: 'front',
        },
      },
      b: {
        theme: 't',
        backColorGroup: 'back',
        frontColorGroup: 'front',
        styles: {
          theme: 't',
          backColorGroup: 'back',
          frontColorGroup: 'front',
        },
      },
    });
    expect(blocks.b).toEqual({});
  });

  it('merges column settings and drops the theme when cleared', () => {
    const current = {
      theme: 'a',
      backColorGroup: 'x',
      frontColorGroup: 'y',
      z: 1,
    };
    expect(mergeColumnSettings(current, { theme: 'b' })).toEqual({
      ...current,
      theme: 'b',
    });
    expect(mergeColumnSettings(current, { theme: '', styles: {} })).toEqual({
      z: 1,
      styles: {},
    });
  });

  it('builds a column with its first block, inheriting the theme', () => {
    const themed = {
      settings: { theme: 't', backColorGroup: 'b', frontColorGroup: 'f' },
    };
    expect(buildColumnWithFirstBlock(themed, 'id1', 'slate')).toEqual({
      ...themed,
      blocks: {
        id1: {
          '@type': 'slate',
          theme: 't',
          backColorGroup: 'b',
          frontColorGroup: 'f',
          styles: { theme: 't', backColorGroup: 'b', frontColorGroup: 'f' },
        },
      },
      blocks_layout: { items: ['id1'] },
    });
    expect(buildColumnWithFirstBlock({}, 'id1', 'slate').blocks).toEqual({
      id1: { '@type': 'slate' },
    });
  });

  it('empties a column form without blocks', () => {
    const filled = { blocks: { a: {} }, blocks_layout: { items: ['a'] } };
    expect(normalizeColumnFormData(filled)).toBe(filled);
    expect(
      normalizeColumnFormData({
        blocks: { a: {} },
        blocks_layout: { items: [] },
      }),
    ).toEqual({ blocks: {}, blocks_layout: { items: [] } });
    expect(normalizeColumnFormData({ x: 1 })).toEqual({
      x: 1,
      blocks: {},
      blocks_layout: { items: [] },
    });
  });

  it('resolves the block width class', () => {
    expect(getBlockWidthClass('full')).toBe('has--block-width--full');
    expect(getBlockWidthClass({ value: 'narrow' })).toBe(
      'has--block-width--narrow',
    );
    expect(getBlockWidthClass({ id: 'layout' })).toBe(
      'has--block-width--layout',
    );
    expect(getBlockWidthClass({ foo: 'default' })).toBe(
      'has--block-width--default',
    );
    expect(getBlockWidthClass(undefined)).toBe('has--block-width--layout');
  });

  it('removes Volto width classes from the className', () => {
    expect(
      cleanGridClassName(
        'a has--block-width--full full narrow b layout default',
      ),
    ).toBe('a b');
    expect(cleanGridClassName(undefined)).toBe('');
  });

  it('has no theme class or style without a column theme', () => {
    expect(getColumnTheme(undefined)).toEqual({
      className: '',
      style: undefined,
    });
  });

  it('uses an object theme as inline style', () => {
    const style = { '--x': 'red' } as any;
    const result = getColumnTheme({ theme: style });
    expect(result.style).toBe(style);
    expect(result.className).toContain('has-theme');
  });
});
