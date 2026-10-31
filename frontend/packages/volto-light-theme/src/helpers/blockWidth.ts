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
    data.styles?.blockWidth ??
    data.blockWidth;

  // Extrai valor se encapsulado em objeto (ex: vindo de ButtonsWidget ou radio personalizado)
  if (typeof raw === 'object' && raw !== null) {
    raw = raw['--block-width'] || raw.value || raw.id || Object.values(raw)[0];
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === 'unset') return 'full';
    if (trimmed === 'var(--layout-container-width)') return 'layout';
    if (trimmed === 'var(--narrow-container-width)') return 'narrow';
    if (trimmed === 'var(--default-container-width)') return 'default';
    if (VALID_BLOCK_WIDTHS.includes(trimmed as BlockWidth)) {
      return trimmed as BlockWidth;
    }
  }

  return 'default';
}

/**
 * Resolve a largura efetiva para um bloco.
 * Se o bloco for uma imagem alinhada lateralmente (left ou right):
 * - A largura da coluna é derivada dos blocos adjacentes (ao lado dela no mesmo tema).
 * - Caso haja múltiplos elementos adjacentes com larguras diferentes (ex: um default e outro layout),
 *   adota o menor tamanho entre eles (narrow < default < layout < full).
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

  const candidateWidths: BlockWidth[] = [];

  // 1. Examina blocos subsequentes no mesmo grupo de tema
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

    // Coleta a largura normalizada do bloco irmão
    candidateWidths.push(normalizeBlockWidth(siblingData));

    // Analisa até 3 blocos adjacentes que dividem o espaço com o float
    if (candidateWidths.length >= 3) {
      break;
    }
  }

  // 2. Se não houver irmãos subsequentes no mesmo tema, verifica o bloco anterior
  if (candidateWidths.length === 0 && currentIndex > 0) {
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
        candidateWidths.push(normalizeBlockWidth(prevData));
      }
    }
  }

  // Se nenhum bloco adjacente foi encontrado, fallback para 'default'
  if (candidateWidths.length === 0) {
    return 'default';
  }

  // Caso tenham mais que dois elementos com tamanhos diferentes, seleciona o menor
  let smallest = candidateWidths[0];
  for (let i = 1; i < candidateWidths.length; i++) {
    const current = candidateWidths[i];
    if (WIDTH_RANK[current] < WIDTH_RANK[smallest]) {
      smallest = current;
    }
  }

  return smallest;
}
