import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import { Container } from '@plone/components';
import config from '@plone/volto/registry';
import type { Content } from '@plone/types';
import HeaderBarActions from './HeaderBarActions';

type HeaderBarProps = {
  content: Content;
  navRoot: Content;
  location: any;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  content,
  navRoot,
  location,
}) => {
  const token = useSelector(
    (state: any) => state.userSession.token,
    shallowEqual,
  );
  const { headerBar } = config.settings?.scvlt || {};
  const display = headerBar?.display ?? false;

  return display ? (
    <div className="header-bar-wrapper">
      <Container layout className="header-bar">
        <SlotRenderer
          name="headerBarStart"
          content={content}
          navRoot={navRoot}
          location={location}
        />
        <HeaderBarActions token={token} />
        <SlotRenderer
          name="headerBarEnd"
          content={content}
          navRoot={navRoot}
          location={location}
        />
      </Container>
    </div>
  ) : null;
};

export default HeaderBar;
