import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useSyncExternalStore,
} from 'react';
import { ReactReduxContext } from 'react-redux';
import type { BlockTheme, ColorGroup, SerializedTheme } from '../../types/theme';
import {
  DEFAULT_BLOCK_THEMES,
  DEFAULT_COLOR_GROUPS,
  NATAL_BLOCK_THEMES,
  NATAL_COLOR_GROUPS,
} from '../../config/blockThemes';

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
  frontColor = '#edeff0',
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
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isBackMenuOpen, setIsBackMenuOpen] = useState(false);
  const [isFrontMenuOpen, setIsFrontMenuOpen] = useState(false);

  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const backDropdownRef = useRef<HTMLDivElement>(null);
  const frontDropdownRef = useRef<HTMLDivElement>(null);

  const reduxContext = useContext(ReactReduxContext);
  const store = reduxContext?.store || DUMMY_STORE;
  const storeState = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  ) as any;

  const siteTheme = props.siteTheme || getActiveSiteTheme(storeState);
  const themeToken = siteTheme?.token;
  const isNatal = themeToken === 'natal';

  const baseDefaults = isNatal
    ? {
        colorGroups: NATAL_COLOR_GROUPS,
        blockThemes: NATAL_BLOCK_THEMES,
      }
    : {
        colorGroups: DEFAULT_COLOR_GROUPS,
        blockThemes: DEFAULT_BLOCK_THEMES,
      };

  // Close floating menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        themeDropdownRef.current &&
        !themeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsThemeMenuOpen(false);
      }
      if (
        backDropdownRef.current &&
        !backDropdownRef.current.contains(e.target as Node)
      ) {
        setIsBackMenuOpen(false);
      }
      if (
        frontDropdownRef.current &&
        !frontDropdownRef.current.contains(e.target as Node)
      ) {
        setIsFrontMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Available ColorGroups and BlockThemes (merging active site theme data, props or defaults)
  const availableColorGroups: Record<string, ColorGroup> = React.useMemo(() => {
    return {
      ...baseDefaults.colorGroups,
      ...(siteTheme?.value?.color_groups || {}),
      ...(formData?.color_groups || {}),
      ...(objectvalue?.color_groups || {}),
    };
  }, [
    baseDefaults.colorGroups,
    siteTheme?.value?.color_groups,
    formData?.color_groups,
    objectvalue?.color_groups,
  ]);

  const availableBlockThemes: Record<string, BlockTheme> = React.useMemo(() => {
    return {
      ...baseDefaults.blockThemes,
      ...(siteTheme?.value?.block_themes || {}),
      ...(formData?.block_themes || {}),
      ...(objectvalue?.block_themes || {}),
    };
  }, [
    baseDefaults.blockThemes,
    siteTheme?.value?.block_themes,
    formData?.block_themes,
    objectvalue?.block_themes,
  ]);

  const [customBack, setCustomBack] = useState<string | null>(null);
  const [customFront, setCustomFront] = useState<string | null>(null);

  // Parse theme value
  const rawTheme =
    typeof value === 'object' && value !== null
      ? value.theme
      : value ||
        formData?.theme ||
        formData?.styles?.theme ||
        objectvalue?.theme ||
        'default';

  let initialThemeId = 'default';
  let parsedBack: string | undefined;
  let parsedFront: string | undefined;

  if (typeof rawTheme === 'string') {
    if (rawTheme.startsWith('custom-')) {
      initialThemeId = 'custom';
      const parts = rawTheme.split('-');
      parsedBack = parts[1];
      parsedFront = parts[2];
    } else {
      initialThemeId = rawTheme;
    }
  }

  const currentThemeId = initialThemeId;

  const currentBack =
    customBack ||
    parsedBack ||
    formData?.backColorGroup ||
    formData?.styles?.backColorGroup ||
    objectvalue?.backColorGroup ||
    (typeof value === 'object' ? value?.backColorGroup : undefined) ||
    availableBlockThemes[currentThemeId]?.back_color_group ||
    'primary';

  const currentFront =
    customFront ||
    parsedFront ||
    formData?.frontColorGroup ||
    formData?.styles?.frontColorGroup ||
    objectvalue?.frontColorGroup ||
    (typeof value === 'object' ? value?.frontColorGroup : undefined) ||
    availableBlockThemes[currentThemeId]?.front_color_group ||
    'neutral';

  const getGroupBg = (groupId: string): string => {
    return (
      availableColorGroups[groupId]?.background_color_light ||
      DEFAULT_COLOR_GROUPS[groupId]?.background_color_light ||
      '#ffffff'
    );
  };

  const applyChanges = (
    newThemeValue: string,
    newBack: string,
    newFront: string,
  ) => {
    // Notify standard onChange
    onChange(id, newThemeValue);

    // Propagate to parent block and styles object if onChangeBlock or onChangeFormData is available
    const parentOnChangeBlock = onChangeBlock || (props as any)?.onChangeBlock;
    const parentOnChangeFormData = (props as any)?.onChangeFormData;

    const currentStyles = formData?.styles || objectvalue || {};
    const updatedData = {
      ...formData,
      theme: newThemeValue,
      backColorGroup: newBack,
      frontColorGroup: newFront,
      styles: {
        ...currentStyles,
        theme: newThemeValue,
        backColorGroup: newBack,
        frontColorGroup: newFront,
      },
    };

    if (parentOnChangeBlock && block) {
      parentOnChangeBlock(block, updatedData);
    } else if (parentOnChangeFormData) {
      parentOnChangeFormData(updatedData);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    setIsThemeMenuOpen(false);
    if (themeId === 'custom' || themeId.startsWith('custom-')) {
      let b = currentBack;
      let f = currentFront;
      if (themeId.startsWith('custom-')) {
        const parts = themeId.split('-');
        b = parts[1] || currentBack;
        f = parts[2] || currentFront;
      }
      const customThemeValue = `custom-${b}-${f}`;
      setCustomBack(b);
      setCustomFront(f);
      applyChanges(customThemeValue, b, f);
      setIsEditing(true);
      return;
    }
    const targetTheme = availableBlockThemes[themeId];
    const newBack = targetTheme?.back_color_group || 'primary';
    const newFront = targetTheme?.front_color_group || 'neutral';
    setCustomBack(newBack);
    setCustomFront(newFront);
    applyChanges(themeId, newBack, newFront);
  };

  const handleSelectBack = (groupId: string) => {
    setIsBackMenuOpen(false);
    setCustomBack(groupId);
    const customThemeValue = `custom-${groupId}-${currentFront}`;
    applyChanges(customThemeValue, groupId, currentFront);
  };

  const handleSelectFront = (groupId: string) => {
    setIsFrontMenuOpen(false);
    setCustomFront(groupId);
    const customThemeValue = `custom-${currentBack}-${groupId}`;
    applyChanges(customThemeValue, currentBack, groupId);
  };

  const currentThemeTitle =
    currentThemeId === 'custom'
      ? 'Personalizado'
      : currentThemeId === 'default'
        ? 'Padrão'
        : availableBlockThemes[currentThemeId]?.name || currentThemeId;

  return (
    <div className="block-theme-widget">
      <div className="widget-header">
        <label className="widget-title" htmlFor={`field-${id}`}>
          {title}
        </label>
        {description && <p className="help">{description}</p>}
      </div>

      {/* Main Block Theme Selector Row */}
      <div className="block-theme-selector-row">
        <div className="theme-dropdown-container" ref={themeDropdownRef}>
          <button
            type="button"
            className="theme-dropdown-trigger"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            aria-haspopup="listbox"
            aria-expanded={isThemeMenuOpen}
            id={`field-${id}`}
          >
            <SplitColorCircle
              backColor={getGroupBg(currentBack)}
              frontColor={getGroupBg(currentFront)}
              size={18}
            />
            <span className="theme-name-label">{currentThemeTitle}</span>
            <span
              className={`dropdown-arrow ${isThemeMenuOpen ? 'open' : ''}`}
            >
              ▾
            </span>
          </button>

          {/* Accessible hidden select for testing and screen readers */}
          <select
            className="sr-only block-theme-hidden-select"
            data-testid="block-theme-hidden-select"
            value={currentThemeId}
            onChange={(e) => handleSelectTheme(e.target.value)}
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: 'none' }}
          >
            {Object.values(availableBlockThemes).map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name || bt.id}
              </option>
            ))}
            <option value="custom">Personalizado</option>
            <option value={`custom-${currentBack}-${currentFront}`}>
              Personalizado ({currentBack}/{currentFront})
            </option>
          </select>

          {isThemeMenuOpen && (
            <div className="theme-dropdown-menu" role="listbox">
              {Object.values(availableBlockThemes).map((bt) => {
                const bBg = getGroupBg(bt.back_color_group);
                const fBg = getGroupBg(bt.front_color_group);
                const isSelected = currentThemeId === bt.id;
                const displayName =
                  bt.id === 'default' ? 'Padrão' : bt.name || bt.id;

                return (
                  <div
                    key={bt.id}
                    className={`theme-dropdown-item ${isSelected ? 'selected' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectTheme(bt.id)}
                  >
                    <SplitColorCircle
                      backColor={bBg}
                      frontColor={fBg}
                      size={18}
                    />
                    <span className="item-label">{displayName}</span>
                    {isSelected && <span className="check-mark">✓</span>}
                  </div>
                );
              })}

              {currentThemeId === 'custom' && (
                <div
                  className="theme-dropdown-item selected"
                  role="option"
                  aria-selected={true}
                  onClick={() => handleSelectTheme('custom')}
                >
                  <SplitColorCircle
                    backColor={getGroupBg(currentBack)}
                    frontColor={getGroupBg(currentFront)}
                    size={18}
                  />
                  <span className="item-label">Personalizado</span>
                  <span className="check-mark">✓</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Pencil Button */}
        <button
          type="button"
          className={`theme-edit-btn ${isEditing ? 'is-active' : ''}`}
          title="Editar ColorGroups do tema"
          aria-label="Editar ColorGroups do tema"
          onClick={() => setIsEditing(!isEditing)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      {/* Expanded ColorGroups Details Section */}
      {isEditing && (
        <div className="theme-colorgroups-details">
          <p className="details-help">
            Personalize as cores deste bloco selecionando os ColorGroups para
            fundo e elementos da frente.
          </p>

          {/* Área de Trás (Back ColorGroup) */}
          <div className="colorgroup-field-group">
            <span className="field-group-label">
              Área de Trás (Color Group):
            </span>
            <div
              className="colorgroup-dropdown-container"
              ref={backDropdownRef}
            >
              <button
                type="button"
                className="colorgroup-dropdown-trigger"
                onClick={() => setIsBackMenuOpen(!isBackMenuOpen)}
                aria-haspopup="listbox"
                aria-expanded={isBackMenuOpen}
                aria-label="Área de Trás (Color Group)"
              >
                <SolidColorCircle color={getGroupBg(currentBack)} size={16} />
                <span className="cg-label">
                  {availableColorGroups[currentBack]?.name || currentBack}
                </span>
                <span
                  className={`dropdown-arrow ${isBackMenuOpen ? 'open' : ''}`}
                >
                  ▾
                </span>
              </button>

              <select
                className="sr-only back-cg-hidden-select"
                data-testid="back-cg-hidden-select"
                value={currentBack}
                onChange={(e) => handleSelectBack(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                style={{ display: 'none' }}
              >
                {Object.values(availableColorGroups).map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name || cg.id}
                  </option>
                ))}
              </select>

              {isBackMenuOpen && (
                <div className="colorgroup-dropdown-menu" role="listbox">
                  {Object.values(availableColorGroups).map((cg) => {
                    const isSelected = currentBack === cg.id;
                    return (
                      <div
                        key={cg.id}
                        className={`colorgroup-dropdown-item ${isSelected ? 'selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectBack(cg.id)}
                      >
                        <SolidColorCircle
                          color={getGroupBg(cg.id)}
                          size={16}
                        />
                        <span className="item-label">{cg.name || cg.id}</span>
                        {isSelected && <span className="check-mark">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Área da Frente (Front ColorGroup) */}
          <div className="colorgroup-field-group">
            <span className="field-group-label">
              Área da Frente (Color Group):
            </span>
            <div
              className="colorgroup-dropdown-container"
              ref={frontDropdownRef}
            >
              <button
                type="button"
                className="colorgroup-dropdown-trigger"
                onClick={() => setIsFrontMenuOpen(!isFrontMenuOpen)}
                aria-haspopup="listbox"
                aria-expanded={isFrontMenuOpen}
                aria-label="Área da Frente (Color Group)"
              >
                <SolidColorCircle color={getGroupBg(currentFront)} size={16} />
                <span className="cg-label">
                  {availableColorGroups[currentFront]?.name || currentFront}
                </span>
                <span
                  className={`dropdown-arrow ${isFrontMenuOpen ? 'open' : ''}`}
                >
                  ▾
                </span>
              </button>

              <select
                className="sr-only front-cg-hidden-select"
                data-testid="front-cg-hidden-select"
                value={currentFront}
                onChange={(e) => handleSelectFront(e.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                style={{ display: 'none' }}
              >
                {Object.values(availableColorGroups).map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name || cg.id}
                  </option>
                ))}
              </select>

              {isFrontMenuOpen && (
                <div className="colorgroup-dropdown-menu" role="listbox">
                  {Object.values(availableColorGroups).map((cg) => {
                    const isSelected = currentFront === cg.id;
                    return (
                      <div
                        key={cg.id}
                        className={`colorgroup-dropdown-item ${isSelected ? 'selected' : ''}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectFront(cg.id)}
                      >
                        <SolidColorCircle
                          color={getGroupBg(cg.id)}
                          size={16}
                        />
                        <span className="item-label">{cg.name || cg.id}</span>
                        {isSelected && <span className="check-mark">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockThemeWidget;
