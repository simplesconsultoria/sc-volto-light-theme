import React from 'react';
import cx from 'classnames';
import { BlocksForm } from '@plone/volto/components';
import { emptyBlocksForm } from '@plone/volto/helpers/Blocks/Blocks';
import EmptyColumnPlaceholder from './EmptyColumnPlaceholder';
import { getColumnTheme } from './helpers';

type AnyRecord = Record<string, any>;

interface CustomGridColumnProps {
  colId: string;
  /** Raw column data; an empty blocks form is used when it is incomplete. */
  column?: AnyRecord;
  /** True when the grid is selected and this column is focused. */
  isFocused: boolean;
  multiSelected: string[];
  selectedBlock: string | null;
  stopPropagation: boolean;
  errors?: any;
  manage?: boolean;
  metadata?: AnyRecord;
  pathname: string;
  onFocus: (colId: string) => void;
  onAddFirstBlock: (colId: string, colData: AnyRecord, type: string) => void;
  onSelectBlock: (id: string, colId: string) => void;
  onChangeFormData: (colId: string, formData: AnyRecord) => void;
  onChangeField: (id: string, value: any, colId: string) => void;
}

const isCompleteColumn = (column?: AnyRecord) =>
  !!column?.blocks && !!column.blocks_layout?.items;

const CustomGridColumn = ({
  colId,
  column,
  isFocused,
  multiSelected,
  selectedBlock,
  stopPropagation,
  errors,
  manage,
  metadata,
  pathname,
  onFocus,
  onAddFirstBlock,
  onSelectBlock,
  onChangeFormData,
  onChangeField,
}: CustomGridColumnProps) => {
  const colData = isCompleteColumn(column) ? column! : emptyBlocksForm();
  const theme = getColumnTheme(colData?.settings);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      role="presentation"
      className={cx('custom-grid-column', 'block-column', theme.className, {
        'is-focused': isFocused,
      })}
      style={theme.style}
      // Click on the column background opens column settings and focuses it
      onClick={(e) => {
        // Only trigger when clicking the column container, not its children
        if (e.target === e.currentTarget) {
          onFocus(colId);
        }
      }}
    >
      {colData?.blocks_layout?.items?.length === 0 ? (
        <EmptyColumnPlaceholder
          onAddBlock={(type: string) => onAddFirstBlock(colId, colData, type)}
        />
      ) : (
        <BlocksForm
          errors={errors}
          key={colId}
          manage={manage}
          metadata={metadata}
          isMainForm={false}
          isContainer={true}
          stopPropagation={stopPropagation}
          properties={{
            ...metadata,
            ...colData,
          }}
          disableEvents={true}
          multiSelected={isFocused ? multiSelected : []}
          selectedBlock={isFocused ? selectedBlock || null : null}
          onSelectBlock={(id: string) => onSelectBlock(id, colId)}
          onChangeFormData={(newFormData: any) =>
            onChangeFormData(colId, newFormData)
          }
          onChangeField={(id: string, value: any) =>
            onChangeField(id, value, colId)
          }
          pathname={pathname}
        />
      )}
    </div>
  );
};

export default CustomGridColumn;
