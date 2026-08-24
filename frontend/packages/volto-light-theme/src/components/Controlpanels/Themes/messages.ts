import { defineMessages } from 'react-intl';

/**
 * Shared by the panel and every piece of it.
 *
 * Kept in one module so a label used by both the listing and a toast cannot
 * drift into two ids, which would give the same English string two entries in
 * `locales/`.
 */
export const messages = defineMessages({
  title: { id: 'Themes', defaultMessage: 'Themes' },
  add: { id: 'Add theme', defaultMessage: 'Add theme' },
  back: { id: 'Back', defaultMessage: 'Back' },
  save: { id: 'Save', defaultMessage: 'Save' },
  cancel: { id: 'Cancel', defaultMessage: 'Cancel' },
  edit: { id: 'Edit', defaultMessage: 'Edit' },
  duplicate: { id: 'Duplicate', defaultMessage: 'Duplicate' },
  duplicateOf: {
    id: 'Duplicate of {name}',
    defaultMessage: 'Duplicate of {name}',
  },
  delete: { id: 'Delete', defaultMessage: 'Delete' },
  saved: { id: 'Changes saved', defaultMessage: 'Changes saved' },
  deleted: { id: 'Theme deleted', defaultMessage: 'Theme deleted' },
  error: { id: 'Error', defaultMessage: 'Error' },
  columnName: { id: 'Name', defaultMessage: 'Name' },
  columnId: { id: 'Id', defaultMessage: 'Id' },
  columnColours: { id: 'Colours', defaultMessage: 'Colours' },
  columnActions: { id: 'Actions', defaultMessage: 'Actions' },
  confirmDelete: {
    id: 'Delete this theme?',
    defaultMessage:
      'Delete this theme? Content still using it keeps the stored id but ' +
      'falls back to the default colours.',
  },
});

export default messages;
