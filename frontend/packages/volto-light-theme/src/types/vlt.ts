/**
 * How the hover reader speaks one language.
 *
 * The reader speaks the site language. An entry whose `lang` matches it (or
 * shares its language: `en-US` for a site in `en`) sets the exact tag given to
 * the browser and the voices to try first. The browser picks the voice: the
 * first installed one whose language matches `lang` exactly, then any voice of
 * the same language, trying `preferredNames` first in both cases.
 */
export type SpeechVoiceOption = {
  /** BCP-47 tag given to the utterance, such as `pt-BR` or `en-US`. */
  lang: string;
  /** Parts of voice names to prefer, in order (`Google`, `Microsoft`, …). */
  preferredNames?: string[];
};

export type SCVLTSettings = {
  headerBehavior: string;
  /**
   * Voices of the hover reader, by language. Projects append to the list to
   * tune another language; see `DEFAULT_SPEECH_VOICES` in
   * `utils/speechSynthesis`.
   */
  speechVoices?: SpeechVoiceOption[];
  headerBar: {
    display: boolean;
    quickLinks?: Array<{
      id?: string;
      label?: string;
      href?: string;
      component?: React.ComponentType<any>;
    }>;
    elements: {
      accessibilityControls: boolean;
      languageSelector: boolean;
      themeToggle: boolean;
      userTools: boolean;
    };
  };
};

/**
 * @deprecated Use `ThemeSettings` from `../types/theme`, which mirrors
 * `ISCVLTThemeDefinition` exactly — this alias predates `header_foreground_color`.
 */
export type { ThemeSettings as SiteThemeSettings } from './theme';
