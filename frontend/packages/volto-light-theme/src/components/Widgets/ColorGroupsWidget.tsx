import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import type { ColorGroup } from '../../types/theme';
import {
  DEFAULT_COLOR_GROUPS,
  BASE_COLOR_GROUP_IDS,
  type CssPatternPreset,
} from '../../config/blockThemes';
import { ColorGroupItem } from './ColorGroups/ColorGroupItem';
import { NewColorGroupForm } from './ColorGroups/NewColorGroupForm';
import { messages } from './ColorGroups/messages';

export interface ColorGroupsWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: Record<string, ColorGroup> | ColorGroup[];
  onChange: (id: string, value: Record<string, ColorGroup>) => void;
  required?: boolean;
  [key: string]: any;
}

/** The stored value keyed by id, or the defaults when there is none. */
function normalizeGroups(
  value: ColorGroupsWidgetProps['value'],
): Record<string, ColorGroup> {
  const dict: Record<string, ColorGroup> = {};
  if (Array.isArray(value)) {
    for (const cg of value) {
      if (cg?.id) dict[cg.id] = cg;
    }
  } else {
    // Stored as a mapping: the key is the id even when the entry lacks one.
    for (const [key, cg] of Object.entries(value || {})) {
      if (cg) dict[key] = cg.id ? cg : { ...cg, id: key };
    }
  }
  return Object.keys(dict).length > 0 ? dict : { ...DEFAULT_COLOR_GROUPS };
}

/** Flip one id's flag in a `Record<id, boolean>` state. */
const toggleKey =
  (key: string) =>
  (prev: Record<string, boolean>): Record<string, boolean> => ({
    ...prev,
    [key]: !prev[key],
  });

export const ColorGroupsWidget: React.FC<ColorGroupsWidgetProps> = ({
  id,
  value,
  onChange,
}) => {
  const intl = useIntl();
  const groups = React.useMemo(() => normalizeGroups(value), [value]);

  // Collapsible state and simulated device per group (initially collapsed,
  // desktop).
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [mobilePreview, setMobilePreview] = useState<Record<string, boolean>>(
    {},
  );

  const updateGroupMultiple = (
    groupId: string,
    updates: Partial<ColorGroup>,
  ) => {
    const target = groups[groupId];
    if (!target) return;
    onChange(id, { ...groups, [groupId]: { ...target, ...updates } });
  };

  const updateGroup = (groupId: string, field: keyof ColorGroup, val: string) =>
    updateGroupMultiple(groupId, { [field]: val });

  const handleApplyPreset = (groupId: string, preset: CssPatternPreset) => {
    if (preset.id === 'none') {
      updateGroupMultiple(groupId, {
        bg_image_light_desktop: '',
        bg_image_light_mobile: '',
        bg_image_dark_desktop: '',
        bg_image_dark_mobile: '',
      });
      return;
    }
    // Both colour modes: the presets draw with `currentColor`, so the same
    // pattern follows the light or dark text colour on its own. Setting only
    // the light field left a dark image picked earlier in place.
    updateGroupMultiple(groupId, {
      bg_image_light_desktop: preset.css,
      bg_image_dark_desktop: preset.css,
      bg_size: preset.defaultSize || 'auto',
      bg_repeat: preset.defaultRepeat || 'repeat',
      bg_position: preset.defaultPosition || 'center',
    });
  };

  const handleFileUpload = (
    groupId: string,
    field: keyof ColorGroup,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateGroup(groupId, field, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (BASE_COLOR_GROUP_IDS.includes(groupId)) return;
    const updated = { ...groups };
    delete updated[groupId];
    onChange(id, updated);
  };

  const handleAddGroup = (group: ColorGroup) => {
    onChange(id, { ...groups, [group.id]: group });
    // Expand the newly added group automatically
    setExpandedGroups((prev) => ({ ...prev, [group.id]: true }));
  };

  return (
    <div className="colorgroups-widget">
      <div className="colorgroups-header">
        <h4>{intl.formatMessage(messages.colorGroups)}</h4>
        <p className="help">{intl.formatMessage(messages.colorGroupsHelp)}</p>
      </div>

      <div className="colorgroups-list">
        {Object.values(groups).map((group) => (
          <ColorGroupItem
            key={group.id}
            group={group}
            isExpanded={!!expandedGroups[group.id]}
            isBase={BASE_COLOR_GROUP_IDS.includes(group.id)}
            isMobilePreview={!!mobilePreview[group.id]}
            onToggleExpand={(gid) => setExpandedGroups(toggleKey(gid))}
            onToggleDevice={(gid) => setMobilePreview(toggleKey(gid))}
            onUpdateGroup={updateGroup}
            onUpdateGroupMultiple={updateGroupMultiple}
            onApplyPreset={handleApplyPreset}
            onFileUpload={handleFileUpload}
            onDeleteGroup={handleDeleteGroup}
          />
        ))}
      </div>

      <NewColorGroupForm
        existingIds={Object.keys(groups)}
        onAdd={handleAddGroup}
      />
    </div>
  );
};

export default ColorGroupsWidget;
