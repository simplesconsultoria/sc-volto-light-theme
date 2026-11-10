import React from 'react';
import {
  SIZE_OPTIONS,
  SIZE_PATTERN_PILLS,
  REPEAT_OPTIONS,
  POSITION_COMPASS,
} from './constants';

export type LayerSizingField = 'bg_size' | 'bg_repeat' | 'bg_position';

export interface LayerSizingControlsProps {
  /** Suffix of every control id (the group id, or `new` in the add form). */
  idSuffix: string;
  size?: string;
  repeat?: string;
  position?: string;
  onChange: (field: LayerSizingField, value: string) => void;
  className?: string;
}

const slug = (value: string) => value.replace(/[^a-z0-9]/gi, '-');

/**
 * Size, repeat and position of a Color Group's 2nd background layer: icon
 * buttons for the common values plus a free text field for anything else.
 * Shared by the group editor and the "new group" form.
 */
export const LayerSizingControls: React.FC<LayerSizingControlsProps> = ({
  idSuffix,
  size,
  repeat,
  position,
  onChange,
  className = 'layer-controls-interactive layer-controls-row',
}) => {
  const currentSize = size || 'auto';
  const currentRepeat = repeat || 'repeat';
  const currentPosition = (position || 'center').toLowerCase().trim();

  return (
    <div className={className}>
      <div className="control-group-box">
        <label className="control-group-label" htmlFor={`bg-size-${idSuffix}`}>
          Tamanho (background-size):
        </label>
        <div className="icon-button-group button-group-row">
          {SIZE_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            return (
              <button
                key={opt.value}
                id={`bg-size-${slug(opt.value)}-${idSuffix}`}
                type="button"
                className={`icon-btn ${currentSize === opt.value ? 'is-active' : ''}`}
                aria-pressed={currentSize === opt.value}
                onClick={() => onChange('bg_size', opt.value)}
                title={opt.title}
              >
                <IconComp />
                <span>{opt.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="pattern-pills-row">
          <span className="pills-hint">Patterns CSS:</span>
          {SIZE_PATTERN_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              className={`pill-btn size-pill ${size === pill.value ? 'is-active' : ''}`}
              aria-pressed={size === pill.value}
              onClick={() => onChange('bg_size', pill.value)}
              title={pill.title}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <input
          id={`bg-size-${idSuffix}`}
          type="text"
          className="custom-input-compact"
          value={size || ''}
          onChange={(e) => onChange('bg_size', e.target.value)}
          placeholder="ou digite custom (ex: 40px 40px)"
        />
      </div>

      <div className="control-group-box">
        <label
          className="control-group-label"
          htmlFor={`bg-repeat-${idSuffix}`}
        >
          Repetição (background-repeat):
        </label>
        <div className="icon-button-group button-group-row">
          {REPEAT_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            return (
              <button
                key={opt.value}
                id={`bg-repeat-${slug(opt.value)}-${idSuffix}`}
                type="button"
                className={`icon-btn ${currentRepeat === opt.value ? 'is-active' : ''}`}
                aria-pressed={currentRepeat === opt.value}
                onClick={() => onChange('bg_repeat', opt.value)}
                title={opt.title}
              >
                <IconComp />
                <span>{opt.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <input
          id={`bg-repeat-${idSuffix}`}
          type="text"
          className="custom-input-compact"
          value={repeat || ''}
          onChange={(e) => onChange('bg_repeat', e.target.value)}
          placeholder="ou digite custom (ex: repeat space)"
        />
      </div>

      <div className="control-group-box">
        <label className="control-group-label" htmlFor={`bg-pos-${idSuffix}`}>
          Posição (background-position):
        </label>
        <div className="compass-grid-wrapper">
          <div className="compass-grid">
            {POSITION_COMPASS.map((pos) => (
              <button
                key={pos.value}
                id={`bg-pos-${pos.idKey}-${idSuffix}`}
                type="button"
                className={`compass-cell-btn ${currentPosition === pos.value ? 'is-active' : ''}`}
                aria-pressed={currentPosition === pos.value}
                aria-label={pos.label}
                onClick={() => onChange('bg_position', pos.value)}
                title={pos.label}
              >
                {pos.arrow}
              </button>
            ))}
          </div>
        </div>

        <input
          id={`bg-pos-${idSuffix}`}
          type="text"
          className="custom-input-compact"
          value={position || ''}
          onChange={(e) => onChange('bg_position', e.target.value)}
          placeholder="ou digite custom (ex: 50% 20px)"
        />
      </div>
    </div>
  );
};
