import { useState, useEffect, useCallback, type RefObject } from 'react';

type UseAutoCollapseOptions = {
  /** Ref to the outer container that defines the available width. */
  containerRef: RefObject<HTMLElement>;
  /** Ref to a hidden measurer node that contains the full (uncollapsed) content. */
  measurerRef: RefObject<HTMLElement>;
  /**
   * Extra horizontal space (px) to reserve so the content doesn't feel cramped.
   * Defaults to 24 (≈ 1.5rem).
   */
  reservedWidth?: number;
  /** When true the hook always returns `shouldCollapse: true`. */
  forceCollapse?: boolean;
  /** Ref to the visible target that gets collapsed. Used to exclude its current width from sibling calculations. */
  targetRef?: RefObject<HTMLElement>;
};

type UseAutoCollapseResult = {
  /** Whether the content should be collapsed into a dropdown. */
  shouldCollapse: boolean;
};

/**
 * Detects whether the children of a bar (e.g. HeaderBar) overflow their
 * container and should be collapsed into a compact dropdown.
 *
 * How it works:
 * 1. A **measurer node** (hidden with `position: absolute; visibility: hidden`)
 *    renders the full, uncollapsed content so we can measure its natural width.
 * 2. A **container ref** points to the visible wrapper whose `clientWidth`
 *    represents the available space.
 * 3. A `ResizeObserver` watches both elements and flips `shouldCollapse` when
 *    the measurer is wider than the container minus `reservedWidth`.
 *
 * This approach avoids CSS-selector coupling — everything is ref-based.
 */
export const useAutoCollapse = ({
  containerRef,
  measurerRef,
  reservedWidth = 24,
  forceCollapse = false,
  targetRef,
}: UseAutoCollapseOptions): UseAutoCollapseResult => {
  const [shouldCollapse, setShouldCollapse] = useState(forceCollapse);

  const measure = useCallback(() => {
    if (forceCollapse) {
      setShouldCollapse(true);
      return;
    }

    const container = containerRef.current;
    const measurer = measurerRef.current;
    if (!container || !measurer) return;

    const available = container.clientWidth;

    // Dynamically calculate the space taken by other siblings in the container
    let siblingsWidth = 0;
    Array.from(container.children).forEach((child) => {
      const el = child as HTMLElement;
      // Skip the measurer (since we use its scrollWidth explicitly)
      if (el === measurer) return;
      // Skip the target (the visible actions container)
      if (targetRef?.current && el === targetRef.current) return;
      // Include the sibling's width
      siblingsWidth += el.offsetWidth;
    });

    // If the container has a gap, we should ideally account for it.
    // `reservedWidth` serves as a safety buffer for gaps and padding.
    const needed = measurer.scrollWidth + siblingsWidth + reservedWidth;

    setShouldCollapse(needed > available);
  }, [containerRef, measurerRef, targetRef, reservedWidth, forceCollapse]);

  useEffect(() => {
    if (forceCollapse) {
      setShouldCollapse(true);
      return;
    }

    const container = containerRef.current;
    const measurer = measurerRef.current;
    if (!container || !measurer) return;

    // Initial measurement
    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(container);
    observer.observe(measurer);

    return () => observer.disconnect();
  }, [containerRef, measurerRef, measure, forceCollapse]);

  return { shouldCollapse };
};
