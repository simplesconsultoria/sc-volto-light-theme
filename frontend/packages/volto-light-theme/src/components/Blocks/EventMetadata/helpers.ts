import { defineMessages, type IntlShape } from 'react-intl';

/** Column headings and fallback values shown by the Event Metadata block. */
export const messages = defineMessages({
  when: { id: 'When', defaultMessage: 'When' },
  where: { id: 'Where', defaultMessage: 'Where' },
  organization: { id: 'Organization', defaultMessage: 'Organization' },
  participation: { id: 'Participation', defaultMessage: 'Participation' },
  addToCalendar: {
    id: 'Add to calendar (iCal)',
    defaultMessage: 'Add to calendar (iCal)',
  },
  locationTbc: {
    id: 'Location to be confirmed',
    defaultMessage: 'Location to be confirmed',
  },
  onlineStream: { id: 'Online stream', defaultMessage: 'Online stream' },
  free: { id: 'Free', defaultMessage: 'Free' },
});

const LOCALE = 'pt-BR';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

const toDate = (value?: string | null): Date | null =>
  value ? new Date(value) : null;

const formatDate = (date: Date | null): string =>
  date ? date.toLocaleDateString(LOCALE, DATE_FORMAT) : '';

const formatTime = (date: Date | null): string =>
  date ? date.toLocaleTimeString(LOCALE, TIME_FORMAT) : '';

export interface EventSchedule {
  /** Formatted start date, e.g. "24 de set. de 2026". */
  date: string;
  /** Formatted start time, e.g. "13:00". */
  time: string;
  /**
   * Text appended after the start time: " – <end time>" on the same day,
   * " – <end date> <end time>" otherwise, or null when there is no end.
   */
  endSuffix: string | null;
}

/**
 * Formats the start/end of an event (falling back to EffectiveDate and
 * ExpirationDate) for the "Quando" column.
 */
export const getEventSchedule = (item: Record<string, any>): EventSchedule => {
  const startDate = toDate(item.start || item.EffectiveDate);
  const endDate = toDate(item.end || item.ExpirationDate);

  let endSuffix: string | null = null;
  if (endDate) {
    const isSameDay =
      !!startDate && startDate.toDateString() === endDate.toDateString();
    endSuffix = isSameDay
      ? ` – ${formatTime(endDate)}`
      : ` – ${formatDate(endDate)} ${formatTime(endDate)}`;
  }

  return {
    date: formatDate(startDate),
    time: formatTime(startDate),
    endSuffix,
  };
};

/**
 * Resolves the event link: the block's `eventUrl` (object browser value or
 * plain string) wins over the content's `event_url`.
 */
export const getEventLink = (
  data: Record<string, any> | undefined,
  item: Record<string, any>,
) => {
  if (data?.eventUrl) {
    if (Array.isArray(data.eventUrl) && data.eventUrl.length > 0) {
      return data.eventUrl[0]['@id'];
    }
    return data.eventUrl;
  }
  return item.event_url;
};

/**
 * Returns the theme class for the block, unless the incoming className
 * already carries one.
 */
export const getThemeClass = (
  className: string | undefined,
  theme: string | undefined,
): string =>
  (className || '').includes('has--theme--')
    ? ''
    : `has--theme--${theme || 'default'}`;

/** Removes block width classes injected by Volto from the className. */
export const stripBlockWidthClasses = (className?: string): string =>
  (className || '').replace(/has--block-width--[\w-]+/g, '').trim();

/**
 * Resolves the values shown by the block: block data overrides win,
 * falling back to the context item (Event content) and then to defaults.
 */
export const getEventDetails = (
  data: Record<string, any> | undefined,
  item: Record<string, any>,
  intl: IntlShape,
) => ({
  location:
    data?.location || item.location || intl.formatMessage(messages.locationTbc),
  eventLink: getEventLink(data, item),
  eventLinkLabel:
    data?.eventUrlLabel || intl.formatMessage(messages.onlineStream),
  hasEventLinkLabel: !!data?.eventUrlLabel,
  contactName:
    data?.contactName ||
    item.contact_name ||
    intl.formatMessage(messages.organization),
  contactEmail: data?.contactEmail || item.contact_email,
  price: data?.price || item.price || intl.formatMessage(messages.free),
  eventUrl: item['@id'] || '',
});
