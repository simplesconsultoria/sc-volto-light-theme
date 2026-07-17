import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import config from '@plone/volto/registry';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';

import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';
import playSVG from '@plone/volto/icons/play.svg';
import pauseSVG from '@plone/volto/icons/pause.svg';

type ListingItem = Record<string, any>;

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

const isValidDate = (dateString?: string): boolean => {
  if (!dateString || dateString === 'None') return false;
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    // Plone's empty effective date defaults to 1969 or 1970
    if (isNaN(date.getTime()) || year === 1969 || year === 1970) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const formatDate = (dateString?: string): string => {
  if (!isValidDate(dateString)) return '';
  const date = new Date(dateString as string);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getLikelyVideoUrl = (item: ListingItem): string | null => {
  const url = item?.videoUrl || item?.video_url;
  return typeof url === 'string' && url.trim() ? url : null;
};

const toEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname || '';

    // YouTube - youtu.be shortener
    if (host === 'youtu.be') {
      const id = path.split('/')[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // YouTube - full domain
    if (host === 'youtube.com') {
      if (path.startsWith('/embed/')) return url;
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // Vimeo
    if (host === 'vimeo.com') {
      const id = path.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    // Already embed URL
    if (host === 'player.vimeo.com' && path.startsWith('/video/')) {
      return url;
    }
  } catch {
    return null;
  }

  return null;
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
  const slides = items.filter(Boolean);
  const PreviewImageComponent = config.getComponent('PreviewImage').component;
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaHeight = Math.max(
    200,
    Math.min(1200, Number(carouselMaxHeight) || 520),
  );
  const objectFit = carouselObjectFit === 'cover' ? 'cover' : 'contain';
  const autoPlayIntervalMs = Math.max(
    2000,
    Math.min(60000, Math.floor(Number(carouselAutoPlayInterval) || 6000)),
  );

  const count = slides.length;
  const canNavigate = count > 1;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const canAutoPlay =
    carouselAutoPlay && !isEditMode && canNavigate && !prefersReducedMotion;
  const [isPlaying, setIsPlaying] = useState(canAutoPlay);

  useEffect(() => {
    setIsPlaying(canAutoPlay);
  }, [canAutoPlay]);

  const goTo = (nextIndex: number) => {
    if (count <= 0) return;
    setActiveIndex(((nextIndex % count) + count) % count);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!canAutoPlay || !isPlaying) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, autoPlayIntervalMs);

    return () => window.clearInterval(id);
  }, [canAutoPlay, isPlaying, autoPlayIntervalMs, count]);

  const footerHref = linkHref?.[0]?.['@id'];
  const footerLink =
    footerHref && typeof footerHref === 'string' ? (
      isInternalURL(footerHref) ? (
        <ConditionalLink
          to={flattenToAppURL(footerHref)}
          condition={!isEditMode}
        >
          {linkTitle || footerHref}
        </ConditionalLink>
      ) : (
        <a href={footerHref}>{linkTitle || footerHref}</a>
      )
    ) : null;

  if (!count) return null;

  const containerStyle = {
    ['--listing-carousel-media-height' as any]: `${mediaHeight}px`,
    ['--listing-carousel-object-fit' as any]: objectFit,
    ...(carouselObjectPosition
      ? {
          ['--listing-carousel-object-position' as any]: carouselObjectPosition,
        }
      : null),
  } as React.CSSProperties;

  return (
    <div className="listing-carousel" style={containerStyle}>
      <div
        className="listing-carousel__viewport"
        aria-roledescription="carousel"
        aria-label="Carrossel"
        onFocusCapture={() => setIsPlaying(false)}
      >
        <div
          className="listing-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((item, index) => {
            const isActiveSlide = index === activeIndex;
            const title = item?.title || '';
            const description = (
              item?.description ||
              item?.summary ||
              ''
            ).toString();
            const dateString = [
              item?.Date,
              item?.effective,
              item?.created,
            ].find(isValidDate);
            const date = formatDate(dateString);

            const videoUrl = getLikelyVideoUrl(item);
            const playableEmbedUrl =
              videoUrl && isActiveSlide ? toEmbedUrl(videoUrl) : null;

            // Render: embed iframe (active only) → preview image → placeholder
            let media: React.ReactNode;
            if (playableEmbedUrl) {
              media = (
                <div className="listing-carousel__embed">
                  <iframe
                    src={[
                      playableEmbedUrl,
                      playableEmbedUrl?.includes('youtube')
                        ? '?autoplay=0&mute=1&playsinline=1&rel=0&modestbranding=1'
                        : '?autoplay=0&muted=1&playsinline=1',
                    ].join('')}
                    title={title || 'Vídeo'}
                    loading={isActiveSlide ? 'eager' : 'lazy'}
                    sandbox="allow-scripts allow-presentation"
                    allowFullScreen
                  />
                </div>
              );
            } else if (item?.image_field && PreviewImageComponent) {
              media = (
                <PreviewImageComponent
                  item={item}
                  className="listing-carousel__image"
                />
              );
            } else {
              media = <div className="listing-carousel__placeholder" />;
            }

            return (
              <div
                key={item['@id']}
                className="listing-carousel__slide"
                aria-hidden={!isActiveSlide}
              >
                <ConditionalLink
                  to={flattenToAppURL(item['@id'])}
                  condition={!isEditMode}
                  className="listing-carousel__slideLink"
                >
                  <div className="listing-carousel__slideInner">
                    <div className="listing-carousel__media">{media}</div>
                    {(title || date) && (
                      <div className="listing-carousel__caption">
                        {date && (
                          <span className="listing-carousel__date">{date}</span>
                        )}
                        {title && (
                          <h2 className="listing-carousel__title">{title}</h2>
                        )}
                        {description && (
                          <p className="listing-carousel__description">
                            {description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </ConditionalLink>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carousel controls */}
      {canNavigate && (
        <div
          className="listing-carousel__controls"
          aria-label="Controles do carrossel"
        >
          <button
            type="button"
            className={cx(
              'listing-carousel__arrow',
              'listing-carousel__arrow--prev',
            )}
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Anterior"
          >
            <Icon name={leftSVG} size="20px" />
          </button>

          <div
            className="listing-carousel__dots"
            role="tablist"
            aria-label="Itens"
          >
            {slides.map((item, index) => (
              <button
                key={item?.['@id'] || index}
                type="button"
                className={cx('listing-carousel__dot', {
                  'is-active': index === activeIndex,
                })}
                onClick={() => goTo(index)}
                aria-label={`Ir para item ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                role="tab"
              />
            ))}
          </div>

          {canAutoPlay && (
            <button
              type="button"
              className={cx(
                'listing-carousel__arrow',
                'listing-carousel__toggle',
              )}
              onClick={() => setIsPlaying((prev) => !prev)}
              aria-label={
                isPlaying ? 'Pausar carrossel' : 'Reproduzir carrossel'
              }
              aria-pressed={isPlaying}
            >
              <Icon name={isPlaying ? pauseSVG : playSVG} size="20px" />
            </button>
          )}

          <button
            type="button"
            className={cx(
              'listing-carousel__arrow',
              'listing-carousel__arrow--next',
            )}
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Próximo"
          >
            <Icon name={rightSVG} size="20px" />
          </button>
        </div>
      )}

      {/* Footer */}
      {footerLink && (
        <div className="listing-carousel__footer">{footerLink}</div>
      )}
    </div>
  );
};

export default CarouselTemplate;
