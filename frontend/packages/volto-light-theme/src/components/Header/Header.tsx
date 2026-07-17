import React, { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import type { Content } from '@plone/types';
import { Container } from '@plone/components';
import SearchWidget from '@plone/volto/components/theme/SearchWidget/SearchWidget';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import { getVLTComponent } from '@kitconcept/volto-light-theme/helpers/settings';
import HeaderBar from '../HeaderBar/HeaderBar';
import MobileHeader from './MobileHeader/MobileHeader';
import Logo from '@kitconcept/volto-light-theme/components/Logo/Logo';

type HeaderProps = {
  pathname: string;
};

type FormState = {
  content: {
    data: Content;
  };
  navroot: {
    data: {
      navroot: Content;
    };
  };
};

const useTheme = () => {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    return () => observer.disconnect();
  }, []);
  return theme;
};

const Header: React.FC<HeaderProps> = ({ pathname }) => {
  const token = useSelector(
    (state: any) => state.userSession.token,
    shallowEqual,
  );
  const content = useSelector<FormState, Content>(
    (state: any) => state.content.data,
    shallowEqual,
  );

  const navRoot = useSelector<FormState, Content>(
    (state: any) => state.navroot?.data?.navroot,
  );

  const Navigation = getVLTComponent('navigation');
  const theme = useTheme();
  const isDark = theme === 'dark' || theme === 'high-contrast';

  return (
    <>
      <SlotRenderer
        name="aboveHeader"
        content={content}
        navRoot={navRoot}
        location={content}
      />
      <header className="header-wrapper">
        <HeaderBar content={content} navRoot={navRoot} location={content} />
        <Container layout>
          <div className="header">
            <div className="header-main">
              <div className="logo-nav-wrapper">
                <div className="logo">
                  <Logo isFooterLogo={isDark} />
                </div>
                <Navigation pathname={pathname} />
                <MobileHeader token={token} pathname={pathname} />
              </div>

              <div className="search-wrapper navigation-desktop">
                <div className="search">
                  <SearchWidget />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </header>
      <SlotRenderer
        name="belowHeader"
        content={content}
        navRoot={navRoot}
        location={content}
      />
    </>
  );
};

export default Header;
