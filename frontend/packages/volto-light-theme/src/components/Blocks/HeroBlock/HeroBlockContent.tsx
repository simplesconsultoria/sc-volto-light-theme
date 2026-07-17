import React from 'react';
import cx from 'classnames';
import FormattedDate from '@plone/volto/components/theme/FormattedDate/FormattedDate';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import type { HeroBlockData } from './types';

interface HeroBlockContentProps {
  data: HeroBlockData;
  isEditMode?: boolean;
  contentData: {
    displayTitle: string;
    displayDescription: string;
    date: string | null;
    buttonLink: string;
    TitleTag: keyof JSX.IntrinsicElements;
  };
}

const HeroBlockContent: React.FC<HeroBlockContentProps> = ({
  data,
  isEditMode,
  contentData: { displayTitle, displayDescription, date, buttonLink, TitleTag },
}) => {
  return (
    <>
      <header className="hero-header">
        {(data.headerText ||
          (date && date !== 'None' && data.showDate !== false)) && (
          <p className="hero-header-text">
            {data.headerText}
            {data.headerText &&
              date &&
              date !== 'None' &&
              data.showDate !== false &&
              ' - '}
            {date && date !== 'None' && data.showDate !== false && (
              <time dateTime={date}>
                {/* @ts-expect-error Volto FormattedDate types are incomplete */}
                <FormattedDate date={date} />
              </time>
            )}
          </p>
        )}
        {data.fileType && <p className="hero-file-type">{data.fileType}</p>}
        {displayTitle && (
          <TitleTag className={cx('hero-title', `is-${TitleTag}`)}>
            {displayTitle}
          </TitleTag>
        )}
      </header>

      {displayDescription && (
        <p className="hero-description">{displayDescription}</p>
      )}

      {data.button && (data.buttonText || 'Saiba mais') && (
        <div className="hero-cta">
          {isEditMode ? (
            <span className="hero-button item" aria-hidden="true">
              {data.buttonText || 'Saiba mais'}
            </span>
          ) : (
            <ConditionalLink
              condition={!!buttonLink}
              href={buttonLink}
              className="hero-button item"
              aria-label={`${data.buttonText || 'Saiba mais'} sobre ${displayTitle}`}
            >
              {data.buttonText || 'Saiba mais'}
            </ConditionalLink>
          )}
        </div>
      )}

      {data.footerText && <p className="hero-footer-text">{data.footerText}</p>}

      {data.tags && data.tags.length > 0 && (
        <ul className="hero-tags" aria-label="Tags">
          {data.tags.map((tag: string) => (
            <li key={tag} className="hero-tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default HeroBlockContent;
