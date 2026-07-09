/**
 * Utilities for Web Speech Synthesis with Portuguese voice selection
 */

export type ReadingChunk = {
  text: string;
  pauseAfterMs: number;
};

const READABLE_BLOCK_SELECTOR =
  'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, td, th';
const DEFAULT_CHUNK_PAUSE_MS = 220;
const DEFAULT_BLOCK_PAUSE_MS = 120;

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

/**
 * Gets an array of available voices from the browser.
 * This function ensures voices are loaded by triggering the onvoiceschanged event.
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
};

/**
 * Finds the best Portuguese (pt-BR) voice available in the browser.
 * Tries multiple voice name patterns to maximize compatibility across browsers.
 * Falls back to any voice with pt-BR language code if no exact match.
 */
export const getPortugueseVoice = (): SpeechSynthesisVoice | undefined => {
  const voices = getAvailableVoices();
  if (!voices.length) return undefined;

  // Prefer Google or Microsoft Portuguese voices (usually better quality)
  const preferredVoice = voices.find(
    (v) =>
      (v.lang === 'pt-BR' ||
        v.lang === 'pt_BR' ||
        v.lang.startsWith('pt-BR')) &&
      (v.name.includes('Google') ||
        v.name.includes('Microsoft') ||
        v.name.includes('Zira') ||
        v.name.includes('Maria')),
  );

  if (preferredVoice) return preferredVoice;

  // Fallback: any pt-BR voice
  return voices.find((v) => v.lang === 'pt-BR' || v.lang === 'pt_BR');
};

/**
 * Initializes voice loading by triggering the onvoiceschanged event.
 * Some browsers (Chrome, Edge) load voices asynchronously.
 * Call this in a useEffect to ensure voices are available before speaking.
 */
export const ensureVoicesLoaded = (callback?: () => void): (() => void) => {
  if (!isSpeechSupported()) {
    callback?.();
    return () => {};
  }

  const handleVoicesChanged = () => {
    callback?.();
  };

  window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

  // Trigger immediate load attempt
  window.speechSynthesis.getVoices();

  // Return cleanup function
  return () => {
    window.speechSynthesis.onvoiceschanged = null;
  };
};

/**
 * Configures an utterance with Portuguese language and voice settings
 */
export const configurePortugueseUtterance = (
  utterance: SpeechSynthesisUtterance,
  rate: number = 1,
): void => {
  utterance.lang = 'pt-BR';
  utterance.rate = rate;

  const voice = getPortugueseVoice();
  if (voice) {
    utterance.voice = voice;
  }
};

const normalizeText = (text: string): string =>
  text.replace(/\s+/g, ' ').trim();

const splitTextToChunks = (text: string): string[] => {
  const rawParts = normalizeText(text)
    .split(/(?<=[.!?:;])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  rawParts.forEach((part) => {
    if (!current) {
      current = part;
      return;
    }

    if (`${current} ${part}`.length <= 220) {
      current = `${current} ${part}`;
      return;
    }

    chunks.push(current);
    current = part;
  });

  if (current) chunks.push(current);
  return chunks;
};

const isNestedInReadableBlock = (
  element: HTMLElement,
  readableBlocks: HTMLElement[],
): boolean =>
  readableBlocks.some(
    (candidate) =>
      candidate !== element &&
      candidate.contains(element) &&
      Boolean(
        candidate.compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_CONTAINED_BY,
      ),
  );

const getReadableBlocks = (node: HTMLElement): HTMLElement[] => {
  const blocks = Array.from(
    node.querySelectorAll<HTMLElement>(READABLE_BLOCK_SELECTOR),
  ).filter((element) => !element.closest('[aria-hidden="true"]'));

  if (blocks.length) {
    return blocks.filter(
      (element) => !isNestedInReadableBlock(element, blocks),
    );
  }

  return [node];
};

export const createReadingChunks = (node: HTMLElement): ReadingChunk[] => {
  const chunks: ReadingChunk[] = [];
  const blocks = getReadableBlocks(node);

  blocks.forEach((block, blockIndex) => {
    const text = normalizeText(block.textContent ?? '');
    if (!text) return;

    const parts = splitTextToChunks(text);
    const isLastBlock = blockIndex === blocks.length - 1;

    parts.forEach((part, partIndex) => {
      const isLastPart = partIndex === parts.length - 1;
      let pauseAfterMs = DEFAULT_CHUNK_PAUSE_MS;
      if (isLastPart && !isLastBlock) {
        pauseAfterMs = DEFAULT_BLOCK_PAUSE_MS;
      }

      chunks.push({
        text: part,
        pauseAfterMs,
      });
    });
  });

  if (chunks.length) {
    chunks[chunks.length - 1].pauseAfterMs = 0;
  }

  return chunks;
};

/**
 * Safely speaks text with Portuguese voice
 * Handles edge cases like already-speaking utterances
 */
export const speakPortugueseText = (
  text: string,
  rate: number = 1,
  onError?: () => void,
): void => {
  if (!isSpeechSupported() || !text) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  configurePortugueseUtterance(utterance, rate);

  utterance.onerror = () => {
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
};
