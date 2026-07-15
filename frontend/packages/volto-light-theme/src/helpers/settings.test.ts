import { describe, it, expect, beforeEach } from 'vitest';
import config from '@plone/volto/registry';
import { getComponent } from './settings';

const VltNavigation = () => null;
const ScNavigation = () => null;
const VltFooter = () => null;

describe('helpers/settings', () => {
  beforeEach(() => {
    config._data.utilities = {};
    config.registerUtility({
      name: 'vlt',
      type: 'navigation',
      method: VltNavigation,
    });
    config.registerUtility({
      name: 'sc',
      type: 'navigation',
      method: ScNavigation,
    });
    config.registerUtility({ name: 'vlt', type: 'footer', method: VltFooter });
    config.settings.vlt = {
      components: {
        header: 'vlt',
        navigation: 'sc',
        mobileNavigation: 'vlt',
        footer: 'vlt',
      },
      display: { accessibilityBar: true },
    };
  });

  describe('getComponent', () => {
    it('returns the component the settings select', () => {
      expect(getComponent('navigation')).toBe(ScNavigation);
    });

    it('falls back to vlt when the configured name is not registered', () => {
      config.settings.vlt!.components.navigation = 'nope';
      expect(getComponent('navigation')).toBe(VltNavigation);
    });

    it('falls back to vlt when no settings are present', () => {
      config.settings.vlt = undefined;
      expect(getComponent('navigation')).toBe(VltNavigation);
    });
  });
});
