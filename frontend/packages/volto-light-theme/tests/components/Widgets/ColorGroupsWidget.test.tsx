import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import ColorGroupsWidget from '@simplesconsultoria/volto-light-theme/components/Widgets/ColorGroupsWidget';

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

  it('applies a CSS pattern preset when clicked', () => {
    const onChange = vi.fn();
    const { getAllByText, container } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    // Expand primary group
    const header = container.querySelector(
      '.colorgroup-card-header',
    ) as HTMLElement;
    fireEvent.click(header);

    // Click 'Pontos (Dots)' preset button in the expanded card
    const dotsBtn = getAllByText('Pontos (Dots)')[0];
    fireEvent.click(dotsBtn);

    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_image_light_desktop: expect.stringContaining('radial-gradient'),
          bg_size: '24px 24px',
          bg_repeat: 'repeat',
          bg_position: '0 0',
        }),
      }),
    );
  });

  it('updates background layer fields: repeat, size, position, and mode images', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    // Expand primary group
    const header = container.querySelector(
      '.colorgroup-card-header',
    ) as HTMLElement;
    fireEvent.click(header);

    // Change Light Desktop image
    const lightDeskInput = container.querySelector(
      '#img-light-desk-primary',
    ) as HTMLInputElement;
    fireEvent.change(lightDeskInput, {
      target: { value: 'https://example.com/banner.png' },
    });
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_image_light_desktop: 'https://example.com/banner.png',
        }),
      }),
    );

    // Change Repeat
    const repeatSelect = container.querySelector(
      '#bg-repeat-primary',
    ) as HTMLSelectElement;
    fireEvent.change(repeatSelect, { target: { value: 'no-repeat' } });
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_repeat: 'no-repeat',
        }),
      }),
    );

    // Change Size
    const sizeSelect = container.querySelector(
      '#bg-size-primary',
    ) as HTMLSelectElement;
    fireEvent.change(sizeSelect, { target: { value: 'cover' } });
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_size: 'cover',
        }),
      }),
    );

    // Change Position
    const posSelect = container.querySelector(
      '#bg-pos-primary',
    ) as HTMLSelectElement;
    fireEvent.change(posSelect, { target: { value: 'top center' } });
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_position: 'top center',
        }),
      }),
    );
  });

  it('updates background layer fields by clicking interactive icon buttons', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    // Expand primary group
    const header = container.querySelector(
      '.colorgroup-card-header',
    ) as HTMLElement;
    fireEvent.click(header);

    // Click Cover size button
    const coverBtn = container.querySelector(
      '#bg-size-cover-primary',
    ) as HTMLButtonElement;
    expect(coverBtn).toBeInTheDocument();
    fireEvent.click(coverBtn);
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_size: 'cover',
        }),
      }),
    );

    // Click No-Repeat button
    const noRepeatBtn = container.querySelector(
      '#bg-repeat-no-repeat-primary',
    ) as HTMLButtonElement;
    expect(noRepeatBtn).toBeInTheDocument();
    fireEvent.click(noRepeatBtn);
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_repeat: 'no-repeat',
        }),
      }),
    );

    // Click Top-Left compass cell
    const topLeftBtn = container.querySelector(
      '#bg-pos-top-left-primary',
    ) as HTMLButtonElement;
    expect(topLeftBtn).toBeInTheDocument();
    fireEvent.click(topLeftBtn);
    expect(onChange).toHaveBeenCalledWith(
      'color_groups',
      expect.objectContaining({
        primary: expect.objectContaining({
          bg_position: 'top left',
        }),
      }),
    );
  });

  it('toggles device preview simulation between Desktop and Mobile', () => {
    const onChange = vi.fn();
    const { container } = render(
      <ColorGroupsWidget id="color_groups" onChange={onChange} />,
    );

    const header = container.querySelector(
      '.colorgroup-card-header',
    ) as HTMLElement;
    fireEvent.click(header);

    const deviceBtn = container.querySelector(
      '.device-toggle-btn',
    ) as HTMLButtonElement;
    expect(deviceBtn).toBeInTheDocument();
    expect(deviceBtn.textContent).toContain('Desktop');

    fireEvent.click(deviceBtn);
    expect(deviceBtn.textContent).toContain('Mobile');

    fireEvent.click(deviceBtn);
    expect(deviceBtn.textContent).toContain('Desktop');
  });
});
