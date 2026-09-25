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
    defaultHref: string;
    TitleTag: keyof JSX.IntrinsicElements;
  };
}

const HeroBlockContent: React.FC<HeroBlockContentProps> = ({
  data,
  isEditMode,
  contentData: {
    displayTitle,
    displayDescription,
    date,
    defaultHref,
    TitleTag,
  },
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

      {data.buttons && data.buttons.length > 0 && (
        <div
          className="hero-cta-group"
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
        >
          {data.buttons.map((btn, index) => {
            const btnLink = btn.buttonLink?.[0]?.['@id'] || defaultHref;
            const btnText = btn.buttonText || 'Saiba mais';
            const themeClass = btn.theme
              ? `theme-${btn.theme}`
              : 'theme-primary';

            if (isEditMode) {
              return (
                <div key={index} className={cx('hero-cta', themeClass)}>
                  <span className="hero-button item" aria-hidden="true">
                    {btnText}
                  </span>
                </div>
              );
            }

            return (
              <ConditionalLink
                key={index}
                condition={!!btnLink}
                href={btnLink}
                className={cx('hero-cta', themeClass)}
                aria-label={`${btnText} sobre ${displayTitle}`}
              >
                <span className="hero-button item">{btnText}</span>
              </ConditionalLink>
            );
          })}
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
