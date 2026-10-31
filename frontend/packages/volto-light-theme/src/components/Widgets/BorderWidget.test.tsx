import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  BorderWidget,
  parseBorderValue,
  formatBorderValue,
  getBorderDescription,
} from './BorderWidget';

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
  it('retorna descrições amigáveis e claras', () => {
    expect(getBorderDescription({ top: 0, right: 0, bottom: 0, left: 0 })).toBe(
      'Nenhuma borda',
    );
    expect(getBorderDescription({ top: 2, right: 2, bottom: 2, left: 2 })).toBe(
      'Borda completa (2px)',
    );
    expect(getBorderDescription({ top: 3, right: 0, bottom: 0, left: 0 })).toBe(
      'Apenas no topo (3px)',
    );
    expect(getBorderDescription({ top: 0, right: 0, bottom: 4, left: 0 })).toBe(
      'Apenas abaixo (4px)',
    );
    expect(getBorderDescription({ top: 0, right: 2, bottom: 0, left: 2 })).toBe(
      'Nas laterais (2px)',
    );
    expect(getBorderDescription({ top: 2, right: 0, bottom: 0, left: 2 })).toBe(
      'No topo e na lateral esquerda (2px, 2px)',
    );
  });
});

describe('BorderWidget Component', () => {
  it('renderiza corretamente com os presets e controles', () => {
    const onChange = vi.fn();
    render(<BorderWidget id="test-border" value="" onChange={onChange} />);

    expect(screen.getByText('Predefinições rápidas:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sem borda' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Completa' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Topo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abaixo' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Laterais' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Topo & Lateral' }),
    ).toBeInTheDocument();

    // Botões dos lados
    expect(
      screen.getByRole('button', { name: /Borda Superior/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Borda Direita/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Borda Inferior/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Borda Esquerda/i }),
    ).toBeInTheDocument();
  });

  it('dispara onChange com preset Completa', () => {
    const onChange = vi.fn();
    render(<BorderWidget id="test-border" value="0px" onChange={onChange} />);

    const allBtn = screen.getByRole('button', { name: 'Completa' });
    fireEvent.click(allBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '1px');
  });

  it('dispara onChange com preset Topo', () => {
    const onChange = vi.fn();
    render(<BorderWidget id="test-border" value="" onChange={onChange} />);

    const topBtn = screen.getByRole('button', { name: 'Topo' });
    fireEvent.click(topBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '1px 0px 0px 0px');
  });

  it('dispara onChange com preset Laterais', () => {
    const onChange = vi.fn();
    render(<BorderWidget id="test-border" value="" onChange={onChange} />);

    const sidesBtn = screen.getByRole('button', { name: 'Laterais' });
    fireEvent.click(sidesBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '0px 1px');
  });

  it('alterna borda individual ao clicar no botão do lado', () => {
    const onChange = vi.fn();
    render(<BorderWidget id="test-border" value="0px" onChange={onChange} />);

    const topSideBtn = screen.getByRole('button', { name: /Borda Superior/i });
    fireEvent.click(topSideBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '1px 0px 0px 0px');
  });

  it('permite alterar espessura via botões stepper', () => {
    const onChange = vi.fn();
    render(<BorderWidget id="test-border" value="1px" onChange={onChange} />);

    const incBtn = screen.getByRole('button', { name: /Aumentar espessura/i });
    fireEvent.click(incBtn);

    expect(onChange).toHaveBeenCalledWith('test-border', '2px');
  });
});
