import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { createIntl } from 'react-intl';
import { renderWithIntl } from '../../support/intl';
import {
  BorderWidget,
  toThickness,
  parseBorderValue,
  formatBorderValue,
  getBorderDescription,
} from '@simplesconsultoria/volto-light-theme/components/Widgets/BorderWidget';

vi.mock('@plone/volto/components/manage/Widgets/FormFieldWrapper', () => ({
  default: ({ children }: any) => (
    <div data-testid="field-wrapper">{children}</div>
  ),
}));

describe('parseBorderValue', () => {
  it('faz parse de valor vazio ou nulo para 0px em todos os lados', () => {
    expect(parseBorderValue(undefined)).toEqual({
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    });
    expect(parseBorderValue('')).toEqual({
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    });
    expect(parseBorderValue('0px')).toEqual({
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    });
  });

  it('faz parse de valor com 1 token (todas as bordas)', () => {
    expect(parseBorderValue('2px')).toEqual({
      sides: { top: 2, right: 2, bottom: 2, left: 2 },
      baseThickness: 2,
      isUniform: true,
    });
  });

  it('faz parse de valor com 2 tokens (vertical e horizontal)', () => {
    expect(parseBorderValue('3px 1px')).toEqual({
      sides: { top: 3, right: 1, bottom: 3, left: 1 },
      baseThickness: 3,
      isUniform: false,
    });
  });

  it('faz parse de valor com 4 tokens (topo, direita, abaixo, esquerda)', () => {
    expect(parseBorderValue('3px 0px 0px 0px')).toEqual({
      sides: { top: 3, right: 0, bottom: 0, left: 0 },
      baseThickness: 3,
      isUniform: true,
    });
    expect(parseBorderValue('0px 2px 0px 2px')).toEqual({
      sides: { top: 0, right: 2, bottom: 0, left: 2 },
      baseThickness: 2,
      isUniform: true,
    });
  });
});

describe('formatBorderValue', () => {
  it('formata 0 em todos os lados como 0px', () => {
    expect(formatBorderValue({ top: 0, right: 0, bottom: 0, left: 0 })).toBe(
      '0px',
    );
  });

  it('formata 4 lados iguais como valor único', () => {
    expect(formatBorderValue({ top: 2, right: 2, bottom: 2, left: 2 })).toBe(
      '2px',
    );
  });

  it('formata pares verticais e horizontais iguais como 2 tokens', () => {
    expect(formatBorderValue({ top: 2, right: 0, bottom: 2, left: 0 })).toBe(
      '2px 0px',
    );
    expect(formatBorderValue({ top: 0, right: 3, bottom: 0, left: 3 })).toBe(
      '0px 3px',
    );
  });

  it('formata lados assimétricos com 4 tokens', () => {
    expect(formatBorderValue({ top: 3, right: 0, bottom: 0, left: 0 })).toBe(
      '3px 0px 0px 0px',
    );
    expect(formatBorderValue({ top: 3, right: 0, bottom: 0, left: 2 })).toBe(
      '3px 0px 0px 2px',
    );
  });
});

describe('getBorderDescription', () => {
  const intl = createIntl({ locale: 'en', messages: {} });

  it('retorna descrições amigáveis e claras', () => {
    expect(
      getBorderDescription({ top: 0, right: 0, bottom: 0, left: 0 }, intl),
    ).toBe('No border');
    expect(
      getBorderDescription({ top: 2, right: 2, bottom: 2, left: 2 }, intl),
    ).toBe('Full border (2px)');
    expect(
      getBorderDescription({ top: 3, right: 0, bottom: 0, left: 0 }, intl),
    ).toBe('Top only (3px)');
    expect(
      getBorderDescription({ top: 0, right: 0, bottom: 4, left: 0 }, intl),
    ).toBe('Bottom only (4px)');
    expect(
      getBorderDescription({ top: 0, right: 2, bottom: 0, left: 2 }, intl),
    ).toBe('On the sides (2px)');
    expect(
      getBorderDescription({ top: 2, right: 0, bottom: 0, left: 2 }, intl),
    ).toBe('On top and left side (2px, 2px)');
  });

  it('describes mixed sides and translates the side names', () => {
    expect(
      getBorderDescription({ top: 1, right: 2, bottom: 3, left: 0 }, intl),
    ).toBe('Borders on: top: 1px, right: 2px, bottom: 3px');
    const ptBR = createIntl({
      locale: 'pt-BR',
      messages: { 'No border': 'Nenhuma borda' },
    });
    expect(
      getBorderDescription({ top: 0, right: 0, bottom: 0, left: 0 }, ptBR),
    ).toBe('Nenhuma borda');
  });
});

describe('BorderWidget Component', () => {
  it('renderiza corretamente com os presets e controles', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="" onChange={onChange} />,
    );

    expect(screen.getByText('Quick presets:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'No border' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Full' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Top' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bottom' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sides' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Top & side' }),
    ).toBeInTheDocument();

    // Botão de expandir ajuste por lado
    const toggleBtn = screen.getByRole('button', {
      name: /Customize thickness per side/i,
    });
    expect(toggleBtn).toBeInTheDocument();

    // Ao expandir, exibe os botões dos 4 lados
    fireEvent.click(toggleBtn);
    expect(
      screen.getByRole('button', { name: /Top border/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Right border/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Bottom border/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Left border/i }),
    ).toBeInTheDocument();
  });

  it('dispara onChange com preset Completa', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="0px" onChange={onChange} />,
    );

    const allBtn = screen.getByRole('button', { name: 'Full' });
    fireEvent.click(allBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '1px');
  });

  it('dispara onChange com preset Topo', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="" onChange={onChange} />,
    );

    const topBtn = screen.getByRole('button', { name: 'Top' });
    fireEvent.click(topBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '1px 0px 0px 0px');
  });

  it('dispara onChange com preset Laterais', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="" onChange={onChange} />,
    );

    const sidesBtn = screen.getByRole('button', { name: 'Sides' });
    fireEvent.click(sidesBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '0px 1px');
  });

  it('alterna borda individual ao clicar no botão do lado', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="0px" onChange={onChange} />,
    );

    // Expande a seção detalhada
    const toggleBtn = screen.getByRole('button', {
      name: /Customize thickness per side/i,
    });
    fireEvent.click(toggleBtn);

    const topSideBtn = screen.getByRole('button', { name: /Top border/i });
    fireEvent.click(topSideBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '1px 0px 0px 0px');
  });

  it('permite alterar espessura via botões stepper', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="1px" onChange={onChange} />,
    );

    const incBtn = screen.getByRole('button', { name: /Increase thickness/i });
    fireEvent.click(incBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '2px');
  });

  it('permite diminuir espessura via botão stepper', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="3px" onChange={onChange} />,
    );

    const decBtn = screen.getByRole('button', { name: /Decrease thickness/i });
    fireEvent.click(decBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '2px');
  });

  it('expande e colapsa a seção de personalização por lado e altera espessura individual', () => {
    const onChange = vi.fn();
    renderWithIntl(
      <BorderWidget id="test-border" value="2px" onChange={onChange} />,
    );

    // Botão de alternância
    const toggleBtn = screen.getByRole('button', {
      name: /Customize thickness per side/i,
    });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Clica para expandir
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Hide per-side settings')).toBeInTheDocument();

    // Altera espessura do Topo
    const topInput = screen.getByLabelText(/Top border thickness in pixels/i);
    expect(topInput).toBeInTheDocument();
    fireEvent.change(topInput, { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith('test-border', '5px 2px 2px 2px');
  });

  it('possui tooltips acessíveis nos presets e botões de lados', () => {
    renderWithIntl(
      <BorderWidget id="test-border" value="" onChange={vi.fn()} />,
    );

    // Presets possuem tooltips descritivos
    const noneBtn = screen.getByRole('button', { name: 'No border' });
    expect(noneBtn).toHaveAttribute('title', 'No border (0px)');

    const allBtn = screen.getByRole('button', { name: 'Full' });
    expect(allBtn).toHaveAttribute('title', 'Full border on all 4 sides');

    // Ao expandir, botões de lados possuem títulos e aria-labels
    const toggleBtn = screen.getByRole('button', {
      name: /Customize thickness per side/i,
    });
    fireEvent.click(toggleBtn);

    const topBtn = screen.getByRole('button', { name: /Top border/i });
    expect(topBtn).toHaveAttribute('title', 'Toggle Top border');
  });
});

describe('BorderWidget translations', () => {
  it('uses the messages of the current locale', () => {
    renderWithIntl(
      <BorderWidget id="test-border" value="" onChange={vi.fn()} />,
      {
        locale: 'pt-BR',
        messages: {
          Full: 'Completa',
          'Quick presets': 'Predefinições rápidas',
        },
      },
    );
    expect(
      screen.getByRole('button', { name: 'Completa' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Predefinições rápidas:')).toBeInTheDocument();
  });

  it('announces a preset in the live region', () => {
    renderWithIntl(
      <BorderWidget id="test-border" value="" onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Full' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Full border enabled at 1 pixels',
    );
  });
});

describe('toThickness', () => {
  it('reads a typed number and rounds it', () => {
    expect(toThickness('3')).toBe(3);
    expect(toThickness('2.6')).toBe(3);
  });

  it('treats anything that is not a finite number as 0', () => {
    expect(toThickness('')).toBe(0);
    expect(toThickness('-')).toBe(0);
    expect(toThickness('e')).toBe(0);
    expect(toThickness(Number.NaN)).toBe(0);
  });

  it('clamps to 0..24', () => {
    expect(toThickness('-5')).toBe(0);
    expect(toThickness('99')).toBe(24);
  });
});
