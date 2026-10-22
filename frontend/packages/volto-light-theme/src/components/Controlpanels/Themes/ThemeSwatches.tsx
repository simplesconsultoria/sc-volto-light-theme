import React from 'react';
import type { ThemeItem, ColorGroup, BlockTheme } from '../../../types/theme';
import {
  DEFAULT_COLOR_GROUPS,
  DEFAULT_BLOCK_THEMES,
} from '../../../config/blockThemes';
import { SplitColorCircle } from '../../Widgets/BlockThemeWidget';

export type ThemeSwatchesProps = {
  /** The theme whose settings become the chips. */
  theme: ThemeItem;
};

/**
 * Small colour chips, so the listing is scannable without opening a theme.
 * Displays each ColorGroup's background color as a square swatch,
 * followed by each BlockTheme as a split circle.
 */
const ThemeSwatches: React.FC<ThemeSwatchesProps> = ({ theme }) => {
  // Normalize color_groups
  const rawGroups = theme?.color_groups || (theme as any)?.value?.color_groups;
  const groupsList: ColorGroup[] = React.useMemo(() => {
    if (!rawGroups) return Object.values(DEFAULT_COLOR_GROUPS);
    if (Array.isArray(rawGroups)) return rawGroups;
    return Object.values(rawGroups);
  }, [rawGroups]);

  const groupsMap: Record<string, ColorGroup> = React.useMemo(() => {
    const map: Record<string, ColorGroup> = { ...DEFAULT_COLOR_GROUPS };
    for (const g of groupsList) {
      if (g && g.id) map[g.id] = g;
    }
    return map;
  }, [groupsList]);

  // Normalize block_themes
  const rawBlockThemes =
    theme?.block_themes || (theme as any)?.value?.block_themes;
  const blockThemesList: BlockTheme[] = React.useMemo(() => {
    if (!rawBlockThemes) return Object.values(DEFAULT_BLOCK_THEMES);
    if (Array.isArray(rawBlockThemes)) return rawBlockThemes;
    return Object.values(rawBlockThemes);
  }, [rawBlockThemes]);

  return (
    <span className="sc-theme-swatches" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {/* ColorGroup background squares */}
      <span
        className="sc-theme-cg-swatches"
        style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}
      >
        {groupsList.map((cg) => {
          const bg = cg.background_color_light || '#ffffff';
          return (
            <span
              key={cg.id}
              className="sc-theme-swatch"
              style={{
                backgroundColor: bg,
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                border: '1px solid rgba(0,0,0,0.15)',
                display: 'inline-block',
              }}
              title={`ColorGroup: ${cg.name || cg.id} (${bg})`}
            />
          );
        })}
      </span>

      {/* Subtle separator */}
      {groupsList.length > 0 && blockThemesList.length > 0 && (
        <span
          style={{
            width: '1px',
            height: '14px',
            backgroundColor: '#ccc',
            margin: '0 2px',
            display: 'inline-block',
          }}
        />
      )}

      {/* BlockTheme split circles */}
      <span
        className="sc-theme-bt-swatches"
        style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}
      >
        {blockThemesList.map((bt) => {
          const backBg =
            groupsMap[bt.back_color_group]?.background_color_light || '#ffffff';
          const frontBg =
            groupsMap[bt.front_color_group]?.background_color_light ||
            '#edeff0';
          return (
            <span
              key={bt.id}
              title={`Tema de Bloco: ${bt.name || bt.id} (${bt.back_color_group} / ${bt.front_color_group})`}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <SplitColorCircle
                backColor={backBg}
                frontColor={frontBg}
                size={18}
              />
            </span>
          );
        })}
      </span>
    </span>
  );
};

export default ThemeSwatches;
