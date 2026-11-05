/**
 * Helper para normalização e resolução de larguras de blocos (Block Width).
 */

export const VALID_BLOCK_WIDTHS = [
  'narrow',
  'default',
  'layout',
  'full',
] as const;
export type BlockWidth = (typeof VALID_BLOCK_WIDTHS)[number];

/**
 * Normaliza o valor de largura de bloco vindo de qualquer formato suportado:
 * - string direta: 'narrow' | 'default' | 'layout' | 'full' | 'unset'
 * - CSS custom property string: 'var(--narrow-container-width)', etc.
 * - objeto com chave de estilo: { '--block-width': '...' } ou { value: '...' }
 *
 * Retorna sempre uma string válida: 'narrow' | 'default' | 'layout' | 'full'.
 * Fallback padrão: 'default'.
 */
export const WIDTH_RANK: Record<BlockWidth, number> = {
  narrow: 1,
  default: 2,
  layout: 3,
  full: 4,
};

export interface ResolveBlockWidthParams {
  block?: string;
  content?: any;
  data: any;
}

/**
 * Normaliza o valor de largura de bloco vindo de qualquer formato suportado:
 * - string direta: 'narrow' | 'default' | 'layout' | 'full' | 'unset'
 * - CSS custom property string: 'var(--narrow-container-width)', etc.
 * - objeto com chave de estilo: { '--block-width': '...' } ou { value: '...' }
 *
 * Retorna sempre uma string válida: 'narrow' | 'default' | 'layout' | 'full'.
 * Fallback padrão: 'default'.
 */
export function normalizeBlockWidth(data: any): BlockWidth {
  if (!data) return 'default';

  let raw =
    data.styles?.['blockWidth:noprefix'] ??
    data['blockWidth:noprefix'] ??
    data.styles?.['block-width:noprefix'] ??
    data['block-width:noprefix'] ??
    data.styles?.['--block-width'] ??
    data['--block-width'] ??
    data.styles?.['block-width'] ??
    data['block-width'] ??
    data.styles?.blockWidth ??
    data.blockWidth ??
    data.styles?.width ??
    data.width;

  // Extrai valor se encapsulado em objeto (ex: vindo de ButtonsWidget ou radio personalizado)
  while (typeof raw === 'object' && raw !== null) {
    if (raw.name && typeof raw.name === 'string') {
      raw = raw.name;
      break;
    }
    if (raw['--block-width'] && typeof raw['--block-width'] === 'string') {
      raw = raw['--block-width'];
      break;
    }
    if (raw.style && typeof raw.style === 'object') {
      raw = raw.style['--block-width'] || raw.style.value || raw.style;
      continue;
    }
    raw = raw.value || raw.id || raw.val || (Object.values(raw)[0] as any);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim().toLowerCase();
    if (
      trimmed === 'unset' ||
      trimmed.includes('full') ||
      trimmed.includes('100%')
    ) {
      return 'full';
    }
    if (trimmed.includes('narrow')) {
      return 'narrow';
    }
    if (trimmed.includes('layout') || trimmed.includes('wide')) {
      return 'layout';
    }
    if (trimmed.includes('default') || trimmed.includes('fit')) {
      return 'default';
    }
    if (VALID_BLOCK_WIDTHS.includes(trimmed as BlockWidth)) {
      return trimmed as BlockWidth;
    }
  }

  return 'default';
}

/**
 * Resolve a largura efetiva para um bloco.
 * Se o bloco for uma imagem alinhada lateralmente (left ou right):
 * - A largura do bloco é derivada do elemento imediatamente ao lado dela (compartilhando o espaço do float).
 * - Prioriza o primeiro bloco subsequente adjacente no mesmo tema; caso não exista, verifica o bloco anterior.
 */
export function resolveBlockWidthForBlock({
  block,
  content,
  data,
}: ResolveBlockWidthParams): BlockWidth {
  if (!data) return 'default';

  const blockType = data['@type'];
  const align =
    data.align || data.styles?.['align:noprefix'] || data.styles?.align;
  const isAlignedImage =
    (blockType === 'image' || blockType === 'mainImageBlock') &&
    (align === 'left' || align === 'right');

  // Se não for imagem alinhada lateralmente, usa a largura própria do bloco
  if (!isAlignedImage) {
    return normalizeBlockWidth(data);
  }

  // Tenta resolver a largura a partir dos blocos adjacentes no mesmo layout
  const items = content?.blocks_layout?.items;
  if (!items || !block || !content?.blocks) {
    return normalizeBlockWidth(data);
  }

  const currentIndex = items.indexOf(block);
  if (currentIndex === -1) {
    return normalizeBlockWidth(data);
  }

  const rawTheme = data.theme || data.styles?.theme || 'default';
  const currentTheme =
    typeof rawTheme === 'object' && rawTheme !== null
      ? rawTheme.theme || 'default'
      : rawTheme;

  // 1. Examina blocos subsequentes no mesmo grupo de tema (que fluem ao lado do float)
  for (let i = currentIndex + 1; i < items.length; i++) {
    const siblingId = items[i];
    const siblingData = content.blocks[siblingId];
    if (!siblingData) continue;

    // Se o bloco seguinte tem tema diferente, ele fica em outro container isolado (BFC)
    const rawSiblingTheme =
      siblingData.theme || siblingData.styles?.theme || 'default';
    const siblingTheme =
      typeof rawSiblingTheme === 'object' && rawSiblingTheme !== null
        ? rawSiblingTheme.theme || 'default'
        : rawSiblingTheme;

    if (siblingTheme !== currentTheme) {
      break;
    }

    const siblingType = siblingData['@type'];
    // Elementos divisores ou containers full-bleed encerram a adjacência
    if (
      siblingType === 'separator' ||
      siblingType === 'heroBlock' ||
      siblingType === 'customGrid'
    ) {
      break;
    }

    const siblingAlign =
      siblingData.align || siblingData.styles?.['align:noprefix'];
    if (siblingAlign === 'left' || siblingAlign === 'right') {
      break;
    }

    // O elemento irmão imediatamente ao lado define a largura do bloco
    return normalizeBlockWidth(siblingData);
  }

  // 2. Se não houver irmãos subsequentes no mesmo tema, verifica o bloco anterior
  if (currentIndex > 0) {
    const prevId = items[currentIndex - 1];
    const prevData = content.blocks[prevId];
    if (prevData) {
      const rawPrevTheme =
        prevData.theme || prevData.styles?.theme || 'default';
      const prevTheme =
        typeof rawPrevTheme === 'object' && rawPrevTheme !== null
          ? rawPrevTheme.theme || 'default'
          : rawPrevTheme;

      if (prevTheme === currentTheme) {
        return normalizeBlockWidth(prevData);
      }
    }
  }

  // Se nenhum bloco adjacente foi encontrado, fallback para a largura configurada ou 'default'
  return normalizeBlockWidth(data);
}
