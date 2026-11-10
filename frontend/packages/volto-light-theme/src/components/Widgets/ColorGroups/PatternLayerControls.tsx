import React from 'react';
import type { ColorGroup } from '../../../types/theme';
import {
  CSS_PATTERN_PRESETS,
  type CssPatternPreset,
} from '../../../config/blockThemes';
import { renderPatternPresetIcon } from './icons';
import { LayerSizingControls } from './LayerSizingControls';

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

type ImageField =
  | 'bg_image_light_desktop'
  | 'bg_image_light_mobile'
  | 'bg_image_dark_desktop'
  | 'bg_image_dark_mobile';

interface ImageFieldSpec {
  field: ImageField;
  idPrefix: string;
  label: string;
  placeholder: string;
}

/** The four image sources of the layer: light/dark x desktop/mobile. */
const IMAGE_MATRIX: {
  mode: 'light' | 'dark';
  title: string;
  fields: ImageFieldSpec[];
}[] = [
  {
    mode: 'light',
    title: 'Modo Claro (Light Mode)',
    fields: [
      {
        field: 'bg_image_light_desktop',
        idPrefix: 'img-light-desk',
        label: 'Desktop (Arquivo, Link ou Pattern CSS):',
        placeholder: 'https://... ou radial-gradient(...)',
      },
      {
        field: 'bg_image_light_mobile',
        idPrefix: 'img-light-mob',
        label:
          'Mobile (Opcional - caso queira imagem diferente em telas pequenas):',
        placeholder: 'ex: https://.../banner-mobile.webp',
      },
    ],
  },
  {
    mode: 'dark',
    title: 'Modo Escuro (Dark Mode)',
    fields: [
      {
        field: 'bg_image_dark_desktop',
        idPrefix: 'img-dark-desk',
        label: 'Desktop (Opcional - usa a versão clara como padrão se vazio):',
        placeholder: 'ex: https://.../bg-dark.svg',
      },
      {
        field: 'bg_image_dark_mobile',
        idPrefix: 'img-dark-mob',
        label: 'Mobile (Opcional - telas pequenas modo escuro):',
        placeholder: 'ex: https://.../bg-dark-mobile.svg',
      },
    ],
  },
];

/** One image source: link or CSS pattern, file upload, and a clear button. */
const ImageSourceField: React.FC<
  ImageFieldSpec &
    Pick<PatternLayerControlsProps, 'group' | 'onUpdateGroup' | 'onFileUpload'>
> = ({
  field,
  idPrefix,
  label,
  placeholder,
  group,
  onUpdateGroup,
  onFileUpload,
}) => {
  const inputId = `${idPrefix}-${group.id}`;
  const value = group[field] || '';
  return (
    <div className="image-field-block">
      <label htmlFor={inputId}>{label}</label>
      <div className="image-input-row">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onUpdateGroup(group.id, field, e.target.value)}
          placeholder={placeholder}
        />
        <label
          className="file-upload-btn"
          title="Enviar imagem do seu computador"
        >
          <span>Arquivo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileUpload(group.id, field, e)}
          />
        </label>
        {value ? (
          <button
            type="button"
            className="clear-field-btn"
            onClick={() => onUpdateGroup(group.id, field, '')}
            title="Limpar imagem"
            aria-label="Limpar imagem"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
};

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
        {IMAGE_MATRIX.map(({ mode, title, fields }) => (
          <div key={mode} className={`mode-matrix-card ${mode}-mode-card`}>
            <div className="mode-matrix-header">
              <span className={`mode-indicator ${mode}-dot`} />
              <strong>{title}</strong>
            </div>
            {fields.map((field) => (
              <ImageSourceField
                key={field.field}
                {...field}
                group={group}
                onUpdateGroup={onUpdateGroup}
                onFileUpload={onFileUpload}
              />
            ))}
          </div>
        ))}
      </div>

      <LayerSizingControls
        idSuffix={group.id}
        size={group.bg_size}
        repeat={group.bg_repeat}
        position={group.bg_position}
        onChange={(field, value) => onUpdateGroup(group.id, field, value)}
      />
    </div>
  );
};
