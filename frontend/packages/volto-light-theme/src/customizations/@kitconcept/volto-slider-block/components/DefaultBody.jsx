/**
 * OVERRIDE DefaultBody.jsx
 * REASON: Robust href/image normalization (supporting arrays, objects and strings)
 * and SafeImage fallback when image scale metadata is missing or fails to resolve.
 * Ensures the Slider block always renders the slide image instead of an empty box.
 * FILE: @kitconcept/volto-slider-block/src/components/DefaultBody.jsx
 * FILE VERSION: 7.0.0
 */

import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import MaybeWrap from '@plone/volto/components/manage/MaybeWrap/MaybeWrap';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { Button } from '@plone/components';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import {
  normalizeItemRef,
  resolveItemImageSrc,
} from '@simplesconsultoria/volto-light-theme/helpers/itemImage';
import cx from 'classnames';
import navTreeSVG from '@plone/volto/icons/nav.svg';
import TeaserTemplateImg from '@kitconcept/volto-slider-block/components/teaser-template.svg';
import config from '@plone/volto/registry';

const messages = defineMessages({
  PleaseChooseContent: {
    id: 'Please choose an existing content as source for this element',
    defaultMessage:
      'Please choose an existing content as source for this element',
  },
  moreInfo: {
    id: 'moreInfo',
    defaultMessage: 'More info',
  },
  source: {
    id: 'Source',
    defaultMessage: 'Source',
  },
  ButtonText: {
    id: 'Continue reading',
    defaultMessage: 'Continue reading',
  },
});

// eslint-disable-next-line no-restricted-syntax
const DefaultImage = (props) => <img {...props} alt={props.alt || ''} />;

/**
 * Image component for a slide: the configured `Image`, or a plain `<img>` of
 * `fallbackSrc` when there is nothing to render.
 */
function makeSafeImage(Image, fallbackSrc) {
  const SafeImage = (imageProps) => {
    if (imageProps.src) {
      return <Image {...imageProps} />;
    }
    try {
      const res = Image ? <Image {...imageProps} /> : null;
      if (res) return res;
    } catch {
      // Fallback on scale rendering error
    }
    if (fallbackSrc) {
      return (
        // eslint-disable-next-line no-restricted-syntax
        <img
          src={fallbackSrc}
          alt={imageProps.alt || ''}
          loading={imageProps.loading || 'lazy'}
          className={imageProps.responsive ? 'responsive' : undefined}
        />
      );
    }
    return null;
  };
  return SafeImage;
}

/**
 * Opens the object browser and stores the chosen content as the source of
 * slide `index`.
 */
function selectSlideSource({
  openObjectBrowser,
  dataBlock,
  index,
  block,
  onChangeBlock,
}) {
  openObjectBrowser({
    onSelectItem: (url, document) => {
      dataBlock.slides[index].title = document.Title;
      dataBlock.slides[index].description = document.Description;
      dataBlock.slides[index].href = [
        {
          '@id': document['@id'],
          Title: document.Title,
          Description: document.Description,
          title: document.Title,
          image_field: document.image_field,
          hasPreviewImage: document.hasPreviewImage,
        },
      ];
      onChangeBlock(block, dataBlock);
    },
    mode: 'link',
  });
}

/** Link target of the slide: `_blank` for new-tab links, else `null`. */
function getSlideLinkTarget(data, hrefId) {
  const { openExternalLinkInNewTab } = config.settings;
  return data.openLinkInNewTab ||
    (openExternalLinkInNewTab && !isInternalURL(hrefId))
    ? '_blank'
    : null;
}

const SlidePlaceholder = ({ Image, onSelectSource }) => {
  const intl = useIntl();
  return (
    <div className="slider-default-placeholder">
      <Image src={TeaserTemplateImg} alt="" />
      <p>{intl.formatMessage(messages.PleaseChooseContent)}</p>
      <Button onPress={onSelectSource}>
        <Icon name={navTreeSVG} size="24px" />
        {intl.formatMessage(messages.source)}
      </Button>
    </div>
  );
};

const SlideFlag = ({ data }) => {
  const intl = useIntl();
  return (
    <div
      className={cx(
        'teaser-item-title fix-width-issue',
        `has--slider--flagAlign--${data.flagAlign || 'left'}`,
      )}
    >
      <div className="title">
        {data?.head_title && (
          <span className="supertitle">{data?.head_title}</span>
        )}
        <h2>{data?.nav_title || data?.title}</h2>
      </div>
      <p>{data?.description}</p>

      {!data.hideButton && (
        <Button tabIndex={'-1'}>
          {data.buttonText || intl.formatMessage(messages.ButtonText)}
        </Button>
      )}
    </div>
  );
};

const SlideImage = ({ Image, href, image }) => {
  const resolvedSrc = resolveItemImageSrc(image || href);

  // Stable per (Image, src): a component defined inline would be a new type
  // on every render and remount the slide image.
  const SafeImage = React.useMemo(
    () => makeSafeImage(Image, resolvedSrc),
    [Image, resolvedSrc],
  );

  if (!(href?.hasPreviewImage || href?.image_field || image || resolvedSrc)) {
    return null;
  }
  return (
    <div className="highlight-image-wrapper gradient">
      <SafeImage
        item={image || href}
        imageField={image ? image.image_field : href?.image_field}
        alt=""
        loading="lazy"
        responsive={true}
        sizes="auto, (max-width: 1440px) 100vw, 1440px"
      />
    </div>
  );
};

const SliderBody = ({
  index,
  onChangeBlock,
  block,
  data,
  dataBlock,
  isEditMode,
  openObjectBrowser,
  isActive,
}) => {
  const href = normalizeItemRef(data.href);
  const image = normalizeItemRef(data.preview_image);
  const Image = config.getComponent('Image').component || DefaultImage;
  const hrefId = href?.['@id'] || href?.url || href?.href;
  const isEmptyInEdit = !hrefId && isEditMode;

  const handleClick = () =>
    selectSlideSource({
      openObjectBrowser,
      dataBlock,
      index,
      block,
      onChangeBlock,
    });

  return (
    <div
      className={cx('grid-teaser-item top', {
        'empty-slide': isEmptyInEdit,
        'slide-visible': isActive,
      })}
    >
      {isEmptyInEdit && (
        <SlidePlaceholder Image={Image} onSelectSource={handleClick} />
      )}
      {hrefId && (
        <div className="teaser-item top">
          <MaybeWrap
            condition={!isEditMode}
            as={UniversalLink}
            href={hrefId}
            className="link-container"
            target={getSlideLinkTarget(data, hrefId)}
            tabIndex={!isActive ? '-1' : null}
          >
            <SlideImage Image={Image} href={href} image={image} />
            <SlideFlag data={data} />
          </MaybeWrap>
        </div>
      )}
    </div>
  );
};

export default SliderBody;
