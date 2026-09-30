import React from 'react';
import { ColorPicker } from '@plone/components';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';

export const SimpleColorPickerWidget = (props: any) => {
  const { id, value, onChange, title } = props;

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
            title="Remover cor"
          >
            Limpar
          </button>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default SimpleColorPickerWidget;
