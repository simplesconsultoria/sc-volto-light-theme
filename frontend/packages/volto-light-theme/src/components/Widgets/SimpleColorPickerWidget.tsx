import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ColorPicker } from '@plone/components';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';

const messages = defineMessages({
  removeColor: { id: 'Remove color', defaultMessage: 'Remove color' },
  clear: { id: 'Clear', defaultMessage: 'Clear' },
});

export const SimpleColorPickerWidget = (props: any) => {
  const { id, value, onChange, title } = props;
  const intl = useIntl();

  return (
    <FormFieldWrapper {...props} className="simple-color-picker">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ColorPicker
          label={title}
          value={value || '#000000'}
          onChange={(val: any) => {
            const hexString =
              typeof val === 'string' ? val : val?.toString('hex');
            onChange(id, hexString === '' ? undefined : hexString);
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange(id, undefined)}
            style={{
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            title={intl.formatMessage(messages.removeColor)}
          >
            {intl.formatMessage(messages.clear)}
          </button>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default SimpleColorPickerWidget;
