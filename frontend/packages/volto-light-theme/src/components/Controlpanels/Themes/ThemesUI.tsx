import type { Ref } from 'react';
import { createPortal } from 'react-dom';
import { Container } from 'semantic-ui-react';
import { useIntl } from 'react-intl';

import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import Toolbar from '@plone/volto/components/manage/Toolbar/Toolbar';

import type {
  JsonSchema,
  ThemeItem,
  ThemesControlpanelData,
} from '../../../types/theme';
import { findTheme } from '../../../helpers/themesControlpanel';
import ThemeForm from './ThemeForm';
import ThemesList from './ThemesList';
import ThemesToolbarActions from './ThemesToolbarActions';
import messages from './messages';

export type ThemesUIProps = {
  /**
   * The `@controlpanels/themes` payload.
   *
   * The schema is required rather than optional: the panel has nothing to
   * render without it, so the container waits for it and this component can
   * use it without a cast.
   */
  data: ThemesControlpanelData & { schema: JsonSchema };
  pathname: string;
  /** Id of the theme being edited, or `null` while listing. */
  editing: string | null;
  /** Whether the add form is open. */
  adding: boolean;
  /** Id of the theme an open add form was seeded from. */
  cloneOf: string | null;
  requestError?: unknown;
  /** Portals the toolbar; false during SSR, when `#toolbar` does not exist. */
  isClient: boolean;
  onEdit: (theme: ThemeItem) => void;
  onDuplicate: (theme: ThemeItem) => void;
  onDelete: (theme: ThemeItem) => void;
  onAdd: () => void;
  onSave: () => void;
  onSubmit: (formData: Record<string, unknown>) => void;
  onCancel: () => void;
  formRef?: Ref<any>;
};

/**
 * The panel's markup: a listing or a form, plus the toolbar that drives it.
 *
 * Holds no state and talks to no store — every decision arrives as a prop, so
 * the whole panel can be seen in Storybook. `Themes` is the connected half.
 */
const ThemesUI = ({
  data,
  pathname,
  editing,
  adding,
  cloneOf,
  requestError,
  isClient,
  onEdit,
  onDuplicate,
  onDelete,
  onAdd,
  onSave,
  onSubmit,
  onCancel,
  formRef,
}: ThemesUIProps) => {
  const intl = useIntl();

  const isForm = adding || editing !== null;
  const toolbarTarget = isClient ? document.getElementById('toolbar') : null;
  const current = editing ? findTheme(data, editing) : undefined;
  const source = cloneOf ? findTheme(data, cloneOf) : undefined;

  const toolbar = (
    <Toolbar
      pathname={pathname}
      hideDefaultViewButtons
      inner={
        <ThemesToolbarActions
          isForm={isForm}
          onSave={onSave}
          onCancel={onCancel}
          onAdd={onAdd}
        />
      }
    />
  );

  return (
    <div id="page-controlpanel" className="sc-themes-controlpanel">
      <Helmet title={intl.formatMessage(messages.title)} />
      <Container>
        {isForm ? (
          <ThemeForm
            schema={data.schema}
            adding={adding}
            theme={current}
            cloneOf={source}
            requestError={requestError}
            onSubmit={onSubmit}
            onCancel={onCancel}
            formRef={formRef}
          />
        ) : (
          <ThemesList
            themes={data.items ?? []}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}
      </Container>
      {/*
        The lookup is guarded rather than cast: `#toolbar` is Volto's, not
        ours, and a panel rendered outside the toolbar's layout should degrade
        to no toolbar instead of throwing in `createPortal`.
      */}
      {isClient && toolbarTarget && createPortal(toolbar, toolbarTarget)}
    </div>
  );
};

export default ThemesUI;
