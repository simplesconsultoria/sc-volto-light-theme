import { describe, it, expect, beforeEach } from 'vitest';
import config from '@plone/volto/registry';
import { listVLTComponents } from './components';

const VltNavigation = () => null;
const ScNavigation = () => null;
const VltFooter = () => null;

describe('helpers/components', () => {
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

  it('marks the configured component as selected', () => {
    expect(listVLTComponents().navigation).toEqual([
      { name: 'vlt', selected: false },
      { name: 'sc', selected: true },
    ]);
  });

  it('keys the result by slot', () => {
    expect(Object.keys(listVLTComponents()).sort()).toEqual([
      'footer',
      'header',
      'mobileNavigation',
      'navigation',
    ]);
  });

  it('returns an empty list for a slot with nothing registered', () => {
    expect(listVLTComponents().header).toEqual([]);
  });

  it('skips utilities registered with dependencies', () => {
    config.registerUtility({
      name: 'scoped',
      type: 'navigation',
      dependencies: { foo: '1' },
      method: () => null,
    });
    expect(listVLTComponents().navigation.map((c) => c.name)).toEqual([
      'vlt',
      'sc',
    ]);
  });

  it('selects the vlt fallback when the configured name is not registered, matching what getComponent renders', () => {
    config.settings.vlt!.components.navigation = 'nope';
    expect(listVLTComponents().navigation).toEqual([
      { name: 'vlt', selected: true },
      { name: 'sc', selected: false },
    ]);
  });

  it('never marks more than one component selected per slot', () => {
    for (const choices of Object.values(listVLTComponents())) {
      expect(choices.filter((c) => c.selected).length).toBeLessThanOrEqual(1);
    }
  });

  it('returns an empty object when no settings are present', () => {
    config.settings.vlt = undefined;
    expect(listVLTComponents()).toEqual({});
  });
});
