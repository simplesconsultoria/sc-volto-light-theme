/**
 * OVERRIDE EventTemplate.tsx
 * REASON: Upstream calls `start.getDate()` without checking `start`, so a
 * listing using the Event Calendar template crashes the whole block on any
 * item without a `start` date (a non-Event result, or an Event saved without
 * dates). Items without dates now render as a plain card, and items are keyed
 * by their `@id` instead of their position.
 * FILE: @kitconcept/volto-light-theme/src/components/Blocks/EventCalendar/Search/components/EventTemplate.tsx
 * FILE VERSION: 8.0.0
 * NOTE: the listing's Event Calendar variation and the Event Calendar block
 * use this copy, not the near-identical one in @kitconcept/volto-calendar-block.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import DefaultSummary from '@kitconcept/volto-light-theme/components/Summary/DefaultSummary';
import cx from 'classnames';

const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const MONTH_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
};
const HEADER_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  year: 'numeric',
  month: 'long',
};

/** Formatters are costly to build; keep one per language and format. */
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(lang: string, kind: 'month' | 'header') {
  const key = `${lang}|${kind}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(
      lang,
      kind === 'month' ? MONTH_FORMAT : HEADER_FORMAT,
    );
    formatters.set(key, formatter);
  }
  return formatter;
}

const twoDigits = (date: Date) => String(date.getDate()).padStart(2, '0');

/**
 * The dates an item shows: its start, falling back to its end, plus the end
 * when it falls on another day. `null` when the item has no usable date.
 */
export function eventDates(item: { start?: string; end?: string }) {
  const start = toDate(item.start);
  const end = toDate(item.end);
  const first = start || end;
  if (!first) return null;
  const last = start && end ? end : null;
  return {
    first,
    last,
    notSameDay: !!last && first.getDate() !== last.getDate(),
  };
}

const DateInset: React.FC<{
  dates: NonNullable<ReturnType<typeof eventDates>>;
  lang: string;
}> = ({ dates, lang }) => {
  const formatter = formatterFor(lang, 'month');
  const { first, last, notSameDay } = dates;
  return (
    <div className={cx('date-inset', { 'has-end-date': notSameDay })}>
      <div className="day">{twoDigits(first)}</div>
      <div className="month">{formatter.format(first)}</div>
      {notSameDay && last && (
        <>
          <div className="separator"></div>
          <div className="day">{twoDigits(last)}</div>
          <div className="month">{formatter.format(last)}</div>
        </>
      )}
    </div>
  );
};

const EventItem = ({ item, lang, isEditMode }) => {
  const dates = eventDates(item);
  const headFormatter = formatterFor(lang, 'header');
  let headerDate = '';
  if (dates) {
    headerDate = dates.last
      ? headFormatter.formatRange(dates.first, dates.last)
      : headFormatter.format(dates.first);
  }
  return (
    <div className="card-listing">
      <Card href={isEditMode ? '' : item['@id']} className="event-card">
        {dates && (
          <Card.Image>
            <DateInset dates={dates} lang={lang} />
          </Card.Image>
        )}
        <Card.Summary>
          {(headerDate || item.head_title) && (
            <div className="headline calendar">
              {headerDate && <span className="day">{headerDate}</span>}
              {item.head_title && (
                <span className="event-title">{item.head_title}</span>
              )}
            </div>
          )}
          <DefaultSummary item={item} />
        </Card.Summary>
      </Card>
    </div>
  );
};

const EventCalenderTemplate = (props) => {
  const lang = useSelector((state: any) => state.intl.locale);
  return (
    <div className="event-calendar items">
      {props.items.map((item: any) => (
        <EventItem
          key={item['@id'] || item.UID}
          item={item}
          lang={lang}
          isEditMode={props.isEditMode}
        />
      ))}
    </div>
  );
};

export default EventCalenderTemplate;
