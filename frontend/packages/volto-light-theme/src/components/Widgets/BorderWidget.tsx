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
  /** The sides this preset sets for a thickness `t`. */
  apply: (t: number) => BorderSides;
  /** What the live region announces. */
  announce: (t: number) => string;
}

const PRESETS: PresetDefinition[] = [
  {
    key: 'none',
    name: 'Sem borda',
    tooltip: 'Sem borda (0px)',
    icon: IconPresetNone,
    isActive: (s) =>
      s.top === 0 && s.right === 0 && s.bottom === 0 && s.left === 0,
    apply: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    announce: () => 'Nenhuma borda selecionada',
  },
  {
    key: 'all',
    name: 'Completa',
    tooltip: 'Borda completa em todos os 4 lados',
    icon: IconPresetAll,
    isActive: (s) => s.top > 0 && s.right > 0 && s.bottom > 0 && s.left > 0,
    apply: (t) => ({ top: t, right: t, bottom: t, left: t }),
    announce: (t) => `Borda completa ativada com ${t} pixels`,
  },
  {
    key: 'top',
    name: 'Topo',
    tooltip: 'Borda apenas no topo (superior)',
    icon: IconPresetTop,
    isActive: (s) =>
      s.top > 0 && s.right === 0 && s.bottom === 0 && s.left === 0,
    apply: (t) => ({ top: t, right: 0, bottom: 0, left: 0 }),
    announce: (t) => `Borda no topo ativada com ${t} pixels`,
  },
  {
    key: 'bottom',
    name: 'Abaixo',
    tooltip: 'Borda apenas abaixo (inferior)',
    icon: IconPresetBottom,
    isActive: (s) =>
      s.top === 0 && s.right === 0 && s.bottom > 0 && s.left === 0,
    apply: (t) => ({ top: 0, right: 0, bottom: t, left: 0 }),
    announce: (t) => `Borda abaixo ativada com ${t} pixels`,
  },
  {
    key: 'sides',
    name: 'Laterais',
    tooltip: 'Bordas nas laterais (esquerda e direita)',
    icon: IconPresetSides,
    isActive: (s) => s.top === 0 && s.right > 0 && s.bottom === 0 && s.left > 0,
    apply: (t) => ({ top: 0, right: t, bottom: 0, left: t }),
    announce: (t) => `Bordas laterais ativadas com ${t} pixels`,
  },
  {
    key: 'top-left',
    name: 'Topo & Lateral',
    tooltip: 'Bordas no topo e na lateral esquerda',
    icon: IconPresetTopLeft,
    isActive: (s) => s.top > 0 && s.right === 0 && s.bottom === 0 && s.left > 0,
    apply: (t) => ({ top: t, right: 0, bottom: 0, left: t }),
    announce: (t) =>
      `Bordas no topo e na lateral esquerda ativadas com ${t} pixels`,
  },
];

interface SideDefinition {
  key: keyof BorderSides;
  label: string;
  tooltip: string;
  icon: React.FC;
  /** Accessible name of the side's toggle. */
  ariaName: string;
  /** Adjective used in announcements ("Borda superior ativada"). */
  announceName: string;
}

const SIDE_CONFIGS: SideDefinition[] = [
  {
    key: 'top',
    label: 'Topo',
    tooltip: 'Borda Superior (topo)',
    icon: IconSideTop,
    ariaName: 'Borda Superior',
    announceName: 'superior',
  },
  {
    key: 'right',
    label: 'Direita',
    tooltip: 'Borda Lateral Direita',
    icon: IconSideRight,
    ariaName: 'Borda Direita',
    announceName: 'direita',
  },
  {
    key: 'bottom',
    label: 'Abaixo',
    tooltip: 'Borda Inferior (abaixo)',
    icon: IconSideBottom,
    ariaName: 'Borda Inferior',
    announceName: 'inferior',
  },
  {
    key: 'left',
    label: 'Esquerda',
    tooltip: 'Borda Lateral Esquerda',
    icon: IconSideLeft,
    ariaName: 'Borda Esquerda',
    announceName: 'esquerda',
  },
];

/** Thickest border the widget allows, in pixels. */
const MAX_THICKNESS = 24;

/**
 * Read a thickness typed into a number field: anything that is not a finite
 * number (empty field, `-`, `e`) counts as 0, and the result is clamped.
 */
export function toThickness(raw: string | number): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_THICKNESS, Math.round(n)));
}

const StepIcon: React.FC<{ plus?: boolean }> = ({ plus }) => (
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
    {plus && <line x1="12" y1="5" x2="12" y2="19" />}
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/** "Espessura da Borda" number field with -1 / +1 buttons. */
const ThicknessStepper: React.FC<{
  widgetId: string;
  thickness: number;
  onChange: (value: number) => void;
}> = ({ widgetId, thickness, onChange }) => (
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
        onClick={() => onChange(thickness - 1)}
        disabled={thickness <= 0}
        aria-label="Diminuir espessura em 1 pixel"
        title="Diminuir espessura (-1px)"
      >
        <StepIcon />
      </button>

      <div className="border-widget__stepper-input-container">
        <input
          id={`${widgetId}-thickness-input`}
          type="number"
          min="0"
          max={MAX_THICKNESS}
          value={thickness}
          onChange={(e) => onChange(toThickness(e.target.value))}
          className="border-widget__number-input"
          aria-describedby={`${widgetId}-thickness-unit`}
        />
        <span id={`${widgetId}-thickness-unit`} className="border-widget__unit">
          px
        </span>
      </div>

      <button
        type="button"
        className="border-widget__stepper-btn border-widget__stepper-btn--inc"
        onClick={() => onChange(thickness + 1)}
        disabled={thickness >= MAX_THICKNESS}
        aria-label="Aumentar espessura em 1 pixel"
        title="Aumentar espessura (+1px)"
      >
        <StepIcon plus />
      </button>
    </div>
  </div>
);

/** One side in the detailed grid: an on/off toggle and its own thickness. */
const SideControl: React.FC<{
  widgetId: string;
  side: SideDefinition;
  value: number;
  onToggle: () => void;
  onChange: (value: number) => void;
}> = ({ widgetId, side, value, onToggle, onChange }) => {
  const { key, label, tooltip, icon: SideIcon, ariaName } = side;
  const isActive = value > 0;
  return (
    <div
      className={`border-widget__side-control ${isActive ? 'is-active' : ''}`}
    >
      <div className="border-widget__side-header">
        <button
          type="button"
          className={`border-widget__side-icon-btn ${isActive ? 'is-active' : ''}`}
          onClick={onToggle}
          aria-pressed={isActive}
          aria-label={`${ariaName}: ${isActive ? `${value}px` : 'nenhuma'}`}
          title={`Alternar ${ariaName}`}
        >
          <SideIcon />
        </button>
        <label
          htmlFor={`${widgetId}-side-${key}`}
          className="border-widget__side-label"
        >
          {label}:
        </label>
        <span className="border-widget__side-tooltip" role="tooltip">
          {tooltip}
        </span>
      </div>

      <div className="border-widget__side-input-container">
        <input
          id={`${widgetId}-side-${key}`}
          type="number"
          min="0"
          max={MAX_THICKNESS}
          value={value}
          onChange={(e) => onChange(toThickness(e.target.value))}
          className="border-widget__side-input"
          aria-label={`Espessura da borda ${label} em pixels`}
          title={tooltip}
        />
        <span className="border-widget__unit">px</span>
      </div>
    </div>
  );
};

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

  const baseThickness = thickness > 0 ? thickness : 1;

  const handlePreset = (preset: PresetDefinition) =>
    updateSides(preset.apply(baseThickness), preset.announce(baseThickness));

  const toggleSide = ({ key, announceName }: SideDefinition) => {
    const nextVal = sides[key] > 0 ? 0 : baseThickness;
    const action = nextVal > 0 ? `ativada com ${nextVal} pixels` : 'desativada';
    updateSides(
      { ...sides, [key]: nextVal },
      `Borda ${announceName} ${action}`,
    );
  };

  const handleThicknessChange = (newVal: number) => {
    const valid = toThickness(newVal);
    setThickness(valid);
    // Every active side follows the shared thickness.
    if (Object.values(sides).some((val) => val > 0)) {
      updateSides(
        {
          top: sides.top > 0 ? valid : 0,
          right: sides.right > 0 ? valid : 0,
          bottom: sides.bottom > 0 ? valid : 0,
          left: sides.left > 0 ? valid : 0,
        },
        `Espessura alterada para ${valid} pixels`,
      );
    }
  };

  const handleSideThicknessChange = (
    sideKey: keyof BorderSides,
    newVal: number,
  ) => {
    const valid = toThickness(newVal);
    updateSides(
      { ...sides, [sideKey]: valid },
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
                  onClick={() => handlePreset(preset)}
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
          <ThicknessStepper
            widgetId={widgetId}
            thickness={thickness}
            onChange={handleThicknessChange}
          />

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
              {SIDE_CONFIGS.map((side) => (
                <SideControl
                  key={side.key}
                  widgetId={widgetId}
                  side={side}
                  value={sides[side.key]}
                  onToggle={() => toggleSide(side)}
                  onChange={(val) => handleSideThicknessChange(side.key, val)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default BorderWidget;
