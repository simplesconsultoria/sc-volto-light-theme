import React from 'react';
import type { ColorGroup } from '../../../types/theme';
import {
  CSS_PATTERN_PRESETS,
  type CssPatternPreset,
} from '../../../config/blockThemes';
import { renderPatternPresetIcon } from './icons';
import {
  SIZE_OPTIONS,
  SIZE_PATTERN_PILLS,
  REPEAT_OPTIONS,
  POSITION_COMPASS,
} from './constants';

export interface PatternLayerControlsProps {
  group: ColorGroup;
  onUpdateGroup: (
    groupId: string,
    field: keyof ColorGroup,
    val: string,
  ) => void;
  onApplyPreset: (groupId: string, preset: CssPatternPreset) => void;
  onFileUpload: (
    groupId: string,
    field: keyof ColorGroup,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const PatternLayerControls: React.FC<PatternLayerControlsProps> = ({
  group,
  onUpdateGroup,
  onApplyPreset,
  onFileUpload,
}) => {
  return (
    <div className="colorgroup-image-layer">
      <div className="layer-header">
        <div className="layer-title-wrapper">
          <span className="layer-badge">2ª Camada</span>
          <strong className="layer-title">
            Imagem e Padrões CSS de Fundo (Background Image Layer)
          </strong>
        </div>
        <p className="layer-help">
          Adicione uma imagem (link/arquivo) ou padrão CSS. A imagem é
          renderizada em cima da cor de fundo configurada acima, permitindo
          transparência e sobreposição responsiva.
        </p>
      </div>

      {/* Quick CSS Pattern Presets */}
      <div className="presets-section">
        <span className="presets-label">
          Padrões CSS Prontos (Presets estilo Acreative):
        </span>
        <div className="pattern-presets-list">
          {CSS_PATTERN_PRESETS.map((preset) => {
            const isSelected =
              group.bg_image_light_desktop === preset.css ||
              (!group.bg_image_light_desktop && preset.id === 'none');
            return (
              <button
                key={preset.id}
                type="button"
                className={`preset-pill ${isSelected ? 'is-active' : ''}`}
                onClick={() => onApplyPreset(group.id, preset)}
                title={preset.description}
              >
                <span className="preset-pill-icon" aria-hidden="true">
                  {renderPatternPresetIcon(preset.id)}
                </span>
                <span className="preset-pill-label">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive & Theme Matrix for Image Sources */}
      <div className="image-matrix-grid">
        {/* Light Mode */}
        <div className="mode-matrix-card light-mode-card">
          <div className="mode-matrix-header">
            <span className="mode-indicator light-dot" />
            <strong>Modo Claro (Light Mode)</strong>
          </div>

          <div className="image-field-block">
            <label htmlFor={`img-light-desk-${group.id}`}>
              Desktop (Arquivo, Link ou Pattern CSS):
            </label>
            <div className="image-input-row">
              <input
                id={`img-light-desk-${group.id}`}
                type="text"
                value={group.bg_image_light_desktop || ''}
                onChange={(e) =>
                  onUpdateGroup(
                    group.id,
                    'bg_image_light_desktop',
                    e.target.value,
                  )
                }
                placeholder="https://... ou radial-gradient(...)"
              />
              <label
                className="file-upload-btn"
                title="Enviar imagem do seu computador"
              >
                <span>Arquivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onFileUpload(group.id, 'bg_image_light_desktop', e)
                  }
                />
              </label>
              {group.bg_image_light_desktop ? (
                <button
                  type="button"
                  className="clear-field-btn"
                  onClick={() =>
                    onUpdateGroup(group.id, 'bg_image_light_desktop', '')
                  }
                  title="Limpar imagem"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>

          <div className="image-field-block">
            <label htmlFor={`img-light-mob-${group.id}`}>
              Mobile (Opcional - caso queira imagem diferente em telas
              pequenas):
            </label>
            <div className="image-input-row">
              <input
                id={`img-light-mob-${group.id}`}
                type="text"
                value={group.bg_image_light_mobile || ''}
                onChange={(e) =>
                  onUpdateGroup(
                    group.id,
                    'bg_image_light_mobile',
                    e.target.value,
                  )
                }
                placeholder="ex: https://.../banner-mobile.webp"
              />
              <label
                className="file-upload-btn"
                title="Enviar imagem do seu computador"
              >
                <span>Arquivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onFileUpload(group.id, 'bg_image_light_mobile', e)
                  }
                />
              </label>
              {group.bg_image_light_mobile ? (
                <button
                  type="button"
                  className="clear-field-btn"
                  onClick={() =>
                    onUpdateGroup(group.id, 'bg_image_light_mobile', '')
                  }
                  title="Limpar imagem"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Dark Mode */}
        <div className="mode-matrix-card dark-mode-card">
          <div className="mode-matrix-header">
            <span className="mode-indicator dark-dot" />
            <strong>Modo Escuro (Dark Mode)</strong>
          </div>

          <div className="image-field-block">
            <label htmlFor={`img-dark-desk-${group.id}`}>
              Desktop (Opcional - usa a versão clara como padrão se vazio):
            </label>
            <div className="image-input-row">
              <input
                id={`img-dark-desk-${group.id}`}
                type="text"
                value={group.bg_image_dark_desktop || ''}
                onChange={(e) =>
                  onUpdateGroup(
                    group.id,
                    'bg_image_dark_desktop',
                    e.target.value,
                  )
                }
                placeholder="ex: https://.../bg-dark.svg"
              />
              <label
                className="file-upload-btn"
                title="Enviar imagem do seu computador"
              >
                <span>Arquivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onFileUpload(group.id, 'bg_image_dark_desktop', e)
                  }
                />
              </label>
              {group.bg_image_dark_desktop ? (
                <button
                  type="button"
                  className="clear-field-btn"
                  onClick={() =>
                    onUpdateGroup(group.id, 'bg_image_dark_desktop', '')
                  }
                  title="Limpar imagem"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>

          <div className="image-field-block">
            <label htmlFor={`img-dark-mob-${group.id}`}>
              Mobile (Opcional - telas pequenas modo escuro):
            </label>
            <div className="image-input-row">
              <input
                id={`img-dark-mob-${group.id}`}
                type="text"
                value={group.bg_image_dark_mobile || ''}
                onChange={(e) =>
                  onUpdateGroup(
                    group.id,
                    'bg_image_dark_mobile',
                    e.target.value,
                  )
                }
                placeholder="ex: https://.../bg-dark-mobile.svg"
              />
              <label
                className="file-upload-btn"
                title="Enviar imagem do seu computador"
              >
                <span>Arquivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onFileUpload(group.id, 'bg_image_dark_mobile', e)
                  }
                />
              </label>
              {group.bg_image_dark_mobile ? (
                <button
                  type="button"
                  className="clear-field-btn"
                  onClick={() =>
                    onUpdateGroup(group.id, 'bg_image_dark_mobile', '')
                  }
                  title="Limpar imagem"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Layer Sizing, Repeat, and Position Controls */}
      <div className="layer-controls-interactive layer-controls-row">
        {/* Sizing (Size / Scale) */}
        <div className="control-group-box">
          <span className="control-group-label">
            Tamanho (background-size):
          </span>
          <div className="icon-button-group button-group-row">
            {SIZE_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              const isActive = (group.bg_size || 'auto') === opt.value;
              const cleanVal = opt.value.replace(/[^a-z0-9]/gi, '-');
              return (
                <button
                  key={opt.value}
                  id={`bg-size-${cleanVal}-${group.id}`}
                  type="button"
                  className={`icon-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => onUpdateGroup(group.id, 'bg_size', opt.value)}
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
                className={`pill-btn size-pill ${group.bg_size === pill.value ? 'is-active' : ''}`}
                onClick={() => onUpdateGroup(group.id, 'bg_size', pill.value)}
                title={pill.title}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <input
            id={`bg-size-${group.id}`}
            type="text"
            className="custom-input-compact"
            value={group.bg_size || ''}
            onChange={(e) => onUpdateGroup(group.id, 'bg_size', e.target.value)}
            placeholder="ou digite custom (ex: 40px 40px)"
          />
        </div>

        {/* Repeat */}
        <div className="control-group-box">
          <span className="control-group-label">
            Repetição (background-repeat):
          </span>
          <div className="icon-button-group button-group-row">
            {REPEAT_OPTIONS.map((opt) => {
              const IconComp = opt.icon;
              const isActive = (group.bg_repeat || 'repeat') === opt.value;
              const cleanVal = opt.value.replace(/[^a-z0-9]/gi, '-');
              return (
                <button
                  key={opt.value}
                  id={`bg-repeat-${cleanVal}-${group.id}`}
                  type="button"
                  className={`icon-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() =>
                    onUpdateGroup(group.id, 'bg_repeat', opt.value)
                  }
                  title={opt.title}
                >
                  <IconComp />
                  <span>{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>

          <input
            id={`bg-repeat-${group.id}`}
            type="text"
            className="custom-input-compact"
            value={group.bg_repeat || ''}
            onChange={(e) =>
              onUpdateGroup(group.id, 'bg_repeat', e.target.value)
            }
            placeholder="ou digite custom (ex: repeat space)"
          />
        </div>

        {/* Position (3x3 Compass) */}
        <div className="control-group-box">
          <span className="control-group-label">
            Posição (background-position):
          </span>
          <div className="compass-grid-wrapper">
            <div className="compass-grid">
              {POSITION_COMPASS.map((pos) => {
                const currentPos = (group.bg_position || 'center')
                  .toLowerCase()
                  .trim();
                const isActive = currentPos === pos.value;
                return (
                  <button
                    key={pos.value}
                    id={`bg-pos-${pos.idKey}-${group.id}`}
                    type="button"
                    className={`compass-cell-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() =>
                      onUpdateGroup(group.id, 'bg_position', pos.value)
                    }
                    title={pos.label}
                  >
                    {pos.arrow}
                  </button>
                );
              })}
            </div>
          </div>

          <input
            id={`bg-pos-${group.id}`}
            type="text"
            className="custom-input-compact"
            value={group.bg_position || ''}
            onChange={(e) =>
              onUpdateGroup(group.id, 'bg_position', e.target.value)
            }
            placeholder="ou digite custom (ex: 50% 20px)"
          />
        </div>
      </div>
    </div>
  );
};
