import React from 'react';
import cx from 'classnames';
import { normalizeBlockWidth } from '../../../helpers/blockWidth';

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
  const thickness =
    data?.thickness ||
    (data?.styles?.['--cardBorderWidth']
      ? parseInt(data?.styles?.['--cardBorderWidth'], 10)
      : 1);
  // Largura do separador (100% por padrão)
  const width = data?.width || data?.styles?.width || '100%';
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
