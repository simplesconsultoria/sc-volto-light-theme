import { Container } from '@plone/components';
import type { Content } from '@plone/types';

import Logo from '@kitconcept/volto-light-theme/components/Logo/Logo';
import SlotRenderer from '@plone/volto/components/theme/SlotRenderer/SlotRenderer';
import { useLiveData } from '@kitconcept/volto-light-theme/helpers/useLiveData';
import FooterDoormatSection from './FooterDoormatSection';

const PostFooter = ({
  content,
  location,
}: {
  content: Content;
  location?: any;
}) => {
  const footer_column_left_header = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_left_header',
  );
  const footer_column_left = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_left',
  );

  const footer_column_middle_header = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_middle_header',
  );
  const footer_column_middle = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_middle',
  );

  const footer_column_right_header = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_right_header',
  );
  const footer_column_right = useLiveData<any>(
    content,
    'kitconcept.footer',
    'footer_column_right',
  );

  const brand_slogan = useLiveData<any>(
    content,
    'sc.voltolighttheme.footer',
    'footer_brand_slogan',
  );
  const brand_message = useLiveData<any>(
    content,
    'sc.voltolighttheme.footer',
    'footer_brand_message',
  );

  return (
    <Container className="footer-post-footer-container">
      <div className="navigation-row">
        <div className="column-brand">
          <div className="brand-logo">
            <Logo isFooterLogo />
          </div>
          <div className="brand-info">
            <p className="brand-slogan">{brand_slogan}</p>
            <p className="brand-description">{brand_message}</p>
            <SlotRenderer
              name="followUs"
              content={content}
              location={location}
            />
          </div>
        </div>

        <div className="footer-grid footer-doormat">
          <FooterDoormatSection
            header={footer_column_left_header}
            links={footer_column_left}
          />
          <FooterDoormatSection
            header={footer_column_middle_header}
            links={footer_column_middle}
          />
          <FooterDoormatSection
            header={footer_column_right_header}
            links={footer_column_right}
          />
        </div>
      </div>
    </Container>
  );
};

export default PostFooter;
