import React, { useEffect } from 'react';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { getContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import { eventsMessages, getEventCardDates } from './eventsTemplateHelpers';

/**
 * Component to fetch and display the event location.
 * Uses getContent to retrieve full item data if location is not present in listing.
 */
const EventLocation = ({ item }: { item: any }) => {
  const dispatch = useDispatch();
  const isEvent = item['@type'] === 'Event';
  const id = flattenToAppURL(item['@id']);
  const fullItem = useSelector(
    (state: any) => state.content.subrequests?.[id]?.data,
  );

  useEffect(() => {
    if (isEvent && !item.location && !item.Location && !fullItem) {
      // @ts-ignore
      dispatch(getContent(id, null, id));
    }
  }, [item, fullItem, id, dispatch, isEvent]);

  const location =
    item.location || item.Location || fullItem?.location || fullItem?.Location;

  if (!location) return null;

  return (
    <span className="event-location">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      {location}
    </span>
  );
};

const EventsTemplate = ({
  items,
  isEditMode,
  linkTitle,
  linkHref,
  className,
  blockWidth,
}) => {
  const intl = useIntl();
  return (
    <div
      className={cx('events-listing-wrapper', className, {
        [`has--block-width--${blockWidth}`]: blockWidth,
      })}
    >
      <div className="events-listing">
        {items.map((item) => {
          const { day, month, endDate, time } = getEventCardDates(
            item,
            intl.locale,
          );

          // Label: the first subject of an Event, otherwise the content type.
          const eventType =
            item['@type'] === 'Event'
              ? item.Subject?.[0] || intl.formatMessage(eventsMessages.event)
              : item.Type;

          return (
            <div key={item['@id']} className="event-listing-item">
              <div className="event-date-block">
                <div className="event-day">{day}</div>
                <div className="event-month">{month}</div>
                {endDate && <div className="event-end-date">– {endDate}</div>}
              </div>
              <div className="event-content">
                <ConditionalLink item={item} condition={!isEditMode}>
                  <h3 className="event-title">{item.title}</h3>
                </ConditionalLink>
                <div className="event-body">
                  {item.description && (
                    <div className="event-description">{item.description}</div>
                  )}
                  <div className="event-details">
                    {time && (
                      <span className="event-time">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {time}
                      </span>
                    )}
                    <EventLocation item={item} />
                  </div>
                </div>
              </div>
              <div className="event-actions">
                {eventType && <span className="event-label">{eventType}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {linkHref && (
        <div className="listing-footer">
          <UniversalLink href={linkHref}>
            {linkTitle || intl.formatMessage(eventsMessages.viewAll)}
          </UniversalLink>
        </div>
      )}
    </div>
  );
};

export default EventsTemplate;
