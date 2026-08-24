/**
 * The Redux context Volto's `Form` needs, so a story can render the real one.
 *
 * `Form` is `connect()`-ed — it reads `content.data`, `form.global`, `form.ui`
 * and two `sidebar` fields — but it keeps the edited values in its own
 * component state and only dispatches `setFormData` when `global` is set,
 * which the themes panel does not set. A read-only store is therefore enough
 * for a fully interactive form: typing and validation work against local
 * state.
 *
 * Shared by more than one story file, so it cannot live inside a `*.stories.*`
 * module: Storybook reads every named export there as a story.
 */
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

const state = {
  content: { data: {} },
  form: { global: undefined, ui: {} },
  sidebar: { metadataFieldsets: [], metadataFieldFocus: '' },
  userSession: { token: null },
  intl: { locale: 'en', messages: {} },
  // The add form's field is literally named `id`, and Volto maps that *field
  // name* to `IdWidget` (see `config/Widgets.jsx`), which selects
  // `state.querystring.indexes`.
  querystring: { indexes: {}, sortable_indexes: {} },
};

/**
 * A store that answers reads and swallows writes.
 *
 * Hand-rolled rather than `createStore`: there are no reducers to run, and a
 * real store would only add a way for a dispatch to change what the story
 * shows.
 */
const store = {
  getState: () => state,
  subscribe: () => () => {},
  dispatch: (action: unknown) => action,
  replaceReducer: () => {},
};

export const MockStoreProvider = ({ children }: { children: ReactNode }) => (
  <Provider store={store as never}>{children}</Provider>
);

/** Decorator form, for `meta.decorators`. */
export const withMockStore = (Story: () => ReactNode) => (
  <MockStoreProvider>{Story()}</MockStoreProvider>
);
