import React from 'react';
import { useIntl, type MessageDescriptor } from 'react-intl';
import type { ColorGroup } from '../../../types/theme';
import {
  CSS_PATTERN_PRESETS,
  type CssPatternPreset,
} from '../../../config/blockThemes';
import { renderPatternPresetIcon } from './icons';
import { LayerSizingControls } from './LayerSizingControls';
import { messages } from './messages';

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
  label: MessageDescriptor;
  placeholder: MessageDescriptor;
  /** Sample value the placeholder message shows, if it takes one. */
  example?: string;
}

/** The four image sources of the layer: light/dark x desktop/mobile. */
const IMAGE_MATRIX: {
  mode: 'light' | 'dark';
  title: MessageDescriptor;
  fields: ImageFieldSpec[];
}[] = [
  {
    mode: 'light',
    title: messages.lightMode,
    fields: [
      {
        field: 'bg_image_light_desktop',
        idPrefix: 'img-light-desk',
        label: messages.lightDesktopImage,
        placeholder: messages.imageOrPatternPlaceholder,
      },
      {
        field: 'bg_image_light_mobile',
        idPrefix: 'img-light-mob',
        label: messages.lightMobileImage,
        placeholder: messages.example,
        example: 'https://.../banner-mobile.webp',
      },
    ],
  },
  {
    mode: 'dark',
    title: messages.darkMode,
    fields: [
      {
        field: 'bg_image_dark_desktop',
        idPrefix: 'img-dark-desk',
        label: messages.darkDesktopImage,
        placeholder: messages.example,
        example: 'https://.../bg-dark.svg',
      },
      {
        field: 'bg_image_dark_mobile',
        idPrefix: 'img-dark-mob',
        label: messages.darkMobileImage,
        placeholder: messages.example,
        example: 'https://.../bg-dark-mobile.svg',
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
  example,
  group,
  onUpdateGroup,
  onFileUpload,
}) => {
  const intl = useIntl();
  const inputId = `${idPrefix}-${group.id}`;
  const value = group[field] || '';
  return (
    <div className="image-field-block">
      <label htmlFor={inputId}>{intl.formatMessage(label)}:</label>
      <div className="image-input-row">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onUpdateGroup(group.id, field, e.target.value)}
          placeholder={intl.formatMessage(placeholder, { example })}
        />
        <label
          className="file-upload-btn"
          title={intl.formatMessage(messages.uploadImage)}
        >
          <span>{intl.formatMessage(messages.file)}</span>
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
            title={intl.formatMessage(messages.clearImage)}
            aria-label={intl.formatMessage(messages.clearImage)}
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
  const intl = useIntl();
  return (
    <div className="colorgroup-image-layer">
      <div className="layer-header">
        <div className="layer-title-wrapper">
          <span className="layer-badge">
            {intl.formatMessage(messages.layerBadge)}
          </span>
          <strong className="layer-title">
            {intl.formatMessage(messages.layerTitle)}
          </strong>
        </div>
        <p className="layer-help">{intl.formatMessage(messages.layerHelp)}</p>
      </div>

      {/* Quick CSS Pattern Presets */}
      <div className="presets-section">
        <span className="presets-label">
          {intl.formatMessage(messages.presets)}:
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
                title={intl.formatMessage(preset.description)}
              >
                <span className="preset-pill-icon" aria-hidden="true">
                  {renderPatternPresetIcon(preset.id)}
                </span>
                <span className="preset-pill-label">
                  {intl.formatMessage(preset.label)}
                </span>
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
              <strong>{intl.formatMessage(title)}</strong>
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
