import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import { BlocksToolbar, Icon } from '@plone/volto/components';
import settingsSVG from '@plone/volto/icons/settings.svg';

import LayoutSelector from './LayoutSelector';
import CustomGridColumn from './CustomGridColumn';
import CustomGridSidebar from './CustomGridSidebar';
import { messages } from './messages';
import { cleanGridClassName, getBlockWidthClass } from './helpers';
import useGridSelection from './useGridSelection';
import useCustomGridChanges from './useCustomGridChanges';

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

  const selection = useGridSelection(selected);
  const {
    activeColumn,
    focusedColumn,
    multiSelected,
    colSelections,
    selectedCol,
    selectedBlock,
  } = selection;

  const changes = useCustomGridChanges({
    data,
    block,
    onChangeBlock,
    onChangeField,
    activeColumn,
  });

  const metadata = metadataProp || properties;
  const { layout } = data;
  const isInitialized = !!layout && !!data?.data;
  const columnsLayout: string[] = data?.data?.blocks_layout?.items || [];
  const selectedColData = selectedCol
    ? data?.data?.blocks?.[selectedCol]
    : null;

  const addFirstBlock = (colId: string, colData: any, type: string) => {
    const newId = changes.addFirstBlock(colId, colData, type);
    selection.selectColumnBlock(colId, newId);
  };

  // --- Render: initial layout picker ---
  if (!isInitialized) {
    return (
      <div className="custom-grid-edit" role="presentation" tabIndex={-1}>
        <LayoutSelector onSelect={changes.handleLayoutSelect} />
      </div>
    );
  }

  // --- Render: initialized grid editor ---
  return (
    <div
      className={cx('custom-grid-edit', cleanGridClassName(className), {
        'has-selection': !!selectedBlock || focusedColumn !== null,
      })}
      role="presentation"
      tabIndex={-1}
    >
      {selected && (
        <button
          className="custom-grid-settings-btn"
          onClick={selection.openGridSettings}
          title={intl.formatMessage(messages.editParent)}
          type="button"
        >
          <Icon name={settingsSVG} size="18px" />
        </button>
      )}
      <div
        className={cx(
          'block custom-grid',
          getBlockWidthClass(data),
          `layout-${layout}`,
        )}
      >
        {columnsLayout.map((colId: string) => (
          <CustomGridColumn
            key={colId}
            colId={colId}
            column={data?.data?.blocks?.[colId]}
            isFocused={!!selected && focusedColumn === colId}
            multiSelected={multiSelected}
            selectedBlock={colSelections[colId] ?? null}
            stopPropagation={!!selectedBlock}
            errors={errors}
            manage={manage}
            metadata={metadata}
            pathname={pathname}
            onFocus={selection.focusColumn}
            onAddFirstBlock={addFirstBlock}
            onSelectBlock={selection.handleSelectBlock}
            onChangeFormData={changes.handleColumnFormChange}
            onChangeField={changes.handleChangeColumnData}
          />
        ))}
      </div>

      {/* Toolbar for multi-block operations inside columns */}
      {selected && focusedColumn && selectedColData && (
        <BlocksToolbar
          formData={selectedColData}
          selectedBlock={selectedBlock}
          selectedBlocks={multiSelected}
          onChangeBlocks={(newBlockData: any) =>
            changes.handleChangeColumnBlocks(
              selectedCol!,
              selectedColData,
              newBlockData,
            )
          }
          onSetSelectedBlocks={selection.setMultiSelected}
          onSelectBlock={(id: string) =>
            selection.handleSelectBlock(id, selectedCol!)
          }
        />
      )}

      {Object.keys(colSelections).length === 0 && selected && (
        <CustomGridSidebar
          selected={selected}
          data={data}
          blockProps={props}
          activeColumn={activeColumn}
          onChangeGridField={changes.handleLayoutChangeFromSidebar}
          onEditParent={selection.openGridSettings}
          onClearStyle={changes.clearColumnStyle}
          onChangeField={changes.handleColSettingsChange}
          onChangeBlock={changes.handleColSettingsBlockChange}
        />
      )}
    </div>
  );
};

export default CustomGridEdit;
