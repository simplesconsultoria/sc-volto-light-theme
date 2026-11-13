import { useCallback, useRef } from 'react';
import {
  applyLayoutChange,
  applyThemeToBlocks,
  buildColumnWithFirstBlock,
  buildColumnsForLayout,
  getThemeColorGroups,
  mergeColumnSettings,
  normalizeColumnFormData,
  setColumn,
} from './helpers';

type AnyRecord = Record<string, any>;

interface UseCustomGridChangesParams {
  data: AnyRecord;
  block: string;
  onChangeBlock: (block: string, data: AnyRecord) => void;
  onChangeField: (id: string, value: any) => void;
  activeColumn: string | null;
}

/**
 * Change handlers of the CustomGrid editor. They write the grid, its columns
 * and the column settings back through `onChangeBlock`.
 */
const useCustomGridChanges = ({
  data,
  block,
  onChangeBlock,
  onChangeField,
  activeColumn,
}: UseCustomGridChangesParams) => {
  // Ref used to batch onChangeField calls from volto-slate, keyed by column id
  const blocksState = useRef<Record<string, Record<string, any>>>({});

  const syncBlocksState = useCallback((colId: string, values: AnyRecord) => {
    blocksState.current[colId] = {
      ...(blocksState.current[colId] || {}),
      ...values,
    };
  }, []);

  // Called when the user picks a layout from the initial selector
  const handleLayoutSelect = useCallback(
    (layoutId: string) => {
      onChangeBlock(block, {
        ...data,
        layout: layoutId,
        data: buildColumnsForLayout(layoutId),
      });
    },
    [block, data, onChangeBlock],
  );

  // Layout change handler (when layout is changed from sidebar after init)
  const handleLayoutChangeFromSidebar = useCallback(
    (id: string, value: any) => {
      onChangeBlock(
        block,
        id === 'layout'
          ? applyLayoutChange(data, value)
          : { ...data, [id]: value },
      );
    },
    [block, data, onChangeBlock],
  );

  // Handles field changes on blocks inside a column (with batched state for slate)
  const handleChangeColumnData = useCallback(
    (id: string, value: any, colId: string) => {
      if (id !== 'blocks' && id !== 'blocks_layout') {
        // Non-block fields (e.g. image URL, upload) must go through the
        // parent form's onChangeField so the main Volto form processes them.
        onChangeField(id, value);
        return;
      }
      syncBlocksState(colId, { [id]: value });
      onChangeBlock(
        block,
        setColumn(data, colId, {
          ...data.data.blocks?.[colId],
          ...blocksState.current[colId],
        }),
      );
    },
    [block, data, onChangeBlock, onChangeField, syncBlocksState],
  );

  // Handles a full form change of a column's blocks
  const handleColumnFormChange = useCallback(
    (colId: string, newFormData: AnyRecord) => {
      const { blocks, blocks_layout } = normalizeColumnFormData(newFormData);
      // Keep the batching ref in sync so subsequent batched slate updates don't use stale data
      syncBlocksState(colId, { blocks, blocks_layout });
      onChangeBlock(
        block,
        setColumn(data, colId, {
          ...data.data.blocks[colId],
          blocks,
          blocks_layout,
        }),
      );
    },
    [block, data, onChangeBlock, syncBlocksState],
  );

  // Adds the first block to an empty column; returns the new block id
  const addFirstBlock = useCallback(
    (colId: string, colData: AnyRecord, type: string) => {
      const newId = crypto.randomUUID();
      onChangeBlock(
        block,
        setColumn(data, colId, buildColumnWithFirstBlock(colData, newId, type)),
      );
      return newId;
    },
    [block, data, onChangeBlock],
  );

  // Replaces the blocks of a column (toolbar multi-block operations)
  const handleChangeColumnBlocks = useCallback(
    (colId: string, colData: AnyRecord, newBlockData: AnyRecord) => {
      onChangeBlock(
        block,
        setColumn(data, colId, { ...colData, ...newBlockData }),
      );
    },
    [block, data, onChangeBlock],
  );

  // Updates column settings from BlockThemeWidget or full form updates
  const handleColSettingsBlockChange = useCallback(
    (_colBlockId: string, updatedSettings: any) => {
      if (!activeColumn) return;
      const targetColumn = data.data.blocks?.[activeColumn];
      let newBlocks = targetColumn?.blocks ? { ...targetColumn.blocks } : {};

      const newTheme = updatedSettings?.theme;
      if (newTheme !== undefined) {
        newBlocks = applyThemeToBlocks(
          newBlocks,
          newTheme,
          updatedSettings?.backColorGroup,
          updatedSettings?.frontColorGroup,
        );
        // Keep the batching ref in sync so subsequent slate updates don't use stale data
        syncBlocksState(activeColumn, { blocks: newBlocks });
      }

      onChangeBlock(
        block,
        setColumn(data, activeColumn, {
          ...targetColumn,
          blocks: newBlocks,
          settings: mergeColumnSettings(
            targetColumn?.settings,
            updatedSettings,
          ),
        }),
      );
    },
    [activeColumn, block, data, onChangeBlock, syncBlocksState],
  );

  // Updates a column-level setting (e.g. theme)
  const handleColSettingsChange = useCallback(
    (id: string, value: any) => {
      if (!activeColumn) return;
      const extra = id === 'theme' ? getThemeColorGroups(value) : {};
      handleColSettingsBlockChange(activeColumn, { [id]: value, ...extra });
    },
    [activeColumn, handleColSettingsBlockChange],
  );

  // Removes the column theme
  const clearColumnStyle = useCallback(() => {
    if (!activeColumn) return;
    handleColSettingsBlockChange(activeColumn, {
      theme: '',
      backColorGroup: undefined,
      frontColorGroup: undefined,
      styles: {},
    });
  }, [activeColumn, handleColSettingsBlockChange]);

  return {
    handleLayoutSelect,
    handleLayoutChangeFromSidebar,
    handleChangeColumnData,
    handleColumnFormChange,
    addFirstBlock,
    handleChangeColumnBlocks,
    handleColSettingsBlockChange,
    handleColSettingsChange,
    clearColumnStyle,
  };
};

export default useCustomGridChanges;
