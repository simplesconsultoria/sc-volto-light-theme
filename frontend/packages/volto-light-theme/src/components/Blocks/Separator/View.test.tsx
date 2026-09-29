import React from 'react';
import { render } from '@testing-library/react';
import View from './View';

describe('Separator View', () => {
  it('renders with default settings', () => {
    const { container } = render(<View data={{}} />);
    expect(container.firstChild).toHaveClass('block separator');
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('applies custom width', () => {
    const { container } = render(<View data={{ width: '50%' }} />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ width: '50%' });
  });

  it('applies left alignment', () => {
    const { container } = render(
      <View data={{ width: '50%', alignment: 'left' }} />,
    );
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ marginLeft: 0, marginRight: 'auto' });
  });

  it('applies right alignment', () => {
    const { container } = render(
      <View data={{ width: '25%', alignment: 'right' }} />,
    );
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ marginLeft: 'auto', marginRight: 0 });
  });

  it('applies center alignment by default', () => {
    const { container } = render(<View data={{ width: '75%' }} />);
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ marginLeft: 'auto', marginRight: 'auto' });
  });

  it('applies custom thickness and color', () => {
    const { container } = render(
      <View data={{ thickness: 3, color: '#ff0000' }} />,
    );
    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ borderColor: '#ff0000' });
  });
});
