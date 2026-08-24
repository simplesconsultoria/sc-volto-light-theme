import type { ConfigType } from '@plone/registry';
import inherit from '../reducers/inherit/inherit';

/**
 * Register this add-on's reducers.
 *
 * `config.addonReducers` is spread into `combineReducers` after Volto's own
 * reducers, so the `inherit` slice is available as `state.inherit`.
 */
export default function installReducers(config: ConfigType) {
  config.addonReducers = {
    ...config.addonReducers,
    inherit,
  };

  return config;
}
