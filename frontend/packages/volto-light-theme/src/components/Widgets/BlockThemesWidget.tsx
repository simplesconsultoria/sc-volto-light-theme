import React, { useState, useRef, useEffect } from 'react';
import type { BlockTheme, ColorGroup } from '../../types/theme';
import {
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
  BASE_BLOCK_THEME_IDS,
} from '../../config/blockThemes';
import { SplitColorCircle, SolidColorCircle } from './BlockThemeWidget';

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentGroup = availableColorGroups[value] || availableColorGroups.primary;
  const currentBg = currentGroup?.background_color_light || '#ffffff';
  const groupKeys = Object.keys(availableColorGroups);

  return (
    <div className="select-control colorgroup-select-control" ref={containerRef}>
      <label htmlFor={id} className="control-label">
        {label}
      </label>

      {/* Trigger Button */}
      <div className="colorgroup-dropdown-wrapper">
        <button
          type="button"
          className="colorgroup-trigger-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <SolidColorCircle color={currentBg} size={18} />
          <span className="trigger-label">
            {currentGroup?.name || value} ({value})
          </span>
          <span className={`trigger-arrow ${isOpen ? 'open' : ''}`}>▾</span>
        </button>

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

        {/* Floating Menu */}
        {isOpen && (
          <div className="colorgroup-options-menu" role="listbox">
            {groupKeys.map((key) => {
              const cg = availableColorGroups[key];
              const bg = cg?.background_color_light || '#ffffff';
              const isSelected = key === value;

              return (
                <div
                  key={key}
                  className={`colorgroup-option-item ${isSelected ? 'selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(key);
                    setIsOpen(false);
                  }}
                >
                  <SolidColorCircle color={bg} size={16} />
                  <span className="option-name">
                    {cg?.name || key} <span className="option-key">({key})</span>
                  </span>
                  {isSelected && <span className="option-check">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const BlockThemesWidget: React.FC<BlockThemesWidgetProps> = ({
  id,
  value,
  onChange,
  formData,
}) => {
  // Normalize value to a dictionary keyed by id
  const blockThemes: Record<string, BlockTheme> = React.useMemo(() => {
    if (!value) return { ...DEFAULT_BLOCK_THEMES };
    if (Array.isArray(value)) {
      const dict: Record<string, BlockTheme> = {};
      value.forEach((bt) => {
        if (bt && bt.id) dict[bt.id] = bt;
      });
      return Object.keys(dict).length > 0 ? dict : { ...DEFAULT_BLOCK_THEMES };
    }
    return Object.keys(value).length > 0 ? value : { ...DEFAULT_BLOCK_THEMES };
  }, [value]);

  // Extract available color groups from formData or defaults
  const availableColorGroups: Record<string, ColorGroup> = React.useMemo(() => {
    const fromForm = formData?.color_groups;
    if (fromForm) {
      if (Array.isArray(fromForm)) {
        const dict: Record<string, ColorGroup> = {};
        fromForm.forEach((cg) => {
          if (cg && cg.id) dict[cg.id] = cg;
        });
        return { ...DEFAULT_COLOR_GROUPS, ...dict };
      }
      return { ...DEFAULT_COLOR_GROUPS, ...fromForm };
    }
    return DEFAULT_COLOR_GROUPS;
  }, [formData?.color_groups]);

  // Collapsible state for each BlockTheme (initially collapsed, matching ColorGroupsWidget)
  const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpand = (themeId: string) => {
    setExpandedThemes((prev) => ({
      ...prev,
      [themeId]: !prev[themeId],
    }));
  };

  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newBack, setNewBack] = useState('primary');
  const [newFront, setNewFront] = useState('neutral');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateBlockTheme = (
    themeId: string,
    field: keyof BlockTheme,
    val: string,
  ) => {
    const target = blockThemes[themeId];
    if (!target) return;
    const updated = {
      ...blockThemes,
      [themeId]: {
        ...target,
        [field]: val,
      },
    };
    onChange(id, updated);
  };

  const handleDeleteBlockTheme = (themeId: string) => {
    if (BASE_BLOCK_THEME_IDS.includes(themeId)) {
      return;
    }
    const updated = { ...blockThemes };
    delete updated[themeId];
    onChange(id, updated);
  };

  const handleAddBlockTheme = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanId) {
      setErrorMsg('O ID do tema de bloco é obrigatório.');
      return;
    }
    if (blockThemes[cleanId]) {
      setErrorMsg(`Um tema de bloco com o ID "${cleanId}" já existe.`);
      return;
    }

    const newTheme: BlockTheme = {
      id: cleanId,
      name:
        newName.trim() || cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
      back_color_group: newBack,
      front_color_group: newFront,
    };

    const updated = {
      ...blockThemes,
      [cleanId]: newTheme,
    };

    onChange(id, updated);
    setNewId('');
    setNewName('');
    setErrorMsg(null);
  };

  const newBackCg =
    availableColorGroups[newBack] || availableColorGroups.primary;
  const newFrontCg =
    availableColorGroups[newFront] || availableColorGroups.neutral;
  const newBackBg = newBackCg?.background_color_light || '#ffffff';
  const newFrontBg = newFrontCg?.background_color_light || '#edeff0';

  return (
    <div className="blockthemes-widget">
      <div className="blockthemes-header">
        <h4>Temas de Bloco (Block Themes)</h4>
        <p className="help">
          Um Tema de Bloco é um conjunto predefinido de dois ColorGroups: a área de
          trás (fundo do bloco, título da listagem) e a área da frente (cartões, chips
          e destaques). Clique em um tema para expandir e editar.
        </p>
      </div>

      <div className="blockthemes-list">
        {Object.values(blockThemes).map((bt) => {
          const backCg =
            availableColorGroups[bt.back_color_group] ||
            availableColorGroups.primary;
          const frontCg =
            availableColorGroups[bt.front_color_group] ||
            availableColorGroups.neutral;
          const backBg = backCg?.background_color_light || '#ffffff';
          const frontBg = frontCg?.background_color_light || '#edeff0';
          const isBase = BASE_BLOCK_THEME_IDS.includes(bt.id);
          const isExpanded = !!expandedThemes[bt.id];

          return (
            <div
              key={bt.id}
              className={`blocktheme-card ${isExpanded ? 'is-expanded' : ''}`}
            >
              <div
                className="blocktheme-card-header"
                onClick={() => toggleExpand(bt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleExpand(bt.id);
                  }
                }}
              >
                <div className="header-left">
                  <span
                    className={`accordion-chevron ${isExpanded ? 'rotated' : ''}`}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                  <strong className="theme-name">{bt.name}</strong>
                  <code className="theme-id">{bt.id}</code>
                  {isBase && <span className="base-tag">Padrão</span>}
                </div>

                <div className="header-right">
                  <SplitColorCircle
                    backColor={backBg}
                    frontColor={frontBg}
                    size={22}
                  />
                  {!isBase ? (
                    <button
                      type="button"
                      className="delete-theme-btn"
                      title="Excluir este tema de bloco"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlockTheme(bt.id);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Collapsible Body */}
              <div
                className="blocktheme-card-body"
                style={{ display: isExpanded ? 'block' : 'none' }}
              >
                <div className="blocktheme-controls">
                  <ColorGroupDropdownSelect
                    id={`back-cg-${bt.id}`}
                    label="Área de Trás (Fundo):"
                    value={bt.back_color_group}
                    availableColorGroups={availableColorGroups}
                    onChange={(val) =>
                      updateBlockTheme(bt.id, 'back_color_group', val)
                    }
                  />

                  <ColorGroupDropdownSelect
                    id={`front-cg-${bt.id}`}
                    label="Área da Frente (Cards):"
                    value={bt.front_color_group}
                    availableColorGroups={availableColorGroups}
                    onChange={(val) =>
                      updateBlockTheme(bt.id, 'front_color_group', val)
                    }
                  />
                </div>

                {/* Visual Preview */}
                <div
                  className="blocktheme-preview"
                  style={{
                    backgroundColor: backBg,
                    color: backCg?.text_color_light || '#000000',
                    fontFamily: backCg?.font_family || 'inherit',
                  }}
                >
                  <div className="preview-back-bar">
                    <span className="preview-back-title">
                      Área de Trás: {backCg?.name || bt.back_color_group}
                    </span>
                    <span
                      className="preview-accent-badge"
                      style={{
                        backgroundColor:
                          backCg?.accent_color_light || '#f4822c',
                        color: backCg?.background_color_light || '#ffffff',
                      }}
                    >
                      Botão Accent
                    </span>
                  </div>

                  {/* Card Front Preview */}
                  <div
                    className="preview-front-card"
                    style={{
                      backgroundColor: frontBg,
                      color: frontCg?.text_color_light || '#000000',
                      fontFamily: frontCg?.font_family || 'inherit',
                    }}
                  >
                    <div className="preview-front-title">
                      Card na Área da Frente (
                      {frontCg?.name || bt.front_color_group})
                    </div>
                    <div
                      className="preview-front-desc"
                      style={{
                        color: frontCg?.subtext_color_light || '#666666',
                      }}
                    >
                      Descrição do card e metadados usando a cor de subtexto.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form to add a new BlockTheme */}
      <div className="add-blocktheme-card">
        <div className="add-card-header">
          <SplitColorCircle
            backColor={newBackBg}
            frontColor={newFrontBg}
            size={22}
          />
          <h5>+ Adicionar Novo Tema de Bloco</h5>
        </div>
        <p className="help">
          Crie um novo tema de bloco selecionando os ColorGroups para a área de trás
          (fundo do bloco) e para a área da frente (cards e destaques).
        </p>

        {errorMsg && <div className="ui error message">{errorMsg}</div>}

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
              availableColorGroups={availableColorGroups}
              onChange={(val) => setNewBack(val)}
            />
          </div>

          <div className="field-item">
            <ColorGroupDropdownSelect
              id="new-bt-front"
              label="ColorGroup da Frente (Cards):"
              value={newFront}
              availableColorGroups={availableColorGroups}
              onChange={(val) => setNewFront(val)}
            />
          </div>
        </div>

        {/* Live Preview of the new theme being configured */}
        <div className="preview-label">Pré-visualização do Novo Tema de Bloco:</div>
        <div
          className="blocktheme-preview"
          style={{
            backgroundColor: newBackBg,
            color: newBackCg?.text_color_light || '#000000',
            fontFamily: newBackCg?.font_family || 'inherit',
            marginBottom: '1.25rem',
          }}
        >
          <div className="preview-back-bar">
            <span className="preview-back-title">
              Área de Trás: {newBackCg?.name || newBack}
            </span>
            <span
              className="preview-accent-badge"
              style={{
                backgroundColor: newBackCg?.accent_color_light || '#f4822c',
                color: newBackCg?.background_color_light || '#ffffff',
              }}
            >
              Botão Accent
            </span>
          </div>

          <div
            className="preview-front-card"
            style={{
              backgroundColor: newFrontBg,
              color: newFrontCg?.text_color_light || '#000000',
              fontFamily: newFrontCg?.font_family || 'inherit',
            }}
          >
            <div className="preview-front-title">
              Card na Área da Frente ({newFrontCg?.name || newFront})
            </div>
            <div
              className="preview-front-desc"
              style={{ color: newFrontCg?.subtext_color_light || '#666666' }}
            >
              Descrição do card e metadados usando a cor de subtexto.
            </div>
          </div>
        </div>

        <button
          type="button"
          className="ui button primary add-blocktheme-btn"
          onClick={handleAddBlockTheme}
        >
          Salvar Tema de Bloco
        </button>
      </div>
    </div>
  );
};

export default BlockThemesWidget;
