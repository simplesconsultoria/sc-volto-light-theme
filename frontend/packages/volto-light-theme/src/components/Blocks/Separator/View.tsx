import React from 'react';
import cx from 'classnames';

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
  const { data, className } = props;

  const color = data?.color || 'var(--theme-border-color, #ccc)';
  const thickness = data?.thickness || 1;
  // Largura do separador (100% por padrão)
  const width = data?.width || '100%';
  // Alinhamento horizontal (center por padrão)
  const alignment = data?.alignment || 'center';
  let blockWidth = data?.blockWidth || 'default';

  // Trata o objeto salvo pelo widget nativo 'blockWidth' (que salva a prop '--block-width')
  if (typeof blockWidth === 'object') {
    const val = (blockWidth as any)['--block-width'];
    if (val === 'unset') blockWidth = 'full';
    else if (val === 'var(--layout-container-width)') blockWidth = 'layout';
    else if (val === 'var(--narrow-container-width)') blockWidth = 'narrow';
    else if (val === 'var(--default-container-width)') blockWidth = 'default';
    else blockWidth = 'default';
  }

  // O Volto injeta 'has--block-width--default' automaticamente se não encontrar em data.styles.
  // Precisamos limpar isso para aplicar o nosso selecionado na raiz.
  const cleanClassName = (className || '')
    .replace(/has--block-width--[\w-]+/g, '')
    .trim();

  // Aplica estilos manualmente para garantir que funcione mesmo sem SCSS global mapeado para o separator
  const getBlockWidthStyle = (bw: string) => {
    switch (bw) {
      case 'narrow':
        return {
          maxWidth: 'var(--narrow-container-width)',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
        };
      case 'layout':
        return {
          maxWidth: 'var(--layout-container-width)',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
        };
      case 'default':
        return {
          maxWidth: 'var(--default-container-width)',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
        };
      case 'full':
        return {
          maxWidth: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '100%',
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={cx('block separator', cleanClassName, {
        [`has--block-width--${blockWidth}`]: blockWidth !== 'default',
        'has--block-width--default': blockWidth === 'default',
      })}
      style={getBlockWidthStyle(blockWidth)}
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
