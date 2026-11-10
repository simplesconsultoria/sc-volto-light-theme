/**
 * OVERRIDE DefaultBody.jsx
 * REASON: Robust href/image normalization (supporting arrays, objects and strings)
 * and SafeImage fallback when image scale metadata is missing or fails to resolve.
 * Ensures the Slider block always renders the slide image instead of an empty box.
 * FILE: @kitconcept/volto-slider-block/src/components/DefaultBody.jsx
 * FILE VERSION: 7.0.0-alpha.1
 */

import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import MaybeWrap from '@plone/volto/components/manage/MaybeWrap/MaybeWrap';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { Button } from '@plone/components';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
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
  const intl = useIntl();

  const rawHref = data.href;
  const href = Array.isArray(rawHref)
    ? rawHref[0]
    : typeof rawHref === 'object' && rawHref !== null
      ? rawHref
      : typeof rawHref === 'string' && rawHref
        ? { '@id': rawHref }
        : undefined;

  const rawImage = data.preview_image;
  const image = Array.isArray(rawImage)
    ? rawImage[0]
    : typeof rawImage === 'object' && rawImage !== null
      ? rawImage
      : typeof rawImage === 'string' && rawImage
        ? { '@id': rawImage }
        : undefined;

  const Image = config.getComponent('Image').component || DefaultImage;
  const { openExternalLinkInNewTab } = config.settings;

  const handleClick = () => {
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
  };

  const targetItem = image || href;
  let resolvedSrc;
  if (targetItem?.['@id']) {
    const scales = targetItem.image_scales;
    const imageField = targetItem.image_field || 'image';
    const scaleObj =
      scales?.[imageField]?.[0] || (scales && Object.values(scales)?.[0]?.[0]);
    if (scaleObj?.download) {
      resolvedSrc = `${flattenToAppURL(targetItem['@id'])}/${scaleObj.download.replace(/^\//, '')}`;
    } else {
      resolvedSrc = `${flattenToAppURL(targetItem['@id'])}/@@images/image`;
    }
  }

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
    if (resolvedSrc) {
      return (
        // eslint-disable-next-line no-restricted-syntax
        <img
          src={resolvedSrc}
          alt={imageProps.alt || ''}
          loading={imageProps.loading || 'lazy'}
          className={imageProps.responsive ? 'responsive' : undefined}
        />
      );
    }
    return null;
  };

  const hrefId = href?.['@id'] || href?.url || href?.href;

  return (
    <div
      className={cx('grid-teaser-item top', {
        'empty-slide': !hrefId && isEditMode,
        'slide-visible': isActive,
      })}
    >
      {!hrefId && isEditMode && (
        <div className="slider-default-placeholder">
          <Image src={TeaserTemplateImg} alt="" />
          <p>{intl.formatMessage(messages.PleaseChooseContent)}</p>
          <Button onPress={handleClick}>
            <Icon name={navTreeSVG} size="24px" />
            {intl.formatMessage(messages.source)}
          </Button>
        </div>
      )}
      {hrefId && (
        <div className="teaser-item top">
          <MaybeWrap
            condition={!isEditMode}
            as={UniversalLink}
            href={hrefId}
            target={
              data.openLinkInNewTab ||
              (openExternalLinkInNewTab && !isInternalURL(hrefId))
                ? '_blank'
                : null
            }
            tabIndex={!isActive ? '-1' : null}
          >
            {(href?.hasPreviewImage ||
              href?.image_field ||
              image ||
              resolvedSrc) && (
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
            )}
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
          </MaybeWrap>
        </div>
      )}
    </div>
  );
};

export default SliderBody;
