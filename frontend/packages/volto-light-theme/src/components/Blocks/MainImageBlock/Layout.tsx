import React from 'react';
import cx from 'classnames';

const SIZE_CLASS = {
  s: 'small',
  m: 'medium',
  l: 'large',
} as const;

const ALIGN_VALUES = ['left', 'center', 'right', 'full'] as const;

export type MainImageAlign = (typeof ALIGN_VALUES)[number];
export type MainImageSize = keyof typeof SIZE_CLASS;

interface LayoutProps {
  image: React.ReactNode;
  align?: MainImageAlign;
  size?: MainImageSize;
  title?: string;
  description?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Layout: React.FC<LayoutProps> = ({
  image,
  align = 'center',
  size = 'm',
  title,
  description,
  className,
  style,
}) => {
  return (
    <div
      className={cx(
        'block image align',
        {
          center: !Boolean(align),
        },
        align,
        {
          large: size === 'l',
          medium: size === 'm' || !size,
          small: size === 's',
        },
        className,
      )}
      style={style}
    >
      <figure
        className={cx(
          'figure',
          {
            center: !Boolean(align),
          },
          align,
          {
            large: size === 'l',
            medium: size === 'm' || !size,
            small: size === 's',
          },
        )}
      >
        {image}
        {(title || description) && (
          <figcaption>
            {title && <strong className="title">{title}</strong>}
            {description && (
              <div className="description">
                {description.split('\n').map((line, index) => (
                  <p key={index}>{line || '\u00A0'}</p>
                ))}
              </div>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
};

export default Layout;
