import { useContext } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import type { GetSiteResponse } from '@plone/types';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import DefaultSummary from '@kitconcept/volto-light-theme/components/Summary/DefaultSummary';
import type { SummaryComponentType } from '@kitconcept/volto-light-theme/components/Summary/DefaultSummary';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import config from '@plone/volto/registry';
import { GridContext } from '@plone/volto/components/manage/Blocks/Grid/context';

type FormState = {
  site: { data: GetSiteResponse };
};

const TeaserDefaultTemplate = (props) => {
  const site = useSelector<FormState, GetSiteResponse>(
    (state) => state.site?.data,
  );
  const showProfileLinks = site?.['kitconcept.clickable_profile_links'];
  const { data, isEditMode, isContainer } = props;
  const columns = useContext(GridContext);
  const sizes = config.blocks.blocksConfig.teaser?.getSizes?.({
    data,
    inGrid: isContainer,
    columns,
  });
  const href = data.href?.[0] || {};
  const image = data.preview_image?.[0];
  const url = data.preview_image?.[0]?.['@id'];

  const Image = config.getComponent('Image').component;
  const Summary = (config.getComponent({
    name: 'Summary',
    dependencies: [href['@type']],
  }).component || DefaultSummary) as SummaryComponentType;
  let showLink =
    !Summary.hideLink &&
    !isEditMode &&
    !!(href['@id'] || href.href || href.url);
  if (href['@type'] === 'Person' && showProfileLinks !== undefined) {
    showLink =
      showProfileLinks &&
      !isEditMode &&
      !!(href['@id'] || href.href || href.url);
  }
  const { openExternalLinkInNewTab } = config.settings;
  const openLinkInNewTab =
    data.openLinkInNewTab ||
    (openExternalLinkInNewTab && !isInternalURL(href['@id']));

  // Ensures that overridden fields are used when "overwrite" is true
  // and fallbacks to empty strings if they are not provided to ensure no undefined
  // values are passed
  const localOverrides = {
    title: data.title || '',
    description: data.description || '',
    head_title: data.head_title || '',
  };

  const placeholderSrc = config.settings.placeholderImages?.[href['@type']];

  // Resolve direct URL fallback safely
  const targetItem = data.overwrite
    ? image
    : href?.hasPreviewImage || href?.image_field
      ? href
      : image;
  let resolvedSrc: string | undefined;
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
  } else if (url) {
    const flatUrl = flattenToAppURL(url);
    resolvedSrc =
      !flatUrl.includes('@@images') &&
      !flatUrl.includes('@@download') &&
      !/\.(jpe?g|png|gif|svg|webp)($|\?)/i.test(flatUrl)
        ? `${flatUrl.replace(/\/$/, '')}/@@images/image`
        : flatUrl;
  }

  // Safe wrapper for Image component ensuring an image element is always returned
  const SafeImage = (imageProps: any) => {
    if (imageProps.src) {
      return Image ? (
        <Image {...imageProps} />
      ) : (
        <img {...imageProps} alt={imageProps.alt || ''} />
      );
    }
    try {
      const res = Image ? Image(imageProps) : null;
      if (res) return res;
    } catch {
      // Fallback on scale rendering error
    }
    if (resolvedSrc) {
      return (
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

  return (
    <Card
      className={cx({ 'no-link': !showLink })}
      item={showLink ? href : null}
      openLinkInNewTab={openLinkInNewTab}
    >
      <Card.Image
        src={
          resolvedSrc && !image?.image_field && !href?.image_field
            ? resolvedSrc
            : undefined
        }
        item={!data.overwrite ? href : { ...href, ...localOverrides }}
        image={data.overwrite ? image : undefined}
        imageComponent={SafeImage}
        showPlaceholderImage={Boolean(placeholderSrc)}
        placeholderSrc={placeholderSrc}
        sizes={sizes}
      />
      <Card.Summary>
        <Summary
          item={!data.overwrite ? href : { ...href, ...localOverrides }}
          hide_description={props.data?.hide_description}
        />
      </Card.Summary>
    </Card>
  );
};

export default TeaserDefaultTemplate;
