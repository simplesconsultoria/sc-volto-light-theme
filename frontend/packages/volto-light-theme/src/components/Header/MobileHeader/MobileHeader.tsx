import React from 'react';
import { getVLTComponent } from '@kitconcept/volto-light-theme/helpers/settings';
import MobileTools from './MobileTools';

type MobileToolsProps = {
  token?: string | null;
  pathname: string;
};

const MobileHeader: React.FC<MobileToolsProps> = ({ token, pathname }) => {
  const MobileNavigation = getVLTComponent('mobileNavigation');
  return (
    <div className="mobile-nav-actions">
      <MobileTools token={token} />
      <MobileNavigation pathname={pathname} />
    </div>
  );
};

export default MobileHeader;
