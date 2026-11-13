import type { HeroBlockData } from './types';

type HeroButtonData = NonNullable<HeroBlockData['buttons']>[number];

/**
 * The hero date is shown when there is a real date (Plone serialises a
 * missing date as the string "None") and the editor has not turned it off.
 */
export const shouldShowHeroDate = (
  date: string | null | undefined,
  showDate: boolean | undefined,
): date is string => !!date && date !== 'None' && showDate !== false;

/** Resolves link, label and theme class of a hero call-to-action button. */
export const getHeroButtonProps = (
  button: HeroButtonData,
  defaultHref: string,
) => ({
  link: button.buttonLink?.[0]?.['@id'] || defaultHref,
  text: button.buttonText || 'Saiba mais',
  themeClass: button.theme ? `theme-${button.theme}` : 'theme-primary',
});
