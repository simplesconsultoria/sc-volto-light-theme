import {
  getHeroButtonProps,
  shouldShowHeroDate,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/HeroBlock/heroContent';

describe('HeroBlock content helpers', () => {
  it('shows the date only when present and enabled', () => {
    expect(shouldShowHeroDate('2026-01-01', undefined)).toBe(true);
    expect(shouldShowHeroDate('2026-01-01', true)).toBe(true);
    expect(shouldShowHeroDate('2026-01-01', false)).toBe(false);
    expect(shouldShowHeroDate('None', true)).toBe(false);
    expect(shouldShowHeroDate(null, true)).toBe(false);
  });

  it('resolves button link, text and theme', () => {
    expect(
      getHeroButtonProps(
        {
          buttonText: 'Go',
          buttonLink: [{ '@id': '/x' } as any],
          theme: 'dark',
        },
        '/default',
      ),
    ).toEqual({ link: '/x', text: 'Go', themeClass: 'theme-dark' });
    expect(
      getHeroButtonProps({ buttonText: '', buttonLink: [] }, '/default'),
    ).toEqual({
      link: '/default',
      text: 'Saiba mais',
      themeClass: 'theme-primary',
    });
  });
});
