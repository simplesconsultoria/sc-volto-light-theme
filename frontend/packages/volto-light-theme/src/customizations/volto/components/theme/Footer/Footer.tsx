import React from 'react';
import { getComponent } from '@simplesconsultoria/volto-light-theme/helpers/settings';

type FooterProps = {};

const Footer: React.FC<FooterProps> = () => {
  const FooterComponent = getComponent('footer');

  return <FooterComponent />;
};

export default Footer;
