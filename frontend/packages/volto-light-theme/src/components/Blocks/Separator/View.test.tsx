import React from 'react';
import { render } from '@testing-library/react';
import View from './View';

describe('Separator View', () => {
  it('renders correctly', () => {
    const { container } = render(<View data={{}} />);
    expect(container.firstChild).toHaveClass('block separator');
  });
});
