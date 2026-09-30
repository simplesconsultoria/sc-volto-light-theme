import React from 'react';
import cx from 'classnames';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';

const EventMetadataView = (props: any) => {
  const { data, properties, className } = props;
  let blockWidth = data?.blockWidth || 'default';
  if (typeof blockWidth === 'object' && blockWidth !== null) {
    const val =
      (blockWidth as any)['--block-width'] ||
      (blockWidth as any).value ||
      (blockWidth as any).id ||
      Object.values(blockWidth)[0];

    if (val === 'unset') blockWidth = 'full';
    else if (val === 'var(--layout-container-width)') blockWidth = 'layout';
    else if (val === 'var(--narrow-container-width)') blockWidth = 'narrow';
    else if (val === 'var(--default-container-width)') blockWidth = 'default';
    else blockWidth = val;
  }

  const themeClass = data?.theme ? `bg-${data.theme}` : 'bg-slate';

  const cleanClassName = (className || '')
    .replace(/has--block-width--[\w-]+/g, '')
    .trim();

  // Properties usually contains the current context data (Event data)
  const item = properties || {};

  const start = item.start || item.EffectiveDate;
  const startDate = start ? new Date(start) : null;
  const dateFormatted = startDate
    ? startDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';
  const timeFormatted = startDate
    ? startDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const end = item.end || item.ExpirationDate;
  const endDate = end ? new Date(end) : null;
  const isSameDay =
    startDate && endDate
      ? startDate.toDateString() === endDate.toDateString()
      : false;

  const endTimeFormatted = endDate
    ? endDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const endDateFormatted = endDate
    ? endDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  // Use data overrides from block config, fallback to context item
  const location = data?.location || item.location || 'Local a confirmar';

  const getEventLink = () => {
    if (data?.eventUrl) {
      if (Array.isArray(data.eventUrl) && data.eventUrl.length > 0) {
        return data.eventUrl[0]['@id'];
      }
      return data.eventUrl;
    }
    return item.event_url;
  };
  const eventLink = getEventLink();
  const eventLinkLabel = data?.eventUrlLabel || 'Transmissão online';

  const contactName = data?.contactName || item.contact_name || 'Organização';
  const contactEmail = data?.contactEmail || item.contact_email;
  const price = data?.price || item.price || 'Gratuita';

  const eventUrl = item['@id'] || '';

  return (
    <div
      className={cx('block eventMetadata', cleanClassName, themeClass, {
        [`has--block-width--${blockWidth}`]: blockWidth !== 'default',
        'has--block-width--default': blockWidth === 'default',
      })}
    >
      <div className="event-metadata-inner">
        <div className="metadata-col">
          <h4>Quando</h4>
          <p>{dateFormatted}</p>
          <p>
            {timeFormatted}
            {endDate &&
              (isSameDay
                ? ` – ${endTimeFormatted}`
                : ` – ${endDateFormatted} ${endTimeFormatted}`)}{' '}
            (BRT)
          </p>
        </div>
        <div className="metadata-col">
          <h4>Onde</h4>
          <p>{location}</p>
          {(eventLink || data?.eventUrlLabel) &&
            (eventLink ? (
              <UniversalLink href={eventLink}>{eventLinkLabel}</UniversalLink>
            ) : (
              <span>{eventLinkLabel}</span>
            ))}
        </div>
        <div className="metadata-col">
          <h4>Organização</h4>
          <p>{contactName}</p>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          )}
        </div>
        <div className="metadata-col">
          <h4>Participação</h4>
          <p>{price}</p>
          {eventUrl && (
            <a href={`${eventUrl}/@@ical`}>Adicionar ao calendário (iCal)</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMetadataView;
