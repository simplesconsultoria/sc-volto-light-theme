import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import type { BlockTheme, ColorGroup } from '../../types/theme';
import {
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
  BASE_BLOCK_THEME_IDS,
} from '../../config/blockThemes';
import { SplitColorCircle, SolidColorCircle } from './BlockThemeWidget';
import { CardHeader } from './shared/CardHeader';

const messages = defineMessages({
  palette: { id: 'Color group palette', defaultMessage: 'Color group palette' },
  chipTitle: {
    id: '{name} ({id}): background {color}',
    defaultMessage: '{name} ({id}): background {color}',
  },
  previewBack: { id: 'Back area: {name}', defaultMessage: 'Back area: {name}' },
  previewAccent: { id: 'Accent button', defaultMessage: 'Accent button' },
  previewFront: {
    id: 'Card in the front area ({name})',
    defaultMessage: 'Card in the front area ({name})',
  },
  previewDesc: {
    id: 'Card description and metadata using the subtext color.',
    defaultMessage: 'Card description and metadata using the subtext color.',
  },
  default: { id: 'Default', defaultMessage: 'Default' },
  deleteTheme: {
    id: 'Delete block theme {name}',
    defaultMessage: 'Delete block theme {name}',
  },
  backArea: {
    id: 'Back area (background)',
    defaultMessage: 'Back area (background)',
  },
  frontArea: { id: 'Front area (cards)', defaultMessage: 'Front area (cards)' },
  idRequired: {
    id: 'The block theme ID is required.',
    defaultMessage: 'The block theme ID is required.',
  },
  idExists: {
    id: 'A block theme with the ID "{id}" already exists.',
    defaultMessage: 'A block theme with the ID "{id}" already exists.',
  },
  addNew: { id: 'Add new block theme', defaultMessage: 'Add new block theme' },
  addHelp: {
    id: 'Create a new block theme by selecting the Color Groups for the back area (block background) and the front area (cards and highlights).',
    defaultMessage:
      'Create a new block theme by selecting the Color Groups for the back area (block background) and the front area (cards and highlights).',
  },
  themeId: {
    id: 'Theme ID (e.g. highlight)',
    defaultMessage: 'Theme ID (e.g. highlight)',
  },
  themeIdPlaceholder: {
    id: 'e.g. highlight',
    defaultMessage: 'e.g. highlight',
  },
  displayName: { id: 'Display name', defaultMessage: 'Display name' },
  displayNamePlaceholder: {
    id: 'e.g. Highlight',
    defaultMessage: 'e.g. Highlight',
  },
  backGroup: {
    id: 'Back Color Group (background)',
    defaultMessage: 'Back Color Group (background)',
  },
  frontGroup: {
    id: 'Front Color Group (cards)',
    defaultMessage: 'Front Color Group (cards)',
  },
  newPreview: {
    id: 'New block theme preview',
    defaultMessage: 'New block theme preview',
  },
  save: { id: 'Save block theme', defaultMessage: 'Save block theme' },
  title: { id: 'Block themes', defaultMessage: 'Block themes' },
  help: {
    id: 'A block theme is a predefined pair of Color Groups: the back area (block background, listing title) and the front area (cards, chips and highlights). Click a theme to expand and edit it.',
    defaultMessage:
      'A block theme is a predefined pair of Color Groups: the back area (block background, listing title) and the front area (cards, chips and highlights). Click a theme to expand and edit it.',
  },
});

export interface BlockThemesWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: Record<string, BlockTheme> | BlockTheme[];
  onChange: (id: string, value: Record<string, BlockTheme>) => void;
  formData?: any;
  [key: string]: any;
}

/**
 * Custom ColorGroup dropdown selector with SolidColorCircle indicator.
 * Includes a hidden select to maintain accessible label association and testability.
 */
interface ColorGroupDropdownSelectProps {
  id: string;
  label: string;
  value: string;
  availableColorGroups: Record<string, ColorGroup>;
  onChange: (groupId: string) => void;
}

const ColorGroupDropdownSelect: React.FC<ColorGroupDropdownSelectProps> = ({
  id,
  label,
  value,
  availableColorGroups,
  onChange,
}) => {
  const intl = useIntl();
  const groupKeys = Object.keys(availableColorGroups);

  return (
    <div className="select-control colorgroup-select-control">
      <label htmlFor={id} className="control-label">
        {label}:
      </label>

      {/* Clickable Chips Palette com Ícones/Swatches (sem necessidade de abrir menu) */}
      <div
        className="colorgroup-chips-palette"
        role="radiogroup"
        aria-label={intl.formatMessage(messages.palette)}
      >
        {groupKeys.map((key) => {
          const cg = availableColorGroups[key];
          const bg = cg?.background_color_light || '#ffffff';
          const isSelected = key === value;

          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`colorgroup-chip-btn ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onChange(key)}
              title={intl.formatMessage(messages.chipTitle, {
                name: cg?.name || key,
                id: key,
                color: bg,
              })}
            >
              <SolidColorCircle color={bg} size={15} />
              <span className="chip-label">{cg?.name || key}</span>
              {isSelected && (
                <span className="chip-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hidden select for accessibility, screen readers, and automated testing */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
      >
        {groupKeys.map((key) => (
          <option key={key} value={key}>
            {availableColorGroups[key]?.name || key} ({key})
          </option>
        ))}
      </select>
    </div>
  );
};

/** A theme's back group with the front group as a card on top of it. */
const BlockThemePreview: React.FC<{
  back?: ColorGroup;
  front?: ColorGroup;
  backId: string;
  frontId: string;
  style?: React.CSSProperties;
}> = ({ back, front, backId, frontId, style }) => {
  const intl = useIntl();
  return (
    <div
      className="blocktheme-preview"
      style={{
        backgroundColor: back?.background_color_light || '#ffffff',
        color: back?.text_color_light || '#000000',
        fontFamily: back?.font_family || 'inherit',
        ...style,
      }}
    >
      <div className="preview-back-bar">
        <span className="preview-back-title">
          {intl.formatMessage(messages.previewBack, {
            name: back?.name || backId,
          })}
        </span>
        <span
          className="preview-accent-badge"
          style={{
            backgroundColor: back?.accent_color_light || '#1971c2',
            color: back?.background_color_light || '#ffffff',
          }}
        >
          {intl.formatMessage(messages.previewAccent)}
        </span>
      </div>

      <div
        className="preview-front-card"
        style={{
          backgroundColor: front?.background_color_light || '#f6f7f9',
          color: front?.text_color_light || '#000000',
          fontFamily: front?.font_family || 'inherit',
        }}
      >
        <div className="preview-front-title">
          {intl.formatMessage(messages.previewFront, {
            name: front?.name || frontId,
          })}
        </div>
        <div
          className="preview-front-desc"
          style={{ color: front?.subtext_color_light || '#666666' }}
        >
          {intl.formatMessage(messages.previewDesc)}
        </div>
      </div>
    </div>
  );
};

/** The back and front groups of a theme, falling back to the base ones. */
const groupsOf = (
  colorGroups: Record<string, ColorGroup>,
  back: string,
  front: string,
) => ({
  back: colorGroups[back] || colorGroups.primary,
  front: colorGroups[front] || colorGroups.neutral,
});

const BlockThemeCard: React.FC<{
  theme: BlockTheme;
  colorGroups: Record<string, ColorGroup>;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof BlockTheme, value: string) => void;
  onDelete: () => void;
}> = ({ theme: bt, colorGroups, isExpanded, onToggle, onUpdate, onDelete }) => {
  const intl = useIntl();
  const { back, front } = groupsOf(
    colorGroups,
    bt.back_color_group,
    bt.front_color_group,
  );
  const isBase = BASE_BLOCK_THEME_IDS.includes(bt.id);
  const bodyId = `blocktheme-body-${bt.id}`;
  return (
    <div className={`blocktheme-card ${isExpanded ? 'is-expanded' : ''}`}>
      <CardHeader
        className="blocktheme-card-header"
        isExpanded={isExpanded}
        onToggle={onToggle}
        controls={bodyId}
        onDelete={isBase ? undefined : onDelete}
        deleteClassName="delete-theme-btn"
        deleteLabel={intl.formatMessage(messages.deleteTheme, {
          name: bt.name,
        })}
        preview={
          <SplitColorCircle
            backColor={back?.background_color_light || '#ffffff'}
            frontColor={front?.background_color_light || '#f6f7f9'}
            size={22}
          />
        }
      >
        <strong className="theme-name">{bt.name}</strong>
        <code className="theme-id">{bt.id}</code>
        {isBase && (
          <span className="base-tag">
            {intl.formatMessage(messages.default)}
          </span>
        )}
      </CardHeader>

      <div
        id={bodyId}
        className="blocktheme-card-body"
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        <div className="blocktheme-controls">
          <ColorGroupDropdownSelect
            id={`back-cg-${bt.id}`}
            label={intl.formatMessage(messages.backArea)}
            value={bt.back_color_group}
            availableColorGroups={colorGroups}
            onChange={(val) => onUpdate('back_color_group', val)}
          />
          <ColorGroupDropdownSelect
            id={`front-cg-${bt.id}`}
            label={intl.formatMessage(messages.frontArea)}
            value={bt.front_color_group}
            availableColorGroups={colorGroups}
            onChange={(val) => onUpdate('front_color_group', val)}
          />
        </div>

        <BlockThemePreview
          back={back}
          front={front}
          backId={bt.back_color_group}
          frontId={bt.front_color_group}
        />
      </div>
    </div>
  );
};

const NewBlockThemeForm: React.FC<{
  colorGroups: Record<string, ColorGroup>;
  existingIds: string[];
  onAdd: (theme: BlockTheme) => void;
}> = ({ colorGroups, existingIds, onAdd }) => {
  const intl = useIntl();
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newBack, setNewBack] = useState('primary');
  const [newFront, setNewFront] = useState('neutral');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { back, front } = groupsOf(colorGroups, newBack, newFront);

  const handleAdd = () => {
    const cleanId = newId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    if (!cleanId) {
      setErrorMsg(intl.formatMessage(messages.idRequired));
      return;
    }
    if (existingIds.includes(cleanId)) {
      setErrorMsg(intl.formatMessage(messages.idExists, { id: cleanId }));
      return;
    }
    onAdd({
      id: cleanId,
      name:
        newName.trim() || cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
      back_color_group: newBack,
      front_color_group: newFront,
    });
    setNewId('');
    setNewName('');
    setErrorMsg(null);
  };

  return (
    <div className="add-blocktheme-card">
      <div className="add-card-header">
        <SplitColorCircle
          backColor={back?.background_color_light || '#ffffff'}
          frontColor={front?.background_color_light || '#f6f7f9'}
          size={22}
        />
        <h5>+ {intl.formatMessage(messages.addNew)}</h5>
      </div>
      <p className="help">{intl.formatMessage(messages.addHelp)}</p>

      {errorMsg && (
        <div className="ui error message" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="add-fields-grid">
        <div className="field-item">
          <label htmlFor="new-bt-id">
            {intl.formatMessage(messages.themeId)}:
          </label>
          <input
            id="new-bt-id"
            type="text"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder={intl.formatMessage(messages.themeIdPlaceholder)}
          />
        </div>
        <div className="field-item">
          <label htmlFor="new-bt-name">
            {intl.formatMessage(messages.displayName)}:
          </label>
          <input
            id="new-bt-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={intl.formatMessage(messages.displayNamePlaceholder)}
          />
        </div>
        <div className="field-item">
          <ColorGroupDropdownSelect
            id="new-bt-back"
            label={intl.formatMessage(messages.backGroup)}
            value={newBack}
            availableColorGroups={colorGroups}
            onChange={setNewBack}
          />
        </div>
        <div className="field-item">
          <ColorGroupDropdownSelect
            id="new-bt-front"
            label={intl.formatMessage(messages.frontGroup)}
            value={newFront}
            availableColorGroups={colorGroups}
            onChange={setNewFront}
          />
        </div>
      </div>

      <div className="preview-label">
        {intl.formatMessage(messages.newPreview)}:
      </div>
      <BlockThemePreview
        back={back}
        front={front}
        backId={newBack}
        frontId={newFront}
        style={{ marginBottom: '1.25rem' }}
      />

      <button
        type="button"
        className="ui button primary add-blocktheme-btn"
        onClick={handleAdd}
      >
        {intl.formatMessage(messages.save)}
      </button>
    </div>
  );
};

/** A stored mapping or list keyed by id; `fallback` when empty. */
function byId<T extends { id: string }>(
  value: Record<string, T> | T[] | undefined,
  fallback: Record<string, T>,
): Record<string, T> {
  const dict: Record<string, T> = {};
  if (Array.isArray(value)) {
    for (const item of value) if (item?.id) dict[item.id] = item;
  } else {
    for (const [key, item] of Object.entries(value || {})) {
      if (item) dict[key] = item.id ? item : { ...item, id: key };
    }
  }
  return Object.keys(dict).length > 0 ? dict : { ...fallback };
}

export const BlockThemesWidget: React.FC<BlockThemesWidgetProps> = ({
  id,
  value,
  onChange,
  formData,
}) => {
  const intl = useIntl();
  const blockThemes = React.useMemo(
    () => byId<BlockTheme>(value, DEFAULT_BLOCK_THEMES),
    [value],
  );

  // Color groups being edited in the same form, over the defaults.
  const availableColorGroups = React.useMemo(
    () => ({
      ...DEFAULT_COLOR_GROUPS,
      ...(formData?.color_groups
        ? byId<ColorGroup>(formData.color_groups, {})
        : {}),
    }),
    [formData?.color_groups],
  );

  // Collapsible state for each BlockTheme (initially collapsed)
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>(
    {},
  );

  const updateBlockTheme = (
    themeId: string,
    field: keyof BlockTheme,
    val: string,
  ) => {
    const target = blockThemes[themeId];
    if (!target) return;
    onChange(id, { ...blockThemes, [themeId]: { ...target, [field]: val } });
  };

  const handleDeleteBlockTheme = (themeId: string) => {
    if (BASE_BLOCK_THEME_IDS.includes(themeId)) return;
    const updated = { ...blockThemes };
    delete updated[themeId];
    onChange(id, updated);
  };

  return (
    <div className="blockthemes-widget">
      <div className="blockthemes-header">
        <h4>{intl.formatMessage(messages.title)}</h4>
        <p className="help">{intl.formatMessage(messages.help)}</p>
      </div>

      <div className="blockthemes-list">
        {Object.values(blockThemes).map((bt) => (
          <BlockThemeCard
            key={bt.id}
            theme={bt}
            colorGroups={availableColorGroups}
            isExpanded={!!expandedThemes[bt.id]}
            onToggle={() =>
              setExpandedThemes((prev) => ({ ...prev, [bt.id]: !prev[bt.id] }))
            }
            onUpdate={(field, val) => updateBlockTheme(bt.id, field, val)}
            onDelete={() => handleDeleteBlockTheme(bt.id)}
          />
        ))}
      </div>

      <NewBlockThemeForm
        colorGroups={availableColorGroups}
        existingIds={Object.keys(blockThemes)}
        onAdd={(theme) => onChange(id, { ...blockThemes, [theme.id]: theme })}
      />
    </div>
  );
};

export default BlockThemesWidget;
