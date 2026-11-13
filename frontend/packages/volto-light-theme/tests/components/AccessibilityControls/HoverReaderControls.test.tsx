import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import HoverReaderControls from '@simplesconsultoria/volto-light-theme/components/AccessibilityControls/HoverReaderControls';
import { renderWithIntl } from '../../support/intl';

const { registry } = vi.hoisted(() => ({
  registry: { settings: { scvlt: {} as Record<string, unknown> } },
}));
vi.mock('@plone/volto/registry', () => ({ default: registry }));

class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

const voices = [
  { name: 'Google português do Brasil', lang: 'pt-BR' },
  { name: 'Google US English', lang: 'en-US' },
] as SpeechSynthesisVoice[];

let speak: ReturnType<typeof vi.fn>;

/** Volto's test setup stubs storage with no-ops; preferences need a real one. */
const memoryStorage = () => {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, String(value)),
    removeItem: (key: string) => void items.delete(key),
    clear: () => items.clear(),
  };
};

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  registry.settings.scvlt = {};
  speak = vi.fn();
  Object.assign(window, {
    speechSynthesis: {
      getVoices: () => voices,
      speak,
      cancel: vi.fn(),
      onvoiceschanged: null,
    },
    SpeechSynthesisUtterance: FakeUtterance,
  });
});

afterEach(() => {
  // Unmount before removing the API: the voice loader's cleanup touches it.
  cleanup();
  vi.useRealTimers();
  delete (window as any).speechSynthesis;
  delete (window as any).SpeechSynthesisUtterance;
});

/** The options panel is hidden from assistive technology until the reader is on. */
const turnReaderOn = () =>
  fireEvent.click(screen.getAllByRole('button', { name: 'Read on hover' })[0]);

/**
 * Hover a paragraph and return the utterance the reader spoke. The text
 * differs per site language: the reader skips the text it read last, and that
 * memory outlives a test.
 */
const readAloud = (locale: string) => {
  const text = `Hello there, visitor (${locale}).`;
  vi.useFakeTimers();
  renderWithIntl(
    <>
      <HoverReaderControls />
      <p>{text}</p>
    </>,
    { locale },
  );
  turnReaderOn();
  fireEvent.mouseOver(screen.getByText(text));
  act(() => {
    vi.advanceTimersByTime(300);
  });
  expect(speak).toHaveBeenCalledTimes(1);
  return speak.mock.calls[0][0] as FakeUtterance;
};

describe('HoverReaderControls language', () => {
  it('has no language selector: the site language decides', () => {
    renderWithIntl(<HoverReaderControls />, { locale: 'en' });
    turnReaderOn();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('reads in English on an English site', () => {
    const utterance = readAloud('en');
    expect(utterance.lang).toBe('en-US');
    expect(utterance.voice?.name).toBe('Google US English');
  });

  it('reads in Brazilian Portuguese on a Portuguese site', () => {
    const utterance = readAloud('pt-BR');
    expect(utterance.lang).toBe('pt-BR');
    expect(utterance.voice?.name).toBe('Google português do Brasil');
  });

  it('reads a language without an entry in that language', () => {
    const utterance = readAloud('es');
    expect(utterance.lang).toBe('es');
    // No Spanish voice installed: the browser picks one for `lang`.
    expect(utterance.voice).toBeNull();
  });

  it('uses the voices a project configures for a language', () => {
    registry.settings.scvlt = {
      speechVoices: [{ lang: 'en-GB', preferredNames: ['UK'] }],
    };
    const utterance = readAloud('en-AU');
    expect(utterance.lang).toBe('en-GB');
  });
});
