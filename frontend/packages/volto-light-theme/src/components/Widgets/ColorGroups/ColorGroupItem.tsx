import React from 'react';
import type { ColorGroup } from '../../../types/theme';
import type { CssPatternPreset } from '../../../config/blockThemes';
import { formatBackgroundImage } from '../../../helpers/themeStyles';
import { PatternLayerControls } from './PatternLayerControls';

export interface ColorGroupItemProps {
  group: ColorGroup;
  isExpanded: boolean;
  isBase: boolean;
  isMobilePreview: boolean;
  onToggleExpand: (groupId: string) => void;
  onToggleDevice: (groupId: string) => void;
  onUpdateGroup: (
    groupId: string,
    field: keyof ColorGroup,
    val: string,
  ) => void;
  onUpdateGroupMultiple: (
    groupId: string,
    updates: Partial<ColorGroup>,
  ) => void;
  onApplyPreset: (groupId: string, preset: CssPatternPreset) => void;
  onFileUpload: (
    groupId: string,
    field: keyof ColorGroup,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const ColorGroupItem: React.FC<ColorGroupItemProps> = ({
  group,
  isExpanded,
  isBase,
  isMobilePreview,
  onToggleExpand,
  onToggleDevice,
  onUpdateGroup,
  onUpdateGroupMultiple,
  onApplyPreset,
  onFileUpload,
  onDeleteGroup,
}) => {
  const hasImageLayer = !!(
    group.bg_image_light_desktop ||
    group.bg_image_light_mobile ||
    group.bg_image_dark_desktop ||
    group.bg_image_dark_mobile
  );

  // Active preview images
  const lightImgPreview = formatBackgroundImage(
    isMobilePreview
      ? group.bg_image_light_mobile || group.bg_image_light_desktop
      : group.bg_image_light_desktop,
  );
  const darkImgPreview = formatBackgroundImage(
    isMobilePreview
      ? group.bg_image_dark_mobile ||
          group.bg_image_dark_desktop ||
          group.bg_image_light_mobile ||
          group.bg_image_light_desktop
      : group.bg_image_dark_desktop || group.bg_image_light_desktop,
  );

  return (
    <div
      key={group.id}
      className={`colorgroup-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
    >
      {/* Collapsed Header / Bar */}
      <div
        className="colorgroup-card-header"
        onClick={() => onToggleExpand(group.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggleExpand(group.id);
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
          {hasImageLayer && (
            <span
              className="layer-tag"
              title="Possui 2ª camada de imagem/padrão configurada"
            >
              2ª Camada Ativa
            </span>
          )}
        </div>

        <div className="header-right">
          {/* 4 Mini Color Swatch Dots */}
          <div className="color-swatches-preview">
            <span
              className="swatch-dot"
              style={{
                backgroundColor: group.background_color_light || '#ffffff',
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
                backgroundColor: group.accent_color_light || '#1971c2',
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
                onDeleteGroup(group.id);
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
              onUpdateGroup(group.id, 'font_family', e.target.value)
            }
            placeholder="ex: Inter, sans-serif"
          />
        </div>

        <div className="colorgroup-colors-grid">
          <div className="color-row">
            <span className="color-label">
              1ª Camada: Fundo (Background Color):
            </span>
            <div className="color-inputs">
              <div className="mode-input">
                <span className="mode-tag">Claro</span>
                <input
                  type="color"
                  value={group.background_color_light || '#ffffff'}
                  onChange={(e) =>
                    onUpdateGroup(
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
                    onUpdateGroup(
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
                    onUpdateGroup(
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
                    onUpdateGroup(
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
            <span className="color-label">Texto (Text Color):</span>
            <div className="color-inputs">
              <div className="mode-input">
                <span className="mode-tag">Claro</span>
                <input
                  type="color"
                  value={group.text_color_light || '#000000'}
                  onChange={(e) =>
                    onUpdateGroup(group.id, 'text_color_light', e.target.value)
                  }
                />
                <input
                  type="text"
                  className="hex-input"
                  value={group.text_color_light || ''}
                  onChange={(e) =>
                    onUpdateGroup(group.id, 'text_color_light', e.target.value)
                  }
                />
              </div>
              <div className="mode-input">
                <span className="mode-tag">Escuro</span>
                <input
                  type="color"
                  value={group.text_color_dark || '#ffffff'}
                  onChange={(e) =>
                    onUpdateGroup(group.id, 'text_color_dark', e.target.value)
                  }
                />
                <input
                  type="text"
                  className="hex-input"
                  value={group.text_color_dark || ''}
                  onChange={(e) =>
                    onUpdateGroup(group.id, 'text_color_dark', e.target.value)
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
                    onUpdateGroup(
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
                    onUpdateGroup(
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
                    onUpdateGroup(
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
                    onUpdateGroup(
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
                  value={group.accent_color_light || '#1971c2'}
                  onChange={(e) =>
                    onUpdateGroup(
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
                    onUpdateGroup(
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
                  value={group.accent_color_dark || '#74c0fc'}
                  onChange={(e) =>
                    onUpdateGroup(group.id, 'accent_color_dark', e.target.value)
                  }
                />
                <input
                  type="text"
                  className="hex-input"
                  value={group.accent_color_dark || ''}
                  onChange={(e) =>
                    onUpdateGroup(group.id, 'accent_color_dark', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2nd Background Layer: Image and CSS Patterns Section */}
        <PatternLayerControls
          group={group}
          onUpdateGroup={onUpdateGroup}
          onApplyPreset={onApplyPreset}
          onFileUpload={onFileUpload}
        />

        {/* Previews with Device Switch */}
        <div className="preview-header-row">
          <span className="preview-label">
            Pré-visualização do Grupo (Cor + 2ª Camada Sobreposta):
          </span>
          <button
            type="button"
            className="device-toggle-btn"
            onClick={() => onToggleDevice(group.id)}
            title="Alternar simulação de dispositivo"
          >
            Simular:{' '}
            <strong>
              {isMobilePreview ? 'Mobile (Telas Pequenas)' : 'Desktop'}
            </strong>
          </button>
        </div>

        <div className="colorgroup-preview-container">
          {/* Light Mode */}
          <div
            className="preview-card light"
            style={{
              backgroundColor: group.background_color_light || '#ffffff',
              backgroundImage: lightImgPreview,
              backgroundSize: group.bg_size || 'auto',
              backgroundRepeat: group.bg_repeat || 'repeat',
              backgroundPosition: group.bg_position || 'center',
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
              Cor de fundo com 2ª camada sobreposta.
            </p>
            <button
              type="button"
              style={{
                backgroundColor: group.accent_color_light || '#1971c2',
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

          {/* Dark Mode */}
          <div
            className="preview-card dark"
            style={{
              backgroundColor: group.background_color_dark || '#000000',
              backgroundImage: darkImgPreview,
              backgroundSize: group.bg_size || 'auto',
              backgroundRepeat: group.bg_repeat || 'repeat',
              backgroundPosition: group.bg_position || 'center',
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
              Cor de fundo com 2ª camada sobreposta.
            </p>
            <button
              type="button"
              style={{
                backgroundColor: group.accent_color_dark || '#74c0fc',
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
};
