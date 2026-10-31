import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import ColorGroupsWidget from './ColorGroupsWidget';

describe('ColorGroupsWidget', () => {
  it('renders default color groups when no value is provided', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    expect(getByText('Primary')).toBeInTheDocument();
    expect(getByText('Secondary')).toBeInTheDocument();
    expect(getByText('Accent')).toBeInTheDocument();
    expect(getByText('Neutral')).toBeInTheDocument();
  });

  it('updates a color group field when changed', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget
        id="color_groups"
        value={{
          primary: {
            id: 'primary',
            name: 'Primary',
            font_family: 'Inter, sans-serif',
            background_color_light: '#ffffff',
            background_color_dark: '#000000',
            text_color_light: '#000000',
            text_color_dark: '#ffffff',
            subtext_color_light: '#333333',
            subtext_color_dark: '#f8f8f8',
            accent_color_light: '#b55e1c',
            accent_color_dark: '#f4822c',
          },
        }}
        onChange={onChange}
      />,
    );

    const fontInput = container.querySelector(
      '#font-primary',
    ) as HTMLInputElement;
    fireEvent.change(fontInput, { target: { value: 'Roboto, sans-serif' } });

    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          font_family: 'Roboto, sans-serif',
        }),
      }),
    );
  });

  it('adds a new color group', () => {
    const onChange = vi.fn();
    const { getByLabelText, getByText } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    const idInput = getByLabelText(/ID do Grupo/i);
    const nameInput = getByLabelText(/Nome Exibido/i);

    fireEvent.change(idInput, { target: { value: 'vermelho' } });
    fireEvent.change(nameInput, { target: { value: 'Vermelho Natal' } });

    const saveButton = getByText('Salvar Novo ColorGroup');
    fireEvent.click(saveButton);

    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        vermelho: expect.objectContaining({
          id: 'vermelho',
          name: 'Vermelho Natal',
        }),
      }),
    );
  });

  it('does not allow deleting base color groups', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    // There should be no delete buttons for primary, secondary, accent, neutral
    const deleteButtons = container.querySelectorAll('.delete-group-btn');
    expect(deleteButtons.length).toBe(0);
  });

  it('allows deleting custom color groups', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget
        id="color_groups"
        value={{
          custom1: {
            id: 'custom1',
            name: 'Custom 1',
            font_family: 'Inter, sans-serif',
            background_color_light: '#111111',
            background_color_dark: '#222222',
            text_color_light: '#333333',
            text_color_dark: '#444444',
            subtext_color_light: '#555555',
            subtext_color_dark: '#666666',
            accent_color_light: '#777777',
            accent_color_dark: '#888888',
          },
        }}
        onChange={onChange}
      />,
    );

    const deleteBtn = container.querySelector('.delete-group-btn');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn!);

    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.not.objectContaining({
        custom1: expect.anything(),
      }),
    );
  });

  it('toggles accordion expansion on header click', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    const header = container.querySelector(
      '.colorgroup-card-header',
    ) as HTMLElement;
    const body = container.querySelector(
      '.colorgroup-card-body',
    ) as HTMLElement;

    expect(body.style.display).toBe('none');

    fireEvent.click(header);
    expect(body.style.display).toBe('block');

    fireEvent.click(header);
    expect(body.style.display).toBe('none');
  });
});
