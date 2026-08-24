import type { Ref } from 'react';
import { useIntl } from 'react-intl';

import { Form } from '@plone/volto/components/manage/Form';

import type { JsonSchema, ThemeItem } from '../../../types/theme';
import {
  addSchema,
  cloneThemeFormData,
  editSchema,
} from '../../../helpers/themesControlpanel';
import messages from './messages';

export type ThemeFormProps = {
  /** The served `ISCVLTThemeDefinition` schema. */
  schema: JsonSchema;
  /** Creating a theme rather than editing one. */
  adding: boolean;
  /** The theme being edited; ignored while adding. */
  theme?: ThemeItem;
  /** The theme an add form was seeded from, when opened by Duplicate. */
  cloneOf?: ThemeItem;
  requestError?: unknown;
  onSubmit: (formData: Record<string, unknown>) => void;
  onCancel: () => void;
  formRef?: Ref<any>;
};

/**
 * The add and edit form, which differ only in schema and starting data.
 *
 * Volto's own `Form` is used rather than a hand-rolled one, so the colorPicker
 * widgets and the validation come from the served schema. `hideActions` is set
 * because the submit and cancel controls live in the toolbar.
 */
const ThemeForm = ({
  schema,
  adding,
  theme,
  cloneOf,
  requestError,
  onSubmit,
  onCancel,
  formRef,
}: ThemeFormProps) => {
  const intl = useIntl();
  const formData = adding
    ? cloneOf
      ? cloneThemeFormData(cloneOf)
      : {}
    : theme;

  return (
    <Form
      ref={formRef}
      title={
        adding ? intl.formatMessage(messages.add) : theme?.name ?? theme?.id
      }
      schema={adding ? addSchema(schema) : editSchema(schema)}
      formData={formData}
      requestError={requestError}
      onSubmit={onSubmit}
      onCancel={onCancel}
      hideActions
    />
  );
};

export default ThemeForm;
