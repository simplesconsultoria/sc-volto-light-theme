// The component-selection helper (`getVLTComponent`) and its `ComponentSlot`
// type now live upstream in `@kitconcept/volto-light-theme`. We keep this
// re-export so consumers of this theme (e.g. `@simplesconsultoria/showcase`)
// can import `ComponentSlot` from the SC package without depending on the
// kitconcept package directly.
export type { ComponentSlot } from '@kitconcept/volto-light-theme/helpers/settings';
