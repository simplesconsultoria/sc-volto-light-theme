import React, { useState } from 'react';
import type { ColorGroup } from '../../types/theme';
import {
  DEFAULT_COLOR_GROUPS,
  BASE_COLOR_GROUP_IDS,
  type CssPatternPreset,
} from '../../config/blockThemes';
import {
  SIZE_OPTIONS,
  SIZE_PATTERN_PILLS,
  REPEAT_OPTIONS,
  POSITION_COMPASS,
} from './ColorGroups/constants';
import { ColorGroupItem } from './ColorGroups/ColorGroupItem';

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

  // Device preview toggle (desktop vs mobile) per group
  const [previewDevice, setPreviewDevice] = useState<
    Record<string, 'desktop' | 'mobile'>
  >({});

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleDevice = (groupId: string) => {
    setPreviewDevice((prev) => ({
      ...prev,
      [groupId]: prev[groupId] === 'mobile' ? 'desktop' : 'mobile',
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

  // Background layer fields for new group
  const [newBgImageLightDesk, setNewBgImageLightDesk] = useState('');
  const [newBgImageLightMob, setNewBgImageLightMob] = useState('');
  const [newBgImageDarkDesk, setNewBgImageDarkDesk] = useState('');
  const [newBgImageDarkMob, setNewBgImageDarkMob] = useState('');
  const [newBgSize, setNewBgSize] = useState('auto');
  const [newBgRepeat, setNewBgRepeat] = useState('repeat');
  const [newBgPosition, setNewBgPosition] = useState('center');

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

  const updateGroupMultiple = (
    groupId: string,
    updates: Partial<ColorGroup>,
  ) => {
    const target = groups[groupId];
    if (!target) return;
    const updated = {
      ...groups,
      [groupId]: {
        ...target,
        ...updates,
      },
    };
    onChange(id, updated);
  };

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

    updateGroupMultiple(groupId, {
      bg_image_light_desktop: preset.css,
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
    if (BASE_COLOR_GROUP_IDS.includes(groupId)) {
      return;
    }
    const updated = { ...groups };
    delete updated[groupId];
    onChange(id, updated);
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
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
      bg_image_light_desktop: newBgImageLightDesk,
      bg_image_light_mobile: newBgImageLightMob,
      bg_image_dark_desktop: newBgImageDarkDesk,
      bg_image_dark_mobile: newBgImageDarkMob,
      bg_size: newBgSize,
      bg_repeat: newBgRepeat,
      bg_position: newBgPosition,
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
    setNewBgImageLightDesk('');
    setNewBgImageLightMob('');
    setNewBgImageDarkDesk('');
    setNewBgImageDarkMob('');
    setErrorMsg(null);
  };

  return (
    <div className="colorgroups-widget">
      <div className="colorgroups-header">
        <h4>Color Groups</h4>
        <p className="help">
          Um ColorGroup define um conjunto de 4 cores (fundo, texto, subtexto e
          accent), uma camada de imagem/padrão CSS sobreposta à cor de fundo, e
          uma fonte de texto. Clique em um grupo para expandir e editar.
        </p>
      </div>

      <div className="colorgroups-list">
        {Object.values(groups).map((group) => (
          <ColorGroupItem
            key={group.id}
            group={group}
            isExpanded={!!expandedGroups[group.id]}
            isBase={BASE_COLOR_GROUP_IDS.includes(group.id)}
            isMobilePreview={previewDevice[group.id] === 'mobile'}
            onToggleExpand={toggleExpand}
            onToggleDevice={toggleDevice}
            onUpdateGroup={updateGroup}
            onUpdateGroupMultiple={updateGroupMultiple}
            onApplyPreset={handleApplyPreset}
            onFileUpload={handleFileUpload}
            onDeleteGroup={handleDeleteGroup}
          />
        ))}
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

        {/* 2nd layer config for new group */}
        <div className="add-image-layer-row">
          <div className="field-item">
            <label htmlFor="new-cg-img">
              2ª Camada: Imagem ou Padrão CSS Inicial (Desktop Claro):
            </label>
            <input
              id="new-cg-img"
              type="text"
              value={newBgImageLightDesk}
              onChange={(e) => setNewBgImageLightDesk(e.target.value)}
              placeholder="https://... ou radial-gradient(...)"
            />
          </div>

          <div className="layer-controls-interactive add-layer-controls-interactive">
            {/* Tamanho */}
            <div className="control-group-box">
              <span className="control-group-label">
                Tamanho (background-size):
              </span>
              <div className="icon-button-group button-group-row">
                {SIZE_OPTIONS.map((opt) => {
                  const isActive = newBgSize === opt.value;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`icon-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => setNewBgSize(opt.value)}
                      title={opt.title}
                    >
                      <IconComp />
                      <span>{opt.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick pattern pixel sizes */}
              <div className="pattern-pills-row">
                <span className="pills-hint">Patterns CSS:</span>
                {SIZE_PATTERN_PILLS.map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    className={`pill-btn size-pill ${newBgSize === pill.value ? 'is-active' : ''}`}
                    onClick={() => setNewBgSize(pill.value)}
                    title={pill.title}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              <input
                id="new-cg-size"
                type="text"
                className="custom-input-compact"
                value={newBgSize}
                onChange={(e) => setNewBgSize(e.target.value)}
                placeholder="ou digite custom (ex: 40px 40px)"
              />
            </div>

            {/* Repetição */}
            <div className="control-group-box">
              <span className="control-group-label">
                Repetição (background-repeat):
              </span>
              <div className="icon-button-group button-group-row">
                {REPEAT_OPTIONS.map((opt) => {
                  const isActive = newBgRepeat === opt.value;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`icon-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => setNewBgRepeat(opt.value)}
                      title={opt.title}
                    >
                      <IconComp />
                      <span>{opt.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              <input
                id="new-cg-repeat"
                type="text"
                className="custom-input-compact"
                value={newBgRepeat}
                onChange={(e) => setNewBgRepeat(e.target.value)}
                placeholder="ou digite custom (ex: repeat space)"
              />

              <select
                id="new-cg-repeat-select"
                value={newBgRepeat}
                onChange={(e) => setNewBgRepeat(e.target.value)}
                className="sr-only"
                style={{ display: 'none' }}
              >
                <option value="repeat">repeat</option>
                <option value="no-repeat">no-repeat</option>
                <option value="repeat-x">repeat-x</option>
                <option value="repeat-y">repeat-y</option>
              </select>
            </div>

            {/* Posição */}
            <div className="control-group-box">
              <span className="control-group-label">
                Posição (background-position):
              </span>
              <div className="compass-grid-wrapper">
                <div className="compass-grid">
                  {POSITION_COMPASS.map((pos) => {
                    const isActive = newBgPosition === pos.value;
                    return (
                      <button
                        key={pos.value}
                        type="button"
                        className={`compass-cell-btn ${isActive ? 'is-active' : ''}`}
                        onClick={() => setNewBgPosition(pos.value)}
                        title={pos.label}
                      >
                        {pos.arrow}
                      </button>
                    );
                  })}
                </div>
              </div>
              <input
                id="new-cg-pos"
                type="text"
                className="custom-input-compact"
                value={newBgPosition}
                onChange={(e) => setNewBgPosition(e.target.value)}
                placeholder="ou digite custom (ex: 50% 20px)"
              />
            </div>
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
