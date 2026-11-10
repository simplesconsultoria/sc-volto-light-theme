import React from 'react';
import type { ColorGroup } from '../../../types/theme';
import type { CssPatternPreset } from '../../../config/blockThemes';
import { formatBackgroundImage } from '../../../helpers/themeStyles';
import { CardHeader } from '../shared/CardHeader';
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

type ColorRole = 'background' | 'text' | 'subtext' | 'accent';
type Mode = 'light' | 'dark';

/** The four colour roles of a group, with the fallback each picker shows. */
const COLOR_ROWS: {
  role: ColorRole;
  label: string;
  fallback: Record<Mode, string>;
}[] = [
  {
    role: 'background',
    label: '1ª Camada: Fundo (Background Color)',
    fallback: { light: '#ffffff', dark: '#000000' },
  },
  {
    role: 'text',
    label: 'Texto (Text Color)',
    fallback: { light: '#000000', dark: '#ffffff' },
  },
  {
    role: 'subtext',
    label: 'Subtexto (Subtext)',
    fallback: { light: '#666666', dark: '#cccccc' },
  },
  {
    role: 'accent',
    label: 'Accent',
    fallback: { light: '#1971c2', dark: '#74c0fc' },
  },
];

const MODE_LABEL: Record<Mode, string> = { light: 'Claro', dark: 'Escuro' };

const colorField = (role: ColorRole, mode: Mode) =>
  `${role}_color_${mode}` as keyof ColorGroup;

/** Colour picker plus hex text field for one role in one mode. */
const ColorInput: React.FC<{
  group: ColorGroup;
  role: ColorRole;
  mode: Mode;
  label: string;
  fallback: string;
  onUpdateGroup: ColorGroupItemProps['onUpdateGroup'];
}> = ({ group, role, mode, label, fallback, onUpdateGroup }) => {
  const field = colorField(role, mode);
  const value = (group[field] as string | undefined) || '';
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onUpdateGroup(group.id, field, e.target.value);
  const name = `${label} (${MODE_LABEL[mode]})`;
  return (
    <div className="mode-input">
      <span className="mode-tag" aria-hidden="true">
        {MODE_LABEL[mode]}
      </span>
      <input
        type="color"
        aria-label={name}
        value={value || fallback}
        onChange={onChange}
      />
      <input
        type="text"
        className="hex-input"
        aria-label={`${name}, hexadecimal`}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

const PREVIEW_FALLBACK: Record<Mode, Record<ColorRole, string>> = {
  light: {
    background: '#ffffff',
    text: '#000000',
    subtext: '#666666',
    accent: '#1971c2',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    subtext: '#cccccc',
    accent: '#74c0fc',
  },
};

/** The group rendered as a sample card in one mode. */
const PreviewCard: React.FC<{
  group: ColorGroup;
  mode: Mode;
  backgroundImage: string;
}> = ({ group, mode, backgroundImage }) => {
  const color = (role: ColorRole) =>
    (group[colorField(role, mode)] as string | undefined) ||
    PREVIEW_FALLBACK[mode][role];
  return (
    <div
      className={`preview-card ${mode}`}
      style={{
        backgroundColor: color('background'),
        backgroundImage,
        backgroundSize: group.bg_size || 'auto',
        backgroundRepeat: group.bg_repeat || 'repeat',
        backgroundPosition: group.bg_position || 'center',
        color: color('text'),
        fontFamily: group.font_family || 'inherit',
      }}
    >
      <span className={`preview-badge ${mode === 'dark' ? 'dark-tag' : ''}`}>
        {mode === 'dark' ? 'MODO ESCURO' : 'MODO CLARO'}
      </span>
      <h5 style={{ color: color('text'), margin: '0.4rem 0' }}>
        {group.name} Título
      </h5>
      <p
        style={{
          color: color('subtext'),
          fontSize: '0.85rem',
          margin: '0.2rem 0 0.6rem 0',
        }}
      >
        Cor de fundo com 2ª camada sobreposta.
      </p>
      {/* Decorative sample of the accent colour, not an action. */}
      <span
        className="preview-accent-sample"
        style={{
          display: 'inline-block',
          backgroundColor: color('accent'),
          color: '#ffffff',
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        Ação Accent
      </span>
    </div>
  );
};

/** The image layer shown in the preview, honouring the simulated device. */
function previewImages(group: ColorGroup, isMobile: boolean) {
  const lightDesktop = group.bg_image_light_desktop;
  const lightMobile = group.bg_image_light_mobile;
  const darkDesktop = group.bg_image_dark_desktop;
  const darkMobile = group.bg_image_dark_mobile;
  return {
    light: formatBackgroundImage(
      isMobile ? lightMobile || lightDesktop : lightDesktop,
    ),
    dark: formatBackgroundImage(
      isMobile
        ? darkMobile || darkDesktop || lightMobile || lightDesktop
        : darkDesktop || lightDesktop,
    ),
  };
}

export const ColorGroupItem: React.FC<ColorGroupItemProps> = ({
  group,
  isExpanded,
  isBase,
  isMobilePreview,
  onToggleExpand,
  onToggleDevice,
  onUpdateGroup,
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
  const images = previewImages(group, isMobilePreview);
  const bodyId = `colorgroup-body-${group.id}`;

  return (
    <div
      className={`colorgroup-card ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
    >
      <CardHeader
        className="colorgroup-card-header"
        isExpanded={isExpanded}
        onToggle={() => onToggleExpand(group.id)}
        controls={bodyId}
        onDelete={isBase ? undefined : () => onDeleteGroup(group.id)}
        deleteClassName="delete-group-btn"
        deleteLabel={`Excluir o ColorGroup ${group.name}`}
        preview={
          <div className="color-swatches-preview" aria-hidden="true">
            {COLOR_ROWS.map(({ role, label, fallback }) => {
              const value = group[colorField(role, 'light')] as string;
              return (
                <span
                  key={role}
                  className="swatch-dot"
                  style={{ backgroundColor: value || fallback.light }}
                  title={`${label}: ${value}`}
                />
              );
            })}
          </div>
        }
      >
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
      </CardHeader>

      <div
        id={bodyId}
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
          {COLOR_ROWS.map(({ role, label, fallback }) => (
            <div className="color-row" key={role}>
              <span className="color-label">{label}:</span>
              <div className="color-inputs">
                {(['light', 'dark'] as Mode[]).map((mode) => (
                  <ColorInput
                    key={mode}
                    group={group}
                    role={role}
                    mode={mode}
                    label={label}
                    fallback={fallback[mode]}
                    onUpdateGroup={onUpdateGroup}
                  />
                ))}
              </div>
            </div>
          ))}
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
          <PreviewCard
            group={group}
            mode="light"
            backgroundImage={images.light}
          />
          <PreviewCard
            group={group}
            mode="dark"
            backgroundImage={images.dark}
          />
        </div>
      </div>
    </div>
  );
};
