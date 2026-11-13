import React from 'react';
import { useIntl } from 'react-intl';
import { SidebarPortal } from '@plone/volto/components';
import BlockDataForm from '@plone/volto/components/manage/Form/BlockDataForm';
import { SeparatorSchema } from './schema';
import View from './View';

const SeparatorEdit = (props: any) => {
  const { block, data, onChangeBlock, selected } = props;
  let intl = props.intl;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hookIntl = useIntl();
    if (hookIntl) intl = hookIntl;
  } catch {
    // Fallback when rendered outside IntlProvider
  }
  if (!intl) {
    intl = { formatMessage: ({ defaultMessage }: any) => defaultMessage };
  }
  const schema = SeparatorSchema({ ...props, intl });

  return (
    <>
      <View {...props} isEditMode />
      <SidebarPortal selected={selected}>
        <BlockDataForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
          block={block}
        />
      </SidebarPortal>
    </>
  );
};

export default SeparatorEdit;
