import React from 'react';

// =============================================================================
// SVG Icons for Border Presets
// =============================================================================

export function IconPresetNone() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="svg-base-border"
      />
      <line
        x1="5"
        y1="5"
        x2="19"
        y2="19"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="svg-slash-border"
      />
    </svg>
  );
}

export function IconPresetAll() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2"
        strokeWidth="3"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconPresetTop() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="svg-base-border"
      />
      <line
        x1="3"
        y1="3.5"
        x2="21"
        y2="3.5"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconPresetBottom() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="svg-base-border"
      />
      <line
        x1="3"
        y1="20.5"
        x2="21"
        y2="20.5"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconPresetSides() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="svg-base-border"
      />
      <line
        x1="3.5"
        y1="3"
        x2="3.5"
        y2="21"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="svg-active-border"
      />
      <line
        x1="20.5"
        y1="3"
        x2="20.5"
        y2="21"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconPresetTopLeft() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="2"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        className="svg-base-border"
      />
      <polyline
        points="3.5 21 3.5 3.5 21 3.5"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="svg-active-border"
      />
    </svg>
  );
}

// =============================================================================
// SVG Icons for Individual Border Sides
// =============================================================================

export function IconSideTop() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        className="svg-base-border"
      />
      <line
        x1="2.5"
        y1="3"
        x2="17.5"
        y2="3"
        strokeWidth="3"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconSideRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        className="svg-base-border"
      />
      <line
        x1="17"
        y1="2.5"
        x2="17"
        y2="17.5"
        strokeWidth="3"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconSideBottom() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        className="svg-base-border"
      />
      <line
        x1="2.5"
        y1="17"
        x2="17.5"
        y2="17"
        strokeWidth="3"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}

export function IconSideLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        className="svg-base-border"
      />
      <line
        x1="3"
        y1="2.5"
        x2="3"
        y2="17.5"
        strokeWidth="3"
        strokeLinecap="round"
        className="svg-active-border"
      />
    </svg>
  );
}
