/**
 * Web Speech Synthesis helpers for the hover reader.
 *
 * The reader speaks the site language (see `readerLanguage`). Per-language
 * voice preferences come from `config.settings.scvlt.speechVoices` (default:
 * `DEFAULT_SPEECH_VOICES`); a project tunes another language by appending an
 * entry, and nothing else needs to change.
 */

import config from '@plone/volto/registry';
import type { SpeechVoiceOption } from '../types/vlt';

export type { SpeechVoiceOption };

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
 * Voices of the hover reader out of the box. The reader speaks the site
 * language; these entries pick the exact tag and the voices to try first.
 */
export const DEFAULT_SPEECH_VOICES: SpeechVoiceOption[] = [
  {
    lang: 'pt-BR',
    preferredNames: ['Google', 'Microsoft', 'Zira', 'Maria', 'Luciana'],
  },
  {
    lang: 'en-US',
    preferredNames: ['Google', 'Microsoft', 'Samantha', 'Aria', 'Zira'],
  },
];

/**
 * The voices configured for this site: `config.settings.scvlt.speechVoices`,
 * or the defaults when a project has not set the list.
 */
export const getSpeechVoiceOptions = (): SpeechVoiceOption[] => {
  const configured = (config as any)?.settings?.scvlt?.speechVoices;
  return Array.isArray(configured) && configured.length
    ? configured
    : DEFAULT_SPEECH_VOICES;
};

/** `pt_BR` and `PT-br` both become `pt-br`, so tags compare reliably. */
const normalizeLang = (lang: string | undefined | null): string =>
  (lang ?? '').trim().replace(/_/g, '-').toLowerCase();

/** The language without its region or script: `en` for `en-US`. */
const primaryLanguage = (lang: string | undefined | null): string =>
  normalizeLang(lang).split('-')[0];

const preferredNamesFor = (lang: string): string[] =>
  getSpeechVoiceOptions().find(
    (option) => normalizeLang(option.lang) === normalizeLang(lang),
  )?.preferredNames ?? [];

/**
 * Pick the voice to speak `lang` with.
 *
 * Voices whose language matches exactly come first, then any voice of the same
 * language (`en-GB` for `en-US`). Within each, a voice whose name contains one of
 * `preferredNames` wins, in the order given; otherwise the first one listed.
 *
 * @param voices the browser's voices.
 * @param lang a BCP-47 tag; `pt_BR` is accepted too.
 * @param preferredNames parts of voice names to prefer.
 * @returns the voice, or `undefined` when none speaks the language.
 */
export const pickVoice = (
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferredNames: string[] = [],
): SpeechSynthesisVoice | undefined => {
  const target = normalizeLang(lang);
  if (!target) return undefined;
  const exact = voices.filter((v) => normalizeLang(v.lang) === target);
  const sameLanguage = voices.filter(
    (v) => primaryLanguage(v.lang) === primaryLanguage(target),
  );

  for (const pool of [exact, sameLanguage]) {
    if (!pool.length) continue;
    for (const name of preferredNames) {
      const preferred = pool.find((v) => v.name.includes(name));
      if (preferred) return preferred;
    }
    return pool[0];
  }
  return undefined;
};

/**
 * The language the reader speaks: the site language.
 *
 * A configured entry for that language (exactly, then by language: `en-US`
 * for a site in `en`) gives the exact tag. A language without an entry is
 * spoken as is, and the browser picks one of its voices. Without a site
 * language, the first entry is used.
 *
 * @param locale the site language, such as `intl.locale` (`pt_BR` works too).
 * @param options the configured entries.
 * @returns a BCP-47 tag, such as `pt-BR`.
 */
export const readerLanguage = (
  locale: string | null | undefined,
  options: SpeechVoiceOption[] = getSpeechVoiceOptions(),
): string => {
  const target = normalizeLang(locale);
  if (!target) return options[0]?.lang ?? 'pt-BR';
  const match =
    options.find((option) => normalizeLang(option.lang) === target) ??
    options.find(
      (option) => primaryLanguage(option.lang) === primaryLanguage(target),
    );
  if (match) return match.lang;
  // `pt-br` back to the canonical `pt-BR`: region subtags are upper case.
  return target.replace(
    /-([a-z]{2})$/,
    (_, region) => `-${region.toUpperCase()}`,
  );
};

/**
 * Gets an array of available voices from the browser.
 * Some browsers load them asynchronously; see `ensureVoicesLoaded`.
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
};

/**
 * The best installed voice for `lang`, trying the preferred names of the
 * configured option with that language.
 */
export const getVoiceFor = (
  lang: string,
  preferredNames: string[] = preferredNamesFor(lang),
): SpeechSynthesisVoice | undefined =>
  pickVoice(getAvailableVoices(), lang, preferredNames);

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
 * Set the language, rate and voice of an utterance. Without an installed voice
 * for `lang`, the browser still gets the language and picks its own.
 */
export const configureUtterance = (
  utterance: SpeechSynthesisUtterance,
  lang: string,
  rate: number = 1,
): void => {
  utterance.lang = lang;
  utterance.rate = rate;

  const voice = getVoiceFor(lang);
  if (voice) {
    utterance.voice = voice;
  }
};

/** @deprecated Use `getVoiceFor('pt-BR')`. */
export const getPortugueseVoice = (): SpeechSynthesisVoice | undefined =>
  getVoiceFor('pt-BR');

/** @deprecated Use `configureUtterance(utterance, 'pt-BR', rate)`. */
export const configurePortugueseUtterance = (
  utterance: SpeechSynthesisUtterance,
  rate: number = 1,
): void => configureUtterance(utterance, 'pt-BR', rate);

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
 * Speak `text` in `lang`, cancelling whatever is being spoken.
 */
export const speakText = (
  text: string,
  lang: string,
  rate: number = 1,
  onError?: () => void,
): void => {
  if (!isSpeechSupported() || !text) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  configureUtterance(utterance, lang, rate);

  utterance.onerror = () => {
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
};

/** @deprecated Use `speakText(text, 'pt-BR', rate, onError)`. */
export const speakPortugueseText = (
  text: string,
  rate: number = 1,
  onError?: () => void,
): void => speakText(text, 'pt-BR', rate, onError);
