import config from '@plone/volto/registry';
import type { ComponentSlot } from '@simplesconsultoria/volto-light-theme/helpers/settings';

const defaultComponent = 'vlt';

export type ComponentChoice = {
  name: string;
  selected: boolean;
};

// Mirrors what getComponent in the theme would resolve for every configured
// slot, so the panel can show the choices without importing the components.
export function listVLTComponents(): Record<ComponentSlot, ComponentChoice[]> {
  const settings = config.settings.vlt?.components;
  const slots = (settings ? Object.keys(settings) : []) as ComponentSlot[];

  return slots.reduce(
    (acc, type) => {
      const utilities = config._data.utilities?.[type] ?? {};
      // The registry keys a utility by name alone, but prefixes the key with
      // `|<dependencies>` when it is registered with any. Those are skipped:
      // getComponent resolves without dependencies, so it could never pick one.
      const names = Object.keys(utilities).filter(
        (key) => !key.startsWith('|'),
      );
      // Mirror getComponent's fallback, so the selected entry is the one that
      // actually renders even when the settings name something unregistered.
      const configured = settings?.[type];
      const selected =
        configured && names.includes(configured)
          ? configured
          : defaultComponent;

      acc[type] = names.map((name) => ({ name, selected: name === selected }));
      return acc;
    },
    {} as Record<ComponentSlot, ComponentChoice[]>,
  );
}
