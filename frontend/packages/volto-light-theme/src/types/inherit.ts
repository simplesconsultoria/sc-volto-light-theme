/**
 * Types for the `@inherit` expander of `plone.restapi`.
 *
 * The expander walks the acquisition chain and, for each requested behavior,
 * reports the closest object providing it together with that object's values.
 * A behavior with no provider — or one whose registration is not found — is
 * simply omitted from the response, never reported as an error.
 */

/** The values of a single inherited behavior, plus where they came from. */
export type InheritedBehavior = {
  from?: {
    '@id': string;
    title: string;
  };
  data?: Record<string, unknown>;
};

/**
 * The `inherit` expander payload: `@id` plus one entry per behavior that
 * resolved to a provider.
 */
export type InheritExpander = {
  '@id'?: string;
  [behavior: string]: InheritedBehavior | string | undefined;
};

/** Shape of the `inherit` slice this add-on registers in the Redux store. */
export type InheritState = {
  data: InheritExpander;
  error: unknown;
  loaded: boolean;
  loading: boolean;
};

/** The store as far as this add-on is concerned. */
export type InheritRootState = {
  inherit?: InheritState;
};
