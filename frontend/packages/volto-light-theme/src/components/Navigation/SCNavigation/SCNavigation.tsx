import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { hasApiExpander } from '@plone/volto/helpers/Utils/Utils';
import config from '@plone/volto/registry';
import { getNavigation } from '@plone/volto/actions/navigation/navigation';
import MenuItem from './MenuItem';
import { useNavCollapse } from '../../../hooks/useNavCollapse';
import type { NavigationItem } from '@simplesconsultoria/volto-light-theme/types/navigation';

type NavigationProps = {
  pathname: string;
};

type HeaderSettings = {
  has_fat_menu?: boolean;
};

type RootState = {
  content: {
    data?: {
      '@components'?: {
        inherit?: {
          'voltolighttheme.header'?: {
            data?: HeaderSettings;
          };
        };
      };
    };
  };
  form: {
    global?: {
      has_fat_menu?: boolean;
      [key: string]: unknown;
    };
  };
  intl: {
    locale: string;
  };
  navigation: {
    items: NavigationItem[];
  };
};

const SCNavigation = ({ pathname }: NavigationProps) => {
  const containerStyle = useMemo(
    () => ({ width: '100%', display: 'flex', justifyContent: 'flex-end' }),
    [],
  );
  const measurerStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      visibility: 'hidden' as const,
      zIndex: -1,
      pointerEvents: 'none' as const,
    }),
    [],
  );
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<number | null>(null);
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setDesktopMenuOpen(null);
    setCurrentOpenIndex(null);
  }
  const navigation = useRef<HTMLElement | null>(null);
  const dispatch = useDispatch();
  const headerSettings = useSelector(
    (state: RootState) =>
      state.content.data?.['@components']?.inherit?.['voltolighttheme.header']
        ?.data,
  );
  const formData = useSelector((state: RootState) => state.form.global);
  const hasFatMenuSetting =
    !isEmpty(formData) && formData?.has_fat_menu !== undefined
      ? formData.has_fat_menu
      : headerSettings?.has_fat_menu;
  const hasFatMenu = hasFatMenuSetting ?? false;

  const lang = useSelector((state: RootState) => state.intl.locale);
  const items: NavigationItem[] = useSelector(
    (state: RootState) => state.navigation.items,
    shallowEqual,
  );

  const closeMenu = useCallback(() => {
    setDesktopMenuOpen(null);
    setCurrentOpenIndex(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navigation.current?.contains(event.target as Node)) return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside, false);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, [closeMenu]);

  useEffect(() => {
    if (!hasApiExpander('navigation', getBaseUrl(pathname))) {
      dispatch(getNavigation(getBaseUrl(pathname), config.settings.navDepth));
    }
  }, [pathname, dispatch]);

  const openMenu = useCallback(
    (index: number) => {
      if (index === currentOpenIndex) {
        closeMenu();
      } else {
        setDesktopMenuOpen(index);
        setCurrentOpenIndex(index);
      }
    },
    [currentOpenIndex, closeMenu],
  );

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeMenu]);

  // Auto-collapse logic
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLUListElement>(null);
  const { visibleCount } = useNavCollapse({
    containerRef,
    measurerRef,
    totalItems: items.length,
    reservedWidth: 20, // small safety margin
  });

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );
  const hiddenItems = useMemo(
    () => items.slice(visibleCount),
    [items, visibleCount],
  );

  return (
    <nav
      id="navigation"
      aria-label="navigation"
      className={'navigation scNavigation'}
      ref={navigation}
    >
      <div
        className={'computer large screen widescreen only'}
        ref={containerRef}
        style={containerStyle}
      >
        {/* Measurer node: renders all items absolutely so we can measure their natural widths */}
        <ul
          className="desktop-menu"
          ref={measurerRef}
          aria-hidden="true"
          style={measurerStyle}
        >
          {items.map((item, index) => (
            <MenuItem
              key={item.url}
              index={index}
              hasFatMenu={hasFatMenu}
              desktopMenuOpen={desktopMenuOpen}
              item={item}
              pathname={pathname}
              lang={lang}
              openMenu={openMenu}
              closeMenu={closeMenu}
            />
          ))}
          <li className="item">
            <button
              type="button"
              className="sc-dropdown-menu__trigger"
              tabIndex={-1}
            >
              Mais
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
          </li>
        </ul>

        {/* Actual visible menu */}
        <ul className="desktop-menu">
          {visibleItems.map((item, index) => (
            <MenuItem
              key={item.url}
              index={index}
              hasFatMenu={hasFatMenu}
              desktopMenuOpen={desktopMenuOpen}
              item={item}
              pathname={pathname}
              lang={lang}
              openMenu={openMenu}
              closeMenu={closeMenu}
            />
          ))}

          {hiddenItems.length > 0 && (
            <MenuItem
              key="more-menu-item"
              index={items.length + 1}
              hasFatMenu={true}
              desktopMenuOpen={desktopMenuOpen}
              item={{
                title: 'Mais',
                url: 'more',
                items: hiddenItems,
              }}
              pathname={pathname}
              lang={lang}
              openMenu={openMenu}
              closeMenu={closeMenu}
            />
          )}
        </ul>
      </div>
    </nav>
  );
};

export default SCNavigation;
