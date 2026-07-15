import React from 'react';
import config from '@plone/volto/registry';
import type { VLTSettings } from '../types/vlt';

const defaultComponent = 'vlt';

export type ComponentSlot = keyof VLTSettings['components'];

export function getComponent(type: string): React.ComponentType<any> {
  const settings = config.settings.vlt?.components;
  const name = settings ? settings[type] || defaultComponent : defaultComponent;
  const component = config.getUtility({
    name: name,
    type: type,
  }).method;
  return (
    component ||
    config.getUtility({ name: defaultComponent, type: type }).method
  );
}
