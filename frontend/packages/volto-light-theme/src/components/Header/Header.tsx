import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import type { Content } from '@plone/types';
import { Container } from '@plone/components';
import SearchWidget from '@plone/volto/components/theme/SearchWidget/SearchWidget';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import config from '@plone/volto/registry';
import { getVLTComponent } from '@kitconcept/volto-light-theme/helpers/settings';
import Logo from '@kitconcept/volto-light-theme/components/Logo/Logo';
import useTheme from '../../hooks/useTheme';

type HeaderProps = {
  pathname: string;
};

type RootState = {
  userSession: {
    token?: string | null;
  };
  content: {
    data: Content;
  };
  navroot?: {
    data?: {
      navroot: Content;
    };
  };
};

const Header: React.FC<HeaderProps> = ({ pathname }) => {
  const token = useSelector(
    (state: RootState) => state.userSession?.token,
    shallowEqual,
  );
  const content = useSelector(
    (state: RootState) => state.content?.data,
    shallowEqual,
  );

  const navRoot = useSelector(
    (state: RootState) => state.navroot?.data?.navroot,
  );

  const Navigation = getVLTComponent('navigation');
  const HeaderBar = config.getComponent('HeaderBar').component;
  const MobileHeader = config.getComponent('MobileHeader').component;
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
