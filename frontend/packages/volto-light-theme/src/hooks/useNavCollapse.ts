import { useState, useEffect, useCallback, type RefObject } from 'react';

type UseNavCollapseOptions = {
  /** Ref to the container that defines the available width. */
  containerRef: RefObject<HTMLElement>;
  /** Ref to an invisible 'ul' containing all items + the 'More' button as the last child. */
  measurerRef: RefObject<HTMLElement>;
  /** Total number of items (excluding the 'More' button). */
  totalItems: number;
  /** Extra width to reserve for safety/margins. */
  reservedWidth?: number;
};

type UseNavCollapseResult = {
  /** The number of items that fit into the available space without wrapping. */
  visibleCount: number;
};

/**
 * Calculates how many navigation items fit into the available space.
 *
 * It requires a "measurer" node in the DOM that contains all items
 * rendered at their natural width, plus a "More" button rendered as
 * the last child. It measures each item to determine exactly where
 * to cut the list off.
 */
export const useNavCollapse = ({
  containerRef,
  measurerRef,
  totalItems,
  reservedWidth = 0,
}: UseNavCollapseOptions): UseNavCollapseResult => {
  // Start by assuming all items are visible (or 0 if none)
  const [visibleCount, setVisibleCount] = useState(totalItems);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const measurer = measurerRef.current;
    if (!container || !measurer) return;

    // Available width for the navigation
    const availableWidth = container.clientWidth - reservedWidth;

    // The items inside the measurer
    const children = Array.from(measurer.children) as HTMLElement[];

    // We expect the 'More' dropdown to be the last child
    const moreItem = children[children.length - 1];
    const moreItemWidth = moreItem ? moreItem.offsetWidth : 0;

    // Total width if we just render everything natively
    const totalContentWidth = measurer.scrollWidth;

    // Fast path: if everything fits perfectly without the "More" button
    if (totalContentWidth - moreItemWidth <= availableWidth) {
      setVisibleCount(totalItems);
      return;
    }

    // Otherwise, we need to find how many items fit ALONG WITH the "More" button
    let accumulatedWidth = 0;
    let count = 0;

    for (let i = 0; i < totalItems; i++) {
      const itemWidth = children[i]?.offsetWidth || 0;

      // If adding this item + the 'More' button exceeds available space, stop.
      if (accumulatedWidth + itemWidth + moreItemWidth > availableWidth) {
        break;
      }

      accumulatedWidth += itemWidth;
      count++;
    }

    // Ensure we always show at least 1 item if possible, or 0 if even 1 doesn't fit
    setVisibleCount(Math.max(0, count));
  }, [containerRef, measurerRef, totalItems, reservedWidth]);

  useEffect(() => {
    const container = containerRef.current;
    const measurer = measurerRef.current;
    if (!container || !measurer) return;

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });

    observer.observe(container);
    observer.observe(measurer);

    return () => observer.disconnect();
  }, [containerRef, measurerRef, measure]);

  return { visibleCount };
};
