import React from 'react';

// =============================================================================
// Background Repeat and Sizing SVG Icons
// =============================================================================

export const IconRepeatAll: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export const IconRepeatX: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="7" width="5" height="10" rx="1" />
    <rect x="9.5" y="7" width="5" height="10" rx="1" />
    <rect x="17" y="7" width="5" height="10" rx="1" />
    <line x1="2" y1="4" x2="22" y2="4" strokeDasharray="2 2" />
    <line x1="2" y1="20" x2="22" y2="20" strokeDasharray="2 2" />
  </svg>
);

export const IconRepeatY: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="7" y="2" width="10" height="5" rx="1" />
    <rect x="7" y="9.5" width="10" height="5" rx="1" />
    <rect x="7" y="17" width="10" height="5" rx="1" />
    <line x1="4" y1="2" x2="4" y2="22" strokeDasharray="2 2" />
    <line x1="20" y1="2" x2="20" y2="22" strokeDasharray="2 2" />
  </svg>
);

export const IconNoRepeat: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
    <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
  </svg>
);

export const IconRepeatRound: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 12a8 8 0 0 1 14.9-4M20 12a8 8 0 0 1-14.9 4" />
    <polyline points="18 4 20 8 16 8" />
    <polyline points="6 20 4 16 8 16" />
  </svg>
);

export const IconRepeatSpace: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
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

export const IconSizeCover: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

export const IconSizeContain: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
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

export const IconSizeAuto: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
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

export const IconSizeWidth: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <polyline points="7 8 3 12 7 16" />
    <polyline points="17 8 21 12 17 16" />
    <line x1="3" y1="5" x2="3" y2="19" />
    <line x1="21" y1="5" x2="21" y2="19" />
  </svg>
);

// =============================================================================
// CSS Pattern Preset Thumbnails
// =============================================================================

export function renderPatternPresetIcon(presetId: string): React.ReactNode {
  switch (presetId) {
    case 'none':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7" strokeWidth="1.5" opacity="0.4" />
          <line x1="5" y1="15" x2="15" y2="5" strokeWidth="1.5" />
        </svg>
      );
    case 'dots':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="5" r="1.5" />
          <circle cx="10" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="5" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="15" cy="10" r="1.5" />
          <circle cx="5" cy="15" r="1.5" />
          <circle cx="10" cy="15" r="1.5" />
          <circle cx="15" cy="15" r="1.5" />
        </svg>
      );
    case 'grid':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="14" height="14" rx="1" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="10" y1="3" x2="10" y2="17" />
        </svg>
      );
    case 'diagonal-stripes':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <line x1="2" y1="8" x2="8" y2="2" />
          <line x1="4" y1="16" x2="16" y2="4" />
          <line x1="12" y1="18" x2="18" y2="12" />
        </svg>
      );
    case 'waves-acreative':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 7 C5 4, 8 10, 11 7 C14 4, 17 10, 19 7" />
          <path d="M2 13 C5 10, 8 16, 11 13 C14 10, 17 16, 19 13" />
        </svg>
      );
    case 'blueprint':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="16" height="16" />
          <line x1="2" y1="6" x2="18" y2="6" opacity="0.5" />
          <line x1="2" y1="10" x2="18" y2="10" strokeWidth="1.2" />
          <line x1="2" y1="14" x2="18" y2="14" opacity="0.5" />
          <line x1="6" y1="2" x2="6" y2="18" opacity="0.5" />
          <line x1="10" y1="2" x2="10" y2="18" strokeWidth="1.2" />
          <line x1="14" y1="2" x2="14" y2="18" opacity="0.5" />
        </svg>
      );
    case 'zigzag':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="2 8 6 4 10 8 14 4 18 8" />
          <polyline points="2 16 6 12 10 16 14 12 18 16" />
        </svg>
      );
    case 'radial-mesh':
      return (
        <svg
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="3" />
          <circle cx="10" cy="10" r="7" strokeDasharray="2 2" />
        </svg>
      );
    default:
      return null;
  }
}
