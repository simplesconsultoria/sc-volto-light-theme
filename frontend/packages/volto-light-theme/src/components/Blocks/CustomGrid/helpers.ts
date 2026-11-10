import type React from 'react';
import cx from 'classnames';
import { resolveBlockTheme } from '../../../config/blockThemes';

type AnyRecord = Record<string, any>;

// Creates a fresh empty column with a blank blocks subform
export const generateEmptyColumn = () => ({
  '@type': 'customGridColumn',
  blocks: {},
  blocks_layout: { items: [] as string[] },
});

/** Number of columns described by a layout id such as "33-33-33". */
export const countLayoutColumns = (layoutId: string): number =>
  layoutId.split('-').length;

// Builds the initial column structure for a given layout
export const buildColumnsForLayout = (layoutId: string) => {
  const numCols = countLayoutColumns(layoutId);
  const blocks: AnyRecord = {};
  const items: string[] = [];
  for (let i = 0; i < numCols; i++) {
    const id = crypto.randomUUID();
    blocks[id] = generateEmptyColumn();
    items.push(id);
  }
  return { blocks, blocks_layout: { items } };
};

/**
 * Returns the block data after the layout is changed from the sidebar.
 * When the number of columns changes, columns are rebuilt, preserving as
 * many existing columns (in order) as possible.
 */
export const applyLayoutChange = (data: AnyRecord, newLayout: string) => {
  const currentItems: string[] = data?.data?.blocks_layout?.items || [];
  const newNumCols = countLayoutColumns(newLayout);

  if (currentItems.length === newNumCols) {
    return { ...data, layout: newLayout };
  }

  const newColData = buildColumnsForLayout(newLayout);
  const preserveCount = Math.min(currentItems.length, newNumCols);
  for (let i = 0; i < preserveCount; i++) {
    const oldId = currentItems[i];
    const newId = newColData.blocks_layout.items[i];
    newColData.blocks[newId] = data.data.blocks[oldId] || generateEmptyColumn();
  }
  return { ...data, layout: newLayout, data: newColData };
};

/** Returns the block data with column `colId` replaced by `column`. */
export const setColumn = (
  data: AnyRecord,
  colId: string,
  column: AnyRecord,
) => ({
  ...data,
  data: {
    ...data.data,
    blocks: {
      ...data.data.blocks,
      [colId]: column,
    },
  },
});

/**
 * Color groups implied by a column theme value: custom themes encode them
 * in the id ("custom-<back>-<front>"), named themes have fixed pairs.
 */
export const getThemeColorGroups = (value: unknown): AnyRecord => {
  if (typeof value === 'string' && value.startsWith('custom-')) {
    const parts = value.split('-');
    return { backColorGroup: parts[1], frontColorGroup: parts[2] };
  }
  if (value === 'default') {
    return { backColorGroup: 'primary', frontColorGroup: 'neutral' };
  }
  if (value === 'alternative') {
    return { backColorGroup: 'accent', frontColorGroup: 'primary' };
  }
  return {};
};

/** The theme fields a column passes down to its child blocks. */
export const getThemeFields = (
  theme: unknown,
  backColorGroup: unknown,
  frontColorGroup: unknown,
) => ({ theme, backColorGroup, frontColorGroup });

/** Copies a column theme onto every child block (top level and `styles`). */
export const applyThemeToBlocks = (
  blocks: AnyRecord,
  theme: unknown,
  backColorGroup: unknown,
  frontColorGroup: unknown,
): AnyRecord => {
  const fields = getThemeFields(theme, backColorGroup, frontColorGroup);
  const result: AnyRecord = { ...blocks };
  Object.keys(result).forEach((blockId) => {
    result[blockId] = {
      ...result[blockId],
      ...fields,
      styles: {
        ...(result[blockId].styles || {}),
        ...fields,
      },
    };
  });
  return result;
};

/**
 * Merges updated column settings over the current ones. Without a theme,
 * the theme and its color groups are removed.
 */
export const mergeColumnSettings = (
  current: AnyRecord | undefined,
  updated: AnyRecord,
): AnyRecord => {
  const next = { ...current, ...updated };
  if (!updated?.theme) {
    delete next.theme;
    delete next.backColorGroup;
    delete next.frontColorGroup;
  }
  return next;
};

/**
 * Builds the column holding its first block of `type`, inheriting the
 * column theme when there is one.
 */
export const buildColumnWithFirstBlock = (
  colData: AnyRecord,
  newId: string,
  type: string,
) => {
  const theme = colData?.settings?.theme;
  const fields = getThemeFields(
    theme,
    colData?.settings?.backColorGroup,
    colData?.settings?.frontColorGroup,
  );
  return {
    ...colData,
    blocks: {
      [newId]: {
        '@type': type,
        ...(theme ? { ...fields, styles: { ...fields } } : {}),
      },
    },
    blocks_layout: { items: [newId] },
  };
};

/** If the user deleted all blocks of a column, leave it truly empty. */
export const normalizeColumnFormData = (formData: AnyRecord): AnyRecord => {
  if (formData.blocks_layout?.items?.length) return formData;
  return { ...formData, blocks: {}, blocks_layout: { items: [] } };
};

/** Class name for the grid width; object values come from width widgets. */
export const getBlockWidthClass = (blockWidth: unknown): string => {
  let raw: any = blockWidth;
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.value || raw.id || Object.values(raw)[0];
  }
  return raw && typeof raw === 'string'
    ? `has--block-width--${raw}`
    : 'has--block-width--layout';
};

const VOLTO_WIDTH_CLASSES = ['full', 'narrow', 'layout', 'default'];

// Remove Volto's injected width classes to prevent conflicts with our custom logic
export const cleanGridClassName = (className?: string): string =>
  (className || '')
    .split(' ')
    .filter(
      (c: string) =>
        !c.startsWith('has--block-width--') && !VOLTO_WIDTH_CLASSES.includes(c),
    )
    .join(' ');

/** Theme class name and inline style of a column, from its settings. */
export const getColumnTheme = (
  settings: AnyRecord | undefined,
): { className: string; style: React.CSSProperties | undefined } => {
  const themeValue = settings?.theme;
  if (!themeValue) {
    return { className: '', style: undefined };
  }
  const resolved = resolveBlockTheme({
    theme: typeof themeValue === 'string' ? themeValue : undefined,
    backColorGroup: settings?.backColorGroup,
    frontColorGroup: settings?.frontColorGroup,
  });
  const style =
    typeof themeValue === 'object'
      ? (themeValue as React.CSSProperties)
      : resolved?.style;
  return { className: cx('has-theme', resolved?.className), style };
};
