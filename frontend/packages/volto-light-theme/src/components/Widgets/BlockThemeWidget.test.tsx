import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import BlockThemeWidget from './BlockThemeWidget';

describe('BlockThemeWidget', () => {
  it('renders with default block theme and split circle', () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <BlockThemeWidget id="theme" onChange={onChange} value="default" />,
    );

    expect(getByText('Padrão')).toBeInTheDocument();
    const splitCircle = container.querySelector('.split-color-circle');
    expect(splitCircle).toBeInTheDocument();
  });

  it('toggles ColorGroups editor when edit pencil is clicked', () => {
    const onChange = vi.fn();
    const { queryByText, getByTitle } = render(
      <BlockThemeWidget id="theme" onChange={onChange} value="default" />,
    );

    expect(queryByText(/Área de Trás/i)).not.toBeInTheDocument();

    const editBtn = getByTitle('Editar ColorGroups do tema');
    fireEvent.click(editBtn);

    expect(queryByText(/Área de Trás/i)).toBeInTheDocument();
    expect(queryByText(/Área da Frente/i)).toBeInTheDocument();
  });

  it('selects another preset block theme', () => {
    const onChange = vi.fn();
    const onChangeBlock = vi.fn();
    const { getByTestId } = render(
      <BlockThemeWidget
        id="theme"
        block="123"
        onChange={onChange}
        onChangeBlock={onChangeBlock}
        value="default"
      />,
    );

    const hiddenSelect = getByTestId('block-theme-hidden-select');
    fireEvent.change(hiddenSelect, { target: { value: 'alternative' } });

    expect(onChange).toHaveBeenCalledWith('theme', 'alternative');
    expect(onChangeBlock).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        theme: 'alternative',
        backColorGroup: 'accent',
        frontColorGroup: 'primary',
      }),
    );
  });

  it('sets theme to custom when changing a ColorGroup', () => {
    const onChange = vi.fn();
    const onChangeBlock = vi.fn();
    const { getByTitle, getByTestId } = render(
      <BlockThemeWidget
        id="theme"
        block="123"
        onChange={onChange}
        onChangeBlock={onChangeBlock}
        value="default"
      />,
    );

    // Open edit mode
    const editBtn = getByTitle('Editar ColorGroups do tema');
    fireEvent.click(editBtn);

    // Change back color group to 'secondary'
    const backSelect = getByTestId('back-cg-hidden-select');
    fireEvent.change(backSelect, { target: { value: 'secondary' } });

    expect(onChange).toHaveBeenCalledWith('theme', 'custom-secondary-neutral');
    expect(onChangeBlock).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        theme: 'custom-secondary-neutral',
        backColorGroup: 'secondary',
        frontColorGroup: 'neutral',
      }),
    );
  });

  it('includes alternative block theme option for parity across all themes', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <BlockThemeWidget id="theme" onChange={onChange} value="default" />,
    );
    const hiddenSelect = getByTestId('block-theme-hidden-select') as HTMLSelectElement;
    const optionValues = Array.from(hiddenSelect.options).map((opt) => opt.value);
    expect(optionValues).toContain('alternative');
    expect(optionValues).not.toContain('festivo');
  });

  it('uses Natal block themes and color groups when siteTheme is natal', () => {
    const onChange = vi.fn();
    const { getByTestId } = render(
      <BlockThemeWidget
        id="theme"
        onChange={onChange}
        value="default"
        siteTheme={{
          token: 'natal',
          title: 'Natal',
        }}
      />,
    );
    const hiddenSelect = getByTestId('block-theme-hidden-select') as HTMLSelectElement;
    const optionValues = Array.from(hiddenSelect.options).map((opt) => opt.value);
    expect(optionValues).toContain('default');
    expect(optionValues).toContain('alternative');
    expect(optionValues).not.toContain('festivo');
  });
});
