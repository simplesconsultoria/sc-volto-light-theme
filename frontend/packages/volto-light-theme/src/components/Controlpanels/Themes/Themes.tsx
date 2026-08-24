import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

import { useClient } from '@plone/volto/hooks/client/useClient';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import Unauthorized from '@plone/volto/components/theme/Unauthorized/Unauthorized';
import {
  getControlpanel,
  postControlpanel,
  updateControlpanel,
  deleteControlpanel,
} from '@plone/volto/actions/controlpanels/controlpanels';

import type { ThemeItem, ThemesControlpanelData } from '../../../types/theme';
import type { ApiError } from '../../../helpers/themesControlpanel';
import {
  existingThemeIds,
  findTheme,
  isUnauthorizedError,
  splitFormData,
  validateNewThemeId,
} from '../../../helpers/themesControlpanel';
import ThemesUI from './ThemesUI';
import messages from './messages';

const PANEL_ID = 'themes';

type RootState = {
  controlpanels: {
    controlpanel: ThemesControlpanelData | null;
    get: { error: ApiError };
  };
};

/**
 * The themes control panel: everything that talks to the store or the API.
 *
 * The markup lives in `ThemesUI`, which is where to look for what the panel
 * shows; this half owns the fetch, the four actions, and the small amount of
 * state that decides between listing, add, edit and duplicate.
 */
const ThemesControlpanel = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isClient = useClient();
  const { pathname } = useLocation();
  const formRef = useRef<any>(null);

  const data = useSelector(
    (state: RootState) => state.controlpanels.controlpanel,
  ) as ThemesControlpanelData | undefined;
  // The panel fetch is what decides whether this user may be here. Reading the
  // failure off the store rather than the dispatch promise keeps it correct
  // regardless of whether the API middleware rejects or resolves on _FAIL.
  const loadError = useSelector(
    (state: RootState) => state.controlpanels.get.error,
  );
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

  const submitAdd = (formData: Record<string, unknown>) => {
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

  const submitEdit = (formData: Record<string, unknown>) => {
    const theme = findTheme(data, editing as string);
    if (!theme) return;
    const { values } = splitFormData({ ...formData, id: theme.id });
    (
      dispatch(
        updateControlpanel(`/@controlpanels/themes/${theme.id}`, values) as any,
      ) as any
    )
      .then(() => succeed(intl.formatMessage(messages.saved)))
      .catch(fail);
  };

  const confirmAndDelete = (theme: ThemeItem) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(intl.formatMessage(messages.confirmDelete))) return;
    (dispatch(deleteControlpanel(PANEL_ID, theme.id) as any) as any)
      .then(() => succeed(intl.formatMessage(messages.deleted)))
      .catch(fail);
  };

  if (isUnauthorizedError(loadError)) return <Unauthorized />;

  if (!data?.schema) return null;

  return (
    <ThemesUI
      // Re-stated rather than cast: the guard above proves the schema is
      // there, and `ThemesUI` requires it in its props.
      data={{ ...data, schema: data.schema }}
      pathname={pathname}
      editing={editing}
      adding={adding}
      cloneOf={cloneOf}
      requestError={error}
      isClient={isClient}
      onEdit={(theme) => setEditing(theme.id)}
      onDuplicate={startDuplicate}
      onDelete={confirmAndDelete}
      onAdd={() => setAdding(true)}
      onSave={() => formRef.current?.onSubmit()}
      onSubmit={adding ? submitAdd : submitEdit}
      onCancel={closeForm}
      formRef={formRef}
    />
  );
};

export default ThemesControlpanel;
