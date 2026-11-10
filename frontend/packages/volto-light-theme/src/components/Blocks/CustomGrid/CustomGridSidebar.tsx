import React from 'react';
import { useIntl } from 'react-intl';
import { Segment, Button } from 'semantic-ui-react';
import { SidebarPortal, BlockDataForm, Icon } from '@plone/volto/components';
import upSVG from '@plone/volto/icons/up.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import { ColumnSchema } from './Schema';
import CustomGridDataForm from './Data';
import { messages } from './messages';

type AnyRecord = Record<string, any>;

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 18px',
  marginBottom: '16px',
};

const clearButtonStyle: React.CSSProperties = {
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
};

interface ColumnSettingsProps {
  activeColumn: string;
  settings: AnyRecord;
  onEditParent: () => void;
  onClearStyle: () => void;
  onChangeField: (id: string, value: any) => void;
  onChangeBlock: (block: string, settings: any) => void;
}

const ColumnSettings = ({
  activeColumn,
  settings,
  onEditParent,
  onClearStyle,
  onChangeField,
  onChangeBlock,
}: ColumnSettingsProps) => {
  const intl = useIntl();
  return (
    <div className="custom-grid-sidebar-column">
      <Segment className="custom-grid-sidebar-header" style={headerStyle}>
        <Button onClick={onEditParent}>
          <Icon name={upSVG} size="14px" />
          {intl.formatMessage(messages.editParent)}
        </Button>
        <button
          onClick={onClearStyle}
          style={clearButtonStyle}
          title={intl.formatMessage(messages.clearStyle)}
          type="button"
        >
          <Icon name={clearSVG} size="24px" />
        </button>
      </Segment>
      <BlockDataForm
        schema={ColumnSchema(intl)}
        title={intl.formatMessage(messages.labelColumnSettings)}
        onChangeField={onChangeField}
        onChangeBlock={onChangeBlock}
        block={activeColumn}
        formData={settings}
      />
    </div>
  );
};

interface CustomGridSidebarProps
  extends Omit<ColumnSettingsProps, 'activeColumn' | 'settings'> {
  selected: boolean;
  data: AnyRecord;
  activeColumn: string | null;
  onChangeGridField: (id: string, value: any) => void;
  /** The block's own props, for the grid settings form (`Data.tsx`). */
  blockProps: AnyRecord;
}

/** Sidebar: shows grid settings or the active column settings. */
const CustomGridSidebar = ({
  selected,
  data,
  activeColumn,
  onChangeGridField,
  blockProps,
  ...columnProps
}: CustomGridSidebarProps) => {
  return (
    <SidebarPortal selected={selected}>
      {activeColumn ? (
        <ColumnSettings
          activeColumn={activeColumn}
          settings={data?.data?.blocks?.[activeColumn]?.settings || {}}
          {...columnProps}
        />
      ) : (
        <CustomGridDataForm
          {...(blockProps as any)}
          data={data}
          onChangeField={onChangeGridField}
        />
      )}
    </SidebarPortal>
  );
};

export default CustomGridSidebar;
