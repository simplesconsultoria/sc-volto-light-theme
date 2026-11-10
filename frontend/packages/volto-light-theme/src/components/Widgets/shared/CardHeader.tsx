import React from 'react';

/**
 * Header of a collapsible card in the theme widgets (Color Groups, Block
 * Themes).
 *
 * The toggle is a real `<button aria-expanded>` and the delete button sits
 * next to it, not inside it: a focusable control nested in another one is
 * unreachable for assistive technology.
 */
export interface CardHeaderProps {
  /** Class of the header row, e.g. `colorgroup-card-header`. */
  className: string;
  isExpanded: boolean;
  onToggle: () => void;
  /** Id of the element the toggle shows and hides. */
  controls?: string;
  /** Title, id and tags shown in the toggle. */
  children: React.ReactNode;
  /** Swatches or other previews before the delete button. */
  preview?: React.ReactNode;
  /** Shown only when given; base entries cannot be deleted. */
  onDelete?: () => void;
  deleteClassName?: string;
  deleteLabel?: string;
}

export const ChevronIcon: React.FC<{ rotated: boolean }> = ({ rotated }) => (
  <span
    className={`accordion-chevron ${rotated ? 'rotated' : ''}`}
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
);

export const TrashIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  isExpanded,
  onToggle,
  controls,
  children,
  preview,
  onDelete,
  deleteClassName = 'delete-btn',
  deleteLabel = 'Excluir',
}) => (
  <div className={className}>
    <button
      type="button"
      className="header-left card-toggle"
      aria-expanded={isExpanded}
      aria-controls={controls}
      onClick={onToggle}
    >
      <ChevronIcon rotated={isExpanded} />
      {children}
    </button>

    <div className="header-right">
      {preview}
      {onDelete ? (
        <button
          type="button"
          className={deleteClassName}
          title={deleteLabel}
          aria-label={deleteLabel}
          onClick={onDelete}
        >
          <TrashIcon />
        </button>
      ) : null}
    </div>
  </div>
);
