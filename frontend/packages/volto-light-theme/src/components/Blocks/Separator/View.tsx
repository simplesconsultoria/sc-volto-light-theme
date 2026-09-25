import React from 'react';
import cx from 'classnames';

const SeparatorView = (props: any) => {
  const { data, className } = props;
  const color = data?.color || 'var(--theme-border-color, #ccc)';
  const thickness = data?.thickness || 1;

  return (
    <div className={cx('block separator', className)}>
      <hr
        style={{
          borderColor: color,
          borderWidth: `${thickness}px 0 0 0`,
          borderStyle: 'solid',
        }}
      />
    </div>
  );
};

export default SeparatorView;
