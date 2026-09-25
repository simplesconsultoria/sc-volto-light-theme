import React from 'react';
import { ColorPicker } from '@plone/components';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';

export const SimpleColorPickerWidget = (props: any) => {
  const { id, value, onChange, title } = props;

  return (
    <FormFieldWrapper {...props} className="simple-color-picker">
      <ColorPicker
        label={title}
        value={value || '#000000'}
        onChange={(val: any) => {
          const hexString =
            typeof val === 'string' ? val : val?.toString('hex');
          onChange(id, hexString === '' ? undefined : hexString);
        }}
      />
    </FormFieldWrapper>
  );
};

export default SimpleColorPickerWidget;
