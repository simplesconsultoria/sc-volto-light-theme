import React, { useState, useEffect, useId, useCallback } from 'react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';

export interface BorderWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: string;
  onChange: (id: string, value: string | undefined) => void;
  required?: boolean;
  intl?: any;
  [key: string]: any;
}

export interface BorderSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Converte valor numérico para pixel string seguro.
 */
function toPx(val: number): string {
  return `${Math.max(0, Math.round(val))}px`;
}

/**
 * Faz parse de valores CSS border-width (de 1 a 4 partes, ex: '1px', '3px 0px 0px 0px', '2px 0px').
 */
export function parseBorderValue(val?: string): {
  sides: BorderSides;
  baseThickness: number;
  isUniform: boolean;
} {
  if (!val || typeof val !== 'string') {
    return {
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    };
  }

  const trimmed = val.trim();
  if (trimmed === '' || trimmed === '0' || trimmed === '0px') {
    return {
      sides: { top: 0, right: 0, bottom: 0, left: 0 },
      baseThickness: 1,
      isUniform: true,
    };
  }

  const parts = trimmed.split(/\s+/).map((p) => {
    const num = parseInt(p.replace(/px|rem|em|pt/g, ''), 10);
    return Number.isNaN(num) ? 0 : Math.max(0, num);
  });

  let top = 0;
  let right = 0;
  let bottom = 0;
  let left = 0;

  if (parts.length === 1) {
    top = right = bottom = left = parts[0];
  } else if (parts.length === 2) {
    top = bottom = parts[0];
    right = left = parts[1];
  } else if (parts.length === 3) {
    top = parts[0];
    right = left = parts[1];
    bottom = parts[2];
  } else if (parts.length >= 4) {
    [top, right, bottom, left] = parts;
  }

  const activeSides = [top, right, bottom, left].filter((s) => s > 0);
  const baseThickness = activeSides.length > 0 ? activeSides[0] : 1;
  const isUniform =
    activeSides.length <= 1 || activeSides.every((s) => s === activeSides[0]);

  return {
    sides: { top, right, bottom, left },
    baseThickness: baseThickness > 0 ? baseThickness : 1,
    isUniform,
  };
}

/**
 * Formata os 4 lados em string CSS canônica de border-width.
 */
export function formatBorderValue(sides: BorderSides): string {
  const { top, right, bottom, left } = sides;

  if (top === 0 && right === 0 && bottom === 0 && left === 0) {
    return '0px';
  }

  if (top === right && right === bottom && bottom === left) {
    return toPx(top);
  }

  if (top === bottom && right === left) {
    return `${toPx(top)} ${toPx(right)}`;
  }

  return `${toPx(top)} ${toPx(right)} ${toPx(bottom)} ${toPx(left)}`;
}

/**
 * Retorna uma descrição em texto legível para leitores de tela e resumos visuais.
 */
export function getBorderDescription(sides: BorderSides): string {
  const { top, right, bottom, left } = sides;
  const activeCount = [top > 0, right > 0, bottom > 0, left > 0].filter(
    Boolean,
  ).length;

  if (activeCount === 0) return 'Nenhuma borda';
  if (activeCount === 4) {
    return top === right && right === bottom && bottom === left
      ? `Borda completa (${top}px)`
      : `Borda completa mista (${top}px, ${right}px, ${bottom}px, ${left}px)`;
  }
  if (top > 0 && right === 0 && bottom === 0 && left === 0) {
    return `Apenas no topo (${top}px)`;
  }
  if (top === 0 && right === 0 && bottom > 0 && left === 0) {
    return `Apenas abaixo (${bottom}px)`;
  }
  if (top === 0 && right > 0 && bottom === 0 && left > 0) {
    return `Nas laterais (${left === right ? `${left}px` : `esq: ${left}px, dir: ${right}px`})`;
  }
  if (top > 0 && right === 0 && bottom === 0 && left > 0) {
    return `No topo e na lateral esquerda (${top}px, ${left}px)`;
  }

  const activeNames: string[] = [];
  if (top > 0) activeNames.push(`topo: ${top}px`);
  if (right > 0) activeNames.push(`direita: ${right}px`);
  if (bottom > 0) activeNames.push(`abaixo: ${bottom}px`);
  if (left > 0) activeNames.push(`esquerda: ${left}px`);

  return `Bordas em: ${activeNames.join(', ')}`;
}

export const BorderWidget: React.FC<BorderWidgetProps> = (props) => {
  const { id, value, onChange } = props;
  const widgetId = useId();

  const parsed = parseBorderValue(value);
  const [sides, setSides] = useState<BorderSides>(parsed.sides);
  const [thickness, setThickness] = useState<number>(parsed.baseThickness);
  const [showDetailed, setShowDetailed] = useState<boolean>(!parsed.isUniform);
  const [announcement, setAnnouncement] = useState<string>('');

  // Sincroniza estado se a prop value externa mudar
  useEffect(() => {
    const updated = parseBorderValue(value);
    setSides(updated.sides);
    if (updated.baseThickness > 0) {
      setThickness(updated.baseThickness);
    }
  }, [value]);

  const updateSides = useCallback(
    (newSides: BorderSides, announceMsg?: string) => {
      setSides(newSides);
      const formatted = formatBorderValue(newSides);
      onChange(id, formatted === '0px' && !value ? undefined : formatted);
      if (announceMsg) {
        setAnnouncement(announceMsg);
      } else {
        setAnnouncement(getBorderDescription(newSides));
      }
    },
    [id, onChange, value],
  );

  const handlePreset = (
    preset: 'none' | 'all' | 'top' | 'bottom' | 'sides' | 'top-left',
  ) => {
    const t = thickness > 0 ? thickness : 1;
    let newSides: BorderSides;
    let msg = '';

    switch (preset) {
      case 'none':
        newSides = { top: 0, right: 0, bottom: 0, left: 0 };
        msg = 'Nenhuma borda selecionada';
        break;
      case 'all':
        newSides = { top: t, right: t, bottom: t, left: t };
        msg = `Borda completa ativada com ${t} pixels`;
        break;
      case 'top':
        newSides = { top: t, right: 0, bottom: 0, left: 0 };
        msg = `Borda no topo ativada com ${t} pixels`;
        break;
      case 'bottom':
        newSides = { top: 0, right: 0, bottom: t, left: 0 };
        msg = `Borda abaixo ativada com ${t} pixels`;
        break;
      case 'sides':
        newSides = { top: 0, right: t, bottom: 0, left: t };
        msg = `Bordas laterais ativadas com ${t} pixels`;
        break;
      case 'top-left':
        newSides = { top: t, right: 0, bottom: 0, left: t };
        msg = `Bordas no topo e na lateral esquerda ativadas com ${t} pixels`;
        break;
    }

    updateSides(newSides, msg);
  };

  const toggleSide = (sideKey: keyof BorderSides) => {
    const current = sides[sideKey];
    const t = thickness > 0 ? thickness : 1;
    const nextVal = current > 0 ? 0 : t;
    const newSides = { ...sides, [sideKey]: nextVal };
    const sideNames = {
      top: 'superior',
      right: 'direita',
      bottom: 'inferior',
      left: 'esquerda',
    };
    const action = nextVal > 0 ? `ativada com ${nextVal} pixels` : 'desativada';
    updateSides(newSides, `Borda ${sideNames[sideKey]} ${action}`);
  };

  const handleThicknessChange = (newVal: number) => {
    const valid = Math.max(0, Math.min(24, Math.round(newVal || 0)));
    setThickness(valid);

    // Atualiza todos os lados ativos proporcionalmente
    const activeSides = Object.entries(sides).some(([_, val]) => val > 0);
    if (activeSides) {
      const updated: BorderSides = {
        top: sides.top > 0 ? valid : 0,
        right: sides.right > 0 ? valid : 0,
        bottom: sides.bottom > 0 ? valid : 0,
        left: sides.left > 0 ? valid : 0,
      };
      updateSides(updated, `Espessura alterada para ${valid} pixels`);
    }
  };

  const handleSideThicknessChange = (
    sideKey: keyof BorderSides,
    newVal: number,
  ) => {
    const valid = Math.max(0, Math.min(24, Math.round(newVal || 0)));
    const updated = { ...sides, [sideKey]: valid };
    updateSides(
      updated,
      `Espessura da borda ${sideKey} alterada para ${valid} pixels`,
    );
  };

  const currentSummary = getBorderDescription(sides);

  return (
    <FormFieldWrapper {...props} className="border-widget-field">
      <div
        className="border-widget"
        role="group"
        aria-labelledby={`${widgetId}-label`}
      >
        {/* Live region para anúncios a11y */}
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {/* 1. Presets rápidos de posicionamento */}
        <div
          className="border-widget__presets-label"
          id={`${widgetId}-presets-label`}
        >
          Predefinições rápidas:
        </div>
        <div
          className="border-widget__presets"
          role="toolbar"
          aria-labelledby={`${widgetId}-presets-label`}
        >
          <button
            type="button"
            className={`border-widget__preset-btn ${
              sides.top === 0 &&
              sides.right === 0 &&
              sides.bottom === 0 &&
              sides.left === 0
                ? 'is-active'
                : ''
            }`}
            onClick={() => handlePreset('none')}
            aria-pressed={
              sides.top === 0 &&
              sides.right === 0 &&
              sides.bottom === 0 &&
              sides.left === 0
            }
          >
            Sem borda
          </button>
          <button
            type="button"
            className={`border-widget__preset-btn ${
              sides.top > 0 &&
              sides.right > 0 &&
              sides.bottom > 0 &&
              sides.left > 0
                ? 'is-active'
                : ''
            }`}
            onClick={() => handlePreset('all')}
            aria-pressed={
              sides.top > 0 &&
              sides.right > 0 &&
              sides.bottom > 0 &&
              sides.left > 0
            }
          >
            Completa
          </button>
          <button
            type="button"
            className={`border-widget__preset-btn ${
              sides.top > 0 &&
              sides.right === 0 &&
              sides.bottom === 0 &&
              sides.left === 0
                ? 'is-active'
                : ''
            }`}
            onClick={() => handlePreset('top')}
            aria-pressed={
              sides.top > 0 &&
              sides.right === 0 &&
              sides.bottom === 0 &&
              sides.left === 0
            }
          >
            Topo
          </button>
          <button
            type="button"
            className={`border-widget__preset-btn ${
              sides.top === 0 &&
              sides.right === 0 &&
              sides.bottom > 0 &&
              sides.left === 0
                ? 'is-active'
                : ''
            }`}
            onClick={() => handlePreset('bottom')}
            aria-pressed={
              sides.top === 0 &&
              sides.right === 0 &&
              sides.bottom > 0 &&
              sides.left === 0
            }
          >
            Abaixo
          </button>
          <button
            type="button"
            className={`border-widget__preset-btn ${
              sides.top === 0 &&
              sides.right > 0 &&
              sides.bottom === 0 &&
              sides.left > 0
                ? 'is-active'
                : ''
            }`}
            onClick={() => handlePreset('sides')}
            aria-pressed={
              sides.top === 0 &&
              sides.right > 0 &&
              sides.bottom === 0 &&
              sides.left > 0
            }
          >
            Laterais
          </button>
          <button
            type="button"
            className={`border-widget__preset-btn ${
              sides.top > 0 &&
              sides.right === 0 &&
              sides.bottom === 0 &&
              sides.left > 0
                ? 'is-active'
                : ''
            }`}
            onClick={() => handlePreset('top-left')}
            aria-pressed={
              sides.top > 0 &&
              sides.right === 0 &&
              sides.bottom === 0 &&
              sides.left > 0
            }
          >
            Topo & Lateral
          </button>
        </div>

        {/* 2. Diagrama interativo de Caixa ("Box Model") */}
        <div className="border-widget__diagram-wrapper">
          <div
            className="border-widget__box-diagram"
            aria-label="Controle interativo dos lados da borda. Clique em cada borda para alternar."
          >
            {/* Lado Topo */}
            <button
              type="button"
              className={`border-widget__side-btn border-widget__side-btn--top ${
                sides.top > 0 ? 'is-active' : ''
              }`}
              onClick={() => toggleSide('top')}
              aria-pressed={sides.top > 0}
              aria-label={`Borda Superior: ${sides.top > 0 ? `${sides.top}px` : 'nenhuma'}`}
              title="Alternar Borda Superior"
            >
              <span className="border-widget__side-indicator" />
            </button>

            {/* Lado Esquerdo */}
            <button
              type="button"
              className={`border-widget__side-btn border-widget__side-btn--left ${
                sides.left > 0 ? 'is-active' : ''
              }`}
              onClick={() => toggleSide('left')}
              aria-pressed={sides.left > 0}
              aria-label={`Borda Esquerda: ${sides.left > 0 ? `${sides.left}px` : 'nenhuma'}`}
              title="Alternar Borda Esquerda"
            >
              <span className="border-widget__side-indicator" />
            </button>

            {/* Centro / Resumo Visual */}
            <div className="border-widget__box-center">
              <span className="border-widget__box-title">Bloco</span>
              <span className="border-widget__box-summary">
                {currentSummary}
              </span>
            </div>

            {/* Lado Direito */}
            <button
              type="button"
              className={`border-widget__side-btn border-widget__side-btn--right ${
                sides.right > 0 ? 'is-active' : ''
              }`}
              onClick={() => toggleSide('right')}
              aria-pressed={sides.right > 0}
              aria-label={`Borda Direita: ${sides.right > 0 ? `${sides.right}px` : 'nenhuma'}`}
              title="Alternar Borda Direita"
            >
              <span className="border-widget__side-indicator" />
            </button>

            {/* Lado Abaixo */}
            <button
              type="button"
              className={`border-widget__side-btn border-widget__side-btn--bottom ${
                sides.bottom > 0 ? 'is-active' : ''
              }`}
              onClick={() => toggleSide('bottom')}
              aria-pressed={sides.bottom > 0}
              aria-label={`Borda Inferior: ${sides.bottom > 0 ? `${sides.bottom}px` : 'nenhuma'}`}
              title="Alternar Borda Inferior"
            >
              <span className="border-widget__side-indicator" />
            </button>
          </div>
        </div>

        {/* 3. Controle Numérico de Espessura */}
        <div className="border-widget__thickness-section">
          <div className="border-widget__thickness-row">
            <label
              htmlFor={`${widgetId}-thickness-input`}
              className="border-widget__thickness-label"
            >
              Espessura da Borda:
            </label>
            <div className="border-widget__number-stepper">
              <button
                type="button"
                className="border-widget__stepper-btn"
                onClick={() => handleThicknessChange(thickness - 1)}
                disabled={thickness <= 0}
                aria-label="Diminuir espessura em 1 pixel"
              >
                −
              </button>
              <input
                id={`${widgetId}-thickness-input`}
                type="number"
                min="0"
                max="24"
                value={thickness}
                onChange={(e) =>
                  handleThicknessChange(parseInt(e.target.value, 10))
                }
                className="border-widget__number-input"
                aria-describedby={`${widgetId}-thickness-unit`}
              />
              <span
                id={`${widgetId}-thickness-unit`}
                className="border-widget__unit"
              >
                px
              </span>
              <button
                type="button"
                className="border-widget__stepper-btn"
                onClick={() => handleThicknessChange(thickness + 1)}
                disabled={thickness >= 24}
                aria-label="Aumentar espessura em 1 pixel"
              >
                +
              </button>
            </div>
          </div>

          {/* Toggle para personalização detalhada por lado */}
          <div className="border-widget__details-toggle">
            <button
              type="button"
              className="border-widget__toggle-btn"
              onClick={() => setShowDetailed(!showDetailed)}
              aria-expanded={showDetailed}
              aria-controls={`${widgetId}-detailed-sides`}
            >
              <span>
                {showDetailed
                  ? '▾ Ocultar ajuste por lado'
                  : '▸ Personalizar espessura por lado'}
              </span>
            </button>
          </div>

          {/* Seção detalhada com 4 lados independentes */}
          {showDetailed && (
            <div
              id={`${widgetId}-detailed-sides`}
              className="border-widget__detailed-grid"
              role="region"
              aria-label="Ajuste independente de espessura por lado"
            >
              <div className="border-widget__side-control">
                <label htmlFor={`${widgetId}-side-top`}>Topo:</label>
                <input
                  id={`${widgetId}-side-top`}
                  type="number"
                  min="0"
                  max="24"
                  value={sides.top}
                  onChange={(e) =>
                    handleSideThicknessChange(
                      'top',
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="border-widget__side-input"
                />
                <span className="border-widget__unit">px</span>
              </div>
              <div className="border-widget__side-control">
                <label htmlFor={`${widgetId}-side-right`}>Direita:</label>
                <input
                  id={`${widgetId}-side-right`}
                  type="number"
                  min="0"
                  max="24"
                  value={sides.right}
                  onChange={(e) =>
                    handleSideThicknessChange(
                      'right',
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="border-widget__side-input"
                />
                <span className="border-widget__unit">px</span>
              </div>
              <div className="border-widget__side-control">
                <label htmlFor={`${widgetId}-side-bottom`}>Abaixo:</label>
                <input
                  id={`${widgetId}-side-bottom`}
                  type="number"
                  min="0"
                  max="24"
                  value={sides.bottom}
                  onChange={(e) =>
                    handleSideThicknessChange(
                      'bottom',
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="border-widget__side-input"
                />
                <span className="border-widget__unit">px</span>
              </div>
              <div className="border-widget__side-control">
                <label htmlFor={`${widgetId}-side-left`}>Esquerda:</label>
                <input
                  id={`${widgetId}-side-left`}
                  type="number"
                  min="0"
                  max="24"
                  value={sides.left}
                  onChange={(e) =>
                    handleSideThicknessChange(
                      'left',
                      parseInt(e.target.value, 10),
                    )
                  }
                  className="border-widget__side-input"
                />
                <span className="border-widget__unit">px</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default BorderWidget;
