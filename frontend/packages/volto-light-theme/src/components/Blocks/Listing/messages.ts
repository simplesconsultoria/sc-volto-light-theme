import { defineMessages } from 'react-intl';

/**
 * Accessible labels shared by the carousel listing templates.
 *
 * `CarouselTemplate` and `MediaCarouselTemplate` render the same control set, so
 * their labels live here rather than being declared twice.
 */
export const carouselMessages = defineMessages({
  carousel: {
    id: 'Carousel',
    defaultMessage: 'Carousel',
  },
  mediaCarousel: {
    id: 'Media Carousel',
    defaultMessage: 'Media Carousel',
  },
  controls: {
    id: 'Carousel controls',
    defaultMessage: 'Carousel controls',
  },
  previous: {
    id: 'Previous',
    defaultMessage: 'Previous',
  },
  next: {
    id: 'Next',
    defaultMessage: 'Next',
  },
  items: {
    id: 'Items',
    defaultMessage: 'Items',
  },
  goToItem: {
    id: 'Go to item {index}',
    defaultMessage: 'Go to item {index}',
  },
  pause: {
    id: 'Pause carousel',
    defaultMessage: 'Pause carousel',
  },
  play: {
    id: 'Play carousel',
    defaultMessage: 'Play carousel',
  },
  video: {
    id: 'Video',
    defaultMessage: 'Video',
  },
});
