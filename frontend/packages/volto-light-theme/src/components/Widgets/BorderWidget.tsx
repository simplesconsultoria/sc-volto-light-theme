import React, { useState, useEffect, useId, useCallback } from 'react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';
import {
  IconPresetNone,
  IconPresetAll,
  IconPresetTop,
  IconPresetBottom,
  IconPresetSides,
  IconPresetTopLeft,
  IconSideTop,
  IconSideRight,
  IconSideBottom,
  IconSideLeft,
} from './BorderWidget/icons';

export interface BorderWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: string;
  onChange: (id: string, value: string | undefined) => void;
  required?: boolean;
  intl?: any;
  [key: string]: any;
}

export interface BorderSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Converte valor numérico para pixel string seguro.
 */
function toPx(val: number): string {
  return `${Math.max(0, Math.round(val))}px`;
}

/**
 * Faz parse de valores CSS border-width (de 1 a 4 partes, ex: '1px', '3px 0px 0px 0px', '2px 0px').
 */
export function parseBorderValue(val?: string): {
  sides: BorderSides;
  baseThickness: number;
  isUniform: boolean;
} {
  if (!val || typeof val !== 'string') {
    return {
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    };
  }

  const trimmed = val.trim();
  if (trimmed === '' || trimmed === '0' || trimmed === '0px') {
    return {
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    };
  }

  const parts = trimmed.split(/\s+/).map((p) => {
    const num = parseInt(p.replace(/px|rem|em|pt/g, ''), 10);
    return Number.isNaN(num) ? 0 : Math.max(0, num);
  });

  let top = 0;
  let right = 0;
  let bottom = 0;
  let left = 0;

  if (parts.length === 1) {
    top = right = bottom = left = parts[0];
  } else if (parts.length === 2) {
    top = bottom = parts[0];
    right = left = parts[1];
  } else if (parts.length === 3) {
    top = parts[0];
    right = left = parts[1];
    bottom = parts[2];
  } else if (parts.length >= 4) {
    [top, right, bottom, left] = parts;
  }

  const activeSides = [top, right, bottom, left].filter((s) => s > 0);
  const baseThickness = activeSides.length > 0 ? activeSides[0] : 1;
  const isUniform =
    activeSides.length <= 1 || activeSides.every((s) => s === activeSides[0]);

  return {
    sides: { top, right, bottom, left },
    baseThickness: baseThickness > 0 ? baseThickness : 1,
    isUniform,
  };
}

/**
 * Formata os 4 lados em string CSS canônica de border-width.
 */
export function formatBorderValue(sides: BorderSides): string {
  const { top, right, bottom, left } = sides;

  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
    return '0px';
  }

  if (top === right && right === bottom && bottom === left) {
    return toPx(top);
  }

  if (top === bottom && right === left) {
    return `${toPx(top)} ${toPx(right)}`;
  }

  return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
}

/**
 * Retorna uma descrição em texto legível para leitores de tela e resumos visuais.
 */
export function getBorderDescription(sides: BorderSides): string {
  const { top, right, bottom, left } = sides;
  const activeCount = [top > 0, right > 0, bottom > 0, left > 0].filter(
    Boolean,
  ).length;

  if (activeCount === 0) return 'Nenhuma borda';
  if (activeCount === 4) {
    return top === right && right === bottom && bottom === left
      ? `Borda completa (${top}px)`
      : `Borda completa mista (${top}px, ${right}px, ${bottom}px, ${left}px)`;
  }
  if (top > 0 && right === 0 && bottom === 0 && left === 0) {
    return `Apenas no topo (${top}px)`;
  }
  if (top === 0 && right === 0 && bottom > 0 && left === 0) {
    return `Apenas abaixo (${bottom}px)`;
  }
  if (top === 0 && right > 0 && bottom === 0 && left > 0) {
    return `Nas laterais (${left === right ? `${left}px` : `esq: ${left}px, dir: ${right}px`})`;
  }
  if (top > 0 && right === 0 && bottom === 0 && left > 0) {
    return `No topo e na lateral esquerda (${top}px, ${left}px)`;
  }

  const activeNames: string[] = [];
  if (top > 0) activeNames.push(`topo: ${top}px`);
  if (right > 0) activeNames.push(`direita: ${right}px`);
  if (bottom > 0) activeNames.push(`abaixo: ${bottom}px`);
  if (left > 0) activeNames.push(`esquerda: ${left}px`);

  return `Bordas em: ${activeNames.join(', ')}`;
}

type PresetKey = 'none' | 'all' | 'top' | 'bottom' | 'sides' | 'top-left';

interface PresetDefinition {
  key: PresetKey;
  name: string;
  tooltip: string;
  icon: React.FC;
  isActive: (sides: BorderSides) => boolean;
}

const PRESETS: PresetDefinition[] = [
  {
    key: 'none',
    name: 'Sem borda',
    tooltip: 'Sem borda (0px)',
    icon: IconPresetNone,
    isActive: (s) =>
      s.top === 0 && s.right === 0 && s.bottom === 0 && s.left === 0,
  },
  {
    key: 'all',
    name: 'Completa',
    tooltip: 'Borda completa em todos os 4 lados',
    icon: IconPresetAll,
    isActive: (s) => s.top > 0 && s.right > 0 && s.bottom > 0 && s.left > 0,
  },
  {
    key: 'top',
    name: 'Topo',
    tooltip: 'Borda apenas no topo (superior)',
    icon: IconPresetTop,
    isActive: (s) =>
      s.top > 0 && s.right === 0 && s.bottom === 0 && s.left === 0,
  },
  {
    key: 'bottom',
    name: 'Abaixo',
    tooltip: 'Borda apenas abaixo (inferior)',
    icon: IconPresetBottom,
    isActive: (s) =>
      s.top === 0 && s.right === 0 && s.bottom > 0 && s.left === 0,
  },
  {
    key: 'sides',
    name: 'Laterais',
    tooltip: 'Bordas nas laterais (esquerda e direita)',
    icon: IconPresetSides,
    isActive: (s) => s.top === 0 && s.right > 0 && s.bottom === 0 && s.left > 0,
  },
  {
    key: 'top-left',
    name: 'Topo & Lateral',
    tooltip: 'Bordas no topo e na lateral esquerda',
    icon: IconPresetTopLeft,
    isActive: (s) => s.top > 0 && s.right === 0 && s.bottom === 0 && s.left > 0,
  },
];

interface SideDefinition {
  key: keyof BorderSides;
  label: string;
  tooltip: string;
  icon: React.FC;
}

const SIDE_CONFIGS: SideDefinition[] = [
  {
    key: 'top',
    label: 'Topo',
    tooltip: 'Borda Superior (topo)',
    icon: IconSideTop,
  },
  {
    key: 'right',
    label: 'Direita',
    tooltip: 'Borda Lateral Direita',
    icon: IconSideRight,
  },
  {
    key: 'bottom',
    label: 'Abaixo',
    tooltip: 'Borda Inferior (abaixo)',
    icon: IconSideBottom,
  },
  {
    key: 'left',
    label: 'Esquerda',
    tooltip: 'Borda Lateral Esquerda',
    icon: IconSideLeft,
  },
];

export const BorderWidget: React.FC<BorderWidgetProps> = (props) => {
  const { id, value, onChange } = props;
  const widgetId = useId();

  const parsed = parseBorderValue(value);
  const [sides, setSides] = useState<BorderSides>(parsed.sides);
  const [thickness, setThickness] = useState<number>(parsed.baseThickness);
  const [showDetailed, setShowDetailed] = useState<boolean>(!parsed.isUniform);
  const [announcement, setAnnouncement] = useState<string>('');

  // Sincroniza estado se a prop value externa mudar
  useEffect(() => {
    const updated = parseBorderValue(value);
    setSides(updated.sides);
    if (updated.baseThickness > 0) {
      setThickness(updated.baseThickness);
    }
  }, [value]);

  const updateSides = useCallback(
    (newSides: BorderSides, announceMsg?: string) => {
      setSides(newSides);
      const formatted = formatBorderValue(newSides);
      onChange(id, formatted === '0px' && !value ? undefined : formatted);
      if (announceMsg) {
        setAnnouncement(announceMsg);
      } else {
        setAnnouncement(getBorderDescription(newSides));
      }
    },
    [id, onChange, value],
  );

  const handlePreset = (preset: PresetKey) => {
    const t = thickness > 0 ? thickness : 1;
    let newSides: BorderSides;
    let msg = '';

    switch (preset) {
      case 'none':
        newSides = { top: 0, right: 0, bottom: 0, left: 0 };
        msg = 'Nenhuma borda selecionada';
        break;
      case 'all':
        newSides = { top: t, right: t, bottom: t, left: t };
        msg = `Borda completa ativada com ${t} pixels`;
        break;
      case 'top':
        newSides = { top: t, right: 0, bottom: 0, left: 0 };
        msg = `Borda no topo ativada com ${t} pixels`;
        break;
      case 'bottom':
        newSides = { top: 0, right: 0, bottom: t, left: 0 };
        msg = `Borda abaixo ativada com ${t} pixels`;
        break;
      case 'sides':
        newSides = { top: 0, right: t, bottom: 0, left: t };
        msg = `Bordas laterais ativadas com ${t} pixels`;
        break;
      case 'top-left':
        newSides = { top: t, right: 0, bottom: 0, left: t };
        msg = `Bordas no topo e na lateral esquerda ativadas com ${t} pixels`;
        break;
    }

    updateSides(newSides, msg);
  };

  const toggleSide = (sideKey: keyof BorderSides) => {
    const current = sides[sideKey];
    const t = thickness > 0 ? thickness : 1;
    const nextVal = current > 0 ? 0 : t;
    const newSides = { ...sides, [sideKey]: nextVal };
    const sideNames = {
      top: 'superior',
      right: 'direita',
      bottom: 'inferior',
      left: 'esquerda',
    };
    const action = nextVal > 0 ? `ativada com ${nextVal} pixels` : 'desativada';
    updateSides(newSides, `Borda ${sideNames[sideKey]} ${action}`);
  };

  const handleThicknessChange = (newVal: number) => {
    const valid = Math.max(0, Math.min(24, Math.round(newVal || 0)));
    setThickness(valid);

    // Se houver lados ativos, atualiza todos os lados ativos proporcionalmente
    const activeSides = Object.entries(sides).some(([_, val]) => val > 0);
    if (activeSides) {
      const updated: BorderSides = {
        top: sides.top > 0 ? valid : 0,
        right: sides.right > 0 ? valid : 0,
        bottom: sides.bottom > 0 ? valid : 0,
        left: sides.left > 0 ? valid : 0,
      };
      updateSides(updated, `Espessura alterada para ${valid} pixels`);
    }
  };

  const handleSideThicknessChange = (
    sideKey: keyof BorderSides,
    newVal: number,
  ) => {
    const valid = Math.max(0, Math.min(24, Math.round(newVal || 0)));
    const updated = { ...sides, [sideKey]: valid };
    updateSides(
      updated,
      `Espessura da borda ${sideKey} alterada para ${valid} pixels`,
    );
  };

  return (
    <FormFieldWrapper {...props} className="border-widget-field">
      <div
        className="border-widget"
        role="group"
        aria-labelledby={`${widgetId}-label`}
      >
        {/* Live region para anúncios a11y */}
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {/* 1. Presets rápidos de posicionamento com ícones e tooltips acessíveis */}
        <div className="border-widget__section">
          <div
            className="border-widget__presets-label"
            id={`${widgetId}-presets-label`}
          >
            Predefinições rápidas:
          </div>
          <div
            className="border-widget__presets-toolbar"
            role="toolbar"
            aria-labelledby={`${widgetId}-presets-label`}
          >
            {PRESETS.map((preset) => {
              const active = preset.isActive(sides);
              const PresetIcon = preset.icon;

              return (
                <button
                  key={preset.key}
                  type="button"
                  className={`border-widget__preset-btn ${active ? 'is-active' : ''}`}
                  onClick={() => handlePreset(preset.key)}
                  aria-pressed={active}
                  aria-label={preset.name}
                  title={preset.tooltip}
                >
                  <span
                    className="border-widget__preset-icon"
                    aria-hidden="true"
                  >
                    <PresetIcon />
                  </span>
                  <span
                    className="border-widget__preset-tooltip"
                    role="tooltip"
                  >
                    {preset.tooltip}
                  </span>
                  <span className="sr-only">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Controle Numérico de Espessura ("Espessura da Borda") */}
        <div className="border-widget__thickness-section">
          <div className="border-widget__thickness-row">
            <label
              htmlFor={`${widgetId}-thickness-input`}
              className="border-widget__thickness-label"
            >
              Espessura da Borda:
            </label>
            <div className="border-widget__stepper-wrapper">
              <button
                type="button"
                className="border-widget__stepper-btn border-widget__stepper-btn--dec"
                onClick={() => handleThicknessChange(thickness - 1)}
                disabled={thickness <= 0}
                aria-label="Diminuir espessura em 1 pixel"
                title="Diminuir espessura (-1px)"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <div className="border-widget__stepper-input-container">
                <input
                  id={`${widgetId}-thickness-input`}
                  type="number"
                  min="0"
                  max="24"
                  value={thickness}
                  onChange={(e) => {
                    const parsedVal = parseInt(e.target.value, 10);
                    handleThicknessChange(
                      Number.isNaN(parsedVal) ? 0 : parsedVal,
                    );
                  }}
                  className="border-widget__number-input"
                  aria-describedby={`${widgetId}-thickness-unit`}
                />
                <span
                  id={`${widgetId}-thickness-unit`}
                  className="border-widget__unit"
                >
                  px
                </span>
              </div>

              <button
                type="button"
                className="border-widget__stepper-btn border-widget__stepper-btn--inc"
                onClick={() => handleThicknessChange(thickness + 1)}
                disabled={thickness >= 24}
                aria-label="Aumentar espessura em 1 pixel"
                title="Aumentar espessura (+1px)"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Toggle para personalização detalhada por lado */}
          <div className="border-widget__side-toggle-wrapper">
            <button
              type="button"
              className={`border-widget__side-toggle-btn ${
                showDetailed ? 'is-expanded' : ''
              }`}
              onClick={() => setShowDetailed(!showDetailed)}
              aria-expanded={showDetailed}
              aria-controls={`${widgetId}-detailed-sides`}
            >
              <span
                className="border-widget__toggle-chevron"
                aria-hidden="true"
              >
                <svg
                  width="12"
                  height="12"
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
              <span className="border-widget__toggle-text">
                {showDetailed
                  ? 'Ocultar ajuste por lado'
                  : 'Personalizar espessura por lado'}
              </span>
              {!showDetailed && !parsed.isUniform && (
                <span
                  className="border-widget__asymmetric-pill"
                  title="Bordas possuem espessuras assimétricas"
                >
                  Assimétrico
                </span>
              )}
            </button>
          </div>

          {/* Seção detalhada com 4 lados independentes, flex-wrap e inputs estilo Volto */}
          {showDetailed && (
            <div
              id={`${widgetId}-detailed-sides`}
              className="border-widget__detailed-grid"
              role="region"
              aria-label="Ajuste independente de espessura por lado"
            >
              {SIDE_CONFIGS.map(({ key, label, tooltip, icon: SideIcon }) => {
                const isSideActive = sides[key] > 0;
                const sideAriaName =
                  key === 'top'
                    ? 'Borda Superior'
                    : key === 'right'
                      ? 'Borda Direita'
                      : key === 'bottom'
                        ? 'Borda Inferior'
                        : 'Borda Esquerda';

                return (
                  <div
                    key={key}
                    className={`border-widget__side-control ${
                      isSideActive ? 'is-active' : ''
                    }`}
                  >
                    <div className="border-widget__side-header">
                      <button
                        type="button"
                        className={`border-widget__side-icon-btn ${
                          isSideActive ? 'is-active' : ''
                        }`}
                        onClick={() => toggleSide(key)}
                        aria-pressed={isSideActive}
                        aria-label={`${sideAriaName}: ${sides[key] > 0 ? `${sides[key]}px` : 'nenhuma'}`}
                        title={`Alternar ${sideAriaName}`}
                      >
                        <SideIcon />
                      </button>
                      <label
                        htmlFor={`${widgetId}-side-${key}`}
                        className="border-widget__side-label"
                      >
                        {label}:
                      </label>
                      <span
                        className="border-widget__side-tooltip"
                        role="tooltip"
                      >
                        {tooltip}
                      </span>
                    </div>

                    <div className="border-widget__side-input-container">
                      <input
                        id={`${widgetId}-side-${key}`}
                        type="number"
                        min="0"
                        max="24"
                        value={sides[key]}
                        onChange={(e) => {
                          const parsedVal = parseInt(e.target.value, 10);
                          handleSideThicknessChange(
                            key,
                            Number.isNaN(parsedVal) ? 0 : parsedVal,
                          );
                        }}
                        className="border-widget__side-input"
                        aria-label={`Espessura da borda ${label} em pixels`}
                        title={tooltip}
                      />
                      <span className="border-widget__unit">px</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default BorderWidget;
