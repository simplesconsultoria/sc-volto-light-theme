import React, { useEffect, useRef, useState } from 'react';

export interface SwatchOption {
  id: string;
  label: string;
  /** Colour preview shown before the label. */
  swatch: React.ReactNode;
}

export interface SwatchDropdownProps {
  /** Class prefix: `theme` or `colorgroup` (`<prefix>-dropdown-trigger`…). */
  variant: 'theme' | 'colorgroup';
  value: string;
  options: SwatchOption[];
  onSelect: (id: string) => void;
  /** Swatch and text of the closed trigger. */
  triggerSwatch: React.ReactNode;
  triggerLabel: string;
  /** Class of the trigger's text (`theme-name-label`, `cg-label`). */
  triggerLabelClassName: string;
  triggerId?: string;
  ariaLabel?: string;
  /**
   * Test hook: a hidden native `<select>` mirroring the options, so tests can
   * pick a value with `fireEvent.change`. Rendered only when given.
   */
  hiddenSelect?: {
    testId: string;
    className: string;
    /** Extra values the select accepts beyond `options`. */
    extraOptions?: { value: string; label: string }[];
  };
}

/**
 * Trigger button plus a listbox of colour swatches, closing on selection and
 * on any click outside it. Used for the block theme and for the back/front
 * Color Group pickers of `BlockThemeWidget`.
 */
export const SwatchDropdown: React.FC<SwatchDropdownProps> = ({
  variant,
  value,
  options,
  onSelect,
  triggerSwatch,
  triggerLabel,
  triggerLabelClassName,
  triggerId,
  ariaLabel,
  hiddenSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const select = (id: string) => {
    setIsOpen(false);
    onSelect(id);
  };

  return (
    <div className={`${variant}-dropdown-container`} ref={containerRef}>
      <button
        type="button"
        className={`${variant}-dropdown-trigger`}
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        id={triggerId}
      >
        {triggerSwatch}
        <span className={triggerLabelClassName}>{triggerLabel}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {hiddenSelect && (
        <select
          className={`sr-only ${hiddenSelect.className}`}
          data-testid={hiddenSelect.testId}
          value={value}
          onChange={(e) => select(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          style={{ display: 'none' }}
        >
          {/* Ids, not labels: the select is a test hook, not visible text. */}
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.id}
            </option>
          ))}
          {hiddenSelect.extraOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {isOpen && (
        <div className={`${variant}-dropdown-menu`} role="listbox">
          {options.map((opt) => {
            const isSelected = value === opt.id;
            return (
              <div
                key={opt.id}
                className={`${variant}-dropdown-item ${isSelected ? 'selected' : ''}`}
                role="option"
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => select(opt.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    select(opt.id);
                  }
                }}
              >
                {opt.swatch}
                <span className="item-label">{opt.label}</span>
                {isSelected && <span className="check-mark">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
