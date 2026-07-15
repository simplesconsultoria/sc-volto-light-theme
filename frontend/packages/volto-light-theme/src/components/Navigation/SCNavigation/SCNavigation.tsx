import React, { useState, useEffect, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import doesNodeContainClick from '@kitconcept/volto-light-theme/helpers/doesNodeContainClick';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { hasApiExpander } from '@plone/volto/helpers/Utils/Utils';
import config from '@plone/volto/registry';
import { getNavigation } from '@plone/volto/actions/navigation/navigation';
import MenuItem from './MenuItem';
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
  userSession: {
    token?: string | null;
  };
  navigation: {
    items: NavigationItem[];
  };
};

const SCNavigation = ({ pathname }: NavigationProps) => {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<number | null>(null);
  const [currentOpenIndex, setCurrentOpenIndex] = useState<number | null>(null);
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
  const token = useSelector(
    (state: RootState) => state.userSession.token,
    shallowEqual,
  );
  const items: NavigationItem[] = useSelector(
    (state: RootState) => state.navigation.items,
    shallowEqual,
  );

  const closeMenu = () => {
    setDesktopMenuOpen(null);
    setCurrentOpenIndex(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navigation.current && doesNodeContainClick(navigation.current, event))
        return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside, false);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, []);

  // A link in the navigation is not an outside click, so handleClickOutside
  // leaves an open fat menu behind once it navigates. Close it on every route
  // change, which also covers the browser's back and forward buttons.
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (!hasApiExpander('navigation', getBaseUrl(pathname))) {
      dispatch(getNavigation(getBaseUrl(pathname), config.settings.navDepth));
    }
  }, [pathname, token, dispatch]);

  const openMenu = (index: number) => {
    if (index === currentOpenIndex) {
      setDesktopMenuOpen(null);
      setCurrentOpenIndex(null);
    } else {
      setDesktopMenuOpen(index);
      setCurrentOpenIndex(index);
    }
  };

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
  }, []);

  return (
    <nav
      id="navigation"
      aria-label="navigation"
      className={'navigation scNavigation'}
      ref={navigation}
    >
      <div className={'computer large screen widescreen only'}>
        <ul className="desktop-menu">
          {items.map((item, index) => {
            return (
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
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default SCNavigation;
