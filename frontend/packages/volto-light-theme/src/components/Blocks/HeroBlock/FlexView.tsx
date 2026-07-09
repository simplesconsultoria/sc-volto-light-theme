import React from 'react';
import cx from 'classnames';
import config from '@plone/volto/registry';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import { FormattedDate, ConditionalLink } from '@plone/volto/components';

interface FlexViewProps {
  data: Record<string, any>;
  className?: string;
  isEditMode?: boolean;
}

const FlexView: React.FC<FlexViewProps> = ({ data, className, isEditMode }) => {
  const hrefItem = data.href?.[0];

  const title =
    data.overwrite && data.title
      ? data.title
      : hrefItem?.Title || hrefItem?.title || data.title;
  const description =
    data.overwrite && data.description
      ? data.description
      : hrefItem?.Description || hrefItem?.description || data.description;
  const displayTitle =
    title || (isEditMode ? 'Selecione um Item de Destaque' : '');
  const displayDescription =
    description ||
    (isEditMode && !title
      ? 'Este é um Hero Block. Por favor, adicione um item no menu lateral para preenchê-lo automaticamente.'
      : '');
  const date =
    hrefItem?.EffectiveDate ||
    hrefItem?.CreationDate ||
    hrefItem?.effective ||
    null;

  const useHrefImage = !data.overwrite || (data.overwrite && !data.url);
  const urlItem = Array.isArray(data.url) ? data.url[0] : null;
  const urlString = typeof data.url === 'string' ? data.url : urlItem?.['@id'];

  const hasImage = useHrefImage
    ? Boolean(
        hrefItem?.image_field ||
          (hrefItem?.image_scales &&
            Object.keys(hrefItem.image_scales).length > 0) ||
          hrefItem?.hasPreviewImage,
      )
    : Boolean(urlString);

  const rawTextSide = data.textSide || 'left';
  const textSide = rawTextSide === 'left' ? 'right' : 'left';
  const imageFit = data.imageFit || 'cover';
  const imageSize = data.imageSize || '50%';

  const buttonLink = data.buttonLink?.[0]?.['@id'] || hrefItem?.['@id'] || '';

  const TitleTag = (data.titleTag || 'h2') as keyof JSX.IntrinsicElements;

  let renderedImage: React.ReactNode = null;
  if (hasImage) {
    const ImageComponent = config.getComponent('Image').component;
    if (ImageComponent) {
      const itemToUse = useHrefImage ? hrefItem : urlItem;

      renderedImage = (
        <Card.Image
          item={itemToUse || undefined}
          src={!itemToUse && urlString ? urlString : undefined}
          imageComponent={ImageComponent}
        />
      );
    }
  }

  return (
    <div
      className={cx(
        'hero-block',
        'hero-flex', // no FlexView use 'hero-flex'
        `text-${textSide}`,
        `image-fit-${imageFit}`,
        {
          full: data.fullWidth && !hasImage,
          'has-image': hasImage,
        },
        className,
      )}
    >
      <div className="hero-flex-inner">
        <div className="hero-flex-content">
          {(data.headerText ||
            (date && date !== 'None' && data.showDate !== false)) && (
            <span className="hero-header-text">
              {data.headerText}
              {data.headerText &&
                date &&
                date !== 'None' &&
                data.showDate !== false &&
                ' - '}
              {date && date !== 'None' && data.showDate !== false && (
                /* @ts-expect-error Volto FormattedDate types are incomplete */
                <FormattedDate date={date} />
              )}
            </span>
          )}
          {displayTitle && (
            <TitleTag className={cx('hero-title', `is-${TitleTag}`)}>
              {displayTitle}
            </TitleTag>
          )}
          {displayDescription && (
            <p className="hero-description">{displayDescription}</p>
          )}
          {data.button && (data.buttonText || 'Saiba mais') && (
            <div className="hero-cta">
              {isEditMode ? (
                <span className="hero-button item">
                  {data.buttonText || 'Saiba mais'}
                </span>
              ) : (
                <ConditionalLink
                  condition={!!buttonLink}
                  href={buttonLink}
                  className="hero-button item"
                >
                  {data.buttonText || 'Saiba mais'}
                </ConditionalLink>
              )}
            </div>
          )}
          {data.footerText && (
            <span className="hero-footer-text">{data.footerText}</span>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="hero-tags">
              {data.tags.map((tag: string, idx: number) => (
                <span key={idx} className="hero-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {hasImage && (
          <div
            className="hero-flex-image-wrapper"
            style={{ flex: `1 1 ${imageSize}` }}
          >
            <div className="hero-decorative-square" aria-hidden="true" />
            <div className="hero-image">{renderedImage}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlexView;
