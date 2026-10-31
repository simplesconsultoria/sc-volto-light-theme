import { describe, it, expect } from 'vitest';
import { groupByBGColor } from './grouping';

describe('groupByBGColor', () => {
  it('separa blocos com temas diferentes em grupos distintos', () => {
    const blocks: any = {
      b1: { '@type': 'image', theme: 'alternative' },
      b2: { '@type': 'slate', theme: 'default' },
    };
    const blocks_layout: any = {
      items: ['b1', 'b2'],
    };

    const result = groupByBGColor(blocks, blocks_layout);
    expect(result).toEqual([['b1'], ['b2']]);
  });

  it('agrupa blocos consecutivos com o mesmo tema no mesmo grupo', () => {
    const blocks: any = {
      b1: { '@type': 'image', theme: 'default' },
      b2: { '@type': 'slate', theme: 'default' },
      b3: { '@type': 'slate', theme: 'default' },
    };
    const blocks_layout: any = {
      items: ['b1', 'b2', 'b3'],
    };

    const result = groupByBGColor(blocks, blocks_layout);
    expect(result).toEqual([['b1', 'b2', 'b3']]);
  });

  it('suporta theme definido dentro de styles.theme', () => {
    const blocks: any = {
      b1: { '@type': 'image', styles: { theme: 'alternative' } },
      b2: { '@type': 'slate', styles: { theme: 'default' } },
    };
    const blocks_layout: any = {
      items: ['b1', 'b2'],
    };

    const result = groupByBGColor(blocks, blocks_layout);
    expect(result).toEqual([['b1'], ['b2']]);
  });

  it('retorna array vazio quando layout ou blocks estiverem vazios', () => {
    expect(groupByBGColor({}, { items: [] } as any)).toEqual([]);
    expect(groupByBGColor(null as any, null as any)).toEqual([]);
  });
});
