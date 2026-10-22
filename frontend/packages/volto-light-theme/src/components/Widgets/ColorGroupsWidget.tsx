import React, { useState } from 'react';
import type { ColorGroup } from '../../types/theme';
import {
  DEFAULT_COLOR_GROUPS,
  BASE_COLOR_GROUP_IDS,
} from '../../config/blockThemes';

export interface ColorGroupsWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: Record<string, ColorGroup> | ColorGroup[];
  onChange: (id: string, value: Record<string, ColorGroup>) => void;
  required?: boolean;
  [key: string]: any;
}

export const ColorGroupsWidget: React.FC<ColorGroupsWidgetProps> = ({
  id,
  value,
  onChange,
  objectvalue,
}) => {
  // Normalize value to a dictionary keyed by id
  const groups: Record<string, ColorGroup> = React.useMemo(() => {
    if (!value) return { ...DEFAULT_COLOR_GROUPS };
    if (Array.isArray(value)) {
      const dict: Record<string, ColorGroup> = {};
      value.forEach((cg) => {
        if (cg && cg.id) dict[cg.id] = cg;
      });
      return Object.keys(dict).length > 0 ? dict : { ...DEFAULT_COLOR_GROUPS };
    }
    return Object.keys(value).length > 0 ? value : { ...DEFAULT_COLOR_GROUPS };
  }, [value]);

  // Collapsible state for each ColorGroup (initially collapsed)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newFont, setNewFont] = useState('Inter, sans-serif');
  const [newBgLight, setNewBgLight] = useState('#ffffff');
  const [newBgDark, setNewBgDark] = useState('#1e1e1e');
  const [newTextLight, setNewTextLight] = useState('#000000');
  const [newTextDark, setNewTextDark] = useState('#ffffff');
  const [newSubtextLight, setNewSubtextLight] = useState('#666666');
  const [newSubtextDark, setNewSubtextDark] = useState('#cccccc');
  const [newAccentLight, setNewAccentLight] = useState('#f4822c');
  const [newAccentDark, setNewAccentDark] = useState('#f4822c');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateGroup = (
    groupId: string,
    field: keyof ColorGroup,
    val: string,
  ) => {
    const target = groups[groupId];
    if (!target) return;
    const updated = {
      ...groups,
      [groupId]: {
        ...target,
        [field]: val,
      },
    };
    onChange(id, updated);
  };

  const handleDeleteGroup = (groupId: string) => {
    if (BASE_COLOR_GROUP_IDS.includes(groupId)) {
      return;
    }
    const updated = { ...groups };
    delete updated[groupId];
    onChange(id, updated);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanId) {
      setErrorMsg('O ID do ColorGroup é obrigatório.');
      return;
    }
    if (groups[cleanId]) {
      setErrorMsg(`Um ColorGroup com o ID "${cleanId}" já existe.`);
      return;
    }

    const newGroup: ColorGroup = {
      id: cleanId,
      name:
        newName.trim() || cleanId.charAt(0).toUpperCase() + cleanId.slice(1),
      font_family: newFont.trim() || 'Inter, sans-serif',
      background_color_light: newBgLight,
      background_color_dark: newBgDark,
      text_color_light: newTextLight,
      text_color_dark: newTextDark,
      subtext_color_light: newSubtextLight,
      subtext_color_dark: newSubtextDark,
      accent_color_light: newAccentLight,
      accent_color_dark: newAccentDark,
    };

    const updated = {
      ...groups,
      [cleanId]: newGroup,
    };

    onChange(id, updated);
    // Expand the newly added group automatically
    setExpandedGroups((prev) => ({ ...prev, [cleanId]: true }));
    setNewId('');
    setNewName('');
    setErrorMsg(null);
  };

  return (
    <div className="colorgroups-widget">
      <div className="colorgroups-header">
        <h4>Color Groups</h4>
        <p className="help">
          Um ColorGroup define um conjunto de 4 cores (fundo, texto, subtexto e
          accent) com suas variações para modo claro e escuro, e uma fonte de
          texto. Clique em um grupo para expandir e editar.
        </p>
      </div>

      <div className="colorgroups-list">
        {Object.values(groups).map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const isBase = BASE_COLOR_GROUP_IDS.includes(group.id);

          return (
            <div
              key={group.id}
              className={`colorgroup-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
            >
              {/* Collapsed Header / Bar */}
              <div
                className="colorgroup-card-header"
                onClick={() => toggleExpand(group.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleExpand(group.id);
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
                  <strong className="group-name">{group.name}</strong>
                  <code className="group-id">{group.id}</code>
                  {isBase && (
                    <span className="base-tag" title="Grupo base protegido">
                      Base
                    </span>
                  )}
                </div>

                <div className="header-right">
                  {/* 4 Mini Color Swatch Dots */}
                  <div className="color-swatches-preview">
                    <span
                      className="swatch-dot"
                      style={{
                        backgroundColor:
                          group.background_color_light || '#ffffff',
                      }}
                      title={`Fundo: ${group.background_color_light}`}
                    />
                    <span
                      className="swatch-dot"
                      style={{
                        backgroundColor: group.text_color_light || '#000000',
                      }}
                      title={`Texto: ${group.text_color_light}`}
                    />
                    <span
                      className="swatch-dot"
                      style={{
                        backgroundColor: group.subtext_color_light || '#666666',
                      }}
                      title={`Subtexto: ${group.subtext_color_light}`}
                    />
                    <span
                      className="swatch-dot"
                      style={{
                        backgroundColor: group.accent_color_light || '#f4822c',
                      }}
                      title={`Accent: ${group.accent_color_light}`}
                    />
                  </div>

                  {/* Delete button only for custom groups */}
                  {!isBase ? (
                    <button
                      type="button"
                      className="delete-group-btn"
                      title="Excluir este ColorGroup"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(group.id);
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

              {/* Expandable Editor and Previews */}
              <div
                className="colorgroup-card-body"
                style={{ display: isExpanded ? 'block' : 'none' }}
              >
                <div className="group-font-row">
                  <label htmlFor={`font-${group.id}`}>Fonte (Font Family):</label>
                  <input
                    id={`font-${group.id}`}
                    type="text"
                    value={group.font_family || ''}
                    onChange={(e) =>
                      updateGroup(group.id, 'font_family', e.target.value)
                    }
                    placeholder="ex: Inter, sans-serif"
                  />
                </div>

                <div className="colorgroup-colors-grid">
                  <div className="color-row">
                    <span className="color-label">Fundo (Background):</span>
                    <div className="color-inputs">
                      <div className="mode-input">
                        <span className="mode-tag">Claro</span>
                        <input
                          type="color"
                          value={group.background_color_light || '#ffffff'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'background_color_light',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.background_color_light || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'background_color_light',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mode-input">
                        <span className="mode-tag">Escuro</span>
                        <input
                          type="color"
                          value={group.background_color_dark || '#000000'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'background_color_dark',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.background_color_dark || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'background_color_dark',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="color-row">
                    <span className="color-label">Texto (Text):</span>
                    <div className="color-inputs">
                      <div className="mode-input">
                        <span className="mode-tag">Claro</span>
                        <input
                          type="color"
                          value={group.text_color_light || '#000000'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'text_color_light',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.text_color_light || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'text_color_light',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mode-input">
                        <span className="mode-tag">Escuro</span>
                        <input
                          type="color"
                          value={group.text_color_dark || '#ffffff'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'text_color_dark',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.text_color_dark || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'text_color_dark',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="color-row">
                    <span className="color-label">Subtexto (Subtext):</span>
                    <div className="color-inputs">
                      <div className="mode-input">
                        <span className="mode-tag">Claro</span>
                        <input
                          type="color"
                          value={group.subtext_color_light || '#666666'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'subtext_color_light',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.subtext_color_light || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'subtext_color_light',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mode-input">
                        <span className="mode-tag">Escuro</span>
                        <input
                          type="color"
                          value={group.subtext_color_dark || '#cccccc'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'subtext_color_dark',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.subtext_color_dark || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'subtext_color_dark',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="color-row">
                    <span className="color-label">Accent:</span>
                    <div className="color-inputs">
                      <div className="mode-input">
                        <span className="mode-tag">Claro</span>
                        <input
                          type="color"
                          value={group.accent_color_light || '#f4822c'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'accent_color_light',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.accent_color_light || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'accent_color_light',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mode-input">
                        <span className="mode-tag">Escuro</span>
                        <input
                          type="color"
                          value={group.accent_color_dark || '#f4822c'}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'accent_color_dark',
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          className="hex-input"
                          value={group.accent_color_dark || ''}
                          onChange={(e) =>
                            updateGroup(
                              group.id,
                              'accent_color_dark',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previews */}
                <div className="preview-label">Pré-visualização do Grupo:</div>
                <div className="colorgroup-preview-container">
                  {/* Modo Claro */}
                  <div
                    className="preview-card light"
                    style={{
                      backgroundColor:
                        group.background_color_light || '#ffffff',
                      color: group.text_color_light || '#000000',
                      fontFamily: group.font_family || 'inherit',
                    }}
                  >
                    <span className="preview-badge">MODO CLARO</span>
                    <h5
                      style={{
                        color: group.text_color_light || '#000000',
                        margin: '0.4rem 0',
                      }}
                    >
                      {group.name} Título
                    </h5>
                    <p
                      style={{
                        color: group.subtext_color_light || '#666666',
                        fontSize: '0.85rem',
                        margin: '0.2rem 0 0.6rem 0',
                      }}
                    >
                      Exemplo de subtexto explicativo.
                    </p>
                    <button
                      type="button"
                      style={{
                        backgroundColor:
                          group.accent_color_light || '#f4822c',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Ação Accent
                    </button>
                  </div>

                  {/* Modo Escuro */}
                  <div
                    className="preview-card dark"
                    style={{
                      backgroundColor:
                        group.background_color_dark || '#000000',
                      color: group.text_color_dark || '#ffffff',
                      fontFamily: group.font_family || 'inherit',
                    }}
                  >
                    <span className="preview-badge dark-tag">MODO ESCURO</span>
                    <h5
                      style={{
                        color: group.text_color_dark || '#ffffff',
                        margin: '0.4rem 0',
                      }}
                    >
                      {group.name} Título
                    </h5>
                    <p
                      style={{
                        color: group.subtext_color_dark || '#cccccc',
                        fontSize: '0.85rem',
                        margin: '0.2rem 0 0.6rem 0',
                      }}
                    >
                      Exemplo de subtexto explicativo.
                    </p>
                    <button
                      type="button"
                      style={{
                        backgroundColor:
                          group.accent_color_dark || '#f4822c',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Ação Accent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form to add a new ColorGroup */}
      <div className="add-colorgroup-card">
        <h5>+ Adicionar Novo ColorGroup</h5>
        <p className="help">
          Ao criar um novo ColorGroup neste tema, ele será sincronizado
          automaticamente para todos os outros temas do site com valores padrão.
        </p>

        {errorMsg && <div className="ui error message">{errorMsg}</div>}

        <div className="add-fields-grid">
          <div className="field-item">
            <label htmlFor="new-cg-id">ID do Grupo (ex: vermelho):</label>
            <input
              id="new-cg-id"
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="ex: vermelho"
            />
          </div>

          <div className="field-item">
            <label htmlFor="new-cg-name">Nome Exibido:</label>
            <input
              id="new-cg-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ex: Vermelho Natal"
            />
          </div>

          <div className="field-item">
            <label htmlFor="new-cg-font">Fonte:</label>
            <input
              id="new-cg-font"
              type="text"
              value={newFont}
              onChange={(e) => setNewFont(e.target.value)}
              placeholder="ex: Inter, sans-serif"
            />
          </div>
        </div>

        <div className="add-colors-row">
          <div className="color-pair">
            <span>Fundo (Claro / Escuro):</span>
            <input
              type="color"
              value={newBgLight}
              onChange={(e) => setNewBgLight(e.target.value)}
              title="Fundo Claro"
            />
            <input
              type="color"
              value={newBgDark}
              onChange={(e) => setNewBgDark(e.target.value)}
              title="Fundo Escuro"
            />
          </div>

          <div className="color-pair">
            <span>Texto (Claro / Escuro):</span>
            <input
              type="color"
              value={newTextLight}
              onChange={(e) => setNewTextLight(e.target.value)}
              title="Texto Claro"
            />
            <input
              type="color"
              value={newTextDark}
              onChange={(e) => setNewTextDark(e.target.value)}
              title="Texto Escuro"
            />
          </div>

          <div className="color-pair">
            <span>Subtexto (Claro / Escuro):</span>
            <input
              type="color"
              value={newSubtextLight}
              onChange={(e) => setNewSubtextLight(e.target.value)}
              title="Subtexto Claro"
            />
            <input
              type="color"
              value={newSubtextDark}
              onChange={(e) => setNewSubtextDark(e.target.value)}
              title="Subtexto Escuro"
            />
          </div>

          <div className="color-pair">
            <span>Accent (Claro / Escuro):</span>
            <input
              type="color"
              value={newAccentLight}
              onChange={(e) => setNewAccentLight(e.target.value)}
              title="Accent Claro"
            />
            <input
              type="color"
              value={newAccentDark}
              onChange={(e) => setNewAccentDark(e.target.value)}
              title="Accent Escuro"
            />
          </div>
        </div>

        <button
          type="button"
          className="ui button primary add-colorgroup-btn"
          onClick={handleAddGroup}
        >
          Salvar Novo ColorGroup
        </button>
      </div>
    </div>
  );
};

export default ColorGroupsWidget;
