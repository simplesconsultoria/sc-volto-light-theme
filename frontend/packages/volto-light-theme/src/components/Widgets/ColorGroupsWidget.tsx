import React, { useState } from 'react';
import type { ColorGroup } from '../../types/theme';
import {
  DEFAULT_COLOR_GROUPS,
  BASE_COLOR_GROUP_IDS,
  CSS_PATTERN_PRESETS,
  type CssPatternPreset,
} from '../../config/blockThemes';
import { formatBackgroundImage } from '../../helpers/themeStyles';

export interface ColorGroupsWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: Record<string, ColorGroup> | ColorGroup[];
  onChange: (id: string, value: Record<string, ColorGroup>) => void;
  required?: boolean;
  [key: string]: any;
}

const IconRepeatAll = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconRepeatX = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="5" height="10" rx="1" />
    <rect x="9.5" y="7" width="5" height="10" rx="1" />
    <rect x="17" y="7" width="5" height="10" rx="1" />
    <line x1="2" y1="4" x2="22" y2="4" strokeDasharray="2 2" />
    <line x1="2" y1="20" x2="22" y2="20" strokeDasharray="2 2" />
  </svg>
);

const IconRepeatY = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="7" y="2" width="10" height="5" rx="1" />
    <rect x="7" y="9.5" width="10" height="5" rx="1" />
    <rect x="7" y="17" width="10" height="5" rx="1" />
    <line x1="4" y1="2" x2="4" y2="22" strokeDasharray="2 2" />
    <line x1="20" y1="2" x2="20" y2="22" strokeDasharray="2 2" />
  </svg>
);

const IconNoRepeat = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
    <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
  </svg>
);

const IconRepeatRound = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12a8 8 0 0 1 14.9-4M20 12a8 8 0 0 1-14.9 4" />
    <polyline points="18 4 20 8 16 8" />
    <polyline points="6 20 4 16 8 16" />
  </svg>
);

const IconRepeatSpace = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="3"
      y="6"
      width="6"
      height="12"
      rx="1"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <rect
      x="15"
      y="6"
      width="6"
      height="12"
      rx="1"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <line x1="10" y1="12" x2="14" y2="12" strokeDasharray="2 1" />
  </svg>
);

const IconSizeCover = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const IconSizeContain = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" strokeDasharray="3 3" />
    <rect
      x="7"
      y="8"
      width="10"
      height="8"
      rx="1"
      fill="currentColor"
      fillOpacity="0.3"
    />
  </svg>
);

const IconSizeAuto = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <text
      x="12"
      y="15"
      fontSize="7.5"
      fontWeight="bold"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
    >
      1:1
    </text>
  </svg>
);

const IconSizeWidth = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <polyline points="7 8 3 12 7 16" />
    <polyline points="17 8 21 12 17 16" />
    <line x1="3" y1="5" x2="3" y2="19" />
    <line x1="21" y1="5" x2="21" y2="19" />
  </svg>
);

const SIZE_OPTIONS = [
  {
    value: 'cover',
    label: 'Cover',
    shortLabel: 'Cover',
    icon: IconSizeCover,
    title: 'Preencher todo o bloco (cover)',
  },
  {
    value: 'contain',
    label: 'Contain',
    shortLabel: 'Contain',
    icon: IconSizeContain,
    title: 'Conter imagem inteira sem cortar (contain)',
  },
  {
    value: 'auto',
    label: 'Auto',
    shortLabel: 'Auto',
    icon: IconSizeAuto,
    title: 'Tamanho original da imagem (auto)',
  },
  {
    value: '100% auto',
    label: '100% Largura',
    shortLabel: '100% Largura',
    icon: IconSizeWidth,
    title: 'Largura total esticada (100% auto)',
  },
];

const SIZE_PATTERN_PILLS = [
  {
    value: '24px 24px',
    label: '24px',
    title: 'Tamanho pequeno para patterns (24px 24px)',
  },
  {
    value: '32px 32px',
    label: '32px',
    title: 'Tamanho médio para patterns (32px 32px)',
  },
  {
    value: '50px 50px',
    label: '50px',
    title: 'Tamanho grande para patterns (50px 50px)',
  },
];

const REPEAT_OPTIONS = [
  {
    value: 'repeat',
    label: 'Repetir',
    shortLabel: 'Repetir',
    icon: IconRepeatAll,
    title: 'Repetir imagem no X e no Y (repeat)',
  },
  {
    value: 'repeat-x',
    label: 'Horizontal',
    shortLabel: 'Repetir X',
    icon: IconRepeatX,
    title: 'Repetir apenas na horizontal (repeat-x)',
  },
  {
    value: 'repeat-y',
    label: 'Vertical',
    shortLabel: 'Repetir Y',
    icon: IconRepeatY,
    title: 'Repetir apenas na vertical (repeat-y)',
  },
  {
    value: 'no-repeat',
    label: 'Não repetir',
    shortLabel: '1x Única',
    icon: IconNoRepeat,
    title: 'Não repetir a imagem (no-repeat)',
  },
  {
    value: 'round',
    label: 'Ajustar',
    shortLabel: 'Round',
    icon: IconRepeatRound,
    title: 'Repetir ajustando proporções sem corte (round)',
  },
  {
    value: 'space',
    label: 'Espaçado',
    shortLabel: 'Space',
    icon: IconRepeatSpace,
    title: 'Espaçar uniformemente (space)',
  },
];

const POSITION_COMPASS = [
  {
    value: 'top left',
    label: 'Superior Esquerdo (↖)',
    arrow: '↖',
    idKey: 'top-left',
  },
  {
    value: 'top center',
    label: 'Superior Centro (↑)',
    arrow: '↑',
    idKey: 'top-center',
  },
  {
    value: 'top right',
    label: 'Superior Direito (↗)',
    arrow: '↗',
    idKey: 'top-right',
  },
  {
    value: 'center left',
    label: 'Centro Esquerdo (←)',
    arrow: '←',
    idKey: 'center-left',
  },
  { value: 'center', label: 'Centro (•)', arrow: '•', idKey: 'center' },
  {
    value: 'center right',
    label: 'Centro Direito (→)',
    arrow: '→',
    idKey: 'center-right',
  },
  {
    value: 'bottom left',
    label: 'Inferior Esquerdo (↙)',
    arrow: '↙',
    idKey: 'bottom-left',
  },
  {
    value: 'bottom center',
    label: 'Inferior Centro (↓)',
    arrow: '↓',
    idKey: 'bottom-center',
  },
  {
    value: 'bottom right',
    label: 'Inferior Direito (↘)',
    arrow: '↘',
    idKey: 'bottom-right',
  },
];

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
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateGroup(groupId, field, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
        {Object.values(groups).map((group) => {
          const isExpanded = !!expandedGroups[group.id];
          const isBase = BASE_COLOR_GROUP_IDS.includes(group.id);
          const isMobilePreview = previewDevice[group.id] === 'mobile';

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
                  <label htmlFor={`font-${group.id}`}>
                    Fonte (Font Family):
                  </label>
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
                    <span className="color-label">1ª Camada: Fundo (Background Color):</span>
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

                {/* 2nd Background Layer: Image and CSS Patterns Section */}
                <div className="colorgroup-image-layer">
                  <div className="layer-header">
                    <div className="layer-title-wrapper">
                      <span className="layer-badge">2ª Camada</span>
                      <strong className="layer-title">
                        Imagem e Padrões CSS de Fundo (Background Image Layer)
                      </strong>
                    </div>
                    <p className="layer-help">
                      Adicione uma imagem (link/arquivo) ou padrão CSS. A imagem
                      é renderizada em cima da cor de fundo configurada acima,
                      permitindo transparência e sobreposição responsiva.
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
                            onClick={() => handleApplyPreset(group.id, preset)}
                            title={preset.description}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Responsive & Theme Matrix for Image Sources */}
                  <div className="image-matrix-grid">
                    {/* Modo Claro */}
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
                              updateGroup(
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
                                handleFileUpload(
                                  group.id,
                                  'bg_image_light_desktop',
                                  e,
                                )
                              }
                            />
                          </label>
                          {group.bg_image_light_desktop ? (
                            <button
                              type="button"
                              className="clear-field-btn"
                              onClick={() =>
                                updateGroup(
                                  group.id,
                                  'bg_image_light_desktop',
                                  '',
                                )
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
                          Mobile (Opcional - usa Desktop se vazio):
                        </label>
                        <div className="image-input-row">
                          <input
                            id={`img-light-mob-${group.id}`}
                            type="text"
                            value={group.bg_image_light_mobile || ''}
                            onChange={(e) =>
                              updateGroup(
                                group.id,
                                'bg_image_light_mobile',
                                e.target.value,
                              )
                            }
                            placeholder="Vazio = herda do Desktop"
                          />
                          <label
                            className="file-upload-btn"
                            title="Enviar imagem para mobile"
                          >
                            <span>Arquivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(
                                  group.id,
                                  'bg_image_light_mobile',
                                  e,
                                )
                              }
                            />
                          </label>
                          {group.bg_image_light_mobile ? (
                            <button
                              type="button"
                              className="clear-field-btn"
                              onClick={() =>
                                updateGroup(
                                  group.id,
                                  'bg_image_light_mobile',
                                  '',
                                )
                              }
                              title="Limpar imagem mobile"
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Modo Escuro */}
                    <div className="mode-matrix-card dark-mode-card">
                      <div className="mode-matrix-header">
                        <span className="mode-indicator dark-dot" />
                        <strong>Modo Escuro (Dark Mode)</strong>
                      </div>

                      <div className="image-field-block">
                        <label htmlFor={`img-dark-desk-${group.id}`}>
                          Desktop (Opcional - usa Modo Claro se vazio):
                        </label>
                        <div className="image-input-row">
                          <input
                            id={`img-dark-desk-${group.id}`}
                            type="text"
                            value={group.bg_image_dark_desktop || ''}
                            onChange={(e) =>
                              updateGroup(
                                group.id,
                                'bg_image_dark_desktop',
                                e.target.value,
                              )
                            }
                            placeholder="Vazio = herda do Modo Claro"
                          />
                          <label
                            className="file-upload-btn"
                            title="Enviar imagem para modo escuro"
                          >
                            <span>Arquivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(
                                  group.id,
                                  'bg_image_dark_desktop',
                                  e,
                                )
                              }
                            />
                          </label>
                          {group.bg_image_dark_desktop ? (
                            <button
                              type="button"
                              className="clear-field-btn"
                              onClick={() =>
                                updateGroup(
                                  group.id,
                                  'bg_image_dark_desktop',
                                  '',
                                )
                              }
                              title="Limpar imagem modo escuro"
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="image-field-block">
                        <label htmlFor={`img-dark-mob-${group.id}`}>
                          Mobile (Opcional):
                        </label>
                        <div className="image-input-row">
                          <input
                            id={`img-dark-mob-${group.id}`}
                            type="text"
                            value={group.bg_image_dark_mobile || ''}
                            onChange={(e) =>
                              updateGroup(
                                group.id,
                                'bg_image_dark_mobile',
                                e.target.value,
                              )
                            }
                            placeholder="Vazio = herda do escuro desktop / claro mobile"
                          />
                          <label
                            className="file-upload-btn"
                            title="Enviar imagem escuro mobile"
                          >
                            <span>Arquivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(
                                  group.id,
                                  'bg_image_dark_mobile',
                                  e,
                                )
                              }
                            />
                          </label>
                          {group.bg_image_dark_mobile ? (
                            <button
                              type="button"
                              className="clear-field-btn"
                              onClick={() =>
                                updateGroup(
                                  group.id,
                                  'bg_image_dark_mobile',
                                  '',
                                )
                              }
                              title="Limpar imagem escuro mobile"
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layer Styling Controls: Interactive Size, Repeat, and Position with Icons */}
                  <div className="layer-controls-interactive">
                    {/* Tamanho (Size) */}
                    <div className="control-group-box">
                      <span className="control-group-label">
                        Tamanho (background-size):
                      </span>
                      <div className="icon-button-group">
                        {SIZE_OPTIONS.map((opt) => {
                          const isActive =
                            (group.bg_size || 'auto') === opt.value;
                          const IconComp = opt.icon;
                          const cleanVal = opt.value.replace(/[^a-z0-9]/gi, '-');
                          return (
                            <button
                              key={opt.value}
                              id={`bg-size-${cleanVal}-${group.id}`}
                              type="button"
                              className={`icon-btn ${isActive ? 'is-active' : ''}`}
                              onClick={() =>
                                updateGroup(group.id, 'bg_size', opt.value)
                              }
                              title={opt.title}
                            >
                              <IconComp />
                              <span>{opt.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Pattern sizes pills */}
                      <div className="pattern-pills-row">
                        <span className="pills-hint">Padrões:</span>
                        {SIZE_PATTERN_PILLS.map((pill) => {
                          const isActive = group.bg_size === pill.value;
                          return (
                            <button
                              key={pill.value}
                              type="button"
                              className={`pill-btn ${isActive ? 'is-active' : ''}`}
                              onClick={() =>
                                updateGroup(group.id, 'bg_size', pill.value)
                              }
                              title={pill.title}
                            >
                              {pill.label}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        id={`bg-size-${group.id}`}
                        type="text"
                        className="custom-input-compact"
                        value={group.bg_size || ''}
                        onChange={(e) =>
                          updateGroup(group.id, 'bg_size', e.target.value)
                        }
                        placeholder="ou digite custom (ex: 40px, 100% 100%)"
                      />
                    </div>

                    {/* Repetição (Repeat) */}
                    <div className="control-group-box">
                      <span className="control-group-label">
                        Repetição (background-repeat):
                      </span>
                      <div className="icon-button-group">
                        {REPEAT_OPTIONS.map((opt) => {
                          const isActive =
                            (group.bg_repeat || 'repeat') === opt.value;
                          const IconComp = opt.icon;
                          const cleanVal = opt.value.replace(/[^a-z0-9]/gi, '-');
                          return (
                            <button
                              key={opt.value}
                              id={`bg-repeat-${cleanVal}-${group.id}`}
                              type="button"
                              className={`icon-btn ${isActive ? 'is-active' : ''}`}
                              onClick={() =>
                                updateGroup(group.id, 'bg_repeat', opt.value)
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
                          updateGroup(group.id, 'bg_repeat', e.target.value)
                        }
                        placeholder="ou digite custom (ex: repeat space)"
                      />
                    </div>

                    {/* Posição (Position 3x3 Compass) */}
                    <div className="control-group-box">
                      <span className="control-group-label">
                        Posição (background-position):
                      </span>
                      <div className="compass-grid-wrapper">
                        <div className="compass-grid">
                          {POSITION_COMPASS.map((pos) => {
                            const currentPos = (
                              group.bg_position || 'center'
                            )
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
                                  updateGroup(
                                    group.id,
                                    'bg_position',
                                    pos.value,
                                  )
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
                          updateGroup(group.id, 'bg_position', e.target.value)
                        }
                        placeholder="ou digite custom (ex: 50% 20px)"
                      />
                    </div>
                  </div>
                </div>

                {/* Previews with Device Switch */}
                <div className="preview-header-row">
                  <span className="preview-label">
                    Pré-visualização do Grupo (Cor + 2ª Camada Sobreposta):
                  </span>
                  <button
                    type="button"
                    className="device-toggle-btn"
                    onClick={() => toggleDevice(group.id)}
                    title="Alternar simulação de dispositivo"
                  >
                    Simular: <strong>{isMobilePreview ? 'Mobile (Telas Pequenas)' : 'Desktop'}</strong>
                  </button>
                </div>

                <div className="colorgroup-preview-container">
                  {/* Modo Claro */}
                  <div
                    className="preview-card light"
                    style={{
                      backgroundColor:
                        group.background_color_light || '#ffffff',
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
                        backgroundColor: group.accent_color_light || '#f4822c',
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
                        backgroundColor: group.accent_color_dark || '#f4822c',
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

          <div className="add-layer-controls-mini">
            <div className="field-item">
              <label htmlFor="new-cg-repeat">Repetição:</label>
              <select
                id="new-cg-repeat"
                value={newBgRepeat}
                onChange={(e) => setNewBgRepeat(e.target.value)}
              >
                <option value="repeat">repeat</option>
                <option value="no-repeat">no-repeat</option>
                <option value="repeat-x">repeat-x</option>
                <option value="repeat-y">repeat-y</option>
              </select>
            </div>

            <div className="field-item">
              <label htmlFor="new-cg-size">Tamanho:</label>
              <input
                id="new-cg-size"
                type="text"
                value={newBgSize}
                onChange={(e) => setNewBgSize(e.target.value)}
                placeholder="auto, cover, 32px 32px"
              />
            </div>

            <div className="field-item">
              <label htmlFor="new-cg-pos">Posição:</label>
              <input
                id="new-cg-pos"
                type="text"
                value={newBgPosition}
                onChange={(e) => setNewBgPosition(e.target.value)}
                placeholder="center, top left"
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
