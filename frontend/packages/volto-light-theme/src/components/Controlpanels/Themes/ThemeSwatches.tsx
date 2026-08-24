import type { ThemeItem } from '../../../types/theme';
import { themeCustomProperties } from '../../../helpers/themeStyles';

export type ThemeSwatchesProps = {
  /** The theme whose settings become the chips. */
  theme: ThemeItem;
};

/**
 * Small colour chips, so the listing is scannable without opening a theme.
 *
 * The chips come from `themeCustomProperties`, the same function that builds
 * the stylesheet — a swatch therefore shows what the theme actually applies,
 * and a setting that would be dropped as invalid never gets a chip.
 */
const ThemeSwatches = ({ theme }: ThemeSwatchesProps) => (
  <span className="sc-theme-swatches">
    {Object.entries(themeCustomProperties(theme)).map(([variable, color]) => (
      <span
        key={variable}
        className="sc-theme-swatch"
        style={{ backgroundColor: color }}
        title={`${variable}: ${color}`}
      />
    ))}
  </span>
);

export default ThemeSwatches;
