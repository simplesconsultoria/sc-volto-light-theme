import { describe, expect, it } from 'vitest';
import {
  getEventCardDates,
  parseValidDate,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/Listing/eventsTemplateHelpers';

const month = (v: string, locale: string) =>
  new Date(v).toLocaleString(locale, { month: 'short' }).toUpperCase();
const time = (v: string, locale: string) =>
  new Date(v).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

describe('parseValidDate', () => {
  it('treats empty, "None" and unparsable values as missing', () => {
    expect(parseValidDate(undefined)).toBeNull();
    expect(parseValidDate('None')).toBeNull();
    expect(parseValidDate('not a date')).toBeNull();
    expect(parseValidDate('2026-09-24T12:00:00')).toBeInstanceOf(Date);
  });
});

describe('getEventCardDates', () => {
  it('returns empty values without dates', () => {
    expect(getEventCardDates({}, 'en')).toEqual({
      day: '',
      month: '',
      endDate: null,
      time: null,
    });
  });

  it('formats the month in the site language', () => {
    const start = '2026-09-24T12:00:00';
    const en = getEventCardDates({ start }, 'en');
    const pt = getEventCardDates({ start }, 'pt-BR');
    expect(en.day).toBe(24);
    expect(en.month).toBe(month(start, 'en'));
    expect(pt.month).toBe(month(start, 'pt-BR'));
    expect(en.month).not.toBe(pt.month);
  });

  it('shows the time range of a single-day event', () => {
    const start = '2026-09-24T12:00:00';
    const end = '2026-09-24T14:00:00';
    const dates = getEventCardDates({ start, end }, 'en');
    expect(dates.endDate).toBeNull();
    expect(dates.time).toBe(`${time(start, 'en')} – ${time(end, 'en')}`);
  });

  it('shows the last day of a multi-day event, using fallback fields', () => {
    const start = '2026-09-24T12:00:00';
    const end = '2026-09-26T14:00:00';
    const dates = getEventCardDates(
      { EffectiveDate: start, ExpirationDate: end },
      'pt-BR',
    );
    expect(dates.endDate).toBe(`26 ${month(end, 'pt-BR')}`);
    expect(dates.time).toBe(time(start, 'pt-BR'));
  });

  it('shows one time when start and end are equal', () => {
    const start = '2026-09-24T12:00:00';
    expect(getEventCardDates({ start, end: start }, 'en').time).toBe(
      time(start, 'en'),
    );
  });
});
