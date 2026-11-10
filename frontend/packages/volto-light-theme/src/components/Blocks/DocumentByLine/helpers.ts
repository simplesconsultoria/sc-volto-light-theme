import type { Content } from '@plone/types';

/**
 * True when the given content carries at least one byline field
 * (publication date, modification date or a non-empty creators list).
 */
export const hasByLineData = (content?: Partial<Content> | null): boolean =>
  Boolean(
    content?.effective ||
      content?.modified ||
      (content?.creators && content.creators.length > 0),
  );

/**
 * Resolves the document content shown by the byline.
 *
 * Inside containers (GridBlock, CustomGrid, Accordion), `metadata` carries the
 * document object, while `properties` may carry the container or column object
 * (or merged metadata). `stateContent` (Redux store) is an extra fallback.
 */
export const resolveBaseContent = (
  stateContent?: Content,
  properties?: Content,
  metadata?: Content,
): Content => {
  if (hasByLineData(metadata)) {
    return { ...(stateContent || {}), ...(properties || {}), ...metadata };
  }
  if (hasByLineData(properties)) {
    return { ...(stateContent || {}), ...properties };
  }
  return stateContent || metadata || properties || ({} as Content);
};

/**
 * In edit mode or inside containers where dates/authors might not be stored
 * on the sub-item, provide fallback values so the user sees metadata instead
 * of an empty box.
 */
export const withByLineFallback = (
  baseContent: Content,
  data: Record<string, any>,
): Content => {
  if (hasByLineData(baseContent)) return baseContent;
  return {
    effective:
      data?.effective || baseContent?.effective || new Date().toISOString(),
    modified:
      data?.modified || baseContent?.modified || new Date().toISOString(),
    creators: data?.creators || baseContent?.creators || ['admin'],
  } as Content;
};
