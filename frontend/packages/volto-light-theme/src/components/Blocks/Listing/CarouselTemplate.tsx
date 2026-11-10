import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import config from '@plone/volto/registry';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';

import { carouselMessages } from './messages';
import CarouselControls from './CarouselControls';
import {
  type ListingItem,
  buildContainerStyle,
  buildEmbedSrc,
  getAutoPlayIntervalMs,
  getFooterHref,
  getLikelyVideoUrl,
  getSlideText,
  prefersReducedMotion,
  toEmbedUrl,
  wrapIndex,
} from './carouselHelpers';

interface CarouselTemplateProps {
  items: ListingItem[];
  isEditMode?: boolean;
  linkTitle?: string;
  linkHref?: any[];
  carouselMaxHeight?: number;
  carouselObjectFit?: 'contain' | 'cover';
  carouselObjectPosition?: string;
  carouselAutoPlay?: boolean;
  carouselAutoPlayInterval?: number;
}

/**
 * Active slide and autoplay state. Autoplay restarts whenever `canAutoPlay`
 * flips, and any manual navigation pauses it.
 */
const useCarouselPlayback = (
  count: number,
  canAutoPlay: boolean | undefined,
  autoPlayIntervalMs: number,
) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(canAutoPlay);
  const [prevCanAutoPlay, setPrevCanAutoPlay] = useState(canAutoPlay);

  if (canAutoPlay !== prevCanAutoPlay) {
    setPrevCanAutoPlay(canAutoPlay);
    setIsPlaying(canAutoPlay);
  }

  const goTo = (nextIndex: number) => {
    if (count <= 0) return;
    setActiveIndex(wrapIndex(nextIndex, count));
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!canAutoPlay || !isPlaying) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, autoPlayIntervalMs);

    return () => window.clearInterval(id);
  }, [canAutoPlay, isPlaying, autoPlayIntervalMs, count]);

  return { activeIndex, isPlaying, setIsPlaying, goTo };
};

interface SlideMediaProps {
  item: ListingItem;
  title: string;
  isActiveSlide: boolean;
}

// Render: embed iframe (active only) → preview image → placeholder
const SlideMedia: React.FC<SlideMediaProps> = ({
  item,
  title,
  isActiveSlide,
}) => {
  const intl = useIntl();
  const PreviewImageComponent = config.getComponent('PreviewImage').component;
  const videoUrl = getLikelyVideoUrl(item);
  const playableEmbedUrl =
    videoUrl && isActiveSlide ? toEmbedUrl(videoUrl) : null;

  if (playableEmbedUrl) {
    return (
      <div className="listing-carousel__embed">
        <iframe
          src={buildEmbedSrc(playableEmbedUrl)}
          title={title || intl.formatMessage(carouselMessages.video)}
          loading={isActiveSlide ? 'eager' : 'lazy'}
          sandbox="allow-scripts allow-presentation"
          allowFullScreen
        />
      </div>
    );
  }
  if (item?.image_field && PreviewImageComponent) {
    return (
      <PreviewImageComponent
        item={item}
        className="listing-carousel__image"
        loading="lazy"
        size="large"
      />
    );
  }
  return <div className="listing-carousel__placeholder" />;
};

interface SlideCaptionProps {
  title: string;
  description: string;
  date: string;
}

const SlideCaption: React.FC<SlideCaptionProps> = ({
  title,
  description,
  date,
}) => {
  if (!title && !date) return null;
  return (
    <div className="listing-carousel__caption">
      {date && <span className="listing-carousel__date">{date}</span>}
      {title && <h2 className="listing-carousel__title">{title}</h2>}
      {description && (
        <p className="listing-carousel__description">{description}</p>
      )}
    </div>
  );
};

interface CarouselSlideProps {
  item: ListingItem;
  isActiveSlide: boolean;
  isEditMode?: boolean;
}

const CarouselSlide: React.FC<CarouselSlideProps> = ({
  item,
  isActiveSlide,
  isEditMode,
}) => {
  const intl = useIntl();
  const { title, description, date } = getSlideText(item, intl.locale);

  return (
    <div className="listing-carousel__slide" aria-hidden={!isActiveSlide}>
      <ConditionalLink
        to={flattenToAppURL(item['@id'])}
        condition={!isEditMode}
        className="listing-carousel__slideLink"
      >
        <div className="listing-carousel__slideInner">
          <div className="listing-carousel__media">
            <SlideMedia
              item={item}
              title={title}
              isActiveSlide={isActiveSlide}
            />
          </div>
          <SlideCaption title={title} description={description} date={date} />
        </div>
      </ConditionalLink>
    </div>
  );
};

interface CarouselFooterProps {
  linkHref?: any[];
  linkTitle?: string;
  isEditMode?: boolean;
}

const CarouselFooter: React.FC<CarouselFooterProps> = ({
  linkHref,
  linkTitle,
  isEditMode,
}) => {
  const footerHref = getFooterHref(linkHref);
  if (!footerHref) return null;
  const label = linkTitle || footerHref;

  return (
    <div className="listing-carousel__footer">
      {isInternalURL(footerHref) ? (
        <ConditionalLink
          to={flattenToAppURL(footerHref)}
          condition={!isEditMode}
        >
          {label}
        </ConditionalLink>
      ) : (
        <a href={footerHref}>{label}</a>
      )}
    </div>
  );
};

const CarouselTemplate: React.FC<
  CarouselTemplateProps & Record<string, any>
> = ({
  items = [],
  isEditMode,
  linkTitle,
  linkHref,
  carouselMaxHeight,
  carouselObjectFit,
  carouselObjectPosition,
  carouselAutoPlay,
  carouselAutoPlayInterval,
}) => {
  const intl = useIntl();
  const slides = items.filter(Boolean);
  const count = slides.length;
  const canNavigate = count > 1;

  const canAutoPlay =
    carouselAutoPlay && !isEditMode && canNavigate && !prefersReducedMotion();
  const { activeIndex, isPlaying, setIsPlaying, goTo } = useCarouselPlayback(
    count,
    canAutoPlay,
    getAutoPlayIntervalMs(carouselAutoPlayInterval),
  );

  if (!count) return null;

  const containerStyle = buildContainerStyle({
    carouselMaxHeight,
    carouselObjectFit,
    carouselObjectPosition,
  });

  return (
    <div className="listing-carousel" style={containerStyle}>
      <div
        className="listing-carousel__viewport"
        aria-roledescription="carousel"
        aria-label={intl.formatMessage(carouselMessages.carousel)}
        onFocusCapture={() => setIsPlaying(false)}
      >
        <div
          className="listing-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((item, index) => (
            <CarouselSlide
              key={item['@id']}
              item={item}
              isActiveSlide={index === activeIndex}
              isEditMode={isEditMode}
            />
          ))}
        </div>
      </div>

      {/* Carousel controls */}
      <CarouselControls
        canNavigate={canNavigate}
        canAutoPlay={!!canAutoPlay}
        isPlaying={isPlaying}
        activeIndex={activeIndex}
        slides={slides}
        goTo={goTo}
        setIsPlaying={setIsPlaying}
      />

      {/* Footer */}
      <CarouselFooter
        linkHref={linkHref}
        linkTitle={linkTitle}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default CarouselTemplate;
