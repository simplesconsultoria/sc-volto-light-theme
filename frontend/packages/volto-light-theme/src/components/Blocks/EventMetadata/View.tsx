import React from 'react';
import cx from 'classnames';

const EventMetadataView = (props: any) => {
  const { data, properties, className } = props;
  const blockWidth = data?.blockWidth || 'default';
  const themeClass = data?.theme ? `bg-${data.theme}` : 'bg-slate';
  const alignClass = data?.align ? `align-${data.align}` : 'align-left';

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

  const location = item.location || 'Local a confirmar';
  const contactName = item.contact_name || 'Organização';
  const contactEmail = item.contact_email;

  const eventUrl = item['@id'] || '';

  return (
    <div
      className={cx('block eventMetadata', className, themeClass, alignClass, {
        [`has--block-width--${blockWidth}`]: blockWidth,
      })}
    >
      <div
        className="event-metadata-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          padding: '2rem',
          backgroundColor: '#f0f8fb',
        }}
      >
        <div className="metadata-col">
          <h4
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            Quando
          </h4>
          <p style={{ fontWeight: 'bold', margin: '0.2rem 0' }}>
            {dateFormatted}
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            {timeFormatted} (BRT)
          </p>
        </div>
        <div className="metadata-col">
          <h4
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            Onde
          </h4>
          <p style={{ fontWeight: 'bold', margin: '0.2rem 0' }}>{location}</p>
          {item.event_url && (
            <a
              href={item.event_url}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.9rem' }}
            >
              Transmissão online
            </a>
          )}
        </div>
        <div className="metadata-col">
          <h4
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            Organização
          </h4>
          <p style={{ fontWeight: 'bold', margin: '0.2rem 0' }}>
            {contactName}
          </p>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} style={{ fontSize: '0.9rem' }}>
              {contactEmail}
            </a>
          )}
        </div>
        <div className="metadata-col">
          <h4
            style={{
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            Participação
          </h4>
          <p style={{ fontWeight: 'bold', margin: '0.2rem 0' }}>
            {item.price || 'Gratuita'}
          </p>
          <a href={`${eventUrl}/@@ical`} style={{ fontSize: '0.9rem' }}>
            Adicionar ao calendário (iCal)
          </a>
        </div>
      </div>
    </div>
  );
};

export default EventMetadataView;
