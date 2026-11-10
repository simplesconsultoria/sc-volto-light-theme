import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithIntl } from '../../support/intl';
import BlockThemesWidget from '@simplesconsultoria/volto-light-theme/components/Widgets/BlockThemesWidget';

describe('BlockThemesWidget', () => {
  it('renders default block themes when no value is provided', () => {
    const onChange = vi.fn();
    const { getByText } = renderWithIntl(
      <BlockThemesWidget id="block_themes" onChange={onChange} />,
    );

    expect(
      getByText('Default', { selector: '.theme-name' }),
    ).toBeInTheDocument();
    expect(getByText('Alternative')).toBeInTheDocument();
  });

  it('updates back_color_group of a block theme', () => {
    const onChange = vi.fn();
    const { getByLabelText } = renderWithIntl(
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

    const select = getByLabelText(/Back area/i);
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
    const { getByLabelText, getByText } = renderWithIntl(
      <BlockThemesWidget id="block_themes" onChange={onChange} />,
    );

    const idInput = getByLabelText(/Theme ID/i);
    const nameInput = getByLabelText(/Display name/i);

    fireEvent.change(idInput, { target: { value: 'destaque' } });
    fireEvent.change(nameInput, { target: { value: 'Tema Destaque' } });

    const saveButton = getByText('Save block theme');
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
    const { queryAllByTitle } = renderWithIntl(
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
    const deleteButtons = queryAllByTitle(/^Delete block theme /);
    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(deleteButtons[0]);

    expect(onChange).toHaveBeenCalledWith('block_themes', {
      default: expect.objectContaining({ id: 'default' }),
      alternative: expect.objectContaining({ id: 'alternative' }),
    });
  });

  it('renders the labels of the current locale', () => {
    const { getByText, getByRole } = renderWithIntl(
      <BlockThemesWidget id="block_themes" onChange={vi.fn()} />,
      {
        locale: 'pt-BR',
        messages: {
          'Block themes': 'Temas de bloco',
          'Save block theme': 'Salvar tema de bloco',
          'The block theme ID is required.':
            'O ID do tema de bloco é obrigatório.',
        },
      },
    );

    expect(getByText('Temas de bloco')).toBeInTheDocument();
    fireEvent.click(getByText('Salvar tema de bloco'));
    expect(getByRole('alert')).toHaveTextContent(
      'O ID do tema de bloco é obrigatório.',
    );
  });
});
