import { defineMessages } from 'react-intl';

/** Fallback labels shown by the Events listing template. */
export const eventsMessages = defineMessages({
  event: { id: 'Event', defaultMessage: 'Event' },
  viewAll: { id: 'View all', defaultMessage: 'View all' },
});

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

/** Parses a catalog date, treating empty values and "None" as missing. */
export const parseValidDate = (value: unknown): Date | null => {
  if (!value || value === 'None') return null;
  const date = new Date(value as string);
  return isNaN(date.getTime()) ? null : date;
};

const shortMonth = (date: Date, locale?: string): string =>
  date.toLocaleString(locale, { month: 'short' }).toUpperCase();

export interface EventCardDates {
  /** Day of the month the event starts, or '' without a start date. */
  day: number | '';
  /** Abbreviated start month in the site language, upper-cased. */
  month: string;
  /** "<day> <MONTH>" of the last day, only for events spanning several days. */
  endDate: string | null;
  /** "<start time>", or "<start time> – <end time>" on a single day. */
  time: string | null;
}

/**
 * Formats the dates of one Events listing card in the site language.
 *
 * A multi-day event shows its last day under the start date; a single-day
 * event shows its time range.
 *
 * @param item the listing item (catalog brain data).
 * @param locale the site language (`intl.locale`); the runtime default
 *   when omitted.
 */
export const getEventCardDates = (
  item: Record<string, any>,
  locale?: string,
): EventCardDates => {
  const start = parseValidDate(item.start || item.EffectiveDate);
  const end = parseValidDate(item.end || item.ExpirationDate);
  const isSameDay =
    !!start && !!end && start.toDateString() === end.toDateString();

  let time: string | null = null;
  if (start) {
    time = start.toLocaleTimeString(locale, TIME_FORMAT);
    if (end && isSameDay && end.getTime() !== start.getTime()) {
      time = `${time} – ${end.toLocaleTimeString(locale, TIME_FORMAT)}`;
    }
  }

  return {
    day: start ? start.getDate() : '',
    month: start ? shortMonth(start, locale) : '',
    endDate:
      end && start && !isSameDay
        ? `${end.getDate()} ${shortMonth(end, locale)}`
        : null,
    time,
  };
};
