import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button, Container, Segment, Table } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import { useClient } from '@plone/volto/hooks/client/useClient';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { Form } from '@plone/volto/components/manage/Form';
import {
  getControlpanel,
  postControlpanel,
  updateControlpanel,
  deleteControlpanel,
} from '@plone/volto/actions/controlpanels/controlpanels';

import addSVG from '@plone/volto/icons/add.svg';
import backSVG from '@plone/volto/icons/back.svg';
import copySVG from '@plone/volto/icons/copy.svg';
import deleteSVG from '@plone/volto/icons/delete.svg';
import pencilSVG from '@plone/volto/icons/pencil.svg';
import saveSVG from '@plone/volto/icons/save.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

import {
  addSchema,
  cloneThemeFormData,
  editSchema,
  existingThemeIds,
  findTheme,
  isDeletable,
  splitFormData,
  validateNewThemeId,
} from '../../../helpers/themesControlpanel';
import type { ThemeItem, ThemesControlpanelData } from '../../../types/theme';
import { themeCustomProperties } from '../../../helpers/themeStyles';

const PANEL_ID = 'themes';

const messages = defineMessages({
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
  confirmDelete: {
    id: 'Delete this theme?',
    defaultMessage:
      'Delete this theme? Content still using it keeps the stored id but ' +
      'falls back to the default colours.',
  },
});

/** Small colour chips, so the listing is scannable without opening a theme. */
const ThemeSwatches = ({ theme }: { theme: ThemeItem }) => (
  <span className="sc-theme-swatches">
    {Object.entries(themeCustomProperties(theme)).map(([variable, color]) => (
      <span
        key={variable}
        className="sc-theme-swatch"
        style={{ backgroundColor: color }}
        title={`${variable}: ${color}`}
      />
    ))}
  </span>
);

const ThemesControlpanel = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isClient = useClient();
  const { pathname } = useLocation();
  const formRef = useRef<any>(null);

  const data = useSelector((state: any) => state.controlpanels.controlpanel) as
    | ThemesControlpanelData
    | undefined;
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // Theme the add form is seeded from, when it was opened by Duplicate.
  const [cloneOf, setCloneOf] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  const refresh = () => dispatch(getControlpanel(PANEL_ID) as any);

  useEffect(() => {
    (refresh() as any).catch((err: unknown) => setError(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fail = (err: any) => {
    setError(err);
    toast.error(
      <Toast
        error
        title={intl.formatMessage(messages.error)}
        content={err?.response?.body?.message ?? String(err)}
      />,
    );
  };

  const succeed = (message: string) => {
    toast.success(<Toast success title={message} />);
    setEditing(null);
    setAdding(false);
    setCloneOf(null);
    setError(null);
    refresh();
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
    setCloneOf(null);
    setError(null);
  };

  const startDuplicate = (theme: ThemeItem) => {
    setCloneOf(theme.id);
    setAdding(true);
  };

  const onAdd = (formData: Record<string, unknown>) => {
    const { id, values } = splitFormData(formData);
    const problem = validateNewThemeId(id, existingThemeIds(data));
    if (problem) {
      fail(new Error(problem));
      return;
    }
    (dispatch(postControlpanel(PANEL_ID, { id, ...values }) as any) as any)
      .then(() => succeed(intl.formatMessage(messages.saved)))
      .catch(fail);
  };

  const onEdit = (formData: Record<string, unknown>) => {
    const theme = findTheme(data, editing as string);
    if (!theme) return;
    const { values } = splitFormData({ ...formData, id: theme.id });
    (dispatch(updateControlpanel(theme['@id'], values) as any) as any)
      .then(() => succeed(intl.formatMessage(messages.saved)))
      .catch(fail);
  };

  const onDelete = (theme: ThemeItem) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(intl.formatMessage(messages.confirmDelete))) return;
    (dispatch(deleteControlpanel(PANEL_ID, theme.id) as any) as any)
      .then(() => succeed(intl.formatMessage(messages.deleted)))
      .catch(fail);
  };

  if (!data?.schema) return null;

  const isForm = adding || editing !== null;
  const current = editing ? findTheme(data, editing) : undefined;
  const source = cloneOf ? findTheme(data, cloneOf) : undefined;
  const addFormData = source ? cloneThemeFormData(source) : {};

  return (
    <div id="page-controlpanel" className="sc-themes-controlpanel">
      <Helmet title={intl.formatMessage(messages.title)} />
      <Container>
        {isForm ? (
          <Form
            ref={formRef}
            title={
              adding
                ? intl.formatMessage(messages.add)
                : current?.name ?? current?.id
            }
            schema={adding ? addSchema(data.schema) : editSchema(data.schema)}
            formData={adding ? addFormData : current}
            requestError={error}
            onSubmit={adding ? onAdd : onEdit}
            onCancel={closeForm}
            hideActions
          />
        ) : (
          <Segment.Group raised>
            <Segment className="primary">
              {intl.formatMessage(messages.title)}
            </Segment>
            <Segment>
              <Table selectable compact>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Id</Table.HeaderCell>
                    <Table.HeaderCell>Colours</Table.HeaderCell>
                    <Table.HeaderCell textAlign="right">
                      Actions
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {(data.items ?? []).map((theme) => (
                    <Table.Row key={theme.id}>
                      <Table.Cell>{theme.name || theme.id}</Table.Cell>
                      <Table.Cell>
                        <code>{theme.id}</code>
                      </Table.Cell>
                      <Table.Cell>
                        <ThemeSwatches theme={theme} />
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Button
                          basic
                          icon
                          aria-label={intl.formatMessage(messages.edit)}
                          title={intl.formatMessage(messages.edit)}
                          onClick={() => setEditing(theme.id)}
                        >
                          <Icon name={pencilSVG} size="20px" />
                        </Button>
                        <Button
                          basic
                          icon
                          aria-label={intl.formatMessage(messages.duplicate)}
                          title={intl.formatMessage(messages.duplicate)}
                          onClick={() => startDuplicate(theme)}
                        >
                          <Icon name={copySVG} size="20px" />
                        </Button>
                        {isDeletable(theme.id) && (
                          <Button
                            basic
                            icon
                            aria-label={intl.formatMessage(messages.delete)}
                            title={intl.formatMessage(messages.delete)}
                            onClick={() => onDelete(theme)}
                          >
                            <Icon name={deleteSVG} size="20px" />
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Segment>
          </Segment.Group>
        )}
      </Container>
      {isClient &&
        createPortal(
          <Toolbar
            pathname={pathname}
            hideDefaultViewButtons
            inner={
              isForm ? (
                <>
                  <Button
                    id="toolbar-save"
                    className="save"
                    aria-label={intl.formatMessage(messages.save)}
                    onClick={() => formRef.current?.onSubmit()}
                  >
                    <Icon
                      name={saveSVG}
                      className="circled"
                      size="30px"
                      title={intl.formatMessage(messages.save)}
                    />
                  </Button>
                  <Button
                    className="cancel"
                    aria-label={intl.formatMessage(messages.cancel)}
                    onClick={closeForm}
                  >
                    <Icon
                      name={clearSVG}
                      className="circled"
                      size="30px"
                      title={intl.formatMessage(messages.cancel)}
                    />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    id="toolbar-add"
                    aria-label={intl.formatMessage(messages.add)}
                    onClick={() => setAdding(true)}
                  >
                    <Icon
                      name={addSVG}
                      className="circled"
                      size="30px"
                      title={intl.formatMessage(messages.add)}
                    />
                  </Button>
                  <a className="item" href="/controlpanel">
                    <Icon
                      name={backSVG}
                      className="circled"
                      size="30px"
                      title={intl.formatMessage(messages.back)}
                    />
                  </a>
                </>
              )
            }
          />,
          document.getElementById('toolbar') as HTMLElement,
        )}
    </div>
  );
};

export default ThemesControlpanel;
