import React from 'react';
import { render } from '@testing-library/react';
import SimpleColorPickerWidget from './SimpleColorPickerWidget';

import { IntlProvider } from 'react-intl';

describe('SimpleColorPickerWidget', () => {
  it('renders correctly with default props', () => {
    const { getAllByText } = render(
      <IntlProvider locale="en" messages={{}}>
        <SimpleColorPickerWidget
          id="test-color-picker"
          title="Test Color Picker"
          value="#ffffff"
          onChange={() => {}}
        />
      </IntlProvider>,
    );
    expect(getAllByText('Test Color Picker')[0]).toBeInTheDocument();
  });
});
