import React from 'react';
import { useSelector } from 'react-redux';
import ConditionalLink from '@plone/volto/components/manage/ConditionalLink/ConditionalLink';
import Card from '@kitconcept/volto-light-theme/primitives/Card/Card';
import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';
import DefaultSummary from '@kitconcept/volto-light-theme/components/Summary/DefaultSummary';
import cx from 'classnames';

export interface GridTemplateProps {
  items: any[];
  linkTitle?: string;
  linkHref?: any[];
  isEditMode?: boolean;
  gridColumns?: number;
}

const GridTemplate: React.FC<GridTemplateProps> = ({
  items,
  linkTitle,
  linkHref,
  isEditMode,
  gridColumns,
}) => {
  let link: React.ReactNode = null;
  const href = linkHref?.[0]?.['@id'] || '';
  const PreviewImageComponent = config.getComponent('PreviewImage').component;

  const site = useSelector((state: any) => state.site?.data);
  const hideProfileLinks = site?.['kitconcept.disable_profile_links'];

  if (isInternalURL(href)) {
    link = (
      <ConditionalLink to={flattenToAppURL(href)} condition={!isEditMode}>
        {linkTitle || href}
      </ConditionalLink>
    );
  } else if (href) {
    link = <a href={href}>{linkTitle || href}</a>;
  }

  const columnsClass = gridColumns ? `grid-cols-${gridColumns}` : 'grid-cols-2';

  return (
    <>
      <ul className={cx('items', columnsClass)}>
        {items.map((item) => {
          const CustomItemBodyTemplate = config.getComponent({
            name: 'GridListingItemTemplate',
            dependencies: [item['@type']],
          }).component;

          const Summary =
            config.getComponent({
              name: 'Summary',
              dependencies: [item['@type']],
            }).component || DefaultSummary;

          let showLink = !Summary.hideLink && !isEditMode;
          if (item['@type'] === 'Person' && hideProfileLinks !== undefined) {
            showLink = !hideProfileLinks && !isEditMode;
          }

          const ItemBodyTemplate: React.FC<{
            a11yLabelId?: string;
            LinkToItem?: any;
          }> = (props) =>
            CustomItemBodyTemplate ? (
              <CustomItemBodyTemplate item={item} />
            ) : (
              <>
                {item.image_field !== '' && (
                  <Card.Image
                    className="item-image"
                    item={item}
                    imageComponent={PreviewImageComponent}
                  />
                )}
                <Card.Summary
                  a11yLabelId={props.a11yLabelId}
                  LinkToItem={props.LinkToItem}
                >
                  <Summary item={item} />
                </Card.Summary>
              </>
            );

          return (
            <li
              className={cx('listing-item', {
                [`${item['@type']?.toLowerCase()}-listing`]: item['@type'],
              })}
              key={item['@id']}
            >
              <Card item={showLink ? item : null}>
                <ItemBodyTemplate />
              </Card>
            </li>
          );
        })}
      </ul>

      {link && <div className="footer">{link}</div>}
    </>
  );
};

export default GridTemplate;
