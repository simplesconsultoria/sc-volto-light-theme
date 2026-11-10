import React from 'react';
import cx from 'classnames';
import FormattedDate from '@plone/volto/components/theme/FormattedDate/FormattedDate';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import type { HeroBlockData } from './types';
import { getHeroButtonProps, shouldShowHeroDate } from './heroContent';

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

type HeroButtonData = NonNullable<HeroBlockData['buttons']>[number];

const HeroHeaderText = ({
  headerText,
  date,
}: {
  headerText?: string;
  date: string | null;
}) => {
  if (!headerText && !date) return null;
  return (
    <p className="hero-header-text">
      {headerText}
      {headerText && date && ' - '}
      {date && (
        <time dateTime={date}>
          {/* @ts-expect-error Volto FormattedDate types are incomplete */}
          <FormattedDate date={date} />
        </time>
      )}
    </p>
  );
};

const HeroButton = ({
  button,
  defaultHref,
  displayTitle,
  isEditMode,
}: {
  button: HeroButtonData;
  defaultHref: string;
  displayTitle: string;
  isEditMode?: boolean;
}) => {
  const { link, text, themeClass } = getHeroButtonProps(button, defaultHref);

  if (isEditMode) {
    return (
      <div className={cx('hero-cta', themeClass)}>
        <span className="hero-button item" aria-hidden="true">
          {text}
        </span>
      </div>
    );
  }

  return (
    <ConditionalLink
      condition={!!link}
      href={link}
      className={cx('hero-cta', themeClass)}
      aria-label={`${text} sobre ${displayTitle}`}
    >
      <span className="hero-button item">{text}</span>
    </ConditionalLink>
  );
};

const HeroTags = ({ tags }: { tags?: string[] }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <ul className="hero-tags" aria-label="Tags">
      {tags.map((tag: string) => (
        <li key={tag} className="hero-tag">
          {tag}
        </li>
      ))}
    </ul>
  );
};

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
  const visibleDate = shouldShowHeroDate(date, data.showDate) ? date : null;
  const buttons = data.buttons || [];

  return (
    <>
      <header className="hero-header">
        <HeroHeaderText headerText={data.headerText} date={visibleDate} />
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

      {buttons.length > 0 && (
        <div
          className="hero-cta-group"
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
        >
          {buttons.map((btn) => {
            const { link, text } = getHeroButtonProps(btn, defaultHref);
            return (
              <HeroButton
                key={text + String(link)}
                button={btn}
                defaultHref={defaultHref}
                displayTitle={displayTitle}
                isEditMode={isEditMode}
              />
            );
          })}
        </div>
      )}

      {data.footerText && <p className="hero-footer-text">{data.footerText}</p>}

      <HeroTags tags={data.tags} />
    </>
  );
};

export default HeroBlockContent;
