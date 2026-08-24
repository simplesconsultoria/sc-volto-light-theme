import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import type { Content } from '@plone/types';
import { useLocation } from 'react-router-dom';
import type {
  InheritedBehavior,
  InheritExpander,
  InheritRootState,
} from '../types/inherit';

type FormState = {
  content: {
    data: Content;
  };
  errorContext: Content;
  form: {
    global: Content;
  };
};

const DEFAULT_HEADER_BEHAVIOR = 'sc.voltolighttheme.siteheader';
const FOOTER_BEHAVIOR = 'sc.voltolighttheme.footer';

/**
 * Map a kitconcept.voltolighttheme behavior name onto the one this add-on
 * ships in its place. Names we do not supersede are returned untouched, so a
 * third-party behavior still resolves against its own inherit key.
 *
 * Resolved per call rather than once at module scope: the header behavior is
 * read from the registry, which is only populated once `install()` has run.
 */
function mapBehavior(behavior: string): string {
  switch (behavior) {
    case 'voltolighttheme.header':
      return config.settings.scvlt?.headerBehavior ?? DEFAULT_HEADER_BEHAVIOR;
    case 'voltolighttheme.footer':
    case 'kitconcept.footer':
      return FOOTER_BEHAVIOR;
    default:
      return behavior;
  }
}

export function useLiveData<T>(
  content: Content,
  behavior: string | undefined,
  field: string,
) {
  const errorContext = useSelector((state: FormState) => state.errorContext);
  const context = content ?? errorContext;

  const location = useLocation();
  const addMode = location?.pathname?.endsWith('/add');

  const mappedBehavior = behavior ? mapBehavior(behavior) : behavior;

  // Prefer the dedicated `inherit` slice over the copy riding on the content:
  // `state.content.data` is replaced wholesale on every route change, so a
  // response without the expander blanks these values, while the reducer keeps
  // the last ones it saw. Falling back to the content keeps the hook working
  // for consumers that have not registered the reducer.
  const storeInherit = useSelector(
    (state: InheritRootState) => state.inherit?.data,
  );
  const contentInherit = context?.['@components']?.inherit as
    | InheritExpander
    | undefined;

  const inheritedValue = (source: InheritExpander | undefined) =>
    (source?.[mappedBehavior as string] as InheritedBehavior | undefined)
      ?.data?.[field];

  const current = mappedBehavior
    ? ((inheritedValue(storeInherit) ?? inheritedValue(contentInherit)) as T)
    : ((context as unknown as Record<string, unknown> | undefined)?.[
        field
      ] as T);

  const formData = useSelector<FormState, T>(
    (state) => state.form.global?.[field],
  );

  if (addMode && !mappedBehavior) return formData;

  const data = formData ?? current;

  return data;
}
