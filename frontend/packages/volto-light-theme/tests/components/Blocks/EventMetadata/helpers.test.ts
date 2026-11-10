import { createIntl } from 'react-intl';
import {
  getEventDetails,
  getEventLink,
  getEventSchedule,
  getThemeClass,
  stripBlockWidthClasses,
} from '@simplesconsultoria/volto-light-theme/components/Blocks/EventMetadata/helpers';

const intl = createIntl({ locale: 'en', messages: {} });

const fmtDate = (v: string) =>
  new Date(v).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
const fmtTime = (v: string) =>
  new Date(v).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

describe('EventMetadata helpers', () => {
  describe('getEventSchedule', () => {
    it('returns empty values without dates', () => {
      expect(getEventSchedule({})).toEqual({
        date: '',
        time: '',
        endSuffix: null,
      });
    });

    it('shows only the end time on the same day', () => {
      const start = '2026-09-24T12:00:00';
      const end = '2026-09-24T14:00:00';
      expect(getEventSchedule({ start, end })).toEqual({
        date: fmtDate(start),
        time: fmtTime(start),
        endSuffix: ` – ${fmtTime(end)}`,
      });
    });

    it('shows the end date on different days, using fallback fields', () => {
      const start = '2026-09-24T12:00:00';
      const end = '2026-09-26T14:00:00';
      expect(
        getEventSchedule({ EffectiveDate: start, ExpirationDate: end })
          .endSuffix,
      ).toBe(` – ${fmtDate(end)} ${fmtTime(end)}`);
    });
  });

  it('resolves the event link', () => {
    const item = { event_url: 'http://item' };
    expect(getEventLink({ eventUrl: [{ '@id': '/x' }] }, item)).toBe('/x');
    expect(getEventLink({ eventUrl: 'http://data' }, item)).toBe('http://data');
    expect(getEventLink({}, item)).toBe('http://item');
    expect(getEventLink(undefined, {})).toBeUndefined();
  });

  it('resolves the theme class', () => {
    expect(getThemeClass(undefined, undefined)).toBe('has--theme--default');
    expect(getThemeClass('a', 'dark')).toBe('has--theme--dark');
    expect(getThemeClass('has--theme--x', 'dark')).toBe('');
  });

  it('strips block width classes', () => {
    expect(stripBlockWidthClasses(' a has--block-width--full ')).toBe('a');
    expect(stripBlockWidthClasses(undefined)).toBe('');
  });

  it('prefers block data, then the item, then defaults', () => {
    expect(getEventDetails({}, {}, intl)).toEqual({
      location: 'Location to be confirmed',
      eventLink: undefined,
      eventLinkLabel: 'Online stream',
      hasEventLinkLabel: false,
      contactName: 'Organization',
      contactEmail: undefined,
      price: 'Free',
      eventUrl: '',
    });
    expect(
      getEventDetails(
        { location: 'L', eventUrlLabel: 'Live', contactEmail: 'd@x' },
        { location: 'I', contact_name: 'N', price: '10', '@id': '/ev' },
        intl,
      ),
    ).toMatchObject({
      location: 'L',
      eventLinkLabel: 'Live',
      hasEventLinkLabel: true,
      contactName: 'N',
      contactEmail: 'd@x',
      price: '10',
      eventUrl: '/ev',
    });
  });

  it('translates the defaults', () => {
    const ptBR = createIntl({
      locale: 'pt-BR',
      messages: { Free: 'Gratuita', Organization: 'Organização' },
    });
    expect(getEventDetails({}, {}, ptBR)).toMatchObject({
      contactName: 'Organização',
      price: 'Gratuita',
    });
  });
});
