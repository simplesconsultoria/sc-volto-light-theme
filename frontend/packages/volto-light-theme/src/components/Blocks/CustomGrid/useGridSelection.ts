import { useCallback, useState } from 'react';

/**
 * Selection state of the CustomGrid editor: which column is focused/active
 * and which blocks are selected inside it.
 *
 * Clicking a block of an unfocused column first focuses that column; a
 * second click selects the block. Deselecting the grid block resets
 * everything.
 */
const useGridSelection = (selected: boolean) => {
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [focusedColumn, setFocusedColumn] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [colSelections, setColSelections] = useState<
    Record<string, string | null>
  >({});

  const clearBlockSelection = useCallback(() => {
    setColSelections({});
    setMultiSelected([]);
  }, []);

  // Focuses a column (opening its settings) without selecting any block
  const focusColumn = useCallback(
    (colId: string | null) => {
      setFocusedColumn(colId);
      setActiveColumn(colId);
      clearBlockSelection();
    },
    [clearBlockSelection],
  );

  // Opens the grid-level sidebar settings
  const openGridSettings = useCallback(() => focusColumn(null), [focusColumn]);

  // Focuses a column and selects one of its blocks
  const selectColumnBlock = useCallback((colId: string, blockId: string) => {
    setFocusedColumn(colId);
    setActiveColumn(colId);
    setColSelections({ [colId]: blockId });
    setMultiSelected([blockId]);
  }, []);

  // Selects a block inside a column
  const handleSelectBlock = useCallback(
    (id: string, colId: string) => {
      if (focusedColumn !== colId) {
        // First click: focus the column
        focusColumn(colId);
        return;
      }

      // Second click: select block
      if (!id) {
        clearBlockSelection();
        return;
      }
      setColSelections({ [colId]: id });
      setMultiSelected([id]);
      setActiveColumn(colId);
    },
    [focusedColumn, focusColumn, clearBlockSelection],
  );

  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (!selected) {
      focusColumn(null);
    }
  }

  const selectedCol = Object.keys(colSelections)[0] ?? null;

  return {
    activeColumn,
    focusedColumn,
    multiSelected,
    setMultiSelected,
    colSelections,
    selectedCol,
    selectedBlock: selectedCol ? colSelections[selectedCol] : null,
    focusColumn,
    openGridSettings,
    selectColumnBlock,
    handleSelectBlock,
  };
};

export default useGridSelection;
