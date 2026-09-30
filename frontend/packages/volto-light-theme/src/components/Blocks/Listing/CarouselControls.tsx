import React from 'react';
import { useIntl } from 'react-intl';
import cx from 'classnames';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import { carouselMessages } from './messages';

import leftSVG from '@plone/volto/icons/left-key.svg';
import rightSVG from '@plone/volto/icons/right-key.svg';
import playSVG from '@plone/volto/icons/play.svg';
import pauseSVG from '@plone/volto/icons/pause.svg';

interface CarouselControlsProps {
  canNavigate: boolean;
  canAutoPlay: boolean;
  isPlaying: boolean;
  activeIndex: number;
  slides: any[];
  goTo: (index: number) => void;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  canNavigate,
  canAutoPlay,
  isPlaying,
  activeIndex,
  slides,
  goTo,
  setIsPlaying,
}) => {
  const intl = useIntl();

  if (!canNavigate) return null;

  return (
    <div
      className="listing-carousel__controls"
      aria-label={intl.formatMessage(carouselMessages.controls)}
    >
      <button
        type="button"
        className={cx(
          'listing-carousel__arrow',
          'listing-carousel__arrow--prev',
        )}
        onClick={() => goTo(activeIndex - 1)}
        aria-label={intl.formatMessage(carouselMessages.previous)}
      >
        <Icon name={leftSVG} size="20px" />
      </button>

      <div
        className="listing-carousel__dots"
        role="tablist"
        aria-label={intl.formatMessage(carouselMessages.items)}
      >
        {slides.map((item, index) => (
          <button
            key={item['@id']}
            type="button"
            className={cx('listing-carousel__dot', {
              'is-active': index === activeIndex,
            })}
            onClick={() => goTo(index)}
            aria-label={intl.formatMessage(carouselMessages.goToItem, {
              index: index + 1,
            })}
            aria-current={index === activeIndex ? 'true' : undefined}
            role="tab"
          />
        ))}
      </div>

      {canAutoPlay && (
        <button
          type="button"
          className={cx('listing-carousel__toggle', 'listing-carousel__arrow')}
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={intl.formatMessage(
            isPlaying ? carouselMessages.pause : carouselMessages.play,
          )}
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
        aria-label={intl.formatMessage(carouselMessages.next)}
      >
        <Icon name={rightSVG} size="20px" />
      </button>
    </div>
  );
};

export default CarouselControls;
