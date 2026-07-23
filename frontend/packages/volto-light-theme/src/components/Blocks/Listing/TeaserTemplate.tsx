import React from 'react';
import cx from 'classnames';
import config from '@plone/volto/registry';
import { isInternalURL } from '@plone/volto/helpers/Url/Url';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';

type ListingItem = Record<string, any>;

interface TeaserTemplateProps {
  items: ListingItem[];
  isEditMode?: boolean;
  data?: any;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.getTime() === 0
      ? ''
      : date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
  } catch {
    return '';
  }
};

const TeaserSummary = ({
  item,
  date,
  a11yLabelId,
  LinkToItem = React.Fragment,
}: any) => {
  return (
    <>
      {date && <time>{date}</time>}
      {item.head_title && <div className="headline">{item.head_title}</div>}
      <h2 className="title" id={a11yLabelId}>
        <LinkToItem>{item.title}</LinkToItem>
      </h2>
      {item.description && <p className="description">{item.description}</p>}
    </>
  );
};

const TeaserTemplate: React.FC<TeaserTemplateProps & Record<string, any>> = ({
  items,
  isEditMode,
  align: alignProp,
  ...rest
}) => {
  const data = rest.data || rest;
  const Image = config.getComponent('Image').component;
  const { openExternalLinkInNewTab } = config.settings;
  const align = alignProp || data?.align || data?.styles?.align || 'left';

  return (
    <div
      className={cx(
        'listing-teaser-wrapper',
        data?.styles?.theme || 'default',
        { [`has--align--${align}`]: align },
      )}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {items.map((item, index) => {
        const date = formatDate(
          item?.Date || item?.effective || item?.CreationDate || item?.created,
        );

        const openLinkInNewTab =
          openExternalLinkInNewTab && !isInternalURL(item['@id']);

        return (
          <div key={item['@id']} className="block">
            <div
              className={cx('block teaser', {
                [`has--align--${align}`]: align,
              })}
            >
              <Card
                item={!isEditMode ? item : null}
                openLinkInNewTab={openLinkInNewTab}
              >
                <Card.Image item={item} imageComponent={Image} />
                <Card.Summary>
                  <TeaserSummary item={item} date={date} />
                </Card.Summary>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeaserTemplate;
