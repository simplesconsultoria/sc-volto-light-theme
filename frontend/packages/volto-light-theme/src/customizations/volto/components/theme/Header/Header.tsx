import React from 'react';
import { getComponent } from '@simplesconsultoria/volto-light-theme/helpers/settings';

type HeaderProps = {
  pathname: string;
};

const Header: React.FC<HeaderProps> = ({ pathname }) => {
  const HeaderComponent = getComponent('header');

  return <HeaderComponent pathname={pathname} />;
};

export default Header;
