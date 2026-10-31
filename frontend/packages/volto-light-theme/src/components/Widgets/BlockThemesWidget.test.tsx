import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import BlockThemesWidget from './BlockThemesWidget';

describe('BlockThemesWidget', () => {
  it('renders default block themes when no value is provided', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <BlockThemesWidget id="block_themes" onChange={onChange} />,
    );

    expect(getByText('Default')).toBeInTheDocument();
    expect(getByText('Alternative')).toBeInTheDocument();
  });

  it('updates back_color_group of a block theme', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <BlockThemesWidget
        id="block_themes"
        value={{
          default: {
            id: 'default',
            name: 'Default',
            back_color_group: 'primary',
            front_color_group: 'neutral',
          },
        }}
        onChange={onChange}
      />,
    );

    const select = getByLabelText(/Área de Trás/i);
    fireEvent.change(select, { target: { value: 'secondary' } });

    expect(onChange).toHaveBeenCalledWith(
      'block_themes',
      expect.objectContaining({
        default: expect.objectContaining({
          back_color_group: 'secondary',
        }),
      }),
    );
  });

  it('adds a new block theme', () => {
    const onChange = vi.fn();
    const { getByLabelText, getByText } = render(
      <BlockThemesWidget id="block_themes" onChange={onChange} />,
    );

    const idInput = getByLabelText(/ID do Tema/i);
    const nameInput = getByLabelText(/Nome Exibido/i);

    fireEvent.change(idInput, { target: { value: 'destaque' } });
    fireEvent.change(nameInput, { target: { value: 'Tema Destaque' } });

    const saveButton = getByText('Salvar Tema de Bloco');
    fireEvent.click(saveButton);

    expect(onChange).toHaveBeenCalledWith(
      'block_themes',
      expect.objectContaining({
        destaque: expect.objectContaining({
          id: 'destaque',
          name: 'Tema Destaque',
        }),
      }),
    );
  });

  it('allows deleting a custom block theme but not base themes', () => {
    const onChange = vi.fn();
    const { queryAllByTitle } = render(
      <BlockThemesWidget
        id="block_themes"
        value={{
          default: {
            id: 'default',
            name: 'Default',
            back_color_group: 'primary',
            front_color_group: 'neutral',
          },
          alternative: {
            id: 'alternative',
            name: 'Alternative',
            back_color_group: 'accent',
            front_color_group: 'primary',
          },
          personalizado: {
            id: 'personalizado',
            name: 'Personalizado',
            back_color_group: 'secondary',
            front_color_group: 'neutral',
          },
        }}
        onChange={onChange}
      />,
    );

    // Base themes should not have a delete button, only the custom one
    const deleteButtons = queryAllByTitle('Excluir este tema de bloco');
    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(deleteButtons[0]);

    expect(onChange).toHaveBeenCalledWith('block_themes', {
      default: expect.objectContaining({ id: 'default' }),
      alternative: expect.objectContaining({ id: 'alternative' }),
    });
  });
});
