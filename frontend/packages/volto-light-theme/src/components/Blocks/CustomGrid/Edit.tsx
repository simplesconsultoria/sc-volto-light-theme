import React, { useState, useCallback, useRef } from 'react';
import cx from 'classnames';
import { v4 as uuid } from 'uuid';
import { defineMessages, useIntl } from 'react-intl';
import { Segment, Button } from 'semantic-ui-react';
import {
  BlocksForm,
  BlocksToolbar,
  SidebarPortal,
  BlockDataForm,
  Icon,
} from '@plone/volto/components';
import { emptyBlocksForm } from '@plone/volto/helpers/Blocks/Blocks';
import BlockChooser from '@plone/volto/components/manage/BlockChooser/BlockChooser';
import { useDetectClickOutside } from '@plone/volto/helpers/Utils/useDetectClickOutside';
import { usePopper } from 'react-popper';
import { createPortal } from 'react-dom';
import { Ref } from 'semantic-ui-react';
import upSVG from '@plone/volto/icons/up.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import settingsSVG from '@plone/volto/icons/settings.svg';
import addBlockSVG from '@plone/volto/icons/circle-plus.svg';

import { CustomGridSchema, ColumnSchema } from './Schema';
import LayoutSelector from './LayoutSelector';

import config from '@plone/volto/registry';

const messages = defineMessages({
  editParent: {
    id: 'Edit parent grid block',
    defaultMessage: 'Edit parent grid block',
  },
  clearStyle: {
    id: 'Clear column style',
    defaultMessage: 'Clear column style',
  },
  labelColumnSettings: {
    id: 'Column Settings',
    defaultMessage: 'Column Settings',
  },
});

// Creates a fresh empty column with a blank blocks subform
const generateEmptyColumn = () => ({
  '@type': 'customGridColumn',
  blocks: {},
  blocks_layout: { items: [] },
});

// ========================================================================
// Empty Column Placeholder with Block Chooser
// ========================================================================
const EmptyColumnPlaceholder = ({
  onAddBlock,
}: {
  onAddBlock: (type: string) => void;
}) => {
  const [isOpenMenu, setOpenMenu] = React.useState(false);

  const blockChooserRef = useDetectClickOutside({
    onTriggered: () => setOpenMenu(false),
    triggerKeys: ['Escape'],
  });

  const [referenceElement, setReferenceElement] =
    React.useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(
    null,
  );
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
    modifiers: [
      { name: 'offset', options: { offset: [0, -30] } },
      { name: 'flip', options: { fallbackPlacements: ['right', 'top-start'] } },
    ],
  });

  return (
    <div className="custom-grid-empty-placeholder">
      <div className="placeholder-content">
        <p>Add a new block</p>
        <Ref innerRef={setReferenceElement as any}>
          <Button
            icon
            basic
            title="Add block"
            className="add-block-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setOpenMenu(true);
            }}
          >
            <Icon name={addBlockSVG} size="24px" />
          </Button>
        </Ref>
        {isOpenMenu
          ? createPortal(
              <div
                ref={setPopperElement as any}
                style={styles.popper as any}
                {...attributes.popper}
                className="container-chooser-wrapper"
              >
                <BlockChooser
                  onMutateBlock={(id: string, value: any) => {
                    setOpenMenu(false);
                    onAddBlock(value['@type']);
                  }}
                  currentBlock=""
                  showRestricted={false}
                  blocksConfig={config.blocks.blocksConfig}
                  ref={blockChooserRef}
                />
              </div>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
};

// Builds the initial column structure for a given layout
const buildColumnsForLayout = (layoutId: string) => {
  const numCols = layoutId.split('-').length;
  const blocks: Record<string, any> = {};
  const items: string[] = [];
  for (let i = 0; i < numCols; i++) {
    const id = uuid();
    blocks[id] = generateEmptyColumn();
    items.push(id);
  }
  return { blocks, blocks_layout: { items } };
};

// ========================================================================
// Theme Resolution Logic
// ========================================================================
export interface ThemeDefinition {
  name: string;
  style: React.CSSProperties;
}

function getThemeDefinitions(blockType?: string): ThemeDefinition[] {
  const blockThemes = blockType
    ? (config.blocks?.blocksConfig as any)?.[blockType]?.themes
    : undefined;

  return (blockThemes ||
    (config.blocks as any)?.themes ||
    []) as ThemeDefinition[];
}

function resolveThemeStyle(
  theme: unknown,
  themeDefinitions: ThemeDefinition[],
): React.CSSProperties {
  if (!theme) return {};
  if (typeof theme === 'string') {
    return themeDefinitions.find((t) => t.name === theme)?.style ?? {};
  }
  if (typeof theme === 'object') {
    return theme as React.CSSProperties;
  }
  return {};
}

const CustomGridEdit = (props: any) => {
  const {
    data,
    block,
    onChangeBlock,
    onChangeField,
    pathname,
    selected,
    manage,
    metadata: metadataProp,
    properties,
    errors,
    className,
  } = props;
  const intl = useIntl();

  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [focusedColumn, setFocusedColumn] = useState<string | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [colSelections, setColSelections] = useState<
    Record<string, string | null>
  >({});

  // Ref used to batch onChangeField calls from volto-slate, keyed by column id
  const blocksState = useRef<Record<string, Record<string, any>>>({});

  const metadata = metadataProp || properties;
  const { layout } = data;
  const isInitialized = !!layout && !!data?.data;

  const columnsLayout = data?.data?.blocks_layout?.items || [];

  const selectedCol =
    Object.keys(colSelections).length > 0
      ? Object.keys(colSelections)[0]
      : null;
  const selectedColData = selectedCol
    ? data?.data?.blocks?.[selectedCol]
    : null;
  const selectedBlock = selectedCol ? colSelections[selectedCol] : null;

  // --- Event handlers ---

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

  // Selects a block inside a column
  const handleSelectBlock = useCallback(
    (id: string, colId: string, e: any) => {
      if (focusedColumn !== colId) {
        // First click: focus the column
        setFocusedColumn(colId);
        setActiveColumn(colId);
        setColSelections({});
        setMultiSelected([]);
        return;
      }

      // Second click: select block
      if (!id) {
        setColSelections({});
        setMultiSelected([]);
        return;
      }
      setColSelections({ [colId]: id });
      setMultiSelected([id]);
      setActiveColumn(colId);
    },
    [focusedColumn],
  );

  // Clear focused state when grid loses selection
  React.useEffect(() => {
    if (!selected) {
      setFocusedColumn(null);
      setActiveColumn(null);
      setColSelections({});
      setMultiSelected([]);
    }
  }, [selected]);

  // Handles field changes on blocks inside a column (with batched state for slate)
  const handleChangeColumnData = useCallback(
    (id: string, value: any, colId: string) => {
      const coldata = data.data;
      if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
        if (!blocksState.current[colId]) {
          blocksState.current[colId] = {};
        }
        blocksState.current[colId][id] = value;

        onChangeBlock(block, {
          ...data,
          data: {
            ...coldata,
            blocks: {
              ...coldata.blocks,
              [colId]: {
                ...coldata.blocks?.[colId],
                ...blocksState.current[colId],
              },
            },
          },
        });
      } else {
        // Non-block fields (e.g. image URL, upload) must go through the
        // parent form's onChangeField so the main Volto form processes them.
        onChangeField(id, value);
      }
    },
    [block, data, onChangeBlock, onChangeField],
  );

  // Updates a column-level setting (e.g. theme)
  const handleColSettingsChange = useCallback(
    (id: string, value: any) => {
      if (!activeColumn) return;
      const coldata = data.data;
      const targetColumn = coldata.blocks?.[activeColumn];
      let newBlocks = targetColumn?.blocks ? { ...targetColumn.blocks } : {};

      // Propagate theme to all blocks inside the column
      if (id === 'theme') {
        Object.keys(newBlocks).forEach((blockId) => {
          newBlocks[blockId] = {
            ...newBlocks[blockId],
            theme: value,
            styles: {
              ...(newBlocks[blockId].styles || {}),
              theme: value,
            },
          };
        });

        // Keep the batching ref in sync so subsequent slate updates don't use stale data
        if (!blocksState.current[activeColumn]) {
          blocksState.current[activeColumn] = {};
        }
        blocksState.current[activeColumn].blocks = newBlocks;
      }

      onChangeBlock(block, {
        ...data,
        data: {
          ...coldata,
          blocks: {
            ...coldata.blocks,
            [activeColumn]: {
              ...targetColumn,
              blocks: newBlocks,
              settings: {
                ...targetColumn?.settings,
                [id]: value,
              },
            },
          },
        },
      });
    },
    [activeColumn, block, data, onChangeBlock],
  );

  // Opens the grid-level sidebar settings
  const openGridSettings = useCallback(() => {
    setFocusedColumn(null);
    setActiveColumn(null);
    setColSelections({});
    setMultiSelected([]);
  }, []);

  // --- Layout change handler (when layout is changed from sidebar after init) ---
  const handleLayoutChangeFromSidebar = useCallback(
    (id: string, value: any) => {
      if (id === 'layout') {
        const newLayout = value;
        const currentItems = data?.data?.blocks_layout?.items || [];
        const newNumCols = newLayout.split('-').length;

        if (currentItems.length !== newNumCols) {
          // Rebuild columns for new layout
          const newColData = buildColumnsForLayout(newLayout);
          // Preserve as many existing columns as possible
          const preserveCount = Math.min(currentItems.length, newNumCols);
          for (let i = 0; i < preserveCount; i++) {
            const oldId = currentItems[i];
            const newId = newColData.blocks_layout.items[i];
            newColData.blocks[newId] =
              data.data.blocks[oldId] || generateEmptyColumn();
          }
          onChangeBlock(block, {
            ...data,
            layout: newLayout,
            data: newColData,
          });
        } else {
          onChangeBlock(block, { ...data, layout: newLayout });
        }
      } else {
        onChangeBlock(block, { ...data, [id]: value });
      }
    },
    [block, data, onChangeBlock],
  );

  // --- Render: initial layout picker ---
  if (!isInitialized) {
    return (
      <div className="custom-grid-edit" role="presentation" tabIndex={-1}>
        <LayoutSelector onSelect={handleLayoutSelect} />
      </div>
    );
  }

  let rawBlockWidth = data.blockWidth;
  if (typeof rawBlockWidth === 'object' && rawBlockWidth !== null) {
    rawBlockWidth =
      rawBlockWidth.value ||
      rawBlockWidth.id ||
      Object.values(rawBlockWidth)[0];
  }
  const blockWidthClass =
    rawBlockWidth && typeof rawBlockWidth === 'string'
      ? `has--block-width--${rawBlockWidth}`
      : 'has--block-width--layout';

  // Remove Volto's injected width classes to prevent conflicts with our custom logic
  const cleanedClassName = (className || '')
    .split(' ')
    .filter(
      (c: string) =>
        !c.startsWith('has--block-width--') &&
        !['full', 'narrow', 'layout', 'default'].includes(c),
    )
    .join(' ');

  // --- Render: initialized grid editor ---
  return (
    <div
      className={cx('custom-grid-edit', cleanedClassName, {
        'has-selection': !!selectedBlock || focusedColumn !== null,
      })}
      role="presentation"
      tabIndex={-1}
    >
      {selected && (
        <button
          className="custom-grid-settings-btn"
          onClick={openGridSettings}
          title={intl.formatMessage(messages.editParent)}
          type="button"
        >
          <Icon name={settingsSVG} size="18px" />
        </button>
      )}
      <div
        className={cx('block custom-grid', blockWidthClass, `layout-${layout}`)}
      >
        {columnsLayout.map((colId: string, colIndex: number) => {
          let colData = data?.data?.blocks?.[colId];
          if (!colData || !colData.blocks || !colData.blocks_layout?.items) {
            colData = emptyBlocksForm();
          }

          const blockType = data?.['@type'] as string | undefined;
          const themeDefinitions = getThemeDefinitions(blockType);
          const colThemeValue = colData?.settings?.theme;
          const colThemeStyle = resolveThemeStyle(
            colThemeValue,
            themeDefinitions,
          );

          const colTheme = cx({ 'has-theme': !!colThemeValue });

          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={colId}
              className={cx('custom-grid-column', 'block-column', colTheme, {
                'is-focused': selected && focusedColumn === colId,
              })}
              style={colThemeStyle}
              // Click on the column background opens column settings and focuses it
              onClick={(e) => {
                // Only trigger when clicking the column container, not its children
                if (e.target === e.currentTarget) {
                  setFocusedColumn(colId);
                  setActiveColumn(colId);
                  setColSelections({});
                  setMultiSelected([]);
                }
              }}
            >
              {colData?.blocks_layout?.items?.length === 0 ? (
                <EmptyColumnPlaceholder
                  onAddBlock={(type: string) => {
                    const newId = uuid();
                    const colTheme = colData?.settings?.theme;
                    onChangeBlock(block, {
                      ...data,
                      data: {
                        ...data.data,
                        blocks: {
                          ...data.data.blocks,
                          [colId]: {
                            ...colData,
                            blocks: {
                              [newId]: {
                                '@type': type,
                                ...(colTheme
                                  ? {
                                      theme: colTheme,
                                      styles: { theme: colTheme },
                                    }
                                  : {}),
                              },
                            },
                            blocks_layout: { items: [newId] },
                          },
                        },
                      },
                    });
                    setFocusedColumn(colId);
                    setActiveColumn(colId);
                    setColSelections({ [colId]: newId });
                    setMultiSelected([newId]);
                  }}
                />
              ) : (
                <BlocksForm
                  errors={errors}
                  key={colId}
                  manage={manage}
                  metadata={metadata}
                  isMainForm={false}
                  stopPropagation={!!selectedBlock}
                  properties={{
                    ...metadata,
                    ...colData,
                  }}
                  disableEvents={true}
                  multiSelected={
                    selected && focusedColumn === colId ? multiSelected : []
                  }
                  selectedBlock={
                    selected && focusedColumn === colId
                      ? colSelections[colId] || null
                      : null
                  }
                  onSelectBlock={(id: string, _: boolean, e: any) =>
                    handleSelectBlock(id, colId, e)
                  }
                  onChangeFormData={(newFormData: any) => {
                    let safeFormData = newFormData;
                    // If the user deleted all blocks, leave it truly empty
                    if (
                      !safeFormData.blocks_layout?.items ||
                      safeFormData.blocks_layout.items.length === 0
                    ) {
                      safeFormData = {
                        ...safeFormData,
                        blocks: {},
                        blocks_layout: { items: [] },
                      };
                    }

                    // Keep the batching ref in sync so subsequent batched slate updates don't use stale data
                    if (!blocksState.current[colId])
                      blocksState.current[colId] = {};
                    blocksState.current[colId].blocks = safeFormData.blocks;
                    blocksState.current[colId].blocks_layout =
                      safeFormData.blocks_layout;

                    onChangeBlock(block, {
                      ...data,
                      data: {
                        ...data.data,
                        blocks: {
                          ...data.data.blocks,
                          [colId]: {
                            ...data.data.blocks[colId],
                            blocks: safeFormData.blocks,
                            blocks_layout: safeFormData.blocks_layout,
                          },
                        },
                      },
                    });
                  }}
                  onChangeField={(id: string, value: any) =>
                    handleChangeColumnData(id, value, colId)
                  }
                  pathname={pathname}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Toolbar for multi-block operations inside columns */}
      {selected && focusedColumn && selectedColData && (
        <BlocksToolbar
          formData={selectedColData}
          selectedBlock={selectedBlock}
          selectedBlocks={multiSelected}
          onChangeBlocks={(newBlockData: any) => {
            onChangeBlock(block, {
              ...data,
              data: {
                ...data.data,
                blocks: {
                  ...data.data.blocks,
                  [selectedCol!]: { ...selectedColData, ...newBlockData },
                },
              },
            });
          }}
          onSetSelectedBlocks={setMultiSelected}
          onSelectBlock={(id: string, _: boolean, e: any) =>
            handleSelectBlock(id, selectedCol!, e)
          }
        />
      )}

      {/* Sidebar: shows grid settings or active column settings */}
      {Object.keys(colSelections).length === 0 && selected && (
        <SidebarPortal selected={selected}>
          {activeColumn ? (
            <>
              <Segment
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Button onClick={openGridSettings}>
                  <Icon name={upSVG} size="14px" />
                  {intl.formatMessage(messages.editParent)}
                </Button>
                <button
                  onClick={() => handleColSettingsChange('theme', '')}
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                  }}
                  title={intl.formatMessage(messages.clearStyle)}
                  type="button"
                >
                  <Icon name={clearSVG} size="24px" />
                </button>
              </Segment>
              <BlockDataForm
                schema={ColumnSchema(intl)}
                title={intl.formatMessage(messages.labelColumnSettings)}
                onChangeField={handleColSettingsChange}
                formData={data?.data?.blocks?.[activeColumn]?.settings || {}}
              />
            </>
          ) : (
            <BlockDataForm
              schema={CustomGridSchema({ intl })}
              title="Custom Grid"
              onChangeField={handleLayoutChangeFromSidebar}
              formData={data}
            />
          )}
        </SidebarPortal>
      )}
    </div>
  );
};

export default CustomGridEdit;
