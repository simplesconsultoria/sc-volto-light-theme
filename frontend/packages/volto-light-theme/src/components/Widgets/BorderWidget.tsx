import React, { useState, useEffect, useId, useCallback } from 'react';
import {
  defineMessages,
  useIntl,
  type IntlShape,
  type MessageDescriptor,
} from 'react-intl';
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

const messages = defineMessages({
  // Descriptions (`getBorderDescription`)
  noBorder: { id: 'No border', defaultMessage: 'No border' },
  fullBorder: {
    id: 'Full border ({width}px)',
    defaultMessage: 'Full border ({width}px)',
  },
  fullMixedBorder: {
    id: 'Full mixed border ({top}px, {right}px, {bottom}px, {left}px)',
    defaultMessage:
      'Full mixed border ({top}px, {right}px, {bottom}px, {left}px)',
  },
  topOnly: {
    id: 'Top only ({width}px)',
    defaultMessage: 'Top only ({width}px)',
  },
  bottomOnly: {
    id: 'Bottom only ({width}px)',
    defaultMessage: 'Bottom only ({width}px)',
  },
  sidesEqual: {
    id: 'On the sides ({width}px)',
    defaultMessage: 'On the sides ({width}px)',
  },
  sidesMixed: {
    id: 'On the sides (left: {left}px, right: {right}px)',
    defaultMessage: 'On the sides (left: {left}px, right: {right}px)',
  },
  topAndLeft: {
    id: 'On top and left side ({top}px, {left}px)',
    defaultMessage: 'On top and left side ({top}px, {left}px)',
  },
  bordersOn: {
    id: 'Borders on: {sides}',
    defaultMessage: 'Borders on: {sides}',
  },
  sideTopWidth: { id: 'top: {width}px', defaultMessage: 'top: {width}px' },
  sideRightWidth: {
    id: 'right: {width}px',
    defaultMessage: 'right: {width}px',
  },
  sideBottomWidth: {
    id: 'bottom: {width}px',
    defaultMessage: 'bottom: {width}px',
  },
  sideLeftWidth: { id: 'left: {width}px', defaultMessage: 'left: {width}px' },
  // Presets
  noBorderTooltip: { id: 'No border (0px)', defaultMessage: 'No border (0px)' },
  noBorderAnnounce: {
    id: 'No border selected',
    defaultMessage: 'No border selected',
  },
  full: { id: 'Full', defaultMessage: 'Full' },
  fullTooltip: {
    id: 'Full border on all 4 sides',
    defaultMessage: 'Full border on all 4 sides',
  },
  fullAnnounce: {
    id: 'Full border enabled at {width} pixels',
    defaultMessage: 'Full border enabled at {width} pixels',
  },
  top: { id: 'Top', defaultMessage: 'Top' },
  topTooltip: {
    id: 'Border on top only',
    defaultMessage: 'Border on top only',
  },
  bottom: { id: 'Bottom', defaultMessage: 'Bottom' },
  bottomTooltip: {
    id: 'Border on bottom only',
    defaultMessage: 'Border on bottom only',
  },
  sides: { id: 'Sides', defaultMessage: 'Sides' },
  sidesTooltip: {
    id: 'Borders on the sides (left and right)',
    defaultMessage: 'Borders on the sides (left and right)',
  },
  sidesAnnounce: {
    id: 'Side borders enabled at {width} pixels',
    defaultMessage: 'Side borders enabled at {width} pixels',
  },
  topLeft: { id: 'Top & side', defaultMessage: 'Top & side' },
  topLeftTooltip: {
    id: 'Borders on top and left side',
    defaultMessage: 'Borders on top and left side',
  },
  topLeftAnnounce: {
    id: 'Top and left borders enabled at {width} pixels',
    defaultMessage: 'Top and left borders enabled at {width} pixels',
  },
  // Sides
  right: { id: 'Right', defaultMessage: 'Right' },
  left: { id: 'Left', defaultMessage: 'Left' },
  topBorder: { id: 'Top border', defaultMessage: 'Top border' },
  rightBorder: { id: 'Right border', defaultMessage: 'Right border' },
  bottomBorder: { id: 'Bottom border', defaultMessage: 'Bottom border' },
  leftBorder: { id: 'Left border', defaultMessage: 'Left border' },
  rightSideTooltip: {
    id: 'Right side border',
    defaultMessage: 'Right side border',
  },
  leftSideTooltip: {
    id: 'Left side border',
    defaultMessage: 'Left side border',
  },
  topEnabled: {
    id: 'Top border enabled at {width} pixels',
    defaultMessage: 'Top border enabled at {width} pixels',
  },
  rightEnabled: {
    id: 'Right border enabled at {width} pixels',
    defaultMessage: 'Right border enabled at {width} pixels',
  },
  bottomEnabled: {
    id: 'Bottom border enabled at {width} pixels',
    defaultMessage: 'Bottom border enabled at {width} pixels',
  },
  leftEnabled: {
    id: 'Left border enabled at {width} pixels',
    defaultMessage: 'Left border enabled at {width} pixels',
  },
  topDisabled: {
    id: 'Top border disabled',
    defaultMessage: 'Top border disabled',
  },
  rightDisabled: {
    id: 'Right border disabled',
    defaultMessage: 'Right border disabled',
  },
  bottomDisabled: {
    id: 'Bottom border disabled',
    defaultMessage: 'Bottom border disabled',
  },
  leftDisabled: {
    id: 'Left border disabled',
    defaultMessage: 'Left border disabled',
  },
  sideValue: { id: '{side}: {width}px', defaultMessage: '{side}: {width}px' },
  sideNone: { id: '{side}: none', defaultMessage: '{side}: none' },
  toggleSide: { id: 'Toggle {side}', defaultMessage: 'Toggle {side}' },
  sideThickness: {
    id: '{side} thickness in pixels',
    defaultMessage: '{side} thickness in pixels',
  },
  sideThicknessChanged: {
    id: '{side} thickness changed to {width} pixels',
    defaultMessage: '{side} thickness changed to {width} pixels',
  },
  // Thickness
  borderThickness: {
    id: 'Border thickness',
    defaultMessage: 'Border thickness',
  },
  decrease: {
    id: 'Decrease thickness by 1 pixel',
    defaultMessage: 'Decrease thickness by 1 pixel',
  },
  decreaseTitle: {
    id: 'Decrease thickness (-1px)',
    defaultMessage: 'Decrease thickness (-1px)',
  },
  increase: {
    id: 'Increase thickness by 1 pixel',
    defaultMessage: 'Increase thickness by 1 pixel',
  },
  increaseTitle: {
    id: 'Increase thickness (+1px)',
    defaultMessage: 'Increase thickness (+1px)',
  },
  thicknessChanged: {
    id: 'Thickness changed to {width} pixels',
    defaultMessage: 'Thickness changed to {width} pixels',
  },
  // Layout
  quickPresets: { id: 'Quick presets', defaultMessage: 'Quick presets' },
  hidePerSide: {
    id: 'Hide per-side settings',
    defaultMessage: 'Hide per-side settings',
  },
  customizePerSide: {
    id: 'Customize thickness per side',
    defaultMessage: 'Customize thickness per side',
  },
  asymmetric: { id: 'Asymmetric', defaultMessage: 'Asymmetric' },
  asymmetricTitle: {
    id: 'Borders have asymmetric thicknesses',
    defaultMessage: 'Borders have asymmetric thicknesses',
  },
  perSideRegion: {
    id: 'Independent thickness per side',
    defaultMessage: 'Independent thickness per side',
  },
});

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
 * Convert a numeric value to a safe pixel string.
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
 * Return a readable description for screen readers and visual summaries.
 */
export function getBorderDescription(
  sides: BorderSides,
  intl: IntlShape,
): string {
  const { top, right, bottom, left } = sides;
  const activeCount = [top > 0, right > 0, bottom > 0, left > 0].filter(
    Boolean,
  ).length;

  if (activeCount === 0) return intl.formatMessage(messages.noBorder);
  if (activeCount === 4) {
    return top === right && right === bottom && bottom === left
      ? intl.formatMessage(messages.fullBorder, { width: top })
      : intl.formatMessage(messages.fullMixedBorder, {
          top,
          right,
          bottom,
          left,
        });
  }
  if (top > 0 && right === 0 && bottom === 0 && left === 0) {
    return intl.formatMessage(messages.topOnly, { width: top });
  }
  if (top === 0 && right === 0 && bottom > 0 && left === 0) {
    return intl.formatMessage(messages.bottomOnly, { width: bottom });
  }
  if (top === 0 && right > 0 && bottom === 0 && left > 0) {
    return left === right
      ? intl.formatMessage(messages.sidesEqual, { width: left })
      : intl.formatMessage(messages.sidesMixed, { left, right });
  }
  if (top > 0 && right === 0 && bottom === 0 && left > 0) {
    return intl.formatMessage(messages.topAndLeft, { top, left });
  }

  const activeNames: string[] = [];
  if (top > 0)
    activeNames.push(intl.formatMessage(messages.sideTopWidth, { width: top }));
  if (right > 0)
    activeNames.push(
      intl.formatMessage(messages.sideRightWidth, { width: right }),
    );
  if (bottom > 0)
    activeNames.push(
      intl.formatMessage(messages.sideBottomWidth, { width: bottom }),
    );
  if (left > 0)
    activeNames.push(
      intl.formatMessage(messages.sideLeftWidth, { width: left }),
    );

  return intl.formatMessage(messages.bordersOn, {
    sides: activeNames.join(', '),
  });
}

type PresetKey = 'none' | 'all' | 'top' | 'bottom' | 'sides' | 'top-left';

interface PresetDefinition {
  key: PresetKey;
  name: MessageDescriptor;
  tooltip: MessageDescriptor;
  icon: React.FC;
  isActive: (sides: BorderSides) => boolean;
  /** The sides this preset sets for a thickness `t`. */
  apply: (t: number) => BorderSides;
  /** What the live region announces; formatted with `{ width }`. */
  announce: MessageDescriptor;
}

const PRESETS: PresetDefinition[] = [
  {
    key: 'none',
    name: messages.noBorder,
    tooltip: messages.noBorderTooltip,
    icon: IconPresetNone,
    isActive: (s) =>
      s.top === 0 && s.right === 0 && s.bottom === 0 && s.left === 0,
    apply: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    announce: messages.noBorderAnnounce,
  },
  {
    key: 'all',
    name: messages.full,
    tooltip: messages.fullTooltip,
    icon: IconPresetAll,
    isActive: (s) => s.top > 0 && s.right > 0 && s.bottom > 0 && s.left > 0,
    apply: (t) => ({ top: t, right: t, bottom: t, left: t }),
    announce: messages.fullAnnounce,
  },
  {
    key: 'top',
    name: messages.top,
    tooltip: messages.topTooltip,
    icon: IconPresetTop,
    isActive: (s) =>
      s.top > 0 && s.right === 0 && s.bottom === 0 && s.left === 0,
    apply: (t) => ({ top: t, right: 0, bottom: 0, left: 0 }),
    announce: messages.topEnabled,
  },
  {
    key: 'bottom',
    name: messages.bottom,
    tooltip: messages.bottomTooltip,
    icon: IconPresetBottom,
    isActive: (s) =>
      s.top === 0 && s.right === 0 && s.bottom > 0 && s.left === 0,
    apply: (t) => ({ top: 0, right: 0, bottom: t, left: 0 }),
    announce: messages.bottomEnabled,
  },
  {
    key: 'sides',
    name: messages.sides,
    tooltip: messages.sidesTooltip,
    icon: IconPresetSides,
    isActive: (s) => s.top === 0 && s.right > 0 && s.bottom === 0 && s.left > 0,
    apply: (t) => ({ top: 0, right: t, bottom: 0, left: t }),
    announce: messages.sidesAnnounce,
  },
  {
    key: 'top-left',
    name: messages.topLeft,
    tooltip: messages.topLeftTooltip,
    icon: IconPresetTopLeft,
    isActive: (s) => s.top > 0 && s.right === 0 && s.bottom === 0 && s.left > 0,
    apply: (t) => ({ top: t, right: 0, bottom: 0, left: t }),
    announce: messages.topLeftAnnounce,
  },
];

interface SideDefinition {
  key: keyof BorderSides;
  label: MessageDescriptor;
  tooltip: MessageDescriptor;
  icon: React.FC;
  /** Accessible name of the side's toggle ("Top border"). */
  ariaName: MessageDescriptor;
  /** Announced when the side is switched on; formatted with `{ width }`. */
  enabled: MessageDescriptor;
  /** Announced when the side is switched off. */
  disabled: MessageDescriptor;
}

const SIDE_CONFIGS: SideDefinition[] = [
  {
    key: 'top',
    label: messages.top,
    tooltip: messages.topBorder,
    icon: IconSideTop,
    ariaName: messages.topBorder,
    enabled: messages.topEnabled,
    disabled: messages.topDisabled,
  },
  {
    key: 'right',
    label: messages.right,
    tooltip: messages.rightSideTooltip,
    icon: IconSideRight,
    ariaName: messages.rightBorder,
    enabled: messages.rightEnabled,
    disabled: messages.rightDisabled,
  },
  {
    key: 'bottom',
    label: messages.bottom,
    tooltip: messages.bottomBorder,
    icon: IconSideBottom,
    ariaName: messages.bottomBorder,
    enabled: messages.bottomEnabled,
    disabled: messages.bottomDisabled,
  },
  {
    key: 'left',
    label: messages.left,
    tooltip: messages.leftSideTooltip,
    icon: IconSideLeft,
    ariaName: messages.leftBorder,
    enabled: messages.leftEnabled,
    disabled: messages.leftDisabled,
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

/** "Border width" number field with -1 / +1 buttons. */
const ThicknessStepper: React.FC<{
  widgetId: string;
  thickness: number;
  onChange: (value: number) => void;
}> = ({ widgetId, thickness, onChange }) => {
  const intl = useIntl();
  return (
    <div className="border-widget__thickness-row">
      <label
        htmlFor={`${widgetId}-thickness-input`}
        className="border-widget__thickness-label"
      >
        {intl.formatMessage(messages.borderThickness)}:
      </label>
      <div className="border-widget__stepper-wrapper">
        <button
          type="button"
          className="border-widget__stepper-btn border-widget__stepper-btn--dec"
          onClick={() => onChange(thickness - 1)}
          disabled={thickness <= 0}
          aria-label={intl.formatMessage(messages.decrease)}
          title={intl.formatMessage(messages.decreaseTitle)}
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
          onClick={() => onChange(thickness + 1)}
          disabled={thickness >= MAX_THICKNESS}
          aria-label={intl.formatMessage(messages.increase)}
          title={intl.formatMessage(messages.increaseTitle)}
        >
          <StepIcon plus />
        </button>
      </div>
    </div>
  );
};

/** One side in the detailed grid: an on/off toggle and its own thickness. */
const SideControl: React.FC<{
  widgetId: string;
  side: SideDefinition;
  value: number;
  onToggle: () => void;
  onChange: (value: number) => void;
}> = ({ widgetId, side, value, onToggle, onChange }) => {
  const intl = useIntl();
  const { key, icon: SideIcon } = side;
  const label = intl.formatMessage(side.label);
  const tooltip = intl.formatMessage(side.tooltip);
  const ariaName = intl.formatMessage(side.ariaName);
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
          aria-label={
            isActive
              ? intl.formatMessage(messages.sideValue, {
                  side: ariaName,
                  width: value,
                })
              : intl.formatMessage(messages.sideNone, { side: ariaName })
          }
          title={intl.formatMessage(messages.toggleSide, { side: ariaName })}
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
          aria-label={intl.formatMessage(messages.sideThickness, {
            side: ariaName,
          })}
          title={tooltip}
        />
        <span className="border-widget__unit">px</span>
      </div>
    </div>
  );
};

export const BorderWidget: React.FC<BorderWidgetProps> = (props) => {
  const { id, value, onChange } = props;
  const intl = useIntl();
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
        setAnnouncement(getBorderDescription(newSides, intl));
      }
    },
    [id, onChange, value, intl],
  );

  const baseThickness = thickness > 0 ? thickness : 1;

  const handlePreset = (preset: PresetDefinition) =>
    updateSides(
      preset.apply(baseThickness),
      intl.formatMessage(preset.announce, { width: baseThickness }),
    );

  const toggleSide = ({ key, enabled, disabled }: SideDefinition) => {
    const nextVal = sides[key] > 0 ? 0 : baseThickness;
    updateSides(
      { ...sides, [key]: nextVal },
      nextVal > 0
        ? intl.formatMessage(enabled, { width: nextVal })
        : intl.formatMessage(disabled),
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
        intl.formatMessage(messages.thicknessChanged, { width: valid }),
      );
    }
  };

  const handleSideThicknessChange = (side: SideDefinition, newVal: number) => {
    const valid = toThickness(newVal);
    updateSides(
      { ...sides, [side.key]: valid },
      intl.formatMessage(messages.sideThicknessChanged, {
        side: intl.formatMessage(side.ariaName),
        width: valid,
      }),
    );
  };

  return (
    <FormFieldWrapper {...props} className="border-widget-field">
      <div
        className="border-widget"
        role="group"
        aria-labelledby={`${widgetId}-label`}
      >
        {/* Live region for a11y announcements */}
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {/* 1. Presets rápidos de posicionamento com ícones e tooltips acessíveis */}
        <div className="border-widget__section">
          <div
            className="border-widget__presets-label"
            id={`${widgetId}-presets-label`}
          >
            {intl.formatMessage(messages.quickPresets)}:
          </div>
          <div
            className="border-widget__presets-toolbar"
            role="toolbar"
            aria-labelledby={`${widgetId}-presets-label`}
          >
            {PRESETS.map((preset) => {
              const active = preset.isActive(sides);
              const PresetIcon = preset.icon;
              const name = intl.formatMessage(preset.name);
              const tooltip = intl.formatMessage(preset.tooltip);

              return (
                <button
                  key={preset.key}
                  type="button"
                  className={`border-widget__preset-btn ${active ? 'is-active' : ''}`}
                  onClick={() => handlePreset(preset)}
                  aria-pressed={active}
                  aria-label={name}
                  title={tooltip}
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
                    {tooltip}
                  </span>
                  <span className="sr-only">{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Numeric border width control */}
        <div className="border-widget__thickness-section">
          <ThicknessStepper
            widgetId={widgetId}
            thickness={thickness}
            onChange={handleThicknessChange}
          />

          {/* Toggle for per-side customization */}
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
                {intl.formatMessage(
                  showDetailed
                    ? messages.hidePerSide
                    : messages.customizePerSide,
                )}
              </span>
              {!showDetailed && !parsed.isUniform && (
                <span
                  className="border-widget__asymmetric-pill"
                  title={intl.formatMessage(messages.asymmetricTitle)}
                >
                  {intl.formatMessage(messages.asymmetric)}
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
              aria-label={intl.formatMessage(messages.perSideRegion)}
            >
              {SIDE_CONFIGS.map((side) => (
                <SideControl
                  key={side.key}
                  widgetId={widgetId}
                  side={side}
                  value={sides[side.key]}
                  onToggle={() => toggleSide(side)}
                  onChange={(val) => handleSideThicknessChange(side, val)}
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
