import React from 'react';
import cx from 'classnames';
import { normalizeBlockWidth } from '../../../helpers/blockWidth';

/** Width of the upstream separator's short line (`styles.shortLine`). */
export const SHORT_LINE_WIDTH = '165px';

/**
 * The line thickness, in pixels, a `--cardBorderWidth` value asks for.
 *
 * The value is a `border-width` shorthand (`2px`, or `0px 0px 3px 0px` for the
 * bottom only), so it is the thickest of its sides: reading only the first
 * number gave 0 for any border not set on top, and the line disappeared.
 *
 * @returns the thickness, or 0 when the value has no usable width.
 */
export function borderThickness(value: unknown): number {
  if (typeof value !== 'string') return 0;
  const sides = value
    .trim()
    .split(/\s+/)
    .map((part) => parseFloat(part))
    .filter((n) => Number.isFinite(n) && n > 0);
  return sides.length ? Math.max(...sides) : 0;
}

// Estilos de margem conforme o alinhamento selecionado
const getMarginStyle = (alignment: string) => {
  switch (alignment) {
    case 'left':
      return { marginLeft: 0, marginRight: 'auto' };
    case 'right':
      return { marginLeft: 'auto', marginRight: 0 };
    default:
      return { marginLeft: 'auto', marginRight: 'auto' };
  }
};

const SeparatorView = (props: any) => {
  const { data, className, style } = props;

  const color =
    data?.color ||
    data?.styles?.['--cardBorderColor'] ||
    'var(--theme-border-color, #ccc)';
  const cardBorderWidth = data?.styles?.['--cardBorderWidth'];
  const thickness =
    data?.thickness || (cardBorderWidth ? borderThickness(cardBorderWidth) : 1);
  // Separator width (100% by default). Blocks saved by the upstream
  // separator (@kitconcept/volto-separator-block) use `styles.shortLine`
  // for the short line, which measures 165px there.
  const width =
    data?.width ||
    data?.styles?.width ||
    (data?.styles?.shortLine ? SHORT_LINE_WIDTH : '100%');
  // Alinhamento horizontal (center por padrão)
  const alignment =
    data?.alignment ||
    data?.align ||
    data?.styles?.['align:noprefix'] ||
    'center';
  const blockWidth = normalizeBlockWidth(data) || 'default';

  const cleanClassName = (className || '')
    .replace(/has--block-width--[\w-]+/g, '')
    .trim();

  return (
    <div
      className={cx('block separator', cleanClassName, {
        [`has--block-width--${blockWidth}`]: blockWidth !== 'default',
        'has--block-width--default': blockWidth === 'default',
      })}
      style={style}
    >
      <hr
        style={{
          borderColor: color,
          borderWidth: `${thickness}px 0 0 0`,
          borderStyle: 'solid',
          width,
          ...getMarginStyle(alignment),
        }}
      />
    </div>
  );
};

export default SeparatorView;
