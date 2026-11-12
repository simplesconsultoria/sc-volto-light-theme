import React from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { normalizeBlockWidth } from '../../../helpers/blockWidth';
import {
  getEventDetails,
  getEventSchedule,
  getThemeClass,
  messages,
  stripBlockWidthClasses,
} from './helpers';

const EventLink = ({
  href,
  label,
  hasLabel,
}: {
  href?: string;
  label: string;
  hasLabel: boolean;
}) => {
  if (href) {
    return <UniversalLink href={href}>{label}</UniversalLink>;
  }
  return hasLabel ? <span>{label}</span> : null;
};

const EventMetadataView = (props: any) => {
  const { data, properties, className } = props;
  const intl = useIntl();
  const blockWidth = normalizeBlockWidth(data) || 'default';
  const themeClass = getThemeClass(className, data?.theme);
  const cleanClassName = stripBlockWidthClasses(className);

  // Properties usually contains the current context data (Event data)
  const item = properties || {};
  const schedule = getEventSchedule(item, intl.locale);
  const {
    location,
    eventLink,
    eventLinkLabel,
    hasEventLinkLabel,
    contactName,
    contactEmail,
    price,
    eventUrl,
  } = getEventDetails(data, item, intl);

  return (
    <div
      className={cx('block eventMetadata', cleanClassName, themeClass, {
        [`has--block-width--${blockWidth}`]: blockWidth !== 'default',
        'has--block-width--default': blockWidth === 'default',
      })}
    >
      <div className="event-metadata-inner">
        <div className="metadata-col">
          <h4>{intl.formatMessage(messages.when)}</h4>
          <p>{schedule.date}</p>
          <p>
            {schedule.time}
            {schedule.endSuffix} (BRT)
          </p>
        </div>
        <div className="metadata-col">
          <h4>{intl.formatMessage(messages.where)}</h4>
          <p>{location}</p>
          <EventLink
            href={eventLink}
            label={eventLinkLabel}
            hasLabel={hasEventLinkLabel}
          />
        </div>
        <div className="metadata-col">
          <h4>{intl.formatMessage(messages.organization)}</h4>
          <p>{contactName}</p>
          {contactEmail && (
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          )}
        </div>
        <div className="metadata-col">
          <h4>{intl.formatMessage(messages.participation)}</h4>
          <p>{price}</p>
          {eventUrl && (
            <a href={`${eventUrl}/@@ical`}>
              {intl.formatMessage(messages.addToCalendar)}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMetadataView;
