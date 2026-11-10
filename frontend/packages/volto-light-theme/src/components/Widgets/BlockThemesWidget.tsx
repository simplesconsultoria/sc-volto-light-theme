import React, { useState } from 'react';
import type { BlockTheme, ColorGroup } from '../../types/theme';
import {
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
  BASE_BLOCK_THEME_IDS,
} from '../../config/blockThemes';
import { SplitColorCircle, SolidColorCircle } from './BlockThemeWidget';
import { CardHeader } from './shared/CardHeader';

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
  const groupKeys = Object.keys(availableColorGroups);

  return (
    <div className="select-control colorgroup-select-control">
      <label htmlFor={id} className="control-label">
        {label}
      </label>

      {/* Clickable Chips Palette com Ícones/Swatches (sem necessidade de abrir menu) */}
      <div
        className="colorgroup-chips-palette"
        role="radiogroup"
        aria-label="Paleta de Grupo de Cores"
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
              title={`${cg?.name || key} (${key}): Fundo ${bg}`}
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
}> = ({ back, front, backId, frontId, style }) => (
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
        Área de Trás: {back?.name || backId}
      </span>
      <span
        className="preview-accent-badge"
        style={{
          backgroundColor: back?.accent_color_light || '#1971c2',
          color: back?.background_color_light || '#ffffff',
        }}
      >
        Botão Accent
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
        Card na Área da Frente ({front?.name || frontId})
      </div>
      <div
        className="preview-front-desc"
        style={{ color: front?.subtext_color_light || '#666666' }}
      >
        Descrição do card e metadados usando a cor de subtexto.
      </div>
    </div>
  </div>
);

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
        deleteLabel={`Excluir o tema de bloco ${bt.name}`}
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
        {isBase && <span className="base-tag">Padrão</span>}
      </CardHeader>

      <div
        id={bodyId}
        className="blocktheme-card-body"
        style={{ display: isExpanded ? 'block' : 'none' }}
      >
        <div className="blocktheme-controls">
          <ColorGroupDropdownSelect
            id={`back-cg-${bt.id}`}
            label="Área de Trás (Fundo):"
            value={bt.back_color_group}
            availableColorGroups={colorGroups}
            onChange={(val) => onUpdate('back_color_group', val)}
          />
          <ColorGroupDropdownSelect
            id={`front-cg-${bt.id}`}
            label="Área da Frente (Cards):"
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
      setErrorMsg('O ID do tema de bloco é obrigatório.');
      return;
    }
    if (existingIds.includes(cleanId)) {
      setErrorMsg(`Um tema de bloco com o ID "${cleanId}" já existe.`);
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
        <h5>+ Adicionar Novo Tema de Bloco</h5>
      </div>
      <p className="help">
        Crie um novo tema de bloco selecionando os ColorGroups para a área de
        trás (fundo do bloco) e para a área da frente (cards e destaques).
      </p>

      {errorMsg && (
        <div className="ui error message" role="alert">
          {errorMsg}
        </div>
      )}

      <div className="add-fields-grid">
        <div className="field-item">
          <label htmlFor="new-bt-id">ID do Tema (ex: destaque):</label>
          <input
            id="new-bt-id"
            type="text"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="ex: destaque"
          />
        </div>
        <div className="field-item">
          <label htmlFor="new-bt-name">Nome Exibido:</label>
          <input
            id="new-bt-name"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ex: Destaque"
          />
        </div>
        <div className="field-item">
          <ColorGroupDropdownSelect
            id="new-bt-back"
            label="ColorGroup de Trás (Fundo):"
            value={newBack}
            availableColorGroups={colorGroups}
            onChange={setNewBack}
          />
        </div>
        <div className="field-item">
          <ColorGroupDropdownSelect
            id="new-bt-front"
            label="ColorGroup da Frente (Cards):"
            value={newFront}
            availableColorGroups={colorGroups}
            onChange={setNewFront}
          />
        </div>
      </div>

      <div className="preview-label">
        Pré-visualização do Novo Tema de Bloco:
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
        Salvar Tema de Bloco
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
        <h4>Temas de Bloco (Block Themes)</h4>
        <p className="help">
          Um Tema de Bloco é um conjunto predefinido de dois ColorGroups: a área
          de trás (fundo do bloco, título da listagem) e a área da frente
          (cartões, chips e destaques). Clique em um tema para expandir e
          editar.
        </p>
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
