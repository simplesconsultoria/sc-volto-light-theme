import React, { useContext } from 'react';
import withBlockExtensions from '@plone/volto/helpers/Extensions/withBlockExtensions';
import Image from '@plone/volto/components/theme/Image/Image';
import config from '@plone/volto/registry';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import type { Content } from '@plone/types';
import type { MainImageBlockData } from './index';
import Layout, { type MainImageAlign, type MainImageSize } from './Layout';
import { resolveBlockTheme } from '../../../config/blockThemes';
import { ReactReduxContext, useSelector } from 'react-redux';
import {
  findPreviewImage,
  resolveEffectivePreview,
  resolveMainImage,
  resolvePageContent,
  resolveThemeStyle,
} from './helpers';

interface MainImageBlockViewProps {
  data: MainImageBlockData;
  className?: string;
  isEditMode?: boolean;
  style?: React.CSSProperties;
  content?: Content;
  properties?: Content;
  metadata?: Content;
  [key: string]: any;
}

/** The page content from the Redux store (state or store snapshot). */
const useStateContent = () => {
  const reduxContext = useContext(ReactReduxContext);
  const reduxContent = useSelector((state: any) => state.content?.data);
  return reduxContent || reduxContext?.store?.getState()?.content?.data;
};

const EmptyMainImage: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className, style }) => (
  <div className={cx('main-image-block', 'empty', className)} style={style}>
    <FormattedMessage
      id="No preview image found on this page."
      defaultMessage="No preview image found on this page. Add a preview image to the page to display it in this block."
    />
  </div>
);

const MainImageBlockView: React.FC<MainImageBlockViewProps> = (props) => {
  const {
    data = {} as MainImageBlockData,
    className,
    style,
    isEditMode,
    content,
    properties,
    metadata,
  } = props;
  const intl = useIntl();

  const stateContent = useStateContent();

  // Resolves preview image across block data, top-level page, Redux store, and nested containers
  // (GridBlock, CustomGrid, Accordion) where metadata holds the page document.
  const previewImage = findPreviewImage([
    data,
    metadata,
    properties,
    content,
    stateContent,
  ]);
  const pageContent: Content = resolvePageContent(
    metadata,
    properties,
    content,
    stateContent,
  );
  const effectivePreview = resolveEffectivePreview(
    previewImage,
    data,
    pageContent,
  );

  if (!effectivePreview) {
    return isEditMode ? (
      <EmptyMainImage className={className} style={style} />
    ) : null;
  }

  const resolved = resolveBlockTheme(data);
  const mergedStyle: React.CSSProperties = {
    ...(style || {}),
    ...resolveThemeStyle(data, resolved.style),
  };
  const image = resolveMainImage(data, effectivePreview, pageContent, intl);

  return (
    <Layout
      align={data.align as MainImageAlign | undefined}
      size={data.size as MainImageSize | undefined}
      title={image.title}
      description={image.description}
      className={cx(className, resolved.className)}
      style={mergedStyle}
      image={
        <Image
          item={image.item}
          src={image.src}
          imageField={image.imageField}
          alt={image.alt}
          loading="lazy"
          responsive={true}
          sizes={(config.blocks.blocksConfig as any).image?.getSizes?.(data)}
        />
      }
    />
  );
};

export default withBlockExtensions(MainImageBlockView);
