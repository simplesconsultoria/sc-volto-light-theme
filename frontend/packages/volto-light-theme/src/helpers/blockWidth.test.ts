import { describe, it, expect } from 'vitest';
import { normalizeBlockWidth, resolveBlockWidthForBlock } from './blockWidth';

describe('normalizeBlockWidth', () => {
  it('retorna default quando data for nulo ou indefinido', () => {
    expect(normalizeBlockWidth(null)).toBe('default');
    expect(normalizeBlockWidth(undefined)).toBe('default');
    expect(normalizeBlockWidth({})).toBe('default');
  });

  it('lê de data.blockWidth diretamente', () => {
    expect(normalizeBlockWidth({ blockWidth: 'narrow' })).toBe('narrow');
    expect(normalizeBlockWidth({ blockWidth: 'layout' })).toBe('layout');
    expect(normalizeBlockWidth({ blockWidth: 'full' })).toBe('full');
    expect(normalizeBlockWidth({ blockWidth: 'default' })).toBe('default');
  });

  it('lê de data.styles.blockWidth', () => {
    expect(normalizeBlockWidth({ styles: { blockWidth: 'narrow' } })).toBe(
      'narrow',
    );
    expect(normalizeBlockWidth({ styles: { blockWidth: 'full' } })).toBe(
      'full',
    );
  });

  it('lê de data.styles["blockWidth:noprefix"]', () => {
    expect(
      normalizeBlockWidth({ styles: { 'blockWidth:noprefix': 'layout' } }),
    ).toBe('layout');
  });

  it('mapeia unset para full', () => {
    expect(normalizeBlockWidth({ blockWidth: 'unset' })).toBe('full');
    expect(
      normalizeBlockWidth({ styles: { 'blockWidth:noprefix': 'unset' } }),
    ).toBe('full');
  });

  it('mapeia variáveis CSS para nomes de largura', () => {
    expect(
      normalizeBlockWidth({ blockWidth: 'var(--layout-container-width)' }),
    ).toBe('layout');
    expect(
      normalizeBlockWidth({ blockWidth: 'var(--narrow-container-width)' }),
    ).toBe('narrow');
    expect(
      normalizeBlockWidth({ blockWidth: 'var(--default-container-width)' }),
    ).toBe('default');
  });

  it('desempacota objetos vindos de widgets de botão', () => {
    expect(
      normalizeBlockWidth({ blockWidth: { '--block-width': 'narrow' } }),
    ).toBe('narrow');
    expect(normalizeBlockWidth({ blockWidth: { value: 'layout' } })).toBe(
      'layout',
    );
    expect(normalizeBlockWidth({ blockWidth: { id: 'full' } })).toBe('full');
  });

  it('retorna default para valores desconhecidos', () => {
    expect(normalizeBlockWidth({ blockWidth: 'invalid-value' })).toBe(
      'default',
    );
  });
});

describe('resolveBlockWidthForBlock', () => {
  it('retorna largura própria quando o bloco não for imagem alinhada lateralmente', () => {
    expect(
      resolveBlockWidthForBlock({
        data: { '@type': 'slate', blockWidth: 'layout' },
      }),
    ).toBe('layout');
    expect(
      resolveBlockWidthForBlock({
        data: { '@type': 'image', align: 'center', blockWidth: 'narrow' },
      }),
    ).toBe('narrow');
  });

  it('adota a largura do bloco adjacente no mesmo tema para imagem alinhada', () => {
    const content = {
      blocks: {
        img1: { '@type': 'image', align: 'left', theme: 'default' },
        txt1: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'layout' },
        },
      },
      blocks_layout: {
        items: ['img1', 'txt1'],
      },
    };

    expect(
      resolveBlockWidthForBlock({
        block: 'img1',
        content,
        data: content.blocks.img1,
      }),
    ).toBe('layout');
  });

  it('adota o menor tamanho entre elementos adjacentes de larguras diferentes', () => {
    // default e layout -> adota default (menor)
    const contentDefaultAndLayout = {
      blocks: {
        img1: { '@type': 'image', align: 'left', theme: 'default' },
        txt1: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'default' },
        },
        txt2: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'layout' },
        },
      },
      blocks_layout: {
        items: ['img1', 'txt1', 'txt2'],
      },
    };

    expect(
      resolveBlockWidthForBlock({
        block: 'img1',
        content: contentDefaultAndLayout,
        data: contentDefaultAndLayout.blocks.img1,
      }),
    ).toBe('default');

    // narrow e default -> adota narrow (menor)
    const contentNarrowAndDefault = {
      blocks: {
        img1: { '@type': 'mainImageBlock', align: 'right', theme: 'default' },
        txt1: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'default' },
        },
        txt2: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'narrow' },
        },
      },
      blocks_layout: {
        items: ['img1', 'txt1', 'txt2'],
      },
    };

    expect(
      resolveBlockWidthForBlock({
        block: 'img1',
        content: contentNarrowAndDefault,
        data: contentNarrowAndDefault.blocks.img1,
      }),
    ).toBe('narrow');
  });

  it('respeita o isolamento de temas e não herda largura de bloco com tema diferente', () => {
    const contentDifferentTheme = {
      blocks: {
        img1: { '@type': 'image', align: 'left', theme: 'alternative' },
        txt1: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'narrow' },
        },
      },
      blocks_layout: {
        items: ['img1', 'txt1'],
      },
    };

    // Como txt1 tem tema diferente, a varredura para e não adota 'narrow' de outro tema
    expect(
      resolveBlockWidthForBlock({
        block: 'img1',
        content: contentDifferentTheme,
        data: contentDifferentTheme.blocks.img1,
      }),
    ).toBe('default');
  });

  it('interrompe a varredura ao encontrar blocos divisores como separator', () => {
    const contentWithSeparator = {
      blocks: {
        img1: { '@type': 'image', align: 'left', theme: 'default' },
        sep1: { '@type': 'separator', theme: 'default' },
        txt1: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'narrow' },
        },
      },
      blocks_layout: {
        items: ['img1', 'sep1', 'txt1'],
      },
    };

    expect(
      resolveBlockWidthForBlock({
        block: 'img1',
        content: contentWithSeparator,
        data: contentWithSeparator.blocks.img1,
      }),
    ).toBe('default');
  });

  it('verifica bloco anterior caso não haja subsequente no mesmo tema', () => {
    const contentPrev = {
      blocks: {
        txt1: {
          '@type': 'slate',
          theme: 'default',
          styles: { 'blockWidth:noprefix': 'layout' },
        },
        img1: { '@type': 'image', align: 'left', theme: 'default' },
      },
      blocks_layout: {
        items: ['txt1', 'img1'],
      },
    };

    expect(
      resolveBlockWidthForBlock({
        block: 'img1',
        content: contentPrev,
        data: contentPrev.blocks.img1,
      }),
    ).toBe('layout');
  });
});
