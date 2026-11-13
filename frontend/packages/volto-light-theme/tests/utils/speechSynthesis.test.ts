import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_SPEECH_VOICES,
  getSpeechVoiceOptions,
  pickVoice,
  readerLanguage,
  type SpeechVoiceOption,
} from '@simplesconsultoria/volto-light-theme/utils/speechSynthesis';

const { registry } = vi.hoisted(() => ({
  registry: { settings: { scvlt: {} as Record<string, unknown> } },
}));
vi.mock('@plone/volto/registry', () => ({ default: registry }));

/** The fields `pickVoice` reads; the rest of a voice does not matter here. */
const voice = (name: string, lang: string) =>
  ({ name, lang }) as SpeechSynthesisVoice;

describe('pickVoice', () => {
  it('prefers a voice whose language matches exactly', () => {
    const voices = [voice('UK', 'en-GB'), voice('US', 'en-US')];
    expect(pickVoice(voices, 'en-US')?.name).toBe('US');
  });

  it('falls back to another region of the same language', () => {
    const voices = [voice('Portugal', 'pt-PT'), voice('US', 'en-US')];
    expect(pickVoice(voices, 'pt-BR')?.name).toBe('Portugal');
  });

  it('reads the underscore form of a language tag', () => {
    expect(pickVoice([voice('Brazil', 'pt_BR')], 'pt-BR')?.name).toBe('Brazil');
    expect(pickVoice([voice('Brazil', 'pt-BR')], 'pt_BR')?.name).toBe('Brazil');
  });

  it('ignores the case of a language tag', () => {
    expect(pickVoice([voice('US', 'EN-us')], 'en-US')?.name).toBe('US');
  });

  it('picks a preferred name first, in the order given', () => {
    const voices = [
      voice('eSpeak', 'pt-BR'),
      voice('Microsoft Maria', 'pt-BR'),
      voice('Google português', 'pt-BR'),
    ];
    expect(pickVoice(voices, 'pt-BR', ['Google', 'Microsoft'])?.name).toBe(
      'Google português',
    );
    expect(pickVoice(voices, 'pt-BR', ['Microsoft', 'Google'])?.name).toBe(
      'Microsoft Maria',
    );
  });

  it('takes the first voice of the language when no name is preferred', () => {
    const voices = [voice('eSpeak', 'pt-BR'), voice('Other', 'pt-BR')];
    expect(pickVoice(voices, 'pt-BR', ['Google'])?.name).toBe('eSpeak');
  });

  it('keeps an exact match over a preferred voice of another region', () => {
    const voices = [voice('Google UK', 'en-GB'), voice('eSpeak', 'en-US')];
    expect(pickVoice(voices, 'en-US', ['Google'])?.name).toBe('eSpeak');
  });

  it('returns nothing when no voice speaks the language', () => {
    expect(pickVoice([voice('US', 'en-US')], 'pt-BR')).toBeUndefined();
    expect(pickVoice([], 'pt-BR')).toBeUndefined();
    expect(pickVoice([voice('US', 'en-US')], '')).toBeUndefined();
  });
});

describe('readerLanguage', () => {
  const options: SpeechVoiceOption[] = [
    { lang: 'pt-BR' },
    { lang: 'en-US' },
    { lang: 'es' },
  ];

  it('speaks the site language, exactly or by language', () => {
    expect(readerLanguage('pt-BR', options)).toBe('pt-BR');
    expect(readerLanguage('pt_BR', options)).toBe('pt-BR');
    expect(readerLanguage('pt', options)).toBe('pt-BR');
    expect(readerLanguage('en', options)).toBe('en-US');
    expect(readerLanguage('es-AR', options)).toBe('es');
  });

  it('speaks a language without an entry as is', () => {
    expect(readerLanguage('de', options)).toBe('de');
    expect(readerLanguage('fr_ca', options)).toBe('fr-CA');
  });

  it('uses the first entry without a site language', () => {
    expect(readerLanguage(undefined, options)).toBe('pt-BR');
    expect(readerLanguage('', [])).toBe('pt-BR');
  });
});

describe('getSpeechVoiceOptions', () => {
  beforeEach(() => {
    registry.settings.scvlt = {};
  });

  it('offers Brazilian Portuguese and English by default', () => {
    expect(getSpeechVoiceOptions()).toBe(DEFAULT_SPEECH_VOICES);
    expect(DEFAULT_SPEECH_VOICES.map((o) => o.lang)).toEqual([
      'pt-BR',
      'en-US',
    ]);
  });

  it('reads the list a project configures', () => {
    const own = [...DEFAULT_SPEECH_VOICES, { lang: 'es-ES' }];
    registry.settings.scvlt = { speechVoices: own };
    expect(getSpeechVoiceOptions()).toBe(own);
  });

  it('falls back to the defaults for an empty list', () => {
    registry.settings.scvlt = { speechVoices: [] };
    expect(getSpeechVoiceOptions()).toBe(DEFAULT_SPEECH_VOICES);
  });
});
