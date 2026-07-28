import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import config from '@plone/volto/registry';

import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';
import playSVG from '@plone/volto/icons/play.svg';
import pauseSVG from '@plone/volto/icons/pause.svg';

type ListingItem = Record<string, any>;

interface MediaCarouselTemplateProps {
  items: ListingItem[];
  isEditMode?: boolean;
  carouselMaxHeight?: number;
  carouselObjectFit?: 'contain' | 'cover';
  carouselObjectPosition?: string;
  carouselAutoPlay?: boolean;
  carouselAutoPlayInterval?: number;
}

const getLikelyVideoUrl = (item: ListingItem): string | null => {
  const url = item?.videoUrl || item?.video_url;
  return typeof url === 'string' && url.trim() ? url : null;
};

const toEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname || '';

    if (host === 'youtu.be') {
      const id = path.split('/')[1];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'youtube.com') {
      if (path.startsWith('/embed/')) return url;
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === 'vimeo.com') {
      const id = path.split('/').filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    if (host === 'player.vimeo.com' && path.startsWith('/video/')) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
};

const MediaCarouselTemplate: React.FC<
  MediaCarouselTemplateProps & Record<string, any>
> = ({
  items = [],
  isEditMode,
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
    <div
      className="listing-carousel listing-media-carousel"
      style={containerStyle}
    >
      <div
        className="listing-carousel__viewport"
        aria-roledescription="carousel"
        aria-label="Carrossel de Mídia"
        onFocusCapture={() => setIsPlaying(false)}
      >
        <div
          className="listing-carousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((item, index) => {
            const isActiveSlide = index === activeIndex;
            const videoUrl = getLikelyVideoUrl(item);
            const playableEmbedUrl =
              videoUrl && isActiveSlide ? toEmbedUrl(videoUrl) : null;

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
                    title={item?.title || 'Vídeo'}
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
                  loading="lazy"
                  size="large"
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
                <div className="listing-carousel__slideInner">
                  <div className="listing-carousel__media">{media}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                key={item['@id']}
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
    </div>
  );
};

export default MediaCarouselTemplate;
