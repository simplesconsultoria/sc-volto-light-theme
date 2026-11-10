import { useContext, useMemo } from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import type { GetSiteResponse } from '@plone/types';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import {
  resolveImageUrlSrc,
  resolveItemImageSrc,
} from '@simplesconsultoria/volto-light-theme/helpers/itemImage';
import DefaultSummary from '@kitconcept/volto-light-theme/components/Summary/DefaultSummary';
import type { SummaryComponentType } from '@kitconcept/volto-light-theme/components/Summary/DefaultSummary';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import config from '@plone/volto/registry';
import { GridContext } from '@plone/volto/components/manage/Blocks/Grid/context';

type FormState = {
  site: { data: GetSiteResponse };
};

/**
 * Image component for the teaser card: the configured `Image` when it can
 * render the item, otherwise a plain `<img>` of `fallbackSrc`.
 */
function makeSafeImage(Image: any, fallbackSrc?: string) {
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
    if (fallbackSrc) {
      return (
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
 * Whether the teaser card links to its target. Person teasers follow the
 * site's `kitconcept.clickable_profile_links` setting when it is defined.
 */
function shouldShowLink(
  href: any,
  isEditMode: boolean,
  Summary: SummaryComponentType,
  showProfileLinks: boolean | undefined,
): boolean {
  const hasTarget = !!(href['@id'] || href.href || href.url);
  const linkAllowed =
    href['@type'] === 'Person' && showProfileLinks !== undefined
      ? showProfileLinks
      : !Summary.hideLink;
  return !!linkAllowed && !isEditMode && hasTarget;
}

/** Direct image URL used as fallback by the teaser card image. */
function resolveTeaserImageSrc(
  data: any,
  href: any,
  image: any,
): string | undefined {
  const usesHrefImage =
    !data.overwrite && (href?.hasPreviewImage || href?.image_field);
  const targetItem = usesHrefImage ? href : image;
  if (targetItem?.['@id']) return resolveItemImageSrc(targetItem);
  const url = image?.['@id'];
  return url ? resolveImageUrlSrc(url) : undefined;
}

function useTeaserSizes(data: any, isContainer: boolean) {
  const columns = useContext(GridContext);
  return config.blocks.blocksConfig.teaser?.getSizes?.({
    data,
    inGrid: isContainer,
    columns,
  });
}

function useShowProfileLinks() {
  const site = useSelector<FormState, GetSiteResponse>(
    (state) => state.site?.data,
  );
  return site?.['kitconcept.clickable_profile_links'];
}

const TeaserDefaultTemplate = (props) => {
  const showProfileLinks = useShowProfileLinks();
  const { data, isEditMode, isContainer } = props;
  const sizes = useTeaserSizes(data, isContainer);
  const href = data.href?.[0] || {};
  const image = data.preview_image?.[0];

  const Image = config.getComponent('Image').component;
  const Summary = (config.getComponent({
    name: 'Summary',
    dependencies: [href['@type']],
  }).component || DefaultSummary) as SummaryComponentType;
  const showLink = shouldShowLink(href, isEditMode, Summary, showProfileLinks);
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
  const item = !data.overwrite ? href : { ...href, ...localOverrides };

  const placeholderSrc = config.settings.placeholderImages?.[href['@type']];

  // Resolve direct URL fallback safely
  const resolvedSrc = resolveTeaserImageSrc(data, href, image);
  const usesImageField = image?.image_field || href?.image_field;

  // Stable per (Image, src): a component defined inline would be a new type
  // on every render and remount the image.
  const SafeImage = useMemo(
    () => makeSafeImage(Image, resolvedSrc),
    [Image, resolvedSrc],
  );

  return (
    <Card
      className={cx({ 'no-link': !showLink })}
      item={showLink ? href : null}
      openLinkInNewTab={openLinkInNewTab}
    >
      <Card.Image
        src={usesImageField ? undefined : resolvedSrc}
        item={item}
        image={data.overwrite ? image : undefined}
        imageComponent={SafeImage}
        showPlaceholderImage={Boolean(placeholderSrc)}
        placeholderSrc={placeholderSrc}
        sizes={sizes}
      />
      <Card.Summary>
        <Summary item={item} hide_description={props.data?.hide_description} />
      </Card.Summary>
    </Card>
  );
};

export default TeaserDefaultTemplate;
