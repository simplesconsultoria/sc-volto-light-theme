import React, {
  useState,
  useEffect,
  useContext,
  useSyncExternalStore,
} from 'react';
import { ReactReduxContext } from 'react-redux';
import config from '@plone/volto/registry';
import type {
  BlockTheme,
  ColorGroup,
  SerializedTheme,
} from '../../types/theme';
import {
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
  NATAL_BLOCK_THEMES,
  NATAL_COLOR_GROUPS,
} from '../../config/blockThemes';
import { SwatchDropdown, type SwatchOption } from './shared/SwatchDropdown';

const EMPTY_STATE = {};
const DUMMY_STORE = {
  subscribe: () => () => {},
  getState: () => EMPTY_STATE,
};

function getActiveSiteTheme(storeState: any): SerializedTheme | undefined {
  if (!storeState) return undefined;
  const inheritData = storeState?.inherit?.data;
  const content = storeState?.content?.data;
  const contentInherit = content?.['@components']?.inherit;
  const formTheme = storeState?.form?.global?.theme;
  if (formTheme) return formTheme;

  const inheritTheme =
    inheritData?.['sc.voltolighttheme.themeselector']?.data?.theme ||
    contentInherit?.['sc.voltolighttheme.themeselector']?.data?.theme;
  if (inheritTheme) return inheritTheme;

  const directTheme =
    content?.theme ||
    content?.['sc.voltolighttheme.themeselector.theme'] ||
    storeState?.navroot?.data?.navroot?.theme;
  if (directTheme) return directTheme;

  return undefined;
}

export interface BlockThemeWidgetProps {
  id: string;
  title?: string;
  description?: string;
  value?: any;
  onChange: (id: string, value: any) => void;
  required?: boolean;
  block?: string;
  formData?: any;
  objectvalue?: any;
  onChangeBlock?: (blockId: string, data: any) => void;
  siteTheme?: SerializedTheme;
  [key: string]: any;
}

/**
 * Split Circle: Left half is back ColorGroup bg, Right half is front ColorGroup bg.
 */
export const SplitColorCircle: React.FC<{
  backColor?: string;
  frontColor?: string;
  size?: number;
  className?: string;
}> = ({
  backColor = '#ffffff',
  frontColor = '#f6f7f9',
  size = 18,
  className = '',
}) => (
  <svg
    className={`split-color-circle ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ flexShrink: 0 }}
    aria-hidden="true"
  >
    <path d="M12,2 A10,10 0 0,0 12,22 Z" fill={backColor} />
    <path d="M12,2 A10,10 0 0,1 12,22 Z" fill={frontColor} />
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="1.5"
    />
  </svg>
);

/**
 * Solid Color Circle: Full circle showing a single ColorGroup's background color.
 */
export const SolidColorCircle: React.FC<{
  color?: string;
  size?: number;
  className?: string;
}> = ({ color = '#ffffff', size = 18, className = '' }) => (
  <svg
    className={`solid-color-circle ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ flexShrink: 0 }}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill={color} />
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="rgba(0,0,0,0.2)"
      strokeWidth="1.5"
    />
  </svg>
);

type GroupKind = 'backColorGroup' | 'frontColorGroup';

/**
 * Theme id stored on a block, with the back/front groups a
 * `custom-<back>-<front>` value encodes.
 */
export function parseThemeValue(
  value: any,
  formData?: any,
  objectvalue?: any,
): { themeId: string; back?: string; front?: string } {
  const raw =
    typeof value === 'object' && value !== null
      ? value.theme
      : value ||
        formData?.theme ||
        formData?.styles?.theme ||
        objectvalue?.theme ||
        'default';
  if (typeof raw !== 'string') return { themeId: 'default' };
  if (raw.startsWith('custom-')) {
    const [, back, front] = raw.split('-');
    return { themeId: 'custom', back, front };
  }
  return { themeId: raw };
}

/** A back/front group stored next to the theme, wherever the form put it. */
function storedGroup(
  kind: GroupKind,
  value: any,
  formData?: any,
  objectvalue?: any,
): string | undefined {
  return (
    formData?.[kind] ||
    formData?.styles?.[kind] ||
    objectvalue?.[kind] ||
    (typeof value === 'object' ? value?.[kind] : undefined)
  );
}

const PencilIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/** The block themes and color groups the site theme makes available. */
function useAvailableThemes(
  siteTheme: SerializedTheme | undefined,
  formData: any,
  objectvalue: any,
) {
  const isNatal = siteTheme?.token === 'natal';
  const baseColorGroups = isNatal ? NATAL_COLOR_GROUPS : DEFAULT_COLOR_GROUPS;
  const baseBlockThemes = isNatal ? NATAL_BLOCK_THEMES : DEFAULT_BLOCK_THEMES;

  const colorGroups: Record<string, ColorGroup> = React.useMemo(
    () => ({
      ...baseColorGroups,
      ...(siteTheme?.value?.color_groups || {}),
      ...(formData?.color_groups || {}),
      ...(objectvalue?.color_groups || {}),
    }),
    [
      baseColorGroups,
      siteTheme?.value?.color_groups,
      formData?.color_groups,
      objectvalue?.color_groups,
    ],
  );

  const blockThemes: Record<string, BlockTheme> = React.useMemo(
    () => ({
      ...baseBlockThemes,
      ...(siteTheme?.value?.block_themes || {}),
      ...(formData?.block_themes || {}),
      ...(objectvalue?.block_themes || {}),
    }),
    [
      baseBlockThemes,
      siteTheme?.value?.block_themes,
      formData?.block_themes,
      objectvalue?.block_themes,
    ],
  );

  // Keep config.blocks.blockThemes and colorGroups updated with available themes
  useEffect(() => {
    const blocks = (config as any)?.blocks;
    if (!blocks) return;
    blocks.blockThemes = {
      ...DEFAULT_BLOCK_THEMES,
      ...(blocks.blockThemes || {}),
      ...blockThemes,
    };
    blocks.colorGroups = {
      ...DEFAULT_COLOR_GROUPS,
      ...(blocks.colorGroups || {}),
      ...colorGroups,
    };
  }, [blockThemes, colorGroups]);

  return { colorGroups, blockThemes };
}

/** The active site theme, from props or the Redux store when there is one. */
function useSiteTheme(fromProps?: SerializedTheme) {
  const reduxContext = useContext(ReactReduxContext);
  const store = reduxContext?.store || DUMMY_STORE;
  const storeState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  ) as any;
  return fromProps || getActiveSiteTheme(storeState);
}

export const BlockThemeWidget: React.FC<BlockThemeWidgetProps> = (props) => {
  const {
    id = 'theme',
    title = 'Tema do Bloco',
    description,
    value,
    onChange,
    formData,
    objectvalue,
    block,
    onChangeBlock,
  } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [customBack, setCustomBack] = useState<string | null>(null);
  const [customFront, setCustomFront] = useState<string | null>(null);

  const siteTheme = useSiteTheme(props.siteTheme);
  const { colorGroups, blockThemes } = useAvailableThemes(
    siteTheme,
    formData,
    objectvalue,
  );

  const parsed = parseThemeValue(value, formData, objectvalue);
  const currentThemeId = parsed.themeId;
  // A named theme dictates its groups; a custom one keeps what was picked.
  const named =
    currentThemeId === 'custom' ? undefined : blockThemes[currentThemeId];
  const currentBack =
    named?.back_color_group ||
    customBack ||
    parsed.back ||
    storedGroup('backColorGroup', value, formData, objectvalue) ||
    'primary';
  const currentFront =
    named?.front_color_group ||
    customFront ||
    parsed.front ||
    storedGroup('frontColorGroup', value, formData, objectvalue) ||
    'neutral';

  const getGroupBg = (groupId: string): string =>
    colorGroups[groupId]?.background_color_light ||
    DEFAULT_COLOR_GROUPS[groupId]?.background_color_light ||
    '#ffffff';

  const applyChanges = (
    newThemeValue: string,
    newBack: string,
    newFront: string,
  ) => {
    const formattedTheme = newThemeValue.startsWith('custom')
      ? `custom-${newBack}-${newFront}`
      : newThemeValue;

    onChange(id, formattedTheme);

    const onChangeField = (props as any)?.onChangeField;
    if (onChangeField) {
      onChangeField('backColorGroup', newBack);
      onChangeField('frontColorGroup', newFront);
    }

    // Propagate to the parent block (or form) and its styles object.
    const parentOnChangeBlock = onChangeBlock || (props as any)?.onChangeBlock;
    const parentOnChangeFormData = (props as any)?.onChangeFormData;
    const groups = {
      theme: formattedTheme,
      backColorGroup: newBack,
      frontColorGroup: newFront,
    };
    const updatedData = {
      ...formData,
      ...groups,
      styles: { ...(formData?.styles || objectvalue || {}), ...groups },
    };

    if (parentOnChangeBlock && block) {
      parentOnChangeBlock(block, updatedData);
    } else if (parentOnChangeFormData) {
      parentOnChangeFormData(updatedData);
    }
  };

  const selectGroups = (themeValue: string, back: string, front: string) => {
    setCustomBack(back);
    setCustomFront(front);
    applyChanges(themeValue, back, front);
  };

  const handleSelectTheme = (themeId: string) => {
    if (themeId.startsWith('custom')) {
      const [, back, front] = themeId.split('-');
      selectGroups('custom', back || currentBack, front || currentFront);
      setIsEditing(true);
      return;
    }
    const target = blockThemes[themeId];
    selectGroups(
      themeId,
      target?.back_color_group || 'primary',
      target?.front_color_group || 'neutral',
    );
  };

  const themeLabel = (themeId: string) => {
    if (themeId === 'custom') return 'Personalizado';
    if (themeId === 'default') return 'Padrão';
    return blockThemes[themeId]?.name || themeId;
  };

  const themeOptions: SwatchOption[] = Object.values(blockThemes).map((bt) => ({
    id: bt.id,
    label: themeLabel(bt.id),
    swatch: (
      <SplitColorCircle
        backColor={getGroupBg(bt.back_color_group)}
        frontColor={getGroupBg(bt.front_color_group)}
        size={18}
      />
    ),
  }));
  if (currentThemeId === 'custom') {
    themeOptions.push({
      id: 'custom',
      label: 'Personalizado',
      swatch: (
        <SplitColorCircle
          backColor={getGroupBg(currentBack)}
          frontColor={getGroupBg(currentFront)}
          size={18}
        />
      ),
    });
  }

  const groupOptions: SwatchOption[] = Object.values(colorGroups).map((cg) => ({
    id: cg.id,
    label: cg.name || cg.id,
    swatch: <SolidColorCircle color={getGroupBg(cg.id)} size={16} />,
  }));

  const groupPicker = (
    kind: 'back' | 'front',
    label: string,
    current: string,
  ) => (
    <div className="colorgroup-field-group">
      <span className="field-group-label">{label}:</span>
      <SwatchDropdown
        variant="colorgroup"
        value={current}
        options={groupOptions}
        onSelect={(groupId) =>
          kind === 'back'
            ? selectGroups('custom', groupId, currentFront)
            : selectGroups('custom', currentBack, groupId)
        }
        triggerSwatch={
          <SolidColorCircle color={getGroupBg(current)} size={16} />
        }
        triggerLabel={colorGroups[current]?.name || current}
        triggerLabelClassName="cg-label"
        ariaLabel={label}
        hiddenSelect={{
          testId: `${kind}-cg-hidden-select`,
          className: `${kind}-cg-hidden-select`,
        }}
      />
    </div>
  );

  return (
    <div className="block-theme-widget">
      <div className="widget-header">
        <label className="widget-title" htmlFor={`field-${id}`}>
          {title}
        </label>
        {description && <p className="help">{description}</p>}
      </div>

      <div className="block-theme-selector-row">
        <SwatchDropdown
          variant="theme"
          value={currentThemeId}
          options={themeOptions}
          onSelect={handleSelectTheme}
          triggerSwatch={
            <SplitColorCircle
              backColor={getGroupBg(currentBack)}
              frontColor={getGroupBg(currentFront)}
              size={18}
            />
          }
          triggerLabel={themeLabel(currentThemeId)}
          triggerLabelClassName="theme-name-label"
          triggerId={`field-${id}`}
          hiddenSelect={{
            testId: 'block-theme-hidden-select',
            className: 'block-theme-hidden-select',
            extraOptions: [
              { value: 'custom', label: 'Personalizado' },
              {
                value: `custom-${currentBack}-${currentFront}`,
                label: `Personalizado (${currentBack}/${currentFront})`,
              },
            ],
          }}
        />

        <button
          type="button"
          className={`theme-edit-btn ${isEditing ? 'is-active' : ''}`}
          title="Editar ColorGroups do tema"
          aria-label="Editar ColorGroups do tema"
          aria-pressed={isEditing}
          onClick={() => setIsEditing(!isEditing)}
        >
          <PencilIcon />
        </button>
      </div>

      {isEditing && (
        <div className="theme-colorgroups-details">
          <p className="details-help">
            Personalize as cores deste bloco selecionando os ColorGroups para
            fundo e elementos da frente.
          </p>
          {groupPicker('back', 'Área de Trás (Color Group)', currentBack)}
          {groupPicker('front', 'Área da Frente (Color Group)', currentFront)}
        </div>
      )}
    </div>
  );
};

export default BlockThemeWidget;
