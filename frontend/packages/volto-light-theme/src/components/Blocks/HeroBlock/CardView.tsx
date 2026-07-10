import React from 'react';
import cx from 'classnames';
import type { HeroBlockData } from './types';
import CardImage from './CardImage';
import { useHeroBlockContent } from './useHeroBlockContent';
import HeroBlockContent from './HeroBlockContent';

interface CardViewProps {
  data: HeroBlockData;
  className?: string;
  isEditMode?: boolean;
}

const CardView: React.FC<CardViewProps> = ({ data, className, isEditMode }) => {
  const contentData = useHeroBlockContent({
    data,
    isEditMode,
    defaultTitleTag: 'h1',
  });

  return (
    <article
      aria-label={contentData.displayTitle || 'Destaque'}
      className={cx(
        'hero-block',
        'hero-card',
        `text-${contentData.textSide}`,
        `image-fit-${contentData.imageFit}`,
        {
          full: data.fullWidth && !contentData.hasImage,
          'has-image': contentData.hasImage,
        },
        className,
      )}
    >
      <div className="hero-card-inner">
        {contentData.hasImage && (
          <div
            className="hero-card-image-wrapper"
            style={{ flex: `1 1 ${contentData.imageSize}` }}
          >
            <div className="hero-image">
              <CardImage imageInfo={contentData.imageInfo} />
            </div>
          </div>
        )}
        <div className="hero-card-info">
          <HeroBlockContent
            data={data}
            isEditMode={isEditMode}
            contentData={contentData}
          />
        </div>
      </div>
    </article>
  );
};

export default CardView;
