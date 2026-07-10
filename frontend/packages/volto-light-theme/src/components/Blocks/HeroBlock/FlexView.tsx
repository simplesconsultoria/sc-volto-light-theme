import React from 'react';
import cx from 'classnames';
import type { HeroBlockData } from './types';
import CardImage from './CardImage';
import { useHeroBlockContent } from './useHeroBlockContent';
import HeroBlockContent from './HeroBlockContent';

interface FlexViewProps {
  data: HeroBlockData;
  className?: string;
  isEditMode?: boolean;
}

const FlexView: React.FC<FlexViewProps> = ({ data, className, isEditMode }) => {
  const contentData = useHeroBlockContent({
    data,
    isEditMode,
    defaultTitleTag: 'h2',
  });

  return (
    <article
      aria-label={contentData.displayTitle || 'Destaque'}
      className={cx(
        'hero-block',
        'hero-flex',
        `text-${contentData.textSide}`,
        `image-fit-${contentData.imageFit}`,
        {
          full: data.fullWidth && !contentData.hasImage,
          'has-image': contentData.hasImage,
        },
        className,
      )}
    >
      <div className="hero-flex-inner">
        <div className="hero-flex-content">
          <HeroBlockContent
            data={data}
            isEditMode={isEditMode}
            contentData={contentData}
          />
        </div>
        {contentData.hasImage && (
          <div
            className="hero-flex-image-wrapper"
            style={{ flex: `1 1 ${contentData.imageSize}` }}
          >
            <div className="hero-decorative-square" aria-hidden="true" />
            <div className="hero-image">
              <CardImage imageInfo={contentData.imageInfo} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default FlexView;
